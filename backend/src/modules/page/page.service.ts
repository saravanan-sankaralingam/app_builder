import { PrismaClient, Page } from '@prisma/client';
import { CreatePageInput, UpdatePageInput, ListPagesQuery } from './page.schema';

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

  while (await prisma.page.findUnique({ where: { appId_slug: { appId, slug } } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// List pages for an app
export async function listPages(
  appId: string,
  query: ListPagesQuery
): Promise<Page[]> {
  const { search } = query;

  const where: Record<string, unknown> = { appId };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const pages = await prisma.page.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return pages;
}

// Get page by ID
export async function getPageById(id: string): Promise<Page | null> {
  const page = await prisma.page.findUnique({
    where: { id },
  });

  return page;
}

// Get page by slug within an app
export async function getPageBySlug(appId: string, slug: string): Promise<Page | null> {
  const page = await prisma.page.findUnique({
    where: { appId_slug: { appId, slug } },
  });

  return page;
}

// Create new page
export async function createPage(
  appId: string,
  input: CreatePageInput
): Promise<Page> {
  // Verify app exists
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) {
    throw new Error('App not found');
  }

  const baseSlug = generateSlug(input.name);
  const slug = await getUniqueSlug(appId, baseSlug);

  const page = await prisma.page.create({
    data: {
      appId,
      name: input.name,
      slug,
      description: input.description,
      config: {},
    },
  });

  return page;
}

// Update page
export async function updatePage(
  id: string,
  input: UpdatePageInput
): Promise<Page | null> {
  // Check if page exists
  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }

  const page = await prisma.page.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.config !== undefined && { config: input.config }),
    },
  });

  return page;
}

// Delete page
export async function deletePage(id: string): Promise<boolean> {
  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) {
    return false;
  }

  await prisma.page.delete({ where: { id } });
  return true;
}

// Check if page name is taken within an app
export async function isPageNameTaken(
  appId: string,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const page = await prisma.page.findFirst({
    where: {
      appId,
      name: { equals: name, mode: 'insensitive' },
      ...(excludeId && { id: { not: excludeId } }),
    },
  });

  return !!page;
}
