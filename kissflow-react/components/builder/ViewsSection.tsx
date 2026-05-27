'use client'

import {
  ClipboardList,
  LayoutGrid,
  Workflow,
  Table as TableIcon,
  Sheet,
  KanbanSquare,
  Grid3x3,
  GanttChart,
  List,
  Pencil,
  Lock,
  EyeOff,
} from 'lucide-react'

type EntityType = 'Data Form' | 'Board' | 'Process'
type ViewType = 'Table' | 'Gallery' | 'Sheet' | 'Kanban' | 'List' | 'Matrix' | 'Timeline'
type Permission = 'edit' | 'readonly' | 'hidden'

interface Field {
  name: string
  type: string
  id: string
  required: boolean
}

interface Entity {
  id: string
  name: string
  type: EntityType
  fields: Field[]
}

interface View {
  entityId: string
  name: string
  type: ViewType
}

interface ColumnSpec {
  fieldId: string
  permission: Permission
}

interface ViewSpec {
  description: string
  columns: ColumnSpec[]
  dataFilter?: string
  quickFilters?: string[]
  bulkActions?: string[]
  sort?: { fieldId: string; direction: 'asc' | 'desc' }
  tableStyle?: string
}

// Per-view spec details for Data Form views. Keyed by `${entityId}-${viewName}`.
const viewSpecs: Record<string, ViewSpec> = {
  // ── Leave Balance (id=2) ───────────────────────────────────────────────
  '2-All Balances': {
    description:
      "Tabular list of every employee's leave balance for the current year. Used by HR Admin to review and adjust balances.",
    columns: [
      { fieldId: 'employee', permission: 'readonly' },
      { fieldId: 'leave_type', permission: 'readonly' },
      { fieldId: 'total_days', permission: 'readonly' },
      { fieldId: 'used_days', permission: 'edit' },
      { fieldId: 'available_days', permission: 'readonly' },
      { fieldId: 'year', permission: 'readonly' },
    ],
    dataFilter: 'Year equals the current calendar year.',
    quickFilters: ['Leave Type'],
    bulkActions: ['Export to CSV', 'Recalculate balance'],
    sort: { fieldId: 'employee', direction: 'asc' },
    tableStyle: 'Basic',
  },
  '2-Employee Cards': {
    description:
      "Visual gallery showing each employee's available leave at a glance.",
    columns: [
      { fieldId: 'employee', permission: 'readonly' },
      { fieldId: 'leave_type', permission: 'readonly' },
      { fieldId: 'available_days', permission: 'readonly' },
      { fieldId: 'used_days', permission: 'readonly' },
    ],
    dataFilter: 'Year equals the current calendar year.',
    quickFilters: ['Leave Type'],
    sort: { fieldId: 'employee', direction: 'asc' },
  },
  '2-Bulk Edit': {
    description:
      'Spreadsheet-style editor for HR Admin to adjust multiple balances at once.',
    columns: [
      { fieldId: 'employee', permission: 'edit' },
      { fieldId: 'leave_type', permission: 'edit' },
      { fieldId: 'total_days', permission: 'edit' },
      { fieldId: 'used_days', permission: 'edit' },
      { fieldId: 'available_days', permission: 'readonly' },
      { fieldId: 'year', permission: 'edit' },
    ],
    bulkActions: ['Save changes', 'Discard changes'],
    sort: { fieldId: 'employee', direction: 'asc' },
  },

  // ── Holiday Calendar (id=3) ────────────────────────────────────────────
  '3-All Holidays': {
    description: 'Complete list of configured holidays across all regions.',
    columns: [
      { fieldId: 'holiday_name', permission: 'readonly' },
      { fieldId: 'date', permission: 'readonly' },
      { fieldId: 'type', permission: 'readonly' },
      { fieldId: 'description', permission: 'readonly' },
      { fieldId: 'country', permission: 'readonly' },
    ],
    quickFilters: ['Type', 'Country'],
    bulkActions: ['Export to CSV'],
    sort: { fieldId: 'date', direction: 'asc' },
    tableStyle: 'Basic',
  },
  '3-Calendar Cards': {
    description: 'Visual gallery of upcoming holidays, useful for planning.',
    columns: [
      { fieldId: 'holiday_name', permission: 'readonly' },
      { fieldId: 'date', permission: 'readonly' },
      { fieldId: 'type', permission: 'readonly' },
      { fieldId: 'country', permission: 'readonly' },
    ],
    dataFilter: 'Date is today or in the future.',
    quickFilters: ['Type', 'Country'],
    sort: { fieldId: 'date', direction: 'asc' },
  },
  '3-Bulk Upload': {
    description: 'Spreadsheet for HR Admin to bulk-import holiday entries.',
    columns: [
      { fieldId: 'holiday_name', permission: 'edit' },
      { fieldId: 'date', permission: 'edit' },
      { fieldId: 'type', permission: 'edit' },
      { fieldId: 'description', permission: 'edit' },
      { fieldId: 'country', permission: 'edit' },
    ],
    bulkActions: ['Import', 'Validate', 'Clear all'],
    sort: { fieldId: 'date', direction: 'asc' },
  },

  // ── Time-off Policy (id=4) ─────────────────────────────────────────────
  '4-Active Policies': {
    description: 'All active leave policies across the organization.',
    columns: [
      { fieldId: 'policy_name', permission: 'readonly' },
      { fieldId: 'leave_type', permission: 'readonly' },
      { fieldId: 'annual_allocation', permission: 'readonly' },
      { fieldId: 'accrual_rate', permission: 'readonly' },
      { fieldId: 'carry_over', permission: 'readonly' },
      { fieldId: 'max_carry_over', permission: 'readonly' },
      { fieldId: 'applicable_to', permission: 'readonly' },
    ],
    quickFilters: ['Leave Type', 'Applicable To'],
    bulkActions: ['Export'],
    sort: { fieldId: 'policy_name', direction: 'asc' },
    tableStyle: 'Basic',
  },
  '4-Policy Tiles': {
    description: 'Tile-style summary card for each policy.',
    columns: [
      { fieldId: 'policy_name', permission: 'readonly' },
      { fieldId: 'leave_type', permission: 'readonly' },
      { fieldId: 'annual_allocation', permission: 'readonly' },
      { fieldId: 'accrual_rate', permission: 'readonly' },
    ],
    quickFilters: ['Leave Type'],
    sort: { fieldId: 'annual_allocation', direction: 'desc' },
  },
  '4-Policy Editor': {
    description: 'Spreadsheet editor for HR Admin to configure policies.',
    columns: [
      { fieldId: 'policy_name', permission: 'edit' },
      { fieldId: 'leave_type', permission: 'edit' },
      { fieldId: 'annual_allocation', permission: 'edit' },
      { fieldId: 'accrual_rate', permission: 'edit' },
      { fieldId: 'carry_over', permission: 'edit' },
      { fieldId: 'max_carry_over', permission: 'edit' },
      { fieldId: 'applicable_to', permission: 'edit' },
    ],
    bulkActions: ['Save', 'Duplicate selected'],
    sort: { fieldId: 'policy_name', direction: 'asc' },
  },

  // ── Employee Directory (id=6) ──────────────────────────────────────────
  '6-All Employees': {
    description: 'Searchable directory of all employees.',
    columns: [
      { fieldId: 'emp_name', permission: 'readonly' },
      { fieldId: 'email', permission: 'readonly' },
      { fieldId: 'department', permission: 'readonly' },
      { fieldId: 'manager', permission: 'readonly' },
      { fieldId: 'join_date', permission: 'readonly' },
      { fieldId: 'emp_type', permission: 'readonly' },
    ],
    dataFilter: 'Employment Type is one of Full-time, Part-time, or Contract.',
    quickFilters: ['Department', 'Employment Type'],
    bulkActions: ['Export to CSV', 'Send email'],
    sort: { fieldId: 'emp_name', direction: 'asc' },
    tableStyle: 'Basic',
  },
  '6-Employee Cards': {
    description: 'Card grid showing employees with their basic contact info.',
    columns: [
      { fieldId: 'emp_name', permission: 'readonly' },
      { fieldId: 'email', permission: 'readonly' },
      { fieldId: 'department', permission: 'readonly' },
      { fieldId: 'manager', permission: 'readonly' },
    ],
    dataFilter: 'Employment Type is not Inactive.',
    quickFilters: ['Department'],
    sort: { fieldId: 'emp_name', direction: 'asc' },
  },
  '6-Bulk Import': {
    description:
      'Spreadsheet for HR Admin to import or update employee records.',
    columns: [
      { fieldId: 'emp_name', permission: 'edit' },
      { fieldId: 'email', permission: 'edit' },
      { fieldId: 'department', permission: 'edit' },
      { fieldId: 'manager', permission: 'edit' },
      { fieldId: 'join_date', permission: 'edit' },
      { fieldId: 'emp_type', permission: 'edit' },
    ],
    bulkActions: ['Import', 'Validate', 'Send welcome emails'],
    sort: { fieldId: 'join_date', direction: 'desc' },
  },
}

