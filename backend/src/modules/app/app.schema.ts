import { z } from 'zod';

// App type enum
export const AppTypeEnum = z.enum(['app', 'portal']);
export type AppType = z.infer<typeof AppTypeEnum>;

// App status enum
export const AppStatusEnum = z.enum(['draft', 'live', 'archived']);
export type AppStatus = z.infer<typeof AppStatusEnum>;

// Create app schema
export const createAppSchema = z.object({
  name: z.string().min(1, 'App name is required').max(100),
  description: z.string().max(500).optional(),
  icon: z.string().default('Folder'),
  iconBg: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').default('#dbeafe'),
  type: AppTypeEnum.default('app'),
});

export type CreateAppInput = z.infer<typeof createAppSchema>;

// Update app schema
export const updateAppSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().optional(),
  iconBg: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  type: AppTypeEnum.optional(),
  status: AppStatusEnum.optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateAppInput = z.infer<typeof updateAppSchema>;

// Query params for listing apps
export const listAppsQuerySchema = z.object({
  status: AppStatusEnum.optional(),
  type: AppTypeEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ListAppsQuery = z.infer<typeof listAppsQuerySchema>;
