'use client'

import { useState, useMemo } from 'react'
import { Users, User, Database, FileText, Compass, Workflow, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
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
              <WorkflowList items={spec.workflows} />
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
  columnWidth: 224,
  rowHeight: 108,
  chipWidth: 180,
  chipHeight: 62,
  terminalWidth: 116,
  terminalHeight: 40,
  padding: 28,
}

// Handles are functional (React Flow uses them for edge attach points) but
// visually hidden — this is a read-only spec view, not an interactive editor.
const HIDDEN_HANDLE_STYLE: React.CSSProperties = {
  opacity: 0,
  background: 'transparent',
  border: 'none',
}

type StepChipData = { step: WorkflowSpec['steps'][number]; tooltip?: string }
type TerminalData = { label: string }

function StepChipNode(props: NodeProps) {
  const { step, tooltip } = props.data as StepChipData
  const isBranching = step.next.length > 1
  const isUndefined = step.assignee === UNDEFINED_ASSIGNEE
  return (
    <div
      title={isBranching ? tooltip : undefined}
      className={
        'rounded-md px-2.5 py-1.5 text-[12px] font-medium leading-snug ' +
        (isBranching ? 'cursor-help ' : '') +
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
        {isBranching ? (
          // Branching step keeps the decision-diamond glyph as its badge.
          <span
            className="inline-flex items-center justify-center flex-shrink-0 text-[9px] font-bold"
            style={{
              width: 16,
              height: 16,
              backgroundColor: 'var(--orange-500)',
              color: 'white',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
          >
            ?
          </span>
        ) : (
          <span
            className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-semibold flex-shrink-0"
            style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
          >
            {step.column}
          </span>
        )}
        <span className="truncate">{step.name}</span>
      </div>
      {/* Assignee — shown inline on every step now that swimlanes are gone */}
      <div
        className="mt-1 flex items-center gap-1 text-[10px] font-normal leading-none"
        style={{ color: 'var(--orange-600)' }}
      >
        <User className="w-3 h-3 flex-shrink-0" strokeWidth={1.75} />
        <span className={'truncate' + (isUndefined ? ' italic' : '')}>{step.assignee}</span>
      </div>
      {step.condition && (
        <div
          className="mt-1 text-[10px] font-normal italic leading-none"
          style={{ color: 'var(--orange-600)' }}
        >
          {step.condition}
        </div>
      )}
      <Handle id="target-left" type="target" position={Position.Left} style={HIDDEN_HANDLE_STYLE} />
      <Handle id="source-right" type="source" position={Position.Right} style={HIDDEN_HANDLE_STYLE} />
    </div>
  )
}

// Start ("Initiate") / end ("Finish") markers — solid orange pills.
function TerminalNode(props: NodeProps) {
  const { label } = props.data as TerminalData
  return (
    <div
      className="rounded-full px-4 flex items-center justify-center text-[12px] font-semibold leading-none"
      style={{
        width: WF_LAYOUT.terminalWidth,
        height: WF_LAYOUT.terminalHeight,
        backgroundColor: 'var(--orange-500)',
        color: 'white',
        border: '1px solid var(--orange-500)',
      }}
    >
      {label}
      <Handle id="target-left" type="target" position={Position.Left} style={HIDDEN_HANDLE_STYLE} />
      <Handle id="source-right" type="source" position={Position.Right} style={HIDDEN_HANDLE_STYLE} />
    </div>
  )
}

const workflowNodeTypes = {
  stepChip: StepChipNode,
  terminal: TerminalNode,
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
  width: number
  height: number
}

// Free-form left-to-right graph (no swimlanes). Steps are placed by their
// `column` (x) and stacked vertically within a column when parallel branches
// share it. Two synthetic nodes bookend every workflow: an "Initiate" start
// node feeding the root step(s), and a "Finish" node into which every terminal
// branch converges.
function buildWorkflowLayout(workflow: WorkflowSpec): WorkflowLayout {
  const { columnWidth, rowHeight, chipHeight, terminalWidth, terminalHeight, padding } = WF_LAYOUT
  const steps = workflow.steps
  const maxColumn = steps.reduce((m, s) => Math.max(m, s.column), 1)
  const INITIATE_COL = 0
  const FINISH_COL = maxColumn + 1

  // Group steps by column so parallel branches in the same column can stack.
  const byCol = new Map<number, WorkflowSpec['steps']>()
  for (const s of steps) {
    const arr = byCol.get(s.column) ?? []
    arr.push(s)
    byCol.set(s.column, arr)
  }
  const maxRows = Math.max(1, ...[...byCol.values()].map((a) => a.length))
  const canvasHeight = maxRows * rowHeight
  const centerY = padding + canvasHeight / 2

  const nodes: Node[] = []

  // Initiate — always the first node.
  nodes.push({
    id: '__initiate__',
    type: 'terminal',
    position: { x: padding + INITIATE_COL * columnWidth, y: centerY - terminalHeight / 2 },
    data: { label: 'Initiate' },
    draggable: false,
    selectable: false,
  })

  // Step nodes, vertically centered within each column.
  for (const [col, arr] of byCol) {
    const n = arr.length
    arr.forEach((step, i) => {
      const slotCenter = centerY + (i - (n - 1) / 2) * rowHeight
      nodes.push({
        id: step.id,
        type: 'stepChip',
        position: { x: padding + col * columnWidth, y: slotCenter - chipHeight / 2 },
        data: step.next.length > 1 ? { step, tooltip: buildBranchTooltip(step, workflow) } : { step },
        draggable: false,
        selectable: false,
      })
    })
  }

  // Finish — always the last node; parallel branches converge here.
  nodes.push({
    id: '__finish__',
    type: 'terminal',
    position: { x: padding + FINISH_COL * columnWidth, y: centerY - terminalHeight / 2 },
    data: { label: 'Finish' },
    draggable: false,
    selectable: false,
  })

  // Edges — every connection flows right→left with smoothstep routing.
  const edges: Edge[] = []
  const addEdge = (source: string, target: string) => {
    edges.push({
      id: `${source}->${target}`,
      source,
      target,
      sourceHandle: 'source-right',
      targetHandle: 'target-left',
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

  // Initiate → root step(s) (steps no other step points to).
  const referenced = new Set(steps.flatMap((s) => s.next))
  for (const root of steps.filter((s) => !referenced.has(s.id))) {
    addEdge('__initiate__', root.id)
  }

  // Declared step transitions.
  for (const step of steps) {
    for (const nextId of step.next) addEdge(step.id, nextId)
  }

  // Terminal step(s) → Finish.
  for (const terminal of steps.filter((s) => s.next.length === 0)) {
    addEdge(terminal.id, '__finish__')
  }

  const width = padding * 2 + FINISH_COL * columnWidth + terminalWidth
  const height = padding * 2 + canvasHeight
  return { nodes, edges, width, height }
}

// WorkflowList — thin wrapper that just maps to WorkflowCard.
function WorkflowList({ items }: { items: WorkflowSpec[] }) {
  return (
    <div className="space-y-3">
      {items.map((wf) => (
        <WorkflowCard key={wf.name} workflow={wf} />
      ))}
    </div>
  )
}

// WorkflowCard — a plain left-to-right React Flow graph (no swimlane chrome).
// The whole graph is sized to its content and scrolls inside the card.
function WorkflowCard({ workflow }: { workflow: WorkflowSpec }) {
  const layout = useMemo(() => buildWorkflowLayout(workflow), [workflow])
  const { nodes, edges, width, height } = layout

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

      {/* Flow diagram */}
      <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-auto max-w-full" style={{ maxHeight: 520 }}>
          <div style={{ width, height, position: 'relative' }}>
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
