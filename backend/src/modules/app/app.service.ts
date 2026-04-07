import { PrismaClient, App, AppType, AppStatus } from '@prisma/client';
import { CreateAppInput, UpdateAppInput, ListAppsQuery } from './app.schema';
import { env } from '../../config/env';

const prisma = new PrismaClient();

// Get or create system bot user for automated operations
async function getSystemBotUserId(): Promise<string> {
  // If SYSTEM_BOT_USER_ID is set, use it
  if (env.SYSTEM_BOT_USER_ID) {
    return env.SYSTEM_BOT_USER_ID;
  }

  // Otherwise, find or create a system bot user
  const systemEmail = 'system@kissflow.local';
  let systemUser = await prisma.user.findUnique({
    where: { email: systemEmail },
  });

  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: systemEmail,
        name: 'System Bot',
        passwordHash: 'system-bot-no-login',
        role: 'admin',
      },
    });
  }

  return systemUser.id;
}

// Helper to generate URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Ensure slug is unique by appending number if necessary
async function getUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.app.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// App with creator info
export type AppWithCreator = App & {
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  updatedBy: {
    id: string;
    name: string;
    email: string;
  };
};

// List apps with pagination
export async function listApps(query: ListAppsQuery): Promise<{
  apps: AppWithCreator[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { status, type, search, page, limit } = query;

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [apps, total] = await Promise.all([
    prisma.app.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.app.count({ where }),
  ]);

  return {
    apps: apps as AppWithCreator[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// Get app by ID
export async function getAppById(id: string): Promise<AppWithCreator | null> {
  const app = await prisma.app.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      updatedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return app as AppWithCreator | null;
}

// Get app by slug
export async function getAppBySlug(slug: string): Promise<AppWithCreator | null> {
  const app = await prisma.app.findUnique({
    where: { slug },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      updatedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return app as AppWithCreator | null;
}

// Create new app
export async function createApp(input: CreateAppInput): Promise<AppWithCreator> {
  const botUserId = await getSystemBotUserId();

  const baseSlug = generateSlug(input.name);
  const slug = await getUniqueSlug(baseSlug);

  // Use transaction to create app with default navigation and page
  const app = await prisma.$transaction(async (tx) => {
    // Create the app
    const newApp = await tx.app.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        icon: input.icon,
        iconBg: input.iconBg,
        type: input.type as AppType,
        status: 'draft' as AppStatus,
        createdById: botUserId,
        updatedById: botUserId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create default Navigation
    await tx.navigation.create({
      data: {
        appId: newApp.id,
        name: 'Main Navigation',
        slug: 'main-navigation',
        description: 'Default navigation menu',
        config: {},
      },
    });

    // Create default Page
    await tx.page.create({
      data: {
        appId: newApp.id,
        name: 'Home Page',
        slug: 'home-page',
        description: 'Default home page',
        config: {},
      },
    });

    return newApp;
  });

  return app as AppWithCreator;
}

// Update app
export async function updateApp(id: string, input: UpdateAppInput): Promise<AppWithCreator | null> {
  const botUserId = env.SYSTEM_BOT_USER_ID;

  // Check if app exists
  const existing = await prisma.app.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }

  const app = await prisma.app.update({
    where: { id },
    data: {
      ...input,
      type: input.type as AppType | undefined,
      status: input.status as AppStatus | undefined,
      updatedById: botUserId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      updatedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return app as AppWithCreator;
}

// Delete app
export async function deleteApp(id: string): Promise<boolean> {
  const existing = await prisma.app.findUnique({ where: { id } });
  if (!existing) {
    return false;
  }

  await prisma.app.delete({ where: { id } });
  return true;
}

// Check if app name is taken
export async function isAppNameTaken(name: string, excludeId?: string): Promise<boolean> {
  const app = await prisma.app.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      ...(excludeId && { id: { not: excludeId } }),
    },
  });

  return !!app;
}