function getEntityTypeIcon(type: EntityType) {
  switch (type) {
    case 'Data Form':
      return { icon: ClipboardList, color: 'text-green-600', bgColor: 'bg-green-50' }
    case 'Board':
      return { icon: LayoutGrid, color: 'text-purple-600', bgColor: 'bg-purple-50' }
    case 'Process':
      return { icon: Workflow, color: 'text-orange-600', bgColor: 'bg-orange-50' }
  }
}

export function getViewTypeIcon(type: ViewType) {
  switch (type) {
    case 'Table': return { icon: TableIcon, color: 'text-blue-600', bgColor: 'bg-blue-50' }
    case 'Gallery': return { icon: LayoutGrid, color: 'text-pink-600', bgColor: 'bg-pink-50' }
    case 'Sheet': return { icon: Sheet, color: 'text-emerald-600', bgColor: 'bg-emerald-50' }
    case 'Kanban': return { icon: KanbanSquare, color: 'text-purple-600', bgColor: 'bg-purple-50' }
    case 'List': return { icon: List, color: 'text-slate-600', bgColor: 'bg-slate-50' }
    case 'Matrix': return { icon: Grid3x3, color: 'text-amber-600', bgColor: 'bg-amber-50' }
    case 'Timeline': return { icon: GanttChart, color: 'text-cyan-600', bgColor: 'bg-cyan-50' }
  }
}

