'use client'

import { useState, useMemo } from 'react'
import { Users, Database, FileText, Compass, Workflow, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import {
  ReactFlow,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { getStaticApp } from '@/lib/static-apps'
import {
  getAppSpec,
  UNDEFINED_ASSIGNEE,
  type RoleSpec,
  type EntitySpec,
  type WorkflowSpec,
  type PageSpec,
  type NavigationSpec,
  type NavMenuItem,
  type PermissionLevel,
} from '@/lib/app-specs'

/**
 * Read-only spec panel for an app. Consumed by the Builder's Spec mode.
 *
 * The visual language matches the RightPane in the `/new/app` AI creation flow
 * (see `components/new-app/AppCreatingView.tsx`): pinned identity header on a
 * purple/magenta gradient card, then scrollable sections for Roles, Data
 * entities, Pages, and Navigation.
 *
 * Data comes from `lib/app-specs.ts`. If an app has no spec entry we render an
 * empty-state message so the panel never blows up on unknown ids.
 */

export function hasAppSpec(appId: string): boolean {
  return !!getAppSpec(appId)
}

export function AppSpecView({ appId }: { appId: string }) {
  const spec = getAppSpec(appId)
  const app = getStaticApp(appId)

  if (!spec || !app) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <p className="text-sm font-medium text-gray-700">No spec yet</p>
          <p className="text-xs text-gray-500 mt-1">
            This app doesn&apos;t have a spec entry. Add one in{' '}
            <code className="text-[11px] bg-gray-100 px-1 py-0.5 rounded">lib/app-specs.ts</code>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/75 backdrop-blur-2xl rounded-t-xl border border-b-0 border-white/90 shadow-[0_12px_40px_rgba(34,42,59,0.06),0_1px_3px_rgba(34,42,59,0.04)] flex flex-col min-h-0 overflow-hidden">
      {/* Pinned identity header */}
      <div className="p-5 flex-shrink-0">
        <div
          className="rounded-xl p-4"
          style={{
            background:
              'linear-gradient(135deg, var(--purple-100) 0%, var(--magenta-100) 100%)',
            border: '1px solid var(--purple-300)',
          }}
        >
          <AppIdentity name={app.name} description={app.description ?? ''} />
        </div>
      </div>

      {/* Two-column layout: 20% quick nav (left) + 80% scrollable content (right).
          NOTE: every flex-1 in this chain needs `min-w-0` — without it, a wide
          child (e.g. a workflow swimlane) forces the pane to grow past the
          available width instead of letting the child's own scroll take over. */}
      <div className="flex-1 flex min-h-0 min-w-0">
        {/* Left — Quick navigator (20%) */}
        <QuickNav
          sections={[
            { id: SPEC_SECTIONS.roles, label: 'Roles', icon: Users },
            { id: SPEC_SECTIONS.entities, label: 'Data entities', icon: Database },
            { id: SPEC_SECTIONS.workflows, label: 'Workflows', icon: Workflow },
            { id: SPEC_SECTIONS.pages, label: 'Pages', icon: FileText },
            { id: SPEC_SECTIONS.navigation, label: 'Navigation', icon: Compass },
          ]}
        />

        {/* Right — Spec content (80%) enclosed in a card container matching the left */}
        <div className="flex-1 flex pr-5 min-h-0 min-w-0">
          <div className="flex-1 min-w-0 rounded-t-xl border border-b-0 border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-y-auto overflow-x-hidden px-10 py-7 divide-y divide-gray-200 [&>*:not(:first-child)]:pt-9 [&>*:not(:last-child)]:pb-9">
            <Section
              id={SPEC_SECTIONS.roles}
              title="Roles"
              subtitle="Control access and responsibilities across your app"
              count={String(spec.roles.length)}
              accentColor="var(--magenta-500)"
            >
              <RoleList items={spec.roles} entities={spec.entities} />
            </Section>

            <Section
              id={SPEC_SECTIONS.entities}
              title="Data entities"
              subtitle="Schema definitions with field types and per-role permissions"
              count={String(spec.entities.length)}
              accentColor="var(--green-500)"
            >
              <div className="space-y-3">
                {spec.entities.map((entity) => (
                  <EntityCard key={entity.name} entity={entity} />
                ))}
              </div>
            </Section>

            <Section
              id={SPEC_SECTIONS.workflows}
              title="Workflows"
              subtitle="Process paths across roles, laid out as swimlanes"
              count={String(spec.workflows.length)}
              accentColor="var(--orange-500)"
            >
              <WorkflowList items={spec.workflows} roles={spec.roles} />
            </Section>

            <Section
              id={SPEC_SECTIONS.pages}
              title="Pages"
              subtitle="End-user pages composing the app interface"
              count={String(spec.pages.length)}
              accentColor="var(--blue-500)"
            >
              <PageList items={spec.pages} />
            </Section>

            <Section
              id={SPEC_SECTIONS.navigation}
              title="Navigation"
              subtitle="Menus tailored to each role group"
              count={String(spec.navigations.length)}
              accentColor="var(--purple-500)"
            >
              <NavSitemap items={spec.navigations} />
            </Section>
          </div>
        </div>
      </div>
    </div>
  )
}

// Anchor ids shared between the quick navigator and the section headers.
const SPEC_SECTIONS = {
  roles: 'spec-section-roles',
  entities: 'spec-section-entities',
  workflows: 'spec-section-workflows',
  pages: 'spec-section-pages',
  navigation: 'spec-section-navigation',
} as const

interface QuickNavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

function QuickNav({ sections }: { sections: QuickNavItem[] }) {
  const handleClick = (id: string) => {
    const target = document.getElementById(id)
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <aside className="w-1/5 flex-shrink-0 px-5 flex">
      <div className="flex-1 rounded-t-xl border border-b-0 border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <p className="text-[11px] font-normal uppercase tracking-wide text-gray-700 mb-3">
          In this spec
        </p>
        <nav className="space-y-1">
          {sections.map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleClick(s.id)}
                className="w-full flex items-center gap-2.5 text-left px-2 py-1.5 rounded-md text-[13px] font-medium text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Icon className="w-[16px] h-[16px] flex-shrink-0 text-gray-700" strokeWidth={1.75} />
                <span className="truncate">{s.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

// ─── Identity ───────────────────────────────────────────────────────────────
const FALLBACK_DESCRIPTION =
  'An application from the Kissflow Platform. The spec below covers roles, data entities, pages, and navigation as they were defined at build time.'

function AppIdentity({ name, description }: { name: string; description: string }) {
  const trimmed = description?.trim() ?? ''
  const displayDescription = trimmed.length > 60 ? trimmed : FALLBACK_DESCRIPTION
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-[16px] font-semibold text-gray-900 tracking-tight leading-snug min-w-0 truncate">
          {name}
        </h3>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[12px] text-gray-600 leading-none">
            Last updated 5 mins ago
          </span>
          <button
            type="button"
            className="flex items-center gap-1 text-[12px] font-medium text-blue-600 hover:underline leading-none"
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
            Refresh
          </button>
        </div>
      </div>
      <p className="mt-1.5 text-[13px] text-gray-600 leading-relaxed whitespace-pre-line">
        {displayDescription}
      </p>
    </div>
  )
}

// ─── Section wrapper ────────────────────────────────────────────────────────
function Section({
  id,
  title,
  subtitle,
  count,
  accentColor,
  children,
}: {
  id?: string
  title: string
  subtitle?: string
  count?: string
  accentColor: string
  children: React.ReactNode
}) {
  return (
    <div id={id} className="scroll-mt-4">
      <div className="flex items-center gap-2.5">
        <span
          className="w-[3px] h-5 rounded-sm flex-shrink-0"
          style={{ backgroundColor: accentColor }}
          aria-hidden="true"
        />
        <h3 className="text-[18px] font-semibold text-gray-900 tracking-tight leading-snug">
          {title}
        </h3>
        {count !== undefined && <CountBadge>{count}</CountBadge>}
      </div>
      {subtitle && (
        <p className="text-[13px] text-gray-600 leading-relaxed mt-1 ml-[13px]">{subtitle}</p>
      )}
      <div className="mt-3.5">{children}</div>
    </div>
  )
}

function CountBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] bg-gray-100 text-gray-700 px-1.5 py-1 rounded-full font-medium leading-none">
      {children}
    </span>
  )
}

