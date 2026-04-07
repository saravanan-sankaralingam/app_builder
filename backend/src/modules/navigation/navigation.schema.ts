import { z } from 'zod';

// Create navigation schema
export const createNavigationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});

export type CreateNavigationInput = z.infer<typeof createNavigationSchema>;

// Update navigation schema
export const updateNavigationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  config: z.any().optional(),
});

export type UpdateNavigationInput = z.infer<typeof updateNavigationSchema>;

// Query params for listing navigations
export const listNavigationsQuerySchema = z.object({
  search: z.string().optional(),
});

export type ListNavigationsQuery = z.infer<typeof listNavigationsQuerySchema>;
