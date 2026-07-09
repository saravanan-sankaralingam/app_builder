'use client'

import { useMemo } from 'react'
import { Users, User, Database, FileText, Compass, Workflow } from 'lucide-react'
import {
  ReactFlow,
  Handle,
  Position,
  MarkerType,
  BaseEdge,
  getBezierPath,
  type Node,
  type Edge,
  type NodeProps,
  type EdgeProps,
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
    <div className="border border-b-0 border-white/90 shadow-[0_12px_40px_rgba(34,42,59,0.06),0_1px_3px_rgba(34,42,59,0.04)] flex flex-col min-h-0 overflow-hidden">
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
      <h3 className="text-[16px] font-semibold text-gray-900 tracking-tight leading-snug min-w-0 truncate">
        {name}
      </h3>
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

      <p className="mt-3.5 ml-[26px] text-[13px] font-semibold text-gray-700">Permissions</p>
      <div className="mt-2 ml-[26px] border border-gray-200 rounded-lg overflow-hidden bg-white">
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
      <div className="mt-4 ml-[26px] border border-gray-200 rounded-lg overflow-hidden bg-white">
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
// The diagram is rendered with @xyflow/react (React Flow). Three node types are
// registered: `terminal` (Start / Finish pills), `stepChip` (a step), and
// `diamond` (a decision inserted before a branch). Edges are straight gray
// lines connecting each node's right handle to the next node's left handle.

// Layout geometry — kept in one place so node sizing and positioning stay in
// lock-step.
const WF_LAYOUT = {
  columnGap: 56,
  rowHeight: 120,
  chipWidth: 180,
  chipHeight: 62,
  finishWidth: 128,
  finishHeight: 44,
  diamondSize: 40,
  padding: 28,
}

// Handles are functional (React Flow uses them for edge attach points) but
// visually hidden — this is a read-only spec view, not an interactive editor.
const HIDDEN_HANDLE_STYLE: React.CSSProperties = {
  opacity: 0,
  background: 'transparent',
  border: 'none',
}

type StepChipData = { step: WorkflowSpec['steps'][number] }
type TerminalData = { label: string; variant: 'start' | 'end'; assignee?: string }

function StepChipNode(props: NodeProps) {
  const { step } = props.data as StepChipData
  // A condition-based step has its owner decided at runtime; show an italic
  // "Conditional" in place of a role rather than the raw condition text.
  const isConditional = step.assignee === UNDEFINED_ASSIGNEE
  return (
    <div
      className="rounded-md px-2.5 flex flex-col justify-center text-[12px] font-medium leading-snug"
      style={{
        width: WF_LAYOUT.chipWidth,
        height: WF_LAYOUT.chipHeight,
        backgroundColor: 'var(--orange-100)',
        border: '1px solid var(--orange-400)',
        color: 'var(--orange-700)',
      }}
    >
      <span className="truncate">{step.name}</span>
      {/* Assignee — the owning role (or "Conditional" when decided at runtime) */}
      <div
        className="mt-1 flex items-center gap-1 text-[10px] font-normal leading-none"
        style={{ color: 'var(--orange-600)' }}
      >
        <User className="w-3 h-3 flex-shrink-0" strokeWidth={1.75} />
        {isConditional ? (
          <span className="truncate italic">Conditional</span>
        ) : (
          <span className="truncate">{step.assignee}</span>
        )}
      </div>
      <Handle id="target-left" type="target" position={Position.Left} style={HIDDEN_HANDLE_STYLE} />
      <Handle id="source-right" type="source" position={Position.Right} style={HIDDEN_HANDLE_STYLE} />
    </div>
  )
}

// Start / Finish markers. Start is a step-like chip (white, outlined in primary
// blue) that names its initiator role(s); Finish stays a solid orange pill.
function TerminalNode(props: NodeProps) {
  const { label, variant, assignee } = props.data as TerminalData
  if (variant === 'start') {
    return (
      <div
        className="rounded-md px-2.5 flex flex-col justify-center text-[12px] font-medium leading-snug"
        style={{
          width: WF_LAYOUT.chipWidth,
          height: WF_LAYOUT.chipHeight,
          backgroundColor: 'var(--blue-100)',
          color: 'var(--blue-700)',
          border: '1px solid var(--blue-400)',
        }}
      >
        <span className="truncate">{label}</span>
        {assignee && (
          <div
            className="mt-1 flex items-center gap-1 text-[10px] font-normal leading-none"
            style={{ color: 'var(--blue-600)' }}
          >
            <User className="w-3 h-3 flex-shrink-0" strokeWidth={1.75} />
            <span className="truncate">{assignee}</span>
          </div>
        )}
        <Handle id="target-left" type="target" position={Position.Left} style={HIDDEN_HANDLE_STYLE} />
        <Handle id="source-right" type="source" position={Position.Right} style={HIDDEN_HANDLE_STYLE} />
      </div>
    )
  }
  // Completed — a step-like green card; a terminal state, so no assignee and a
  // narrower, centred card.
  return (
    <div
      className="rounded-md px-2.5 flex items-center justify-center text-center text-[12px] font-medium leading-snug"
      style={{
        width: WF_LAYOUT.finishWidth,
        height: WF_LAYOUT.finishHeight,
        backgroundColor: 'var(--green-100)',
        color: 'var(--green-700)',
        border: '1px solid var(--green-400)',
      }}
    >
      <span className="truncate">{label}</span>
      <Handle id="target-left" type="target" position={Position.Left} style={HIDDEN_HANDLE_STYLE} />
      <Handle id="source-right" type="source" position={Position.Right} style={HIDDEN_HANDLE_STYLE} />
    </div>
  )
}

// Decision node — a diamond inserted before a branch so parallel steps fan out
// from it. Read-only, so it carries no label; the branch semantics live in the
// two step chips it points to.
function DiamondNode() {
  // Rendered as an SVG polygon (not a clip-path div) so the dashed stroke stays
  // visible — clip-path clips a CSS border away.
  const s = WF_LAYOUT.diamondSize
  const c = s / 2
  const inset = 2 // keep the stroke inside the viewBox so it isn't clipped
  return (
    <div className="relative" style={{ width: s, height: s }}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="absolute inset-0">
        <polygon
          points={`${c},${inset} ${s - inset},${c} ${c},${s - inset} ${inset},${c}`}
          fill="var(--purple-100)"
          stroke="var(--purple-400)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <Handle id="target-left" type="target" position={Position.Left} style={HIDDEN_HANDLE_STYLE} />
      <Handle id="source-right" type="source" position={Position.Right} style={HIDDEN_HANDLE_STYLE} />
    </div>
  )
}

const workflowNodeTypes = {
  stepChip: StepChipNode,
  terminal: TerminalNode,
  diamond: DiamondNode,
}

// Smooth curved edge for branch connections — a gentle bezier from the diamond
// out to each parallel step and back to the spine at the convergence node.
function CurveEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
}: EdgeProps) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })
  return <BaseEdge path={path} markerEnd={markerEnd} style={style} />
}