// ─── Field type + permission badges ────────────────────────────────────────
const FIELD_TYPE_BADGE: Record<string, string> = {
  Text: 'bg-gray-100 text-gray-700',
  Number: 'bg-gray-100 text-gray-700',
  Date: 'bg-blue-100 text-blue-700',
  Currency: 'bg-green-100 text-green-700',
  Reference: 'bg-purple-100 text-purple-700',
  Dropdown: 'bg-cyan-100 text-cyan-700',
  Status: 'bg-magenta-100 text-magenta-700',
  User: 'bg-purple-100 text-purple-700',
}

function FieldTypeBadge({ type }: { type: string }) {
  const cls = FIELD_TYPE_BADGE[type] ?? 'bg-gray-100 text-gray-700'
  return (
    <span
      className={`inline-block text-[11px] ${cls} px-1.5 py-0.5 rounded font-medium leading-none`}
    >
      {type}
    </span>
  )
}

const PERMISSION_BADGE: Record<PermissionLevel, { cls: string; label: string }> = {
  read: { cls: 'bg-gray-100 text-gray-700', label: 'Read-only' },
  edit: { cls: 'bg-blue-100 text-blue-700', label: 'Edit' },
  manage: { cls: 'bg-green-100 text-green-700', label: 'Manage' },
}

