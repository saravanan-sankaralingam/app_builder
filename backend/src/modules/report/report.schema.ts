import { z } from 'zod';

// Report types
export const reportTypeEnum = z.enum(['table', 'chart', 'pivot', 'card']);

// Create report schema
export const createReportSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: reportTypeEnum,
  description: z.string().max(500).optional(),
  config: z.any().optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

// Update report schema
export const updateReportSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: reportTypeEnum.optional(),
  description: z.string().max(500).nullable().optional(),
  config: z.any().optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateReportInput = z.infer<typeof updateReportSchema>;

// Query params for listing reports
export const listReportsQuerySchema = z.object({
  search: z.string().optional(),
  type: reportTypeEnum.optional(),
});

export type ListReportsQuery = z.infer<typeof listReportsQuerySchema>;
