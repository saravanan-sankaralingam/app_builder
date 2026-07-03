'use client'

import { useState, useEffect, useLayoutEffect, useMemo, useRef, useId, Fragment } from 'react'
import { Users, Database, FileText, Compass, Workflow, RefreshCw, ChevronDown, ChevronUp, Split } from 'lucide-react'
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

      {/* Two-column layout: 20% quick nav (left) + 80% scrollable content (right) */}
      <div className="flex-1 flex min-h-0">
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
        <div className="flex-1 flex pr-5 min-h-0">
          <div className="flex-1 rounded-t-xl border border-b-0 border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-y-auto px-10 py-7 divide-y divide-gray-200 [&>*:not(:first-child)]:pt-9 [&>*:not(:last-child)]:pb-9">
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
function WorkflowList({ items, roles }: { items: WorkflowSpec[]; roles: RoleSpec[] }) {
  return (
    <div className="space-y-3">
      {items.map((wf) => (
        <WorkflowCard key={wf.name} workflow={wf} roles={roles} />
      ))}
    </div>
  )
}

interface Connector {
  key: string
  path: string
}

// Orthogonal (right-angle) path between two points. Same-row pairs get a
// straight horizontal line; cross-row pairs get a Z-shape with the vertical
// leg at the midpoint between the two columns.
function orthPath(x1: number, y1: number, x2: number, y2: number): string {
  if (Math.abs(y1 - y2) < 4) {
    return `M ${x1} ${y1} L ${x2} ${y2}`
  }
  const xMid = x1 + (x2 - x1) * 0.5
  return `M ${x1} ${y1} L ${xMid} ${y1} L ${xMid} ${y2} L ${x2} ${y2}`
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

function WorkflowCard({ workflow, roles }: { workflow: WorkflowSpec; roles: RoleSpec[] }) {
  const gridWrapperRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [svgSize, setSvgSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 })
  const markerId = `wf-arrow-${useId().replace(/:/g, '')}`

  // Precomputed layout: max column across steps and the ordered row list.
  const { maxColumn, rowOrder } = useMemo(() => {
    const maxCol = workflow.steps.reduce((m, s) => Math.max(m, s.column), 1)
    const usedAssignees = new Set(workflow.steps.map((s) => s.assignee))
    const roleOrder = roles.map((r) => r.name).filter((n) => usedAssignees.has(n))
    const rows = [
      ...roleOrder,
      ...(usedAssignees.has(UNDEFINED_ASSIGNEE) ? [UNDEFINED_ASSIGNEE] : []),
    ]
    return { maxColumn: maxCol, rowOrder: rows }
  }, [workflow, roles])

  // Recompute the SVG connector line list from live step-box positions.
  // Runs after paint (useLayoutEffect) so getBoundingClientRect returns final
  // positions, and again on any container resize via ResizeObserver below.
  const recomputeConnectors = () => {
    const wrapper = gridWrapperRef.current
    if (!wrapper) return
    const wrapperRect = wrapper.getBoundingClientRect()
    const lines: Connector[] = []
    for (const step of workflow.steps) {
      const fromEl = stepRefs.current.get(step.id)
      if (!fromEl) continue
      const fromRect = fromEl.getBoundingClientRect()
      const x1 = fromRect.right - wrapperRect.left
      const y1 = fromRect.top + fromRect.height / 2 - wrapperRect.top
      for (const nextId of step.next) {
        const toEl = stepRefs.current.get(nextId)
        if (!toEl) continue
        const toRect = toEl.getBoundingClientRect()
        const x2 = toRect.left - wrapperRect.left
        const y2 = toRect.top + toRect.height / 2 - wrapperRect.top
        lines.push({ key: `${step.id}->${nextId}`, path: orthPath(x1, y1, x2, y2) })
      }
    }
    setConnectors(lines)
    setSvgSize({ w: wrapper.scrollWidth, h: wrapper.scrollHeight })
  }

  useLayoutEffect(() => {
    recomputeConnectors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow])

  useEffect(() => {
    if (!gridWrapperRef.current) return
    const observer = new ResizeObserver(() => recomputeConnectors())
    observer.observe(gridWrapperRef.current)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow])

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

      {/* Swimlane grid with SVG connector overlay */}
      <div className="mt-4 border border-gray-200 rounded-lg overflow-x-auto bg-white">
        <div
          ref={gridWrapperRef}
          className="relative min-w-max"
        >
          <div
            className="grid text-[12px] leading-snug"
            style={{
              gridTemplateColumns: `minmax(160px, max-content) repeat(${maxColumn}, minmax(160px, 1fr))`,
            }}
          >
            {/* Header row */}
            <div className="bg-gray-100 border-b border-r border-gray-200 px-3 py-2 font-medium text-gray-700">
              Assignee
            </div>
            {Array.from({ length: maxColumn }).map((_, i) => (
              <div
                key={i}
                className={
                  'bg-gray-100 border-b border-gray-200 px-3 py-2 font-medium text-gray-700 ' +
                  (i < maxColumn - 1 ? 'border-r' : '')
                }
              >
                Step {i + 1}
              </div>
            ))}

            {/* Body rows */}
            {rowOrder.map((assignee, rowIdx) => {
              const notLastRow = rowIdx < rowOrder.length - 1
              const isUndefined = assignee === UNDEFINED_ASSIGNEE
              return (
                <Fragment key={assignee}>
                  <div
                    className={
                      'border-r border-gray-200 px-3 py-4 text-gray-900 font-medium ' +
                      (notLastRow ? 'border-b ' : '') +
                      (isUndefined ? 'italic text-gray-600' : '')
                    }
                  >
                    {isUndefined ? (
                      <span title="Assignee resolved at runtime by a condition">
                        {assignee}
                      </span>
                    ) : (
                      assignee
                    )}
                  </div>
                  {Array.from({ length: maxColumn }).map((_, colIdx) => {
                    const col = colIdx + 1
                    const notLastCol = colIdx < maxColumn - 1
                    const stepAtCell = workflow.steps.find(
                      (s) => s.assignee === assignee && s.column === col,
                    )
                    return (
                      <div
                        key={col}
                        className={
                          'px-3 py-4 ' +
                          (notLastCol ? 'border-r border-gray-200 ' : '') +
                          (notLastRow ? 'border-b border-gray-200' : '')
                        }
                      >
                        {stepAtCell && (
                          <StepChip
                            step={stepAtCell}
                            registerRef={(el) => stepRefs.current.set(stepAtCell.id, el)}
                            branchTooltip={buildBranchTooltip(stepAtCell, workflow)}
                          />
                        )}
                      </div>
                    )
                  })}
                </Fragment>
              )
            })}
          </div>

          {/* Connector overlay */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={svgSize.w}
            height={svgSize.h}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <marker
                id={markerId}
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="var(--orange-500)" />
              </marker>
            </defs>
            {connectors.map((c) => (
              <path
                key={c.key}
                d={c.path}
                fill="none"
                stroke="var(--orange-500)"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd={`url(#${markerId})`}
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}

function StepChip({
  step,
  registerRef,
  branchTooltip,
}: {
  step: WorkflowSpec['steps'][number]
  registerRef: (el: HTMLDivElement | null) => void
  branchTooltip?: string
}) {
  const isBranching = step.next.length > 1
  const isConditional = !!step.condition

  // Branching cell → full-cell diamond via clip-path. Native tooltip on hover
  // shows the routing with each target's condition.
  if (isBranching) {
    return (
      <div
        ref={registerRef}
        title={branchTooltip}
        className="relative w-full flex items-center justify-center cursor-help min-h-[72px]"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'var(--orange-100)',
            border: `1.5px ${step.optional ? 'dashed' : 'solid'} var(--orange-500)`,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          }}
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-1.5 max-w-[62%] justify-center px-2">
          <Split
            className="w-3.5 h-3.5 flex-shrink-0"
            strokeWidth={2}
            style={{ color: 'var(--orange-500)' }}
          />
          <span
            className="text-[12px] font-medium leading-tight text-center"
            style={{ color: 'var(--orange-700)' }}
          >
            {step.name}
          </span>
        </div>
      </div>
    )
  }

  // Regular step chip (unchanged shape, added strokes for optional/conditional)
  return (
    <div
      ref={registerRef}
      className={
        'rounded-md px-2.5 py-1.5 text-[12px] font-medium leading-snug ' +
        (step.optional ? 'border-dashed' : '')
      }
      style={{
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
