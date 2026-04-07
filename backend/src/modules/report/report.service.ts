import { PrismaClient, Report } from '@prisma/client';
import { CreateReportInput, UpdateReportInput, ListReportsQuery } from './report.schema.js';

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

  while (await prisma.report.findUnique({ where: { dataLayerId_slug: { dataLayerId, slug } } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// List reports for a data layer
export async function listReports(
  dataLayerId: string,
  query: ListReportsQuery
): Promise<Report[]> {
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

  const reports = await prisma.report.findMany({
    where,
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return reports;
}

// Get report by ID
export async function getReportById(id: string): Promise<Report | null> {
  const report = await prisma.report.findUnique({
    where: { id },
  });

  return report;
}

// Get report by slug within a data layer
export async function getReportBySlug(dataLayerId: string, slug: string): Promise<Report | null> {
  const report = await prisma.report.findUnique({
    where: { dataLayerId_slug: { dataLayerId, slug } },
  });

  return report;
}

// Create new report
export async function createReport(
  dataLayerId: string,
  input: CreateReportInput
): Promise<Report> {
  // Verify data layer exists
  const dataLayer = await prisma.dataLayer.findUnique({ where: { id: dataLayerId } });
  if (!dataLayer) {
    throw new Error('Data layer not found');
  }

  const baseSlug = generateSlug(input.name);
  const slug = await getUniqueSlug(dataLayerId, baseSlug);

  const report = await prisma.report.create({
    data: {
      dataLayerId,
      name: input.name,
      slug,
      type: input.type,
      description: input.description,
      config: input.config || {},
    },
  });

  return report;
}

// Update report
export async function updateReport(
  id: string,
  input: UpdateReportInput
): Promise<Report | null> {
  // Check if report exists
  const existing = await prisma.report.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }

  // If setting as default, unset other defaults in the same data layer
  if (input.isDefault === true) {
    await prisma.report.updateMany({
      where: {
        dataLayerId: existing.dataLayerId,
        id: { not: id },
      },
      data: { isDefault: false },
    });
  }

  const report = await prisma.report.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.type && { type: input.type }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.config !== undefined && { config: input.config }),
      ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
    },
  });

  return report;
}

// Delete report
export async function deleteReport(id: string): Promise<boolean> {
  const existing = await prisma.report.findUnique({ where: { id } });
  if (!existing) {
    return false;
  }

  await prisma.report.delete({ where: { id } });
  return true;
}

// Check if report name is taken within a data layer
export async function isReportNameTaken(
  dataLayerId: string,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const report = await prisma.report.findFirst({
    where: {
      dataLayerId,
      name: { equals: name, mode: 'insensitive' },
      ...(excludeId && { id: { not: excludeId } }),
    },
  });

  return !!report;
}
