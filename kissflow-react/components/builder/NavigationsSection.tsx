'use client'

import { Navigation as NavIcon, FileText, Menu as MenuIcon, ArrowRight } from 'lucide-react'

// Menus map to a page when they're leaves; a menu with children is a parent only
// (no page of its own). Sub-menus always map to a page.
export interface NavItem {
  id: string
  label: string
  pageName?: string
  children?: NavItem[]
}

export interface Navigation {
  id: string
  name: string
  description?: string
  items: NavItem[]
}

interface NavigationsSectionProps {
  navigations: Navigation[]
  focusedNavigation?: string | null
  hideHeader?: boolean
}

export function NavigationsSection({ navigations, focusedNavigation, hideHeader }: NavigationsSectionProps) {
  if (focusedNavigation) {
    const nav = navigations.find((n) => n.id === focusedNavigation)
    if (!nav) {
      return <p className="text-[13px] text-gray-500">Navigation not found.</p>
    }
    return <NavigationSitemap nav={nav} />
  }

  return (
    <div>
      {!hideHeader && (
        <>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Interface</h2>
          <p className="text-[13px] text-gray-600 mb-4">
            Navigations defined in this app. Each navigation organizes the app's menus, sub-menus, and the pages they map to.
          </p>
        </>
      )}
      <div className="space-y-3">
        {navigations.map((nav) => (
          <NavigationSummaryRow key={nav.id} nav={nav} />
        ))}
      </div>
    </div>
  )
}

function NavigationSummaryRow({ nav }: { nav: Navigation }) {
  const menuCount = nav.items.length
  const subMenuCount = nav.items.reduce((acc, m) => acc + (m.children ? m.children.length : 0), 0)
  return (
    <div className="border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
      <div className="bg-blue-50 rounded p-1.5 flex-shrink-0">
        <NavIcon className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{nav.name}</h3>
      </div>
      <span className="text-[11px] text-gray-500 flex-shrink-0">
        {menuCount} menus · {subMenuCount} sub-menus
      </span>
    </div>
  )
}

function NavigationSitemap({ nav }: { nav: Navigation }) {
  const colCount = nav.items.length
  const gridTemplate = `repeat(${colCount}, minmax(170px, 1fr))`
  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
        <div className="bg-blue-50 rounded p-1.5 flex-shrink-0">
          <NavIcon className="h-4 w-4 text-blue-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{nav.name}</h3>
      </div>

      {/* Sitemap */}
      <div className="border border-gray-200 rounded-lg p-6 overflow-x-auto">
        <div className="flex flex-col items-center gap-0 w-full">
          {/* Root */}
          <NodeBox tone="root" label={nav.name} />
          {/* Drop from Root down to the bracket bar */}
          <div className="w-px h-4 bg-gray-300" />

          {/* Bracket row + Menu row share the same grid template so cells align */}
          <div className="grid w-full" style={{ gridTemplateColumns: gridTemplate }}>
            {/* Bracket cells */}
            {nav.items.map((item, i) => {
              const isFirst = i === 0
              const isLast = i === colCount - 1
              const single = colCount === 1
              return (
                <div key={`b-${item.id}`} className="relative h-4">
                  {/* Horizontal bar segment for this cell */}
                  {!single && (
                    <div
                      className={`absolute top-0 h-px bg-gray-300 ${
                        isFirst ? 'left-1/2 right-0' :
                        isLast ? 'left-0 right-1/2' :
                        'left-0 right-0'
                      }`}
                    />
                  )}
                  {/* Vertical leg from the bar down to the menu box */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-gray-300" />
                </div>
              )
            })}
            {/* Menu cells */}
            {nav.items.map((item) => (
              <div key={`m-${item.id}`} className="flex justify-center px-3">
                <MenuColumn item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MenuColumn({ item }: { item: NavItem }) {
  return (
    <div className="flex flex-col items-center gap-0 w-full">
      <NodeBox tone="menu" label={item.label} pageName={item.pageName} />
      {item.children && item.children.length > 0 && (() => {
        const children = item.children
        return (
        <>
          {/* Drop from menu down into the sub-tree trunk */}
          <div className="w-px h-4 bg-gray-300" />
          {/* Sub-menu tree: 2-column grid. Left column carries the trunk on its right edge; right column carries each branch + sub-menu. */}
          <div className="grid w-full" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {children.map((child, idx) => {
              const isLast = idx === children.length - 1
              return (
                <div key={child.id} className="contents">
                  {/* Left cell: trunk segment */}
                  <div className="relative">
                    <div className={`absolute right-0 w-px bg-gray-300 ${
                      isLast ? 'top-0 h-1/2' : 'top-0 h-full'
                    }`} />
                  </div>
                  {/* Right cell: horizontal branch + sub-menu box */}
                  <div className="relative flex items-center pl-4 py-3">
                    <div className="absolute left-0 top-1/2 w-4 h-px bg-gray-300 -translate-y-1/2" />
                    <NodeBox tone="submenu" label={child.label} pageName={child.pageName} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
        )
      })()}
    </div>
  )
}

type Tone = 'root' | 'menu' | 'submenu'

const toneStyles: Record<Tone, { box: string; iconColor: string; label: string; page: string; Icon: typeof NavIcon }> = {
  root: {
    box: 'bg-blue-50 border border-blue-200',
    iconColor: 'text-blue-600',
    label: 'text-blue-900',
    page: 'text-blue-700',
    Icon: NavIcon,
  },
  menu: {
    box: 'bg-violet-50 border border-violet-200',
    iconColor: 'text-violet-600',
    label: 'text-violet-900',
    page: 'text-violet-700',
    Icon: MenuIcon,
  },
  submenu: {
    box: 'bg-emerald-50 border border-emerald-200',
    iconColor: 'text-emerald-600',
    label: 'text-emerald-900',
    page: 'text-emerald-700',
    Icon: ArrowRight,
  },
}

function NodeBox({ tone, label, pageName }: { tone: Tone; label: string; pageName?: string }) {
  const style = toneStyles[tone]
  const Icon = style.Icon
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md ${style.box}`}>
      <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${style.iconColor}`} />
      <div className="flex flex-col leading-tight">
        <span className={`text-[12px] font-semibold ${style.label}`}>{label}</span>
        {pageName && (
          <span className={`text-[11px] ${style.page} mt-0.5 inline-flex items-center gap-1`}>
            <FileText className="h-2.5 w-2.5" />
            {pageName}
          </span>
        )}
      </div>
    </div>
  )
}

function Connector() {
  return <div className="w-px h-8 bg-gray-300" />
}
