import { z } from 'zod';

// Data layer type enum
export const DataLayerTypeEnum = z.enum(['dataform', 'board', 'process', 'list']);
export type DataLayerType = z.infer<typeof DataLayerTypeEnum>;

// Create data layer schema
export const createDataLayerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  type: DataLayerTypeEnum.default('dataform'),
});

export type CreateDataLayerInput = z.infer<typeof createDataLayerSchema>;

// Update data layer schema
export const updateDataLayerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  config: z.record(z.any()).optional(), // For storing list items and other config
});

export type UpdateDataLayerInput = z.infer<typeof updateDataLayerSchema>;

// Query params for listing data layers
export const listDataLayersQuerySchema = z.object({
  type: DataLayerTypeEnum.optional(),
  search: z.string().optional(),
});

export type ListDataLayersQuery = z.infer<typeof listDataLayersQuerySchema>;