function PermissionChip({ level }: { level: PermissionLevel }) {
  const { cls, label } = PERMISSION_BADGE[level]
  return (
    <span
      className={`inline-block text-[11px] ${cls} px-2 py-0.5 rounded font-medium leading-none`}
    >
      {label}
    </span>
  )
}

// ─── Roles ──────────────────────────────────────────────────────────────────
function RoleList({ items, entities }: { items: RoleSpec[]; entities: EntitySpec[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <RoleCard key={item.name} role={item} entities={entities} />
      ))}
    </ul>
  )
}

function RoleCard({ role, entities }: { role: RoleSpec; entities: EntitySpec[] }) {
  const [expanded, setExpanded] = useState(false)

  // Build the role's per-entity permission list. Entities where this role has
  // no explicit permission are shown as "No access" so the table is complete.
  const rolePermissions = entities.map((entity) => {
    const perm = entity.permissions.find((p) => p.role === role.name)
    return { entity: entity.name, level: perm?.level ?? null }
  })

  return (
    <li className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-all">
      <div className="flex items-start gap-2.5">
        <Users
          className="w-[18px] h-[18px] flex-shrink-0 mt-0.5"
          strokeWidth={1.75}
          style={{ color: 'var(--magenta-500)' }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-gray-900 leading-snug">
            {role.name}
          </p>
          <p className="text-[13px] text-gray-600 leading-relaxed mt-1">
            {role.description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 ml-[26px] flex items-center gap-1 text-[12px] font-medium text-blue-600 hover:underline leading-none"
        aria-expanded={expanded}
      >
        {expanded ? 'Hide permissions' : 'View permissions'}
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5" strokeWidth={1.75} />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.75} />
        )}
      </button>

      {expanded && (
        <div className="mt-3 ml-[26px] border border-gray-200 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-[12px] leading-snug">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left px-3 py-2 font-medium text-gray-700 border-b border-gray-200">
                  Data entity
                </th>
                <th className="text-left px-3 py-2 font-medium text-gray-700 border-b border-gray-200">
                  Permission
                </th>
              </tr>
            </thead>
            <tbody>
              {rolePermissions.map((p, i) => (
                <tr
                  key={p.entity}
                  className={i < rolePermissions.length - 1 ? 'border-b border-gray-100' : ''}
                >
                  <td className="px-3 py-2 text-gray-900">{p.entity}</td>
                  <td className="px-3 py-2">
                    {p.level ? (
                      <PermissionChip level={p.level} />
                    ) : (
                      <span className="text-[11px] text-gray-500 font-medium leading-none">
                        No access
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </li>
  )
}

// ─── Entity card ────────────────────────────────────────────────────────────
function EntityCard({ entity }: { entity: EntitySpec }) {
  const requiredCount = entity.fields.filter((f) => f.required).length
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-all">
      <div className="flex items-start gap-2.5">
        <Database
          className="w-[18px] h-[18px] flex-shrink-0 mt-0.5"
          strokeWidth={1.75}
          style={{ color: 'var(--green-500)' }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-[14px] font-semibold text-gray-900 leading-snug">
              {entity.name}
            </h4>
            <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
              {entity.fields.length} fields · {requiredCount} required
            </span>
          </div>
          <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
            {entity.description}
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-[12px] leading-snug">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-3 py-2 font-medium text-gray-700 border-b border-gray-200">
                Field Name
              </th>
              <th className="text-left px-3 py-2 font-medium text-gray-700 border-b border-gray-200">
                Type
              </th>
            </tr>
          </thead>
          <tbody>
            {entity.fields.map((field, i) => (
              <tr
                key={field.id}
                className={i < entity.fields.length - 1 ? 'border-b border-gray-100' : ''}
              >
                <td className="px-3 py-2 text-gray-900">
                  {field.name}
                  {field.required && (
                    <span
                      className="text-red-500 ml-0.5"
                      aria-label="Required"
                    >
                      *
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <FieldTypeBadge type={field.type} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

// ─── Workflows ──────────────────────────────────────────────────────────────
// The swimlane diagram is rendered with @xyflow/react (React Flow). Two custom
// node types are registered: `stepChip` for the rectangular step and `diamond`
// for a branching decision. Edges use React Flow's built-in `smoothstep` type
// for orthogonal routing with rounded corners; we choose source and target
// handles per edge so a diamond exits from the top/right/bottom based on the
// target row's position relative to its own row.

// Layout geometry — kept in one place so the swimlane background grid and the
// node positioning stay in lock-step.
const WF_LAYOUT = {
  laneLabelWidth: 160,
  columnWidth: 200,
  headerHeight: 36,
  rowHeight: 80,
  chipWidth: 152,
  chipHeight: 44,
  diamondSize: 32,
}

// Handles are functional (React Flow uses them for edge attach points) but
// visually hidden — this is a read-only spec view, not an interactive editor.
const HIDDEN_HANDLE_STYLE: React.CSSProperties = {
  opacity: 0,
  background: 'transparent',
  border: 'none',
}

type StepChipData = { step: WorkflowSpec['steps'][number] }
type DiamondData = { step: WorkflowSpec['steps'][number]; tooltip: string }

function StepChipNode(props: NodeProps) {
  const { step } = props.data as StepChipData
  const isConditional = !!step.condition
  return (
    <div
      className={
        'rounded-md px-2.5 py-1.5 text-[12px] font-medium leading-snug ' +
        (step.optional ? 'border-dashed' : '')
      }
      style={{
        width: WF_LAYOUT.chipWidth,
        backgroundColor: 'var(--orange-100)',
        border: `1px ${step.optional ? 'dashed' : 'solid'} var(--orange-300)`,
        color: 'var(--orange-700)',
      }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-semibold flex-shrink-0"
          style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
        >
          {step.column}
        </span>
        <span className="truncate">{step.name}</span>
      </div>
      {isConditional && (
        <div
          className="mt-1 text-[10px] font-normal italic leading-none"
          style={{ color: 'var(--orange-600)' }}
        >
          {step.condition}
        </div>
      )}
      <Handle id="target-left" type="target" position={Position.Left} style={HIDDEN_HANDLE_STYLE} />
      <Handle id="target-top" type="target" position={Position.Top} style={HIDDEN_HANDLE_STYLE} />
      <Handle id="target-bottom" type="target" position={Position.Bottom} style={HIDDEN_HANDLE_STYLE} />
      <Handle id="source-right" type="source" position={Position.Right} style={HIDDEN_HANDLE_STYLE} />
    </div>
  )
}

function DiamondNode(props: NodeProps) {
  const { step, tooltip } = props.data as DiamondData
  return (
    <div
      title={tooltip}
      className="relative flex items-center justify-center cursor-help"
      style={{ width: WF_LAYOUT.diamondSize, height: WF_LAYOUT.diamondSize }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundColor: 'var(--orange-100)',
          border: `1.5px ${step.optional ? 'dashed' : 'solid'} var(--orange-500)`,
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        }}
      />
      <span
        className="relative text-[13px] font-bold leading-none"
        style={{ color: 'var(--orange-500)' }}
      >
        ?
      </span>
      <Handle id="target-left" type="target" position={Position.Left} style={HIDDEN_HANDLE_STYLE} />
      <Handle id="source-right" type="source" position={Position.Right} style={HIDDEN_HANDLE_STYLE} />
      <Handle id="source-top" type="source" position={Position.Top} style={HIDDEN_HANDLE_STYLE} />
      <Handle id="source-bottom" type="source" position={Position.Bottom} style={HIDDEN_HANDLE_STYLE} />
    </div>
  )
}

const workflowNodeTypes = {
  stepChip: StepChipNode,
  diamond: DiamondNode,
}

// Native tooltip text for a branching step — enumerates every next step and
// the condition (if any) that gates the branch.
function buildBranchTooltip(step: WorkflowSpec['steps'][number], workflow: WorkflowSpec): string {
  if (step.next.length <= 1) return ''
  const lines = step.next
    .map((nextId) => {
      const target = workflow.steps.find((s) => s.id === nextId)
      if (!target) return null
      const cond = target.condition ?? 'default path'
      return `→ ${target.name}: ${cond}`
    })
    .filter(Boolean)
  return `Condition\n${lines.join('\n')}`
}

interface WorkflowLayout {
  nodes: Node[]
  edges: Edge[]
  rowOrder: string[]
  maxColumn: number
  stepAreaWidth: number
  stepAreaHeight: number
}

function buildWorkflowLayout(workflow: WorkflowSpec, roles: RoleSpec[]): WorkflowLayout {
  const { columnWidth, rowHeight, chipWidth, chipHeight, diamondSize } = WF_LAYOUT

  const usedAssignees = new Set(workflow.steps.map((s) => s.assignee))
  const rowOrder = [
    ...roles.map((r) => r.name).filter((n) => usedAssignees.has(n)),
    ...(usedAssignees.has(UNDEFINED_ASSIGNEE) ? [UNDEFINED_ASSIGNEE] : []),
  ]
  const rowIdx = new Map(rowOrder.map((a, i) => [a, i]))
  const maxColumn = workflow.steps.reduce((m, s) => Math.max(m, s.column), 1)

  // Node positions are relative to the STEP AREA only (0,0 = top-left of the
  // step area, not the whole swimlane). The assignee column and header row
  // live in separate sticky cells outside React Flow's container.
  const stepAreaWidth = maxColumn * columnWidth
  const stepAreaHeight = rowOrder.length * rowHeight

  const nodes: Node[] = workflow.steps.map((step) => {
    const isBranching = step.next.length > 1
    const rIdx = rowIdx.get(step.assignee) ?? 0
    const nodeWidth = isBranching ? diamondSize : chipWidth
    const nodeHeight = isBranching ? diamondSize : chipHeight
    const x = (step.column - 1) * columnWidth + (columnWidth - nodeWidth) / 2
    const y = rIdx * rowHeight + (rowHeight - nodeHeight) / 2
    return {
      id: step.id,
      type: isBranching ? 'diamond' : 'stepChip',
      position: { x, y },
      data: isBranching
        ? { step, tooltip: buildBranchTooltip(step, workflow) }
        : { step },
      draggable: false,
      selectable: false,
    }
  })

  const edges: Edge[] = []
  for (const step of workflow.steps) {
    const isBranching = step.next.length > 1
    const sourceRow = rowIdx.get(step.assignee) ?? 0
    for (const nextId of step.next) {
      const target = workflow.steps.find((s) => s.id === nextId)
      if (!target) continue
      const targetRow = rowIdx.get(target.assignee) ?? 0

      let sourceHandle: string
      let targetHandle: string

      if (targetRow === sourceRow) {
        sourceHandle = 'source-right'
        targetHandle = 'target-left'
      } else if (targetRow < sourceRow) {
        // Target is ABOVE — diamond exits top, chip still exits right.
        sourceHandle = isBranching ? 'source-top' : 'source-right'
        targetHandle = isBranching ? 'target-bottom' : 'target-left'
      } else {
        // Target is BELOW — diamond exits bottom, chip still exits right.
        sourceHandle = isBranching ? 'source-bottom' : 'source-right'
        targetHandle = isBranching ? 'target-top' : 'target-left'
      }

      edges.push({
        id: `${step.id}->${nextId}`,
        source: step.id,
        target: nextId,
        sourceHandle,
        targetHandle,
        type: 'smoothstep',
        style: { stroke: 'var(--orange-500)', strokeWidth: 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'var(--orange-500)',
          width: 16,
          height: 16,
        },
      })
    }
  }

  return { nodes, edges, rowOrder, maxColumn, stepAreaWidth, stepAreaHeight }
}

// WorkflowList — thin wrapper that just maps to WorkflowCard.
function WorkflowList({ items, roles }: { items: WorkflowSpec[]; roles: RoleSpec[] }) {
  return (
    <div className="space-y-3">
      {items.map((wf) => (
        <WorkflowCard key={wf.name} workflow={wf} roles={roles} />
      ))}
    </div>
  )
}

// WorkflowCard — the swimlane is a CSS-Grid table:
//   Row 1  = sticky-top header row (Assignee corner + Step 1, Step 2, …)
//   Row 2  = body (sticky-left assignee column + React Flow step area)
// The outer wrapper is `overflow-auto` with a max-height so the scroll
// happens INSIDE the card. The corner cell is sticky in both directions,
// the header row sticks to the top for vertical scroll, the assignee
// column sticks to the left for horizontal scroll, and the React Flow
// canvas is confined to the step area only (no more laneLabelWidth offset).
function WorkflowCard({ workflow, roles }: { workflow: WorkflowSpec; roles: RoleSpec[] }) {
  const layout = useMemo(() => buildWorkflowLayout(workflow, roles), [workflow, roles])
  const { laneLabelWidth, columnWidth, headerHeight, rowHeight } = WF_LAYOUT
  const { rowOrder, maxColumn, stepAreaWidth, stepAreaHeight, nodes, edges } = layout
  const totalWidth = laneLabelWidth + stepAreaWidth

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-all">
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <Workflow
          className="w-[18px] h-[18px] flex-shrink-0 mt-0.5"
          strokeWidth={1.75}
          style={{ color: 'var(--orange-500)' }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-[14px] font-semibold text-gray-900 leading-snug">
              {workflow.name}
            </h4>
            {workflow.entity && (
              <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
                on {workflow.entity}
              </span>
            )}
          </div>
          <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
            {workflow.description}
          </p>
        </div>
      </div>

      {/* Swimlane */}
      <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-auto max-w-full" style={{ maxHeight: 480 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `${laneLabelWidth}px ${stepAreaWidth}px`,
              gridTemplateRows: `${headerHeight}px ${stepAreaHeight}px`,
              width: totalWidth,
            }}
          >
            {/* Corner cell — sticky top AND left */}
            <div
              className="flex items-center px-3 text-[12px] font-medium text-gray-700 bg-gray-100"
              style={{
                position: 'sticky',
                top: 0,
                left: 0,
                zIndex: 30,
                gridRow: 1,
                gridColumn: 1,
                borderRight: '1px solid var(--gray-200)',
                borderBottom: '1px solid var(--gray-200)',
              }}
            >
              Assignee
            </div>

            {/* Step header row — sticky top only */}
            <div
              className="flex bg-gray-100"
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 20,
                gridRow: 1,
                gridColumn: 2,
                borderBottom: '1px solid var(--gray-200)',
                width: stepAreaWidth,
                height: headerHeight,
              }}
            >
              {Array.from({ length: maxColumn }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center px-3 text-[12px] font-medium text-gray-700"
                  style={{
                    width: columnWidth,
                    height: headerHeight,
                    borderRight: i < maxColumn - 1 ? '1px solid var(--gray-200)' : undefined,
                  }}
                >
                  Step {i + 1}
                </div>
              ))}
            </div>

            {/* Assignee column — sticky left only */}
            <div
              className="bg-white"
              style={{
                position: 'sticky',
                left: 0,
                zIndex: 10,
                gridRow: 2,
                gridColumn: 1,
                width: laneLabelWidth,
                height: stepAreaHeight,
                borderRight: '1px solid var(--gray-200)',
              }}
            >
              {rowOrder.map((assignee, r) => {
                const isUndefined = assignee === UNDEFINED_ASSIGNEE
                return (
                  <div
                    key={assignee}
                    className={
                      'flex items-center px-3 text-[12px] font-medium ' +
                      (isUndefined ? 'italic text-gray-600' : 'text-gray-900')
                    }
                    style={{
                      height: rowHeight,
                      borderBottom: r < rowOrder.length - 1 ? '1px solid var(--gray-200)' : undefined,
                    }}
                    title={isUndefined ? 'Assignee resolved at runtime by a condition' : undefined}
                  >
                    {assignee}
                  </div>
                )
              })}
            </div>

            {/* Step area — React Flow + grid dividers */}
            <div
              style={{
                gridRow: 2,
                gridColumn: 2,
                position: 'relative',
                width: stepAreaWidth,
                height: stepAreaHeight,
              }}
            >
              {/* Vertical column dividers */}
              {Array.from({ length: maxColumn - 1 }).map((_, i) => (
                <div
                  key={`vdiv-${i}`}
                  className="absolute pointer-events-none"
                  style={{
                    left: (i + 1) * columnWidth - 1,
                    top: 0,
                    width: 1,
                    height: stepAreaHeight,
                    background: 'var(--gray-200)',
                  }}
                />
              ))}
              {/* Horizontal row dividers */}
              {Array.from({ length: rowOrder.length - 1 }).map((_, i) => (
                <div
                  key={`hdiv-${i}`}
                  className="absolute pointer-events-none"
                  style={{
                    top: (i + 1) * rowHeight - 1,
                    left: 0,
                    width: stepAreaWidth,
                    height: 1,
                    background: 'var(--gray-200)',
                  }}
                />
              ))}

              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={workflowNodeTypes}
                nodesDraggable={false}
                nodesConnectable={false}
                nodesFocusable={false}
                edgesFocusable={false}
                elementsSelectable={false}
                panOnDrag={false}
                zoomOnScroll={false}
                zoomOnDoubleClick={false}
                zoomOnPinch={false}
                panOnScroll={false}
                preventScrolling={false}
                fitView={false}
                proOptions={{ hideAttribution: true }}
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                style={{ background: 'transparent' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Pages ──────────────────────────────────────────────────────────────────
function PageList({ items }: { items: PageSpec[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li
          key={item.name}
          className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-all flex gap-3"
        >
          <FileText
            className="w-[18px] h-[18px] flex-shrink-0 mt-0.5"
            strokeWidth={1.75}
            style={{ color: 'var(--blue-500)' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-gray-900 leading-snug">
              {item.name}
            </p>
            <p className="text-[13px] text-gray-600 leading-relaxed mt-1">
              {item.description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

// ─── Navigation ─────────────────────────────────────────────────────────────
function NavSitemap({ items }: { items: NavigationSpec[] }) {
  return (
    <ul className="space-y-3">
      {items.map((nav) => (
        <li
          key={nav.title}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-all"
        >
          <div className="flex items-start gap-2.5">
            <Compass
              className="w-[18px] h-[18px] flex-shrink-0 mt-0.5"
              strokeWidth={1.75}
              style={{ color: 'var(--purple-500)' }}
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-semibold text-gray-900 leading-snug">
                {nav.title}
              </h4>
              <p className="text-[12px] text-gray-500 mt-1">
                <span className="font-medium">Shared with:</span> {nav.sharedWith.join(', ')}
              </p>
              <div className="mt-3">
                <NavMenu items={nav.menu} />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function NavMenu({ items, depth = 0 }: { items: NavMenuItem[]; depth?: number }) {
  return (
    <ul className={depth === 0 ? 'space-y-1.5' : 'space-y-1 mt-1'}>
      {items.map((item, i) => (
        <li key={i}>
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] text-gray-900 font-medium">{item.label}</span>
            {item.page && (
              <span className="text-[11px] text-gray-500">→ {item.page}</span>
            )}
          </div>
          {item.children && item.children.length > 0 && (
            <div className="pl-4 border-l border-gray-200 ml-1 mt-1.5">
              <NavMenu items={item.children} depth={depth + 1} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
