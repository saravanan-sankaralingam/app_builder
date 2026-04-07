import { PrismaClient, DataLayer, DataLayerType } from '@prisma/client';
import { CreateDataLayerInput, UpdateDataLayerInput, ListDataLayersQuery } from './data-layer.schema';

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

  while (await prisma.dataLayer.findUnique({ where: { appId_slug: { appId, slug } } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// DataLayer with fields
export type DataLayerWithFields = DataLayer & {
  fields: {
    id: string;
    name: string;
    slug: string;
    type: string;
    required: boolean;
    defaultValue: unknown;
    options: unknown;
    config: unknown;
    order: number;
  }[];
};

// List data layers for an app
export async function listDataLayers(
  appId: string,
  query: ListDataLayersQuery
): Promise<DataLayerWithFields[]> {
  const { type, search } = query;

  const where: Record<string, unknown> = { appId };

  if (type) {
    where.type = type;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const dataLayers = await prisma.dataLayer.findMany({
    where,
    include: {
      fields: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          required: true,
          defaultValue: true,
          options: true,
          config: true,
          order: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return dataLayers as DataLayerWithFields[];
}

// Get data layer by ID
export async function getDataLayerById(id: string): Promise<DataLayerWithFields | null> {
  const dataLayer = await prisma.dataLayer.findUnique({
    where: { id },
    include: {
      fields: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          required: true,
          defaultValue: true,
          options: true,
          config: true,
          order: true,
        },
      },
    },
  });

  return dataLayer as DataLayerWithFields | null;
}

// Get data layer by slug within an app
export async function getDataLayerBySlug(appId: string, slug: string): Promise<DataLayerWithFields | null> {
  const dataLayer = await prisma.dataLayer.findUnique({
    where: { appId_slug: { appId, slug } },
    include: {
      fields: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          required: true,
          defaultValue: true,
          options: true,
          config: true,
          order: true,
        },
      },
    },
  });

  return dataLayer as DataLayerWithFields | null;
}

// Create new data layer
export async function createDataLayer(
  appId: string,
  input: CreateDataLayerInput
): Promise<DataLayerWithFields> {
  // Verify app exists
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) {
    throw new Error('App not found');
  }

  const baseSlug = generateSlug(input.name);
  const slug = await getUniqueSlug(appId, baseSlug);

  const dataLayer = await prisma.dataLayer.create({
    data: {
      appId,
      name: input.name,
      slug,
      description: input.description,
      type: input.type as DataLayerType,
    },
    include: {
      fields: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          required: true,
          defaultValue: true,
          options: true,
          config: true,
          order: true,
        },
      },
    },
  });

  return dataLayer as DataLayerWithFields;
}

// Update data layer
export async function updateDataLayer(
  id: string,
  input: UpdateDataLayerInput
): Promise<DataLayerWithFields | null> {
  // Check if data layer exists
  const existing = await prisma.dataLayer.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }

  const dataLayer = await prisma.dataLayer.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.config !== undefined && { config: input.config }),
    },
    include: {
      fields: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          required: true,
          defaultValue: true,
          options: true,
          config: true,
          order: true,
        },
      },
    },
  });

  return dataLayer as DataLayerWithFields;
}

// Delete data layer
export async function deleteDataLayer(id: string): Promise<boolean> {
  const existing = await prisma.dataLayer.findUnique({ where: { id } });
  if (!existing) {
    return false;
  }

  await prisma.dataLayer.delete({ where: { id } });
  return true;
}

// Check if data layer name is taken within an app
export async function isDataLayerNameTaken(
  appId: string,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const dataLayer = await prisma.dataLayer.findFirst({
    where: {
      appId,
      name: { equals: name, mode: 'insensitive' },
      ...(excludeId && { id: { not: excludeId } }),
    },
  });

  return !!dataLayer;
}

// Duplicate data layer with all meta details
export interface DuplicateDataLayerInput {
  name: string;
  includeViews?: boolean;
  includeReports?: boolean;
}

