export type ArtifactCategory =
  | 'role'
  | 'dataform'
  | 'board'
  | 'process'
  | 'view'
  | 'report'
  | 'page'
  | 'navigation'

export type ArtifactType =
  | 'role'
  | 'dataform'
  | 'board'
  | 'process'
  | 'page'
  | 'datatable'
  | 'gallery'
  | 'sheet'
  | 'table-report'
  | 'chart-report'
  | 'pivot-report'
  | 'card-report'
  | 'navigation'

export interface Artifact {
  id: string
  name: string
  type: ArtifactType
  category: ArtifactCategory
  icon?: string
  iconBg?: string
  iconColor?: string
  metadata?: Record<string, any>
}

export interface ArtifactCategoryConfig {
  id: ArtifactCategory
  name: string
  icon: string
  description: string
}

// Category configurations (in requested order)
export const ARTIFACT_CATEGORIES: ArtifactCategoryConfig[] = [
  {
    id: 'role',
    name: 'Roles',
    icon: 'UserKey',
    description: 'User roles and permissions'
  },
  {
    id: 'dataform',
    name: 'Dataforms',
    icon: 'Database',
    description: 'Simple data collection forms'
  },
  {
    id: 'board',
    name: 'Boards',
    icon: 'LayoutGrid',
    description: 'Kanban-style workflow boards'
  },
  {
    id: 'process',
    name: 'Processes',
    icon: 'GitBranch',
    description: 'Structured workflow processes'
  },
  {
    id: 'view',
    name: 'Views',
    icon: 'Table',
    description: 'DataTables, Galleries, and Sheets'
  },
  {
    id: 'report',
    name: 'Reports',
    icon: 'BarChart3',
    description: 'Tables, Charts, Pivots, and Cards'
  },
  {
    id: 'page',
    name: 'Pages',
    icon: 'FileText',
    description: 'Custom pages and layouts'
  },
  {
    id: 'navigation',
    name: 'Navigations',
    icon: 'Menu',
    description: 'App navigation structure'
  }
]

// Type-specific styling configurations
export const ARTIFACT_TYPE_STYLES: Record<ArtifactType, { iconBg: string; iconColor: string }> = {
  role: { iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  dataform: { iconBg: 'bg-green-50', iconColor: 'text-green-600' },
  board: { iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
  process: { iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  page: { iconBg: 'bg-sky-50', iconColor: 'text-sky-600' },
  datatable: { iconBg: 'bg-teal-50', iconColor: 'text-teal-600' },
  gallery: { iconBg: 'bg-teal-50', iconColor: 'text-teal-600' },
  sheet: { iconBg: 'bg-teal-50', iconColor: 'text-teal-600' },
  'table-report': { iconBg: 'bg-pink-50', iconColor: 'text-pink-600' },
  'chart-report': { iconBg: 'bg-pink-50', iconColor: 'text-pink-600' },
  'pivot-report': { iconBg: 'bg-pink-50', iconColor: 'text-pink-600' },
  'card-report': { iconBg: 'bg-pink-50', iconColor: 'text-pink-600' },
  navigation: { iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' }
}
