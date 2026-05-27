'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  ArrowLeft,
  Settings,
  Palette,
  Pencil,
  Lock,
  EyeOff,
  X,
  GripVertical,
  Type,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type FieldPermission = 'edit' | 'readonly' | 'hidden'

interface Field {
  name: string
  type: string
  id: string
  required: boolean
}

interface Entity {
  id: string
  name: string
  type: 'Data Form' | 'Board' | 'Process'
  fields: Field[]
}

interface View {
  entityId: string
  name: string
  type: string
}

interface FilterCondition {
  id: string
  fieldId: string
  operator: string
  value: string
}

interface ViewBuilderProps {
  entity: Entity
  view: View
  onBack: () => void
}

export function ViewBuilder({ entity, view, onBack }: ViewBuilderProps) {
  const [tab, setTab] = useState<'settings' | 'style'>('settings')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    column: true,
    permissions: true,
    filter: false,
    quickFilter: false,
    bulkAction: false,
    sort: false,
  })
  const [columns, setColumns] = useState<string[]>(entity.fields.map((f) => f.id))
  const [permissions, setPermissions] = useState<Record<string, FieldPermission>>(
    Object.fromEntries(entity.fields.map((f) => [f.id, 'edit' as FieldPermission])),
  )
  const [filters, setFilters] = useState<FilterCondition[]>([])
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [tableStyle, setTableStyle] = useState('Basic')
  const [sortField, setSortField] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const toggleSection = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  const removeColumn = (fieldId: string) =>
    setColumns((prev) => prev.filter((id) => id !== fieldId))

  const addFilterCondition = () =>
    setFilters((prev) => [
      ...prev,
      {
        id: `f-${Date.now()}-${prev.length}`,
        fieldId: entity.fields[0]?.id || '',
        operator: 'Contains',
        value: '',
      },
    ])

  const removeFilter = (id: string) =>
    setFilters((prev) => prev.filter((f) => f.id !== id))

  const updateFilter = (id: string, patch: Partial<FilterCondition>) =>
    setFilters((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))

  const updatePermission = (fieldId: string, perm: FieldPermission) =>
    setPermissions((prev) => ({ ...prev, [fieldId]: perm }))

  const setAllPermissions = (perm: FieldPermission) =>
    setPermissions(
      Object.fromEntries(entity.fields.map((f) => [f.id, perm])) as Record<string, FieldPermission>,
    )

  const visibleColumns = entity.fields.filter((f) => columns.includes(f.id))

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Views
        </button>
        <span className="text-[12px] text-gray-400">/</span>
        <span className="text-[12px] text-gray-500">{entity.name}</span>
        <span className="text-[12px] text-gray-400">/</span>
        <span className="text-[12px] font-medium text-gray-900">{view.name}</span>
        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 rounded">
          {view.type}
        </span>
      </div>

      {/* Two column layout */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left: Preview */}
        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col min-w-0">
          <div className="px-4 py-2.5 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">{view.name}</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0">
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left font-medium text-gray-600 w-10">#</th>
                  {visibleColumns.map((field) => (
                    <th key={field.id} className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap">
                      {field.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-500">{rowIdx + 1}</td>
                    {visibleColumns.map((field) => (
                      <td key={field.id} className="px-3 py-2 text-gray-700 whitespace-nowrap">
                        <span className="inline-block bg-gray-100 rounded px-2 py-0.5 text-[11px] text-gray-500">
                          {field.name.toLowerCase().replace(/\s/g, '_')}_{rowIdx + 1}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
            <span>Rows per page: 10</span>
            <span>Showing 1 to 10 out of 30 entries</span>
          </div>
        </div>

        {/* Right: Config sidebar */}
        <div className="w-[280px] flex-shrink-0 border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col">
          {/* Title */}
          <div className="px-3 py-2.5 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">{view.name}</h3>
          </div>
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setTab('settings')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-medium border-b-2 transition-colors',
                tab === 'settings'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900',
              )}
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </button>
            <button
              onClick={() => setTab('style')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-medium border-b-2 transition-colors',
                tab === 'style'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900',
              )}
            >
              <Palette className="h-3.5 w-3.5" />
              Style
            </button>
          </div>

          {tab === 'settings' && (
            <div className="flex-1 overflow-auto">
              {/* COLUMN */}
              <Section
                title={`COLUMN (${columns.length})`}
                expanded={expanded.column}
                onToggle={() => toggleSection('column')}
                trailing={
                  <button className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                }
              >
                <div className="space-y-1.5 mb-3">
                  <label className="text-[11px] text-gray-600">Choose table style</label>
                  <select
                    value={tableStyle}
                    onChange={(e) => setTableStyle(e.target.value)}
                    className="w-full h-7 text-[12px] border border-gray-300 rounded px-2 bg-white"
                  >
                    <option>Basic</option>
                    <option>Compact</option>
                    <option>Comfortable</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-gray-600 mb-1">Manage columns</p>
                  {columns.map((fieldId) => {
                    const field = entity.fields.find((f) => f.id === fieldId)
                    if (!field) return null
                    return (
                      <div
                        key={fieldId}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded border border-gray-200 bg-white hover:border-gray-300 group"
                      >
                        <GripVertical className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <Type className="h-3 w-3 text-gray-500 flex-shrink-0" />
                        <span className="flex-1 text-[12px] text-gray-800 truncate">
                          {field.name}
                        </span>
                        <button
                          onClick={() => removeColumn(fieldId)}
                          className="text-red-500 hover:bg-red-50 rounded p-0.5 flex-shrink-0"
                          title="Remove column"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </Section>

              {/* FIELD PERMISSIONS */}
              <Section
                title="FIELD PERMISSIONS"
                expanded={expanded.permissions}
                onToggle={() => toggleSection('permissions')}
              >
                <button
                  onClick={() => setShowPermissionsModal(true)}
                  className="text-[12px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Manage <ChevronRight className="h-3 w-3" />
                </button>
              </Section>

              {/* DATA FILTER */}
              <Section
                title="DATA FILTER"
                expanded={expanded.filter}
                onToggle={() => toggleSection('filter')}
                trailing={
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      addFilterCondition()
                      setExpanded((p) => ({ ...p, filter: true }))
                    }}
                    className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                }
              >
                {filters.length === 0 ? (
                  <p className="text-[11px] text-gray-500">
                    No filters. Click + to add a condition.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {filters.map((f) => (
                      <div
                        key={f.id}
                        className="space-y-1 p-2 border border-gray-200 rounded bg-gray-50"
                      >
                        <div className="flex items-center gap-1">
                          <select
                            value={f.fieldId}
                            onChange={(e) => updateFilter(f.id, { fieldId: e.target.value })}
                            className="flex-1 h-6 text-[11px] border border-gray-300 rounded px-1 bg-white min-w-0"
                          >
                            {entity.fields.map((field) => (
                              <option key={field.id} value={field.id}>
                                {field.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeFilter(f.id)}
                            className="text-red-500 hover:bg-red-50 rounded p-0.5 flex-shrink-0"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                        </div>
                        <select
                          value={f.operator}
                          onChange={(e) => updateFilter(f.id, { operator: e.target.value })}
                          className="w-full h-6 text-[11px] border border-gray-300 rounded px-1 bg-white"
                        >
                          <option>Contains</option>
                          <option>Equals</option>
                          <option>Not equals</option>
                          <option>Starts with</option>
                          <option>Ends with</option>
                        </select>
                        <input
                          type="text"
                          value={f.value}
                          onChange={(e) => updateFilter(f.id, { value: e.target.value })}
                          placeholder="Value"
                          className="w-full h-6 text-[11px] border border-gray-300 rounded px-1.5 bg-white"
                        />
                      </div>
                    ))}
                    <button
                      onClick={addFilterCondition}
                      className="text-[11px] text-blue-600 hover:text-blue-700"
                    >
                      + Add new condition
                    </button>
                  </div>
                )}
              </Section>

              {/* QUICK FILTER */}
              <Section
                title="QUICK FILTER"
                expanded={expanded.quickFilter}
                onToggle={() => toggleSection('quickFilter')}
                trailing={
                  <button className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                }
              >
                <p className="text-[11px] text-gray-500">
                  Add quick filter chips that end-users can use to filter the view inline.
                </p>
              </Section>

              {/* BULK ACTION */}
              <Section
                title="BULK ACTION"
                expanded={expanded.bulkAction}
                onToggle={() => toggleSection('bulkAction')}
                trailing={
                  <button className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                }
              >
                <p className="text-[11px] text-gray-500">
                  Configure actions that can be performed on selected rows.
                </p>
              </Section>

              {/* DEFAULT SORT */}
              <Section
                title="DEFAULT SORT"
                expanded={expanded.sort}
                onToggle={() => toggleSection('sort')}
              >
                <div className="space-y-1.5">
                  <label className="text-[11px] text-gray-600">Sort by</label>
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className="w-full h-7 text-[12px] border border-gray-300 rounded px-2 bg-white"
                  >
                    <option value="">None</option>
                    {entity.fields.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={sortDirection}
                    onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                    className="w-full h-7 text-[12px] border border-gray-300 rounded px-2 bg-white"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </Section>
            </div>
          )}

          {tab === 'style' && (
            <div className="flex-1 p-3 text-[12px] text-gray-500">
              Style settings coming soon...
            </div>
          )}
        </div>
      </div>

      {/* Field Permissions Modal */}
      {showPermissionsModal && (
        <FieldPermissionsModal
          entity={entity}
          permissions={permissions}
          onChange={updatePermission}
          onSetAll={setAllPermissions}
          onClose={() => setShowPermissionsModal(false)}
        />
      )}
    </div>
  )
}

function Section({
  title,
  expanded,
  onToggle,
  trailing,
  children,
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  trailing?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
        <button onClick={onToggle} className="flex items-center gap-1 flex-1 text-left">
          <ChevronDown
            className={cn(
              'h-3 w-3 text-gray-500 transition-transform',
              !expanded && '-rotate-90',
            )}
          />
          <span className="text-[11px] font-semibold text-gray-700 tracking-wide">
            {title}
          </span>
        </button>
        {trailing}
      </div>
      {expanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  )
}

function FieldPermissionsModal({
  entity,
  permissions,
  onChange,
  onSetAll,
  onClose,
}: {
  entity: Entity
  permissions: Record<string, FieldPermission>
  onChange: (fieldId: string, perm: FieldPermission) => void
  onSetAll: (perm: FieldPermission) => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-[860px] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Field permissions</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5 bg-gray-50">
          <div className="bg-blue-50/40 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">{entity.name}</h4>
              {/* Set-all toggle */}
              <div className="flex items-center gap-0.5 bg-white rounded-full p-0.5 border border-gray-200">
                <button
                  onClick={() => onSetAll('edit')}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-white text-blue-600 hover:bg-blue-50"
                  title="Set all editable"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onSetAll('readonly')}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                  title="Set all read-only"
                >
                  <Lock className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onSetAll('hidden')}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                  title="Set all hidden"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {entity.fields.map((field) => (
                <FieldPermissionItem
                  key={field.id}
                  field={field}
                  permission={permissions[field.id]}
                  onChange={(p) => onChange(field.id, p)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function FieldPermissionItem({
  field,
  permission,
  onChange,
}: {
  field: Field
  permission: FieldPermission
  onChange: (p: FieldPermission) => void
}) {
  const [open, setOpen] = useState(false)
  const config = {
    edit: { icon: Pencil, color: 'text-blue-600', label: 'Editable' },
    readonly: { icon: Lock, color: 'text-gray-600', label: 'Read-only' },
    hidden: { icon: EyeOff, color: 'text-gray-500', label: 'Hidden' },
  } as const
  const current = config[permission]
  const CurrentIcon = current.icon

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-gray-700">
          {field.name}
          {field.required && <span className="text-red-500"> *</span>}
        </span>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded hover:bg-gray-100',
            current.color,
          )}
        >
          <CurrentIcon className="h-3 w-3" />
          {current.label}
        </button>
      </div>
      <input
        type="text"
        disabled={permission !== 'edit'}
        placeholder={
          permission === 'hidden'
            ? 'Hidden'
            : permission === 'readonly'
              ? 'Read-only'
              : `Enter ${field.name}`
        }
        className={cn(
          'w-full h-8 text-[12px] border border-gray-200 rounded px-2 bg-white',
          permission === 'hidden' && 'opacity-40 bg-gray-50',
          permission === 'readonly' && 'bg-gray-50 text-gray-500',
        )}
      />
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-6 z-20 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px]">
            {(['edit', 'readonly', 'hidden'] as FieldPermission[]).map((p) => {
              const c = config[p]
              const Icon = c.icon
              return (
                <button
                  key={p}
                  onClick={() => {
                    onChange(p)
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] hover:bg-gray-50',
                    permission === p ? `${c.color} font-medium` : 'text-gray-700',
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {c.label}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