export async function duplicateDataLayer(
  appId: string,
  dataLayerId: string,
  input: DuplicateDataLayerInput
): Promise<DataLayerWithFields> {
  return prisma.$transaction(async (tx) => {
    // 1. Get original data layer with all relations
    const original = await tx.dataLayer.findUnique({
      where: { id: dataLayerId },
      include: {
        fields: { orderBy: { order: 'asc' } },
        steps: { orderBy: { order: 'asc' } },
        views: true,
        reports: true,
      },
    });

    if (!original) {
      throw new Error('Data layer not found');
    }

    // Verify it belongs to the specified app
    if (original.appId !== appId) {
      throw new Error('Data layer does not belong to this app');
    }

    // 2. Generate unique slug
    const baseSlug = generateSlug(input.name);
    let slug = baseSlug;
    let counter = 1;
    while (await tx.dataLayer.findUnique({ where: { appId_slug: { appId, slug } } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 3. Create new data layer
    const newDataLayer = await tx.dataLayer.create({
      data: {
        appId,
        name: input.name,
        slug,
        type: original.type,
        description: original.description,
        config: original.config ?? undefined,
      },
    });

    // 4. Copy fields
    for (const field of original.fields) {
      await tx.field.create({
        data: {
          dataLayerId: newDataLayer.id,
          name: field.name,
          slug: field.slug,
          type: field.type,
          required: field.required,
          defaultValue: field.defaultValue ?? undefined,
          options: field.options ?? undefined,
          config: field.config ?? undefined,
          order: field.order,
        },
      });
    }

    // 5. Copy workflow steps (for board/process)
    if ((original.type === 'board' || original.type === 'process') && original.steps.length > 0) {
      const stepIdMap = new Map<string, string>(); // old ID -> new ID

      // First pass: create steps without allowedNextSteps
      for (const step of original.steps) {
        const newStep = await tx.workflowStep.create({
          data: {
            dataLayerId: newDataLayer.id,
            name: step.name,
            slug: step.slug,
            color: step.color,
            order: step.order,
            allowedNextSteps: [], // Temporary empty
          },
        });
        stepIdMap.set(step.id, newStep.id);
      }

      // Second pass: update allowedNextSteps with new IDs
      for (const step of original.steps) {
        const newStepId = stepIdMap.get(step.id);
        if (newStepId && Array.isArray(step.allowedNextSteps)) {
          const newAllowedNextSteps = (step.allowedNextSteps as string[]).map(
            oldId => stepIdMap.get(oldId) || oldId
          );
          await tx.workflowStep.update({
            where: { id: newStepId },
            data: { allowedNextSteps: newAllowedNextSteps },
          });
        }
      }
    }

    // 6. Copy views (if requested)
    if (input.includeViews && original.views && original.views.length > 0) {
      for (const view of original.views) {
        // Generate unique slug for view within new data layer
        let viewSlug = view.slug;
        let viewCounter = 1;
        while (await tx.view.findUnique({ where: { dataLayerId_slug: { dataLayerId: newDataLayer.id, slug: viewSlug } } })) {
          viewSlug = `${view.slug}-${viewCounter}`;
          viewCounter++;
        }

        await tx.view.create({
          data: {
            dataLayerId: newDataLayer.id,
            name: view.name,
            slug: viewSlug,
            type: view.type,
            description: view.description,
            config: view.config ?? undefined,
            isDefault: false, // Copies are never default
          },
        });
      }
    }

    // 7. Copy reports (if requested)
    if (input.includeReports && original.reports && original.reports.length > 0) {
      for (const report of original.reports) {
        // Generate unique slug for report within new data layer
        let reportSlug = report.slug;
        let reportCounter = 1;
        while (await tx.report.findUnique({ where: { dataLayerId_slug: { dataLayerId: newDataLayer.id, slug: reportSlug } } })) {
          reportSlug = `${report.slug}-${reportCounter}`;
          reportCounter++;
        }

        await tx.report.create({
          data: {
            dataLayerId: newDataLayer.id,
            name: report.name,
            slug: reportSlug,
            type: report.type,
            description: report.description,
            config: report.config ?? undefined,
            isDefault: false,
          },
        });
      }
    }

    // Return the new data layer with fields
    const result = await tx.dataLayer.findUnique({
      where: { id: newDataLayer.id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            required: true,
            defaultValue: true,
            options: true,
            config: true,
            order: true,
          },
        },
      },
    });

    return result as DataLayerWithFields;
  });
}
