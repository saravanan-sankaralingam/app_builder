import { z } from 'zod';

// View types
export const viewTypeEnum = z.enum(['datatable', 'gallery', 'sheet']);

// Create view schema
export const createViewSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: viewTypeEnum,
  description: z.string().max(500).optional(),
  config: z.any().optional(),
});

export type CreateViewInput = z.infer<typeof createViewSchema>;

// Update view schema
export const updateViewSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: viewTypeEnum.optional(),
  description: z.string().max(500).nullable().optional(),
  config: z.any().optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateViewInput = z.infer<typeof updateViewSchema>;

// Query params for listing views
export const listViewsQuerySchema = z.object({
  search: z.string().optional(),
  type: viewTypeEnum.optional(),
});

export type ListViewsQuery = z.infer<typeof listViewsQuerySchema>;
