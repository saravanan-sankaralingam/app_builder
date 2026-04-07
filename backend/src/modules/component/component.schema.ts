import { z } from 'zod';

// Parameter schema for component input parameters
export const parameterSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  paramId: z.string().min(1),
  type: z.enum(['string', 'number', 'static_dropdown']),
  defaultValue: z.string().optional(),
});

export type Parameter = z.infer<typeof parameterSchema>;

// Create component schema
export const createComponentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['page', 'form']).default('page'),
  method: z.enum(['scratch', 'ai']).default('scratch'),
  prompt: z.string().max(250).optional(),
});

export type CreateComponentInput = z.infer<typeof createComponentSchema>;

// Update component schema
export const updateComponentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  type: z.enum(['page', 'form']).optional(),
  config: z.any().optional(),
  parameters: z.array(parameterSchema).optional(),
});

export type UpdateComponentInput = z.infer<typeof updateComponentSchema>;

// Add parameter schema
export const addParameterSchema = parameterSchema;

export type AddParameterInput = z.infer<typeof addParameterSchema>;

// Query params for listing components
export const listComponentsQuerySchema = z.object({
  search: z.string().optional(),
  type: z.enum(['page', 'form']).optional(),
});

export type ListComponentsQuery = z.infer<typeof listComponentsQuerySchema>;
