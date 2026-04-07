import { PrismaClient, Navigation } from '@prisma/client';
import { CreateNavigationInput, UpdateNavigationInput, ListNavigationsQuery } from './navigation.schema';

const prisma = new PrismaClient();

// Helper to generate URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Ensure slug is unique within an app
async function getUniqueSlug(appId: string, baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.navigation.findUnique({ where: { appId_slug: { appId, slug } } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// List navigations for an app
export async function listNavigations(
  appId: string,
  query: ListNavigationsQuery
): Promise<Navigation[]> {
  const { search } = query;

  const where: Record<string, unknown> = { appId };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const navigations = await prisma.navigation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return navigations;
}

// Get navigation by ID
export async function getNavigationById(id: string): Promise<Navigation | null> {
  const navigation = await prisma.navigation.findUnique({
    where: { id },
  });

  return navigation;
}

// Get navigation by slug within an app
export async function getNavigationBySlug(appId: string, slug: string): Promise<Navigation | null> {
  const navigation = await prisma.navigation.findUnique({
    where: { appId_slug: { appId, slug } },
  });

  return navigation;
}

// Create new navigation
export async function createNavigation(
  appId: string,
  input: CreateNavigationInput
): Promise<Navigation> {
  // Verify app exists
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) {
    throw new Error('App not found');
  }

  const baseSlug = generateSlug(input.name);
  const slug = await getUniqueSlug(appId, baseSlug);

  const navigation = await prisma.navigation.create({
    data: {
      appId,
      name: input.name,
      slug,
      description: input.description,
      config: {},
    },
  });

  return navigation;
}

// Update navigation
export async function updateNavigation(
  id: string,
  input: UpdateNavigationInput
): Promise<Navigation | null> {
  // Check if navigation exists
  const existing = await prisma.navigation.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }

  const navigation = await prisma.navigation.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.config !== undefined && { config: input.config }),
    },
  });

  return navigation;
}

// Delete navigation
export async function deleteNavigation(id: string): Promise<boolean> {
  const existing = await prisma.navigation.findUnique({ where: { id } });
  if (!existing) {
    return false;
  }

  await prisma.navigation.delete({ where: { id } });
  return true;
}

// Check if navigation name is taken within an app
export async function isNavigationNameTaken(
  appId: string,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const navigation = await prisma.navigation.findFirst({
    where: {
      appId,
      name: { equals: name, mode: 'insensitive' },
      ...(excludeId && { id: { not: excludeId } }),
    },
  });

  return !!navigation;
}
