import { PrismaClient, View } from '@prisma/client';
import { CreateViewInput, UpdateViewInput, ListViewsQuery } from './view.schema';

const prisma = new PrismaClient();

// Helper to generate URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Ensure slug is unique within a data layer
async function getUniqueSlug(dataLayerId: string, baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.view.findUnique({ where: { dataLayerId_slug: { dataLayerId, slug } } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// List views for a data layer
export async function listViews(
  dataLayerId: string,
  query: ListViewsQuery
): Promise<View[]> {
  const { search, type } = query;

  const where: Record<string, unknown> = { dataLayerId };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (type) {
    where.type = type;
  }

  const views = await prisma.view.findMany({
    where,
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return views;
}

// Get view by ID
export async function getViewById(id: string): Promise<View | null> {
  const view = await prisma.view.findUnique({
    where: { id },
  });

  return view;
}

// Get view by slug within a data layer
export async function getViewBySlug(dataLayerId: string, slug: string): Promise<View | null> {
  const view = await prisma.view.findUnique({
    where: { dataLayerId_slug: { dataLayerId, slug } },
  });

  return view;
}

// Create new view
export async function createView(
  dataLayerId: string,
  input: CreateViewInput
): Promise<View> {
  // Verify data layer exists
  const dataLayer = await prisma.dataLayer.findUnique({ where: { id: dataLayerId } });
  if (!dataLayer) {
    throw new Error('Data layer not found');
  }

  const baseSlug = generateSlug(input.name);
  const slug = await getUniqueSlug(dataLayerId, baseSlug);

  const view = await prisma.view.create({
    data: {
      dataLayerId,
      name: input.name,
      slug,
      type: input.type,
      description: input.description,
      config: input.config || {},
    },
  });

  return view;
}

// Update view
export async function updateView(
  id: string,
  input: UpdateViewInput
): Promise<View | null> {
  // Check if view exists
  const existing = await prisma.view.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }

  // If setting as default, unset other defaults in the same data layer
  if (input.isDefault === true) {
    await prisma.view.updateMany({
      where: {
        dataLayerId: existing.dataLayerId,
        id: { not: id },
      },
      data: { isDefault: false },
    });
  }

  const view = await prisma.view.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.type && { type: input.type }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.config !== undefined && { config: input.config }),
      ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
    },
  });

  return view;
}

// Delete view
export async function deleteView(id: string): Promise<boolean> {
  const existing = await prisma.view.findUnique({ where: { id } });
  if (!existing) {
    return false;
  }

  await prisma.view.delete({ where: { id } });
  return true;
}

// Check if view name is taken within a data layer
export async function isViewNameTaken(
  dataLayerId: string,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const view = await prisma.view.findFirst({
    where: {
      dataLayerId,
      name: { equals: name, mode: 'insensitive' },
      ...(excludeId && { id: { not: excludeId } }),
    },
  });

  return !!view;
}
