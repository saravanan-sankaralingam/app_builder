// Field types supported by the app builder
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'email'
  | 'phone'
  | 'url'
  | 'file'
  | 'image'
  | 'lookup'
  | 'formula'
  | 'user';

// View types supported by the app builder
export type ViewType = 'table' | 'form' | 'kanban' | 'calendar' | 'gallery' | 'timeline';

// App types
export type AppType = 'data' | 'workflow';

// Field schema definition
export interface FieldSchema {
  id: string;
  name: string;
  type: FieldType;
  required?: boolean;
  description?: string;
  defaultValue?: unknown;
  // For select/multiselect fields
  options?: string[];
  // For lookup fields
  lookupAppId?: string;
  lookupDisplayField?: string;
  // For formula fields
  formula?: string;
  // Field order in the app
  order: number;
}

// View schema definition
export interface ViewSchema {
  id: string;
  name: string;
  type: ViewType;
  isDefault?: boolean;
  config: ViewConfig;
}

// View-specific configurations
export interface TableViewConfig {
  columns: string[]; // field IDs
  defaultSort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface KanbanViewConfig {
  groupByField: string;
  cardTitleField: string;
  cardFields: string[];
}

export interface CalendarViewConfig {
  dateField: string;
  titleField: string;
  endDateField?: string;
}

export interface GalleryViewConfig {
  imageField?: string;
  titleField: string;
  subtitleField?: string;
  cardFields: string[];
}

export type ViewConfig =
  | TableViewConfig
  | KanbanViewConfig
  | CalendarViewConfig
  | GalleryViewConfig
  | Record<string, unknown>;

// Form layout schema
export interface FormLayoutItem {
  fieldId: string;
  width: 'full' | 'half' | 'third';
  readonly?: boolean;
}

export interface FormSchema {
  id: string;
  name: string;
  layout: FormLayoutItem[];
}

// Workflow transition schema
export interface WorkflowTransition {
  from: string;
  to: string;
  action: string;
  conditions?: WorkflowCondition[];
}

export interface WorkflowCondition {
  type: 'role' | 'field' | 'formula';
  role?: string;
  field?: string;
  operator?: string;
  value?: unknown;
}

export interface WorkflowSchema {
  enabled: boolean;
  statusField: string;
  transitions: WorkflowTransition[];
}

// Main App Schema
export interface AppSchema {
  id: string;
  name: string;
  slug: string;
  icon: string;
  iconBg: string;
  description?: string;
  type: AppType;
  fields: FieldSchema[];
  views: ViewSchema[];
  forms: FormSchema[];
  workflow?: WorkflowSchema;
  createdAt: string;
  updatedAt: string;
}

// Helper type for creating a new app
export interface CreateAppInput {
  name: string;
  icon: string;
  iconBg: string;
  description?: string;
  type?: AppType;
}

// Available icons for the icon picker
export const APP_ICONS = [
  'Users',
  'FileText',
  'Folder',
  'Calendar',
  'CheckSquare',
  'Package',
  'ShoppingCart',
  'DollarSign',
  'Mail',
  'Settings',
  'Clock',
  'Star',
  'Heart',
  'BookOpen',
  'Briefcase',
  'Database',
  'Layers',
  'Grid',
  'List',
  'BarChart',
] as const;

export type AppIconName = (typeof APP_ICONS)[number];

// Available colors for the icon background (Tailwind 500 shades with white icons)
export const APP_COLORS = [
  { name: 'Blue', value: '#3b82f6' },      // blue-500
  { name: 'Green', value: '#22c55e' },     // green-500
  { name: 'Amber', value: '#f59e0b' },     // amber-500
  { name: 'Red', value: '#ef4444' },       // red-500
  { name: 'Purple', value: '#a855f7' },    // purple-500
  { name: 'Pink', value: '#ec4899' },      // pink-500
  { name: 'Cyan', value: '#06b6d4' },      // cyan-500
  { name: 'Orange', value: '#f97316' },    // orange-500
] as const;

export type AppColor = (typeof APP_COLORS)[number];
