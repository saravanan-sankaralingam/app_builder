import { z } from 'zod';

// Create page schema
export const createPageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;

// Update page schema
export const updatePageSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  config: z.any().optional(),
});

export type UpdatePageInput = z.infer<typeof updatePageSchema>;

// Query params for listing pages
export const listPagesQuerySchema = z.object({
  search: z.string().optional(),
});

export type ListPagesQuery = z.infer<typeof listPagesQuerySchema>;
