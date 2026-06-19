'use client'

import { useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  ClipboardList,
  LayoutGrid,
  Plus,
  Store,
  ShoppingBag,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
}

const topItems: NavItem[] = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: ClipboardList, label: 'My Items', href: '/my-items' },
  { icon: Store, label: 'Marketplace', href: '/store' },
  { icon: LayoutGrid, label: 'Explorer', href: '/explorer' },
]

// Pin/unpin behavior will be wired in the next thread.
// For now: Pinned is empty; only Retail One sits in Recent.
const pinnedApps: NavItem[] = []
const recentApps: NavItem[] = [
  { icon: ShoppingBag, label: 'Retail One', href: '/app/retail-one' },
]

const createItem: NavItem = { icon: Plus, label: 'Create new', href: '/create' }

function NavButton({
  item,
  isActive,
  isExpanded,
  onItemClick,
}: {
  item: NavItem
  isActive: boolean
  isExpanded: boolean
  onItemClick: () => void
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onItemClick}
      className={cn(
        'flex items-center h-8 rounded-lg mx-[9px] transition-colors',
        isActive
          ? 'bg-gradient-to-br from-purple-600 to-blue-400 text-white'
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/70'
      )}
    >
      {/* Icon container — fixed 32px so icon X stays put across collapsed/expanded */}
      <div className="w-8 flex items-center justify-center flex-shrink-0">
        <Icon
          className="h-[18px] w-[18px]"
          strokeWidth={isActive ? 2 : 1.5}
        />
      </div>
      <span
        className={cn(
          'text-sm whitespace-nowrap transition-opacity duration-150',
          isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {item.label}
      </span>
    </Link>
  )
}

/**
 * Section divider — fixed-height slot that hosts EITHER a thin line OR a
 * section label pill. Same total height in both collapsed and expanded
 * states so swapping line ↔ pill on hover doesn't shift items around.
 */
function SectionDivider({
  label,
  isExpanded,
}: {
  label?: string
  isExpanded: boolean
}) {
  return (
    <div className="h-5 my-1 flex items-center flex-shrink-0">
      {isExpanded && label ? (
        <div className="mx-3 flex items-center gap-2 flex-1">
          <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-3">
            {label}
          </span>
          <div className="h-px bg-gray-200/80 flex-1" />
        </div>
      ) : (
        <div
          className={cn(
            'h-px bg-gray-200/80 transition-all duration-200',
            isExpanded ? 'mx-3 flex-1' : 'mx-auto w-6'
          )}
        />
      )}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const collapse = useCallback(() => setIsExpanded(false), [])

  const hasPinned = pinnedApps.length > 0

  return (
    <div className="relative h-full">
      <nav
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={cn(
          'absolute left-0 top-0 bottom-0 z-30 flex flex-col gap-2 py-3 bg-white border-r border-gray-100 overflow-hidden transition-[width,box-shadow] duration-200',
          isExpanded
            ? 'w-60 shadow-[4px_0_24px_rgba(0,0,0,0.06)]'
            : 'w-[50px]'
        )}
      >
        {/* Home, My Items */}
        {topItems.map((item) => (
          <NavButton
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            isExpanded={isExpanded}
            onItemClick={collapse}
          />
        ))}

        {/*
          First divider: in collapsed → thin line. In expanded → "PINNED" pill
          if Pinned has items, otherwise "RECENT" pill (because Recent is the
          first section when Pinned is empty).
        */}
        <SectionDivider
          label={hasPinned ? 'Pinned' : 'Recent'}
          isExpanded={isExpanded}
        />

        {/*
          Middle area: Pinned (conditional) + Recent (always).
          flex-1 + min-h-0 lets these two share the remaining vertical space.
          - Pinned has max-height so Recent always keeps room for ~3 items (~150px).
            If Pinned has more content than fits, it scrolls within itself.
          - Recent takes the remaining space (flex-1) and scrolls if it has more
            items than fit.
        */}
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {hasPinned && (
            <>
              <div
                className="flex flex-col gap-2 overflow-y-auto"
                style={{ maxHeight: 'calc(100% - 150px)' }}
              >
                {pinnedApps.map((item) => (
                  <NavButton
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href}
                    isExpanded={isExpanded}
                    onItemClick={collapse}
                  />
                ))}
              </div>
              {/* Divider between Pinned and Recent — "RECENT" pill when expanded */}
              <SectionDivider label="Recent" isExpanded={isExpanded} />
            </>
          )}

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto min-h-0">
            {recentApps.map((item) => (
              <NavButton
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                isExpanded={isExpanded}
                onItemClick={collapse}
              />
            ))}
          </div>
        </div>

        {/* Divider between Recent and Create new — plain line */}
        <SectionDivider isExpanded={isExpanded} />

        {/* Bottom: Create new + brand mark */}
        <div className="flex flex-col">
          <NavButton
            item={createItem}
            isActive={pathname === createItem.href}
            isExpanded={isExpanded}
            onItemClick={collapse}
          />

          {/* Brand mark — centered in the icon column so X position matches the nav items above */}
          <div className="mt-3 mx-[9px] w-8 flex items-center justify-center">
            <img
              src="/kissflow-logo.svg"
              alt="Kissflow"
              className="h-5 w-5"
            />
          </div>
        </div>
      </nav>
    </div>
  )
}