function getPermissionMeta(p: Permission) {
  switch (p) {
    case 'edit':
      return { icon: Pencil, label: 'Editable', color: 'text-blue-700', bg: 'bg-blue-50' }
    case 'readonly':
      return { icon: Lock, label: 'Read-only', color: 'text-gray-600', bg: 'bg-gray-100' }
    case 'hidden':
      return { icon: EyeOff, label: 'Hidden', color: 'text-gray-500', bg: 'bg-gray-100' }
  }
}

function fieldName(entity: Entity, fieldId: string): string {
  return entity.fields.find((f) => f.id === fieldId)?.name ?? fieldId
}

function fieldType(entity: Entity, fieldId: string): string {
  return entity.fields.find((f) => f.id === fieldId)?.type ?? '—'
}

function formatSort(
  entity: Entity,
  sort?: { fieldId: string; direction: 'asc' | 'desc' },
): string {
  if (!sort) return 'No default sort.'
  return `${fieldName(entity, sort.fieldId)} (${sort.direction === 'asc' ? 'ascending' : 'descending'})`
}

interface ViewsSectionProps {
  entities: Entity[]
  views: View[]
  focusedView?: { entityId: string; viewName: string } | null
  hideHeader?: boolean
}

export function ViewsSection({ entities, views, focusedView, hideHeader }: ViewsSectionProps) {
  // Single-view detail mode (used by Spec Y when a view is selected in the nav).
  if (focusedView) {
    const entity = entities.find((e) => e.id === focusedView.entityId)
    const view = views.find(
      (v) => v.entityId === focusedView.entityId && v.name === focusedView.viewName,
    )
    if (!entity || !view) {
      return (
        <p className="text-[13px] text-gray-500">View not found.</p>
      )
    }
    const spec = viewSpecs[`${view.entityId}-${view.name}`]
    return <FocusedViewDetail entity={entity} view={view} spec={spec} />
  }

  // Overview mode — all entities, all views, grouped by entity.
  return (
    <div>
      {!hideHeader && (
        <>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Views</h2>
          <p className="text-[13px] text-gray-600 mb-4">
            Views available for each data entity, with their columns, filters, permissions, and behavior. Data Form views are documented in detail; Board and Process views are listed here and will be detailed in a later iteration.
          </p>
        </>
      )}
      <div className="space-y-6">
        {entities.map((entity) => {
          const entityViews = views.filter((v) => v.entityId === entity.id)
          if (entityViews.length === 0) return null
          return (
            <EntityViewsGroup key={entity.id} entity={entity} views={entityViews} />
          )
        })}
      </div>
    </div>
  )
}