const workflowEdgeTypes = {
  curve: CurveEdge,
}

interface WorkflowLayout {
  nodes: Node[]
  edges: Edge[]
  width: number
  height: number
}

// Graph-based left-to-right layout. Every node sits on its own column (longest
// path from Start), so the flow reads as one horizontal line. A branching step
// (next.length > 1) gets a synthetic diamond inserted after it; the diamond
// fans out to the parallel steps, which sit on rows above/below the spine and
// converge again downstream. Start / Finish bookend the graph.
const WF_START = '__start__'
const WF_FINISH = '__finish__'

type WfNodeKind = 'start' | 'finish' | 'step' | 'diamond'

function buildWorkflowLayout(workflow: WorkflowSpec): WorkflowLayout {
  const { columnGap, rowHeight, chipWidth, chipHeight, finishWidth, finishHeight, diamondSize, padding } = WF_LAYOUT
  const steps = workflow.steps

  // 1. Build the node set + directed edges, inserting a diamond per branch.
  const kind = new Map<string, WfNodeKind>([
    [WF_START, 'start'],
    [WF_FINISH, 'finish'],
  ])
  steps.forEach((s) => kind.set(s.id, 'step'))

  const links: Array<[string, string]> = []
  const referenced = new Set(steps.flatMap((s) => s.next))
  const roots = steps.filter((s) => !referenced.has(s.id))
  roots.forEach((r) => links.push([WF_START, r.id]))
  // Initiator role(s) = the owners of the root step(s) the process kicks off with.
  const initiators = Array.from(
    new Set(roots.map((r) => r.assignee).filter((a) => a !== UNDEFINED_ASSIGNEE))
  ).join(', ')
  for (const s of steps) {
    if (s.next.length > 1) {
      const dia = `dia:${s.id}`
      kind.set(dia, 'diamond')
      links.push([s.id, dia])
      s.next.forEach((t) => links.push([dia, t]))
    } else if (s.next.length === 1) {
      links.push([s.id, s.next[0]])
    } else {
      links.push([s.id, WF_FINISH])
    }
  }

  // 2. Adjacency + in-degree.
  const ids = [...kind.keys()]
  const out = new Map<string, string[]>(ids.map((n) => [n, []]))
  const inDeg = new Map<string, number>(ids.map((n) => [n, 0]))
  for (const [a, b] of links) {
    out.get(a)!.push(b)
    inDeg.set(b, inDeg.get(b)! + 1)
  }

  // 3. Columns = longest path from Start (Kahn topological order).
  const col = new Map<string, number>(ids.map((n) => [n, 0]))
  const work = new Map(inDeg)
  const queue = ids.filter((n) => work.get(n) === 0)
  const order: string[] = []
  while (queue.length) {
    const n = queue.shift()!
    order.push(n)
    for (const m of out.get(n)!) {
      col.set(m, Math.max(col.get(m)!, col.get(n)! + 1))
      work.set(m, work.get(m)! - 1)
      if (work.get(m) === 0) queue.push(m)
    }
  }

  // 4. Rows — spine on 0; a diamond spreads its children symmetrically; a
  // convergence node (in-degree > 1) returns to the spine.
  const row = new Map<string, number>([[WF_START, 0]])
  for (const n of order) {
    const r = row.get(n) ?? 0
    const children = out.get(n)!
    if (kind.get(n) === 'diamond' && children.length > 1) {
      const k = children.length
      children.forEach((c, j) => {
        if (row.has(c)) return
        // Even spacing: children sit one row apart, centred on the spine.
        row.set(c, r + (j - (k - 1) / 2))
      })
    } else {
      for (const c of children) {
        if (inDeg.get(c)! > 1) row.set(c, 0)
        else if (!row.has(c)) row.set(c, r)
      }
    }
  }

  // 5. Geometry. Node centres are placed per (col, row); each node is centred
  // within its column band so the spine stays visually straight.
  const rows = [...row.values()]
  const minRow = Math.min(...rows)
  const maxRow = Math.max(...rows)
  const maxCol = Math.max(...col.values())
  const tallest = Math.max(chipHeight, diamondSize)
  const sizeOf = (k: WfNodeKind): [number, number] =>
    k === 'diamond'
      ? [diamondSize, diamondSize]
      : k === 'finish'
        ? [finishWidth, finishHeight]
        : [chipWidth, chipHeight]

  // Each column is as wide as its widest node; consecutive columns are placed a
  // fixed gap apart, so the edge-to-edge horizontal spacing is uniform even
  // though nodes (chip / diamond / terminal) differ in width.
  const widthByCol = new Map<number, number>()
  for (const id of ids) {
    const c = col.get(id)!
    widthByCol.set(c, Math.max(widthByCol.get(c) ?? 0, sizeOf(kind.get(id)!)[0]))
  }
  const wOf = (c: number) => widthByCol.get(c) ?? chipWidth
  const centerX: number[] = []
  for (let c = 0; c <= maxCol; c++) {
    centerX[c] = c === 0 ? padding + wOf(c) / 2 : centerX[c - 1] + wOf(c - 1) / 2 + columnGap + wOf(c) / 2
  }
  const colCenterX = (c: number) => centerX[c]
  const rowCenterY = (r: number) => padding + tallest / 2 + (r - minRow) * rowHeight

  const typeOf: Record<WfNodeKind, string> = {
    start: 'terminal',
    finish: 'terminal',
    step: 'stepChip',
    diamond: 'diamond',
  }
  const dataOf = (id: string, k: WfNodeKind) => {
    if (k === 'start') return { label: 'Start', variant: 'start' as const, assignee: initiators }
    if (k === 'finish') return { label: 'Completed', variant: 'end' as const }
    if (k === 'step') return { step: steps.find((s) => s.id === id)! }
    return {}
  }

  const nodes: Node[] = ids.map((id) => {
    const k = kind.get(id)!
    const [w, h] = sizeOf(k)
    return {
      id,
      type: typeOf[k],
      position: { x: colCenterX(col.get(id)!) - w / 2, y: rowCenterY(row.get(id)!) - h / 2 },
      data: dataOf(id, k),
      draggable: false,
      selectable: false,
    }
  })

  // 6. Edges — thin straight gray lines along the spine; smooth curves for
  // anything that changes row (the parallel branch/merge connectors).
  const edges: Edge[] = links.map(([source, target]) => {
    const base = {
      id: `${source}->${target}`,
      source,
      target,
      sourceHandle: 'source-right',
      targetHandle: 'target-left',
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--gray-500)', width: 14, height: 14 },
    }
    if (row.get(source) === row.get(target)) {
      return { ...base, type: 'straight', style: { stroke: 'var(--gray-500)', strokeWidth: 1 } }
    }
    return { ...base, type: 'curve', style: { stroke: 'var(--gray-500)', strokeWidth: 1.25 } }
  })

  const width = colCenterX(maxCol) + wOf(maxCol) / 2 + padding
  const height = rowCenterY(maxRow) + tallest / 2 + padding
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
              edgeTypes={workflowEdgeTypes}
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
