import { z } from 'zod';

// Field type enum - all supported field types
export const FieldTypeEnum = z.enum([
  'text',
  'textarea',
  'number',
  'date',
  'datetime',
  'select',
  'multiselect',
  'checkbox',
  'email',
  'phone',
  'url',
  'lookup',
]);
export type FieldType = z.infer<typeof FieldTypeEnum>;

// Select option schema
const selectOptionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

// Create field schema
export const createFieldSchema = z.object({
  name: z.string().min(1, 'Field name is required').max(100),
  type: FieldTypeEnum,
  required: z.boolean().default(false),
  defaultValue: z.unknown().optional(),
  options: z.array(selectOptionSchema).optional(), // For select/multiselect
  config: z.record(z.unknown()).optional(), // For additional field configuration
});

export type CreateFieldInput = z.infer<typeof createFieldSchema>;

// Update field schema
export const updateFieldSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: FieldTypeEnum.optional(),
  required: z.boolean().optional(),
  defaultValue: z.unknown().optional(),
  options: z.array(selectOptionSchema).optional(),
  config: z.record(z.unknown()).optional(),
});

export type UpdateFieldInput = z.infer<typeof updateFieldSchema>;

// Reorder fields schema
export const reorderFieldsSchema = z.object({
  fieldIds: z.array(z.string().uuid()).min(1),
});

export type ReorderFieldsInput = z.infer<typeof reorderFieldsSchema>;