function FocusedViewDetail({
  entity,
  view,
  spec,
}: {
  entity: Entity
  view: View
  spec?: ViewSpec
}) {
  const entityMeta = getEntityTypeIcon(entity.type)
  const EntityIcon = entityMeta.icon
  return (
    <div>
      {/* Entity context header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`${entityMeta.bgColor} rounded p-1`}>
          <EntityIcon className={`h-3.5 w-3.5 ${entityMeta.color}`} />
        </div>
        <span className="text-[12px] text-gray-600">{entity.name}</span>
        <span className="text-[11px] text-gray-400">·</span>
        <span className="text-[11px] text-gray-500">{entity.type}</span>
      </div>

      {/* The view spec card (or fallback when no spec exists yet) */}
      <div className="border border-gray-200 rounded-lg">
        {spec ? (
          <ViewSpecCard entity={entity} view={view} spec={spec} />
        ) : (
          <div className="px-4 py-4">
            <ViewSimpleRow view={view} />
            <p className="text-[12px] text-gray-500 mt-3">
              Detailed spec for this view type is coming soon. It will describe columns, filters, permissions, and actions in the same format as Data Form views.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function EntityViewsGroup({ entity, views }: { entity: Entity; views: View[] }) {
  const { icon: EntityIcon, color, bgColor } = getEntityTypeIcon(entity.type)
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Entity header */}
      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`${bgColor} rounded p-1`}>
            <EntityIcon className={`h-3.5 w-3.5 ${color}`} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">{entity.name}</h3>
          <span className="text-[11px] text-gray-500">{entity.type}</span>
        </div>
        <span className="text-[11px] text-gray-500">{views.length} views</span>
      </div>
      {/* Views */}
      <div className="divide-y divide-gray-100">
        {views.map((view) => {
          const spec = viewSpecs[`${view.entityId}-${view.name}`]
          if (spec && entity.type === 'Data Form') {
            return (
              <ViewSpecCard
                key={`${view.entityId}-${view.name}`}
                entity={entity}
                view={view}
                spec={spec}
              />
            )
          }
          return (
            <ViewSimpleRow
              key={`${view.entityId}-${view.name}`}
              view={view}
            />
          )
        })}
      </div>
    </div>
  )
}

function ViewSimpleRow({ view }: { view: View }) {
  const { icon: ViewIcon, color, bgColor } = getViewTypeIcon(view.type)
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <div className="flex items-center gap-2">
        <div className={`${bgColor} rounded p-1`}>
          <ViewIcon className={`h-3.5 w-3.5 ${color}`} />
        </div>
        <span className="text-[13px] text-gray-900">{view.name}</span>
      </div>
      <span className="text-[11px] font-medium text-gray-500">{view.type}</span>
    </div>
  )
}

function ViewSpecCard({
  entity,
  view,
  spec,
}: {
  entity: Entity
  view: View
  spec: ViewSpec
}) {
  const { icon: ViewIcon, color: viewColor, bgColor: viewBg } = getViewTypeIcon(view.type)
  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className={`${viewBg} rounded p-1`}>
          <ViewIcon className={`h-3.5 w-3.5 ${viewColor}`} />
        </div>
        <h4 className="text-[13px] font-semibold text-gray-900">{view.name}</h4>
        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-700 rounded">
          {view.type}
        </span>
      </div>

      {/* Description */}
      <p className="text-[12.5px] text-gray-700 leading-relaxed mb-3">
        {spec.description}
      </p>

      {/* Columns table */}
      <div className="mb-3">
        <h5 className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
          Columns ({spec.columns.length})
        </h5>
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-3 py-1.5 font-medium text-gray-600">Field</th>
                <th className="text-left px-3 py-1.5 font-medium text-gray-600">Type</th>
                <th className="text-left px-3 py-1.5 font-medium text-gray-600">Permission</th>
              </tr>
            </thead>
            <tbody>
              {spec.columns.map((col, idx) => {
                const meta = getPermissionMeta(col.permission)
                const PermIcon = meta.icon
                return (
                  <tr
                    key={col.fieldId}
                    className={idx !== spec.columns.length - 1 ? 'border-b border-gray-100' : ''}
                  >
                    <td className="px-3 py-1.5 text-gray-900">{fieldName(entity, col.fieldId)}</td>
                    <td className="px-3 py-1.5 text-gray-600">{fieldType(entity, col.fieldId)}</td>
                    <td className="px-3 py-1.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded ${meta.bg} ${meta.color}`}>
                        <PermIcon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Meta rows */}
      <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-1.5 text-[12px]">
        <dt className="text-gray-500 font-medium">Data filter</dt>
        <dd className="text-gray-800">{spec.dataFilter ?? 'No filter — shows all records.'}</dd>

        <dt className="text-gray-500 font-medium">Quick filters</dt>
        <dd className="text-gray-800">
          {spec.quickFilters && spec.quickFilters.length > 0
            ? spec.quickFilters.join(', ')
            : 'None'}
        </dd>

        <dt className="text-gray-500 font-medium">Bulk actions</dt>
        <dd className="text-gray-800">
          {spec.bulkActions && spec.bulkActions.length > 0
            ? spec.bulkActions.join(', ')
            : 'None'}
        </dd>

        <dt className="text-gray-500 font-medium">Default sort</dt>
        <dd className="text-gray-800">{formatSort(entity, spec.sort)}</dd>

        {spec.tableStyle && (
          <>
            <dt className="text-gray-500 font-medium">Table style</dt>
            <dd className="text-gray-800">{spec.tableStyle}</dd>
          </>
        )}
      </dl>
    </div>
  )
}
