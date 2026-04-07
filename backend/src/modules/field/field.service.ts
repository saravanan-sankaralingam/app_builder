import { PrismaClient, Field, Prisma } from '@prisma/client';
import { CreateFieldInput, UpdateFieldInput, ReorderFieldsInput } from './field.schema';

const prisma = new PrismaClient();

// Helper to generate URL-friendly slug for field
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 50);
}

// Ensure slug is unique within a data layer
async function getUniqueSlug(dataLayerId: string, baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.field.findUnique({ where: { dataLayerId_slug: { dataLayerId, slug } } })) {
    slug = `${baseSlug}_${counter}`;
    counter++;
  }

  return slug;
}

// Get next order number for a data layer
async function getNextOrder(dataLayerId: string): Promise<number> {
  const lastField = await prisma.field.findFirst({
    where: { dataLayerId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  return (lastField?.order ?? -1) + 1;
}

// List fields for a data layer
export async function listFields(dataLayerId: string): Promise<Field[]> {
  return prisma.field.findMany({
    where: { dataLayerId },
    orderBy: { order: 'asc' },
  });
}

// Get field by ID
export async function getFieldById(id: string): Promise<Field | null> {
  return prisma.field.findUnique({ where: { id } });
}

// Create new field
export async function createField(
  dataLayerId: string,
  input: CreateFieldInput
): Promise<Field> {
  // Verify data layer exists
  const dataLayer = await prisma.dataLayer.findUnique({ where: { id: dataLayerId } });
  if (!dataLayer) {
    throw new Error('Data layer not found');
  }

  const baseSlug = generateSlug(input.name);
  const slug = await getUniqueSlug(dataLayerId, baseSlug);
  const order = await getNextOrder(dataLayerId);

  const field = await prisma.field.create({
    data: {
      dataLayerId,
      name: input.name,
      slug,
      type: input.type,
      required: input.required ?? false,
      defaultValue: input.defaultValue !== undefined ? (input.defaultValue as Prisma.InputJsonValue) : Prisma.JsonNull,
      options: input.options !== undefined ? (input.options as Prisma.InputJsonValue) : Prisma.JsonNull,
      config: input.config !== undefined ? (input.config as Prisma.InputJsonValue) : Prisma.JsonNull,
      order,
    },
  });

  return field;
}

// Update field
export async function updateField(
  id: string,
  input: UpdateFieldInput
): Promise<Field | null> {
  // Check if field exists
  const existing = await prisma.field.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }

  const updateData: Prisma.FieldUpdateInput = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.required !== undefined) updateData.required = input.required;
  if (input.defaultValue !== undefined) {
    updateData.defaultValue = input.defaultValue === null ? Prisma.JsonNull : input.defaultValue;
  }
  if (input.options !== undefined) {
    updateData.options = input.options === null ? Prisma.JsonNull : input.options;
  }
  if (input.config !== undefined) {
    updateData.config = input.config === null ? Prisma.JsonNull : (input.config as Prisma.InputJsonValue);
  }

  const field = await prisma.field.update({
    where: { id },
    data: updateData,
  });

  return field;
}

// Delete field
export async function deleteField(id: string): Promise<boolean> {
  const existing = await prisma.field.findUnique({ where: { id } });
  if (!existing) {
    return false;
  }

  await prisma.field.delete({ where: { id } });
  return true;
}

// Reorder fields
export async function reorderFields(
  dataLayerId: string,
  input: ReorderFieldsInput
): Promise<Field[]> {
  // Update order for each field
  const updates = input.fieldIds.map((fieldId, index) =>
    prisma.field.updateMany({
      where: { id: fieldId, dataLayerId },
      data: { order: index },
    })
  );

  await prisma.$transaction(updates);

  // Return updated fields
  return prisma.field.findMany({
    where: { dataLayerId },
    orderBy: { order: 'asc' },
  });
}

// Check if field name is taken within a data layer
export async function isFieldNameTaken(
  dataLayerId: string,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const field = await prisma.field.findFirst({
    where: {
      dataLayerId,
      name: { equals: name, mode: 'insensitive' },
      ...(excludeId && { id: { not: excludeId } }),
    },
  });

  return !!field;
}
