import { PrismaClient, Component } from '@prisma/client';
import { CreateComponentInput, UpdateComponentInput, ListComponentsQuery, Parameter } from './component.schema';

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

  while (await prisma.component.findUnique({ where: { appId_slug: { appId, slug } } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// List components for an app
export async function listComponents(
  appId: string,
  query: ListComponentsQuery
): Promise<Component[]> {
  const { search, type } = query;

  const where: Record<string, unknown> = { appId };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (type) {
    where.type = type;
  }

  const components = await prisma.component.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return components;
}

// Get component by ID
export async function getComponentById(id: string): Promise<Component | null> {
  const component = await prisma.component.findUnique({
    where: { id },
  });

  return component;
}

// Get component by slug within an app
export async function getComponentBySlug(appId: string, slug: string): Promise<Component | null> {
  const component = await prisma.component.findUnique({
    where: { appId_slug: { appId, slug } },
  });

  return component;
}

// Create new component
export async function createComponent(
  appId: string,
  input: CreateComponentInput
): Promise<Component> {
  // Verify app exists
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) {
    throw new Error('App not found');
  }

  const baseSlug = generateSlug(input.name);
  const slug = await getUniqueSlug(appId, baseSlug);

  const component = await prisma.component.create({
    data: {
      appId,
      name: input.name,
      slug,
      description: input.description,
      type: input.type || 'page',
      method: input.method || 'scratch',
      prompt: input.prompt,
      config: {},
      parameters: [],
    },
  });

  return component;
}

// Update component
export async function updateComponent(
  id: string,
  input: UpdateComponentInput
): Promise<Component | null> {
  // Check if component exists
  const existing = await prisma.component.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }

  const component = await prisma.component.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.type && { type: input.type }),
      ...(input.config !== undefined && { config: input.config }),
      ...(input.parameters !== undefined && { parameters: input.parameters }),
    },
  });

  return component;
}

// Delete component
export async function deleteComponent(id: string): Promise<boolean> {
  const existing = await prisma.component.findUnique({ where: { id } });
  if (!existing) {
    return false;
  }

  await prisma.component.delete({ where: { id } });
  return true;
}

// Check if component name is taken within an app
export async function isComponentNameTaken(
  appId: string,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const component = await prisma.component.findFirst({
    where: {
      appId,
      name: { equals: name, mode: 'insensitive' },
      ...(excludeId && { id: { not: excludeId } }),
    },
  });

  return !!component;
}

// Add parameter to component
export async function addParameter(
  componentId: string,
  parameter: Parameter
): Promise<Component | null> {
  const existing = await prisma.component.findUnique({ where: { id: componentId } });
  if (!existing) {
    return null;
  }

  const currentParams = (existing.parameters as Parameter[]) || [];
  const updatedParams = [...currentParams, parameter];

  const component = await prisma.component.update({
    where: { id: componentId },
    data: {
      parameters: updatedParams,
    },
  });

  return component;
}

// Update parameter in component
export async function updateParameter(
  componentId: string,
  parameterId: string,
  parameterData: Partial<Parameter>
): Promise<Component | null> {
  const existing = await prisma.component.findUnique({ where: { id: componentId } });
  if (!existing) {
    return null;
  }

  const currentParams = (existing.parameters as Parameter[]) || [];
  const updatedParams = currentParams.map((p) =>
    p.id === parameterId ? { ...p, ...parameterData } : p
  );

  const component = await prisma.component.update({
    where: { id: componentId },
    data: {
      parameters: updatedParams,
    },
  });

  return component;
}

// Delete parameter from component
export async function deleteParameter(
  componentId: string,
  parameterId: string
): Promise<Component | null> {
  const existing = await prisma.component.findUnique({ where: { id: componentId } });
  if (!existing) {
    return null;
  }

  const currentParams = (existing.parameters as Parameter[]) || [];
  const updatedParams = currentParams.filter((p) => p.id !== parameterId);

  const component = await prisma.component.update({
    where: { id: componentId },
    data: {
      parameters: updatedParams,
    },
  });

  return component;
}
