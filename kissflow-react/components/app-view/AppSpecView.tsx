'use client'

import { Users, Database, FileText, Compass } from 'lucide-react'
import { getStaticApp } from '@/lib/static-apps'
import {
  getAppSpec,
  type RoleSpec,
  type EntitySpec,
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
              <RoleList items={spec.roles} />
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
      <h3 className="text-[16px] font-semibold text-gray-900 tracking-tight leading-snug">
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
function RoleList({ items }: { items: RoleSpec[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.name}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-all"
        >
          <div className="flex items-start gap-2.5">
            <Users
              className="w-[18px] h-[18px] flex-shrink-0 mt-0.5"
              strokeWidth={1.75}
              style={{ color: 'var(--magenta-500)' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-gray-900 leading-snug">
                {item.name}
              </p>
              <p className="text-[13px] text-gray-600 leading-relaxed mt-1">
                {item.description}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
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
              <th className="text-center px-3 py-2 font-medium text-gray-700 border-b border-gray-200 w-[80px]">
                Required
              </th>
            </tr>
          </thead>
          <tbody>
            {entity.fields.map((field, i) => (
              <tr
                key={field.id}
                className={i < entity.fields.length - 1 ? 'border-b border-gray-100' : ''}
              >
                <td className="px-3 py-2 text-gray-900">{field.name}</td>
                <td className="px-3 py-2">
                  <FieldTypeBadge type={field.type} />
                </td>
                <td className="px-3 py-2 text-center">
                  {field.required && (
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--green-500)' }}
                      aria-label="Required"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Permissions */}
      <p className="text-[13px] text-gray-600 mt-5 mb-2 leading-relaxed">
        <span className="font-semibold text-gray-900">Permissions</span>
        {' — '}
        Who can view, edit, or fully manage {entity.name} records.
      </p>
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-[12px] leading-snug">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-3 py-2 font-medium text-gray-700 border-b border-gray-200">
                Role
              </th>
              <th className="text-left px-3 py-2 font-medium text-gray-700 border-b border-gray-200">
                Permission
              </th>
            </tr>
          </thead>
          <tbody>
            {entity.permissions.map((perm, i) => (
              <tr
                key={perm.role}
                className={i < entity.permissions.length - 1 ? 'border-b border-gray-100' : ''}
              >
                <td className="px-3 py-2 text-gray-900">{perm.role}</td>
                <td className="px-3 py-2">
                  <PermissionChip level={perm.level} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
