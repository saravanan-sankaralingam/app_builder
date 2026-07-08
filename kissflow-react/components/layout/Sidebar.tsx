'use client'

import { useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  ClipboardList,
  LayoutGrid,
  Plus,
  Store,
  ShoppingBag,
  Boxes,
  Building2,
  Receipt,
  ChevronRight,
  Pin,
  PinOff,
  Grid2x2Plus,
  Workflow,
  Columns3,
  Globe,
  Database,
  Plug,
} from 'lucide-react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  /**
   * Visual variant. `'primary'` renders as a solid filled button (e.g. Create new
   * → blue background, white icon) to mark a primary action. Omit for regular nav items.
   */
  variant?: 'primary'
}

const topItems: NavItem[] = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: ClipboardList, label: 'My Items', href: '/my-items' },
  { icon: Store, label: 'Marketplace', href: '/store' },
  { icon: LayoutGrid, label: 'Explorer', href: '/explorer' },
]

// Initial pinned/recent lists. The Sidebar lifts these into state so the
// hover pin/unpin affordance can move items between the two sections.
// Persistence is not yet wired — refreshing resets to these initial values.
const initialPinnedApps: NavItem[] = []
const initialRecentApps: NavItem[] = [
  { icon: Building2, label: 'Vendor Onboarding and Management', href: '/app/vendor-onboarding-and-management' },
  { icon: ShoppingBag, label: 'Retail One', href: '/app/retail-one' },
  { icon: Boxes, label: 'Inventory Management', href: '/app/inventory-management' },
  { icon: Receipt, label: 'Expense Management', href: '/app/expense-management' },
]

const createItem: NavItem = {
  icon: Plus,
  label: 'Create',
  href: '/create',
  variant: 'primary',
}

/**
 * Options shown in the "Create" popover callout, in the order the user
 * sees them. Order is load-bearing — don't reshuffle without spec sign-off.
 */
const createOptions = [
  { icon: Grid2x2Plus, label: 'App', key: 'app', color: 'text-pink-500' },
  { icon: Workflow, label: 'Process', key: 'process', color: 'text-orange-500' },
  { icon: Columns3, label: 'Board', key: 'board', color: 'text-purple-500' },
  { icon: Globe, label: 'Portal', key: 'portal', color: 'text-pink-500' },
  { icon: Database, label: 'Dataset', key: 'dataset', color: 'text-red-500' },
  { icon: Plug, label: 'Integration', key: 'integration', color: 'text-purple-500' },
] as const

function CreateOptionsList({ onSelect }: { onSelect: () => void }) {
  const router = useRouter()
  return (
    <div className="w-[160px] py-1 space-y-1">
      {createOptions.map((opt) => {
        const Icon = opt.icon
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => {
              // App routes to the new left-nav-driven create flow;
              // other types are still TODO stubs.
              if (opt.key === 'app') {
                router.push('/new/app')
              }
              onSelect()
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Icon className={cn('h-4 w-4', opt.color)} strokeWidth={1.75} />
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function NavButton({
  item,
  isActive,
  isExpanded,
  onItemClick,
  popoverOpen,
  onPopoverOpenChange,
  pinState,
  onTogglePin,
}: {
  item: NavItem
  isActive: boolean
  isExpanded: boolean
  onItemClick: () => void
  /** Only used for primary items (those with a popover). */
  popoverOpen?: boolean
  /** Only used for primary items (those with a popover). */
  onPopoverOpenChange?: (open: boolean) => void
  /**
   * Whether this item supports the pin affordance and which icon to show
   * on hover. Omit to hide pin entirely (e.g. for Home, My Items, etc.).
   */
  pinState?: 'pinned' | 'unpinned'
  onTogglePin?: () => void
}) {
  const Icon = item.icon
  const isPrimary = item.variant === 'primary'
  const [isRowHovered, setIsRowHovered] = useState(false)

  const rowClassName = cn(
    'group flex items-center h-9 rounded-lg mx-[7px] transition-colors',
    isPrimary
      ? cn(
          'hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50',
          // While the popover is open, keep the row in its "hover" look so
          // the user has a clear pressed/active affordance.
          popoverOpen && 'bg-gradient-to-br from-purple-50 to-blue-50'
        )
      : isActive
        ? 'bg-gradient-to-br from-purple-600 to-blue-400 text-white'
        : 'text-gray-800 hover:text-gray-900 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50'
  )

  const rowContent = (
    <>
      {/* Icon container — fixed 36px so icon X stays put across collapsed/expanded */}
      <div className="w-9 flex items-center justify-center flex-shrink-0">
        {isPrimary ? (
          // Primary variant: just the icon area is a solid filled 24x24 button.
          // The label sits next to it as regular text (not inside the blue fill).
          <div className="h-6 w-6 rounded-md bg-blue-500 flex items-center justify-center">
            <Icon className="h-[18px] w-[18px] text-white" strokeWidth={2} />
          </div>
        ) : (
          <Icon
            className="h-[18px] w-[18px]"
            strokeWidth={isActive ? 2 : 1.5}
          />
        )}
      </div>
      <span
        className={cn(
          'text-sm whitespace-nowrap transition-opacity duration-150',
          isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none',
          isPrimary && 'text-gray-800 ml-2'
        )}
      >
        {item.label}
      </span>

      {/* Right-arrow affordance for primary items — indicates "click opens a callout". */}
      {isPrimary && (
        <ChevronRight
          className={cn(
            'h-4 w-4 ml-auto mr-3 text-gray-500 transition-opacity duration-150',
            isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          strokeWidth={1.75}
        />
      )}

      {/* Pin / Unpin affordance — appears on row hover (expanded nav only).
          Visibility is driven by `isRowHovered` (set by onMouseEnter/Leave on
          the Link itself), so hovering anywhere on the row reveals it. */}
      {pinState && (
        <button
          type="button"
          onClick={(e) => {
            // Prevent the surrounding Link from navigating.
            e.preventDefault()
            e.stopPropagation()
            onTogglePin?.()
          }}
          aria-label={pinState === 'pinned' ? 'Unpin' : 'Pin'}
          className={cn(
            'ml-auto mr-2 flex items-center justify-center h-6 w-6 rounded-full transition-opacity duration-150',
            isActive
              ? 'hover:bg-gradient-to-br hover:from-purple-500 hover:to-blue-500'
              : 'hover:bg-gradient-to-br hover:from-purple-200 hover:to-blue-200',
            isExpanded && isRowHovered
              ? 'opacity-100'
              : 'opacity-0 pointer-events-none'
          )}
        >
          {pinState === 'pinned' ? (
            <PinOff
              className={cn(
                'h-3.5 w-3.5',
                isActive ? 'text-purple-200' : 'text-purple-500'
              )}
              strokeWidth={1.75}
            />
          ) : (
            <Pin
              className={cn(
                'h-3.5 w-3.5',
                isActive ? 'text-purple-200' : 'text-purple-500'
              )}
              strokeWidth={1.75}
            />
          )}
        </button>
      )}
    </>
  )

  if (isPrimary) {
    // Primary items open a callout instead of navigating. Open state is
    // controlled by the parent (Sidebar) so the nav can keep itself expanded
    // for as long as the popover is open.
    return (
      <Popover open={popoverOpen} onOpenChange={onPopoverOpenChange}>
        <PopoverTrigger asChild>
          <button type="button" className={cn(rowClassName, 'w-auto text-left focus:outline-none')}>
            {rowContent}
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="end"
          sideOffset={8}
          className="p-1 w-auto"
        >
          <CreateOptionsList
            onSelect={() => {
              // Close the popover AND collapse the nav. The collapse is
              // explicit because mouseleave may not have fired depending on
              // the user's mouse trajectory from the trigger to the option.
              onPopoverOpenChange?.(false)
              onItemClick()
            }}
          />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={onItemClick}
      onMouseEnter={() => setIsRowHovered(true)}
      onMouseLeave={() => setIsRowHovered(false)}
      className={rowClassName}
    >
      {rowContent}
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
  // Track hover and Create-popover-open separately. The nav is "expanded"
  // whenever either is true, so the nav stays open as long as the user is
  // hovering OR has the Create callout open (mouse can move freely between).
  const [isHovering, setIsHovering] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const isExpanded = isHovering || createOpen
  const collapse = useCallback(() => setIsHovering(false), [])

  // Pin/unpin state. Lifted here so items can move between the two sections.
  // Persistence to backend will be wired separately.
  const [pinnedApps, setPinnedApps] = useState<NavItem[]>(initialPinnedApps)
  const [recentApps, setRecentApps] = useState<NavItem[]>(initialRecentApps)

  const pinApp = useCallback((item: NavItem) => {
    setRecentApps((prev) => prev.filter((a) => a.href !== item.href))
    setPinnedApps((prev) => [...prev, item])
  }, [])

  const unpinApp = useCallback((item: NavItem) => {
    setPinnedApps((prev) => prev.filter((a) => a.href !== item.href))
    setRecentApps((prev) => [item, ...prev])
  }, [])

  const hasPinned = pinnedApps.length > 0

  return (
    <div className="relative h-full">
      <nav
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
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
                    pinState="pinned"
                    onTogglePin={() => unpinApp(item)}
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
                pinState="unpinned"
                onTogglePin={() => pinApp(item)}
              />
            ))}
          </div>
        </div>

        {/* Bottom: Create new + brand mark */}
        <div className="flex flex-col">
          <NavButton
            item={createItem}
            isActive={pathname === createItem.href}
            isExpanded={isExpanded}
            onItemClick={collapse}
            popoverOpen={createOpen}
            onPopoverOpenChange={setCreateOpen}
          />

          {/* Divider between Create new and brand mark — plain line */}
          <SectionDivider isExpanded={isExpanded} />

          {/* Brand mark — icon stays at the same X across collapsed/expanded;
              "powered by Kissflow" wordmark fades in beside it when expanded. */}
          <div className="mt-1 mx-[9px] flex items-center">
            <div className="w-8 flex items-center justify-center flex-shrink-0">
              <img
                src="/kissflow-logo.svg"
                alt="Kissflow"
                className="h-5 w-5"
              />
            </div>
            <span
              className={cn(
                'ml-2 text-[11px] text-gray-700 whitespace-nowrap transition-opacity duration-150',
                isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}
            >
              powered by <span className="font-semibold">Kissflow</span>
            </span>
          </div>
        </div>
      </nav>
    </div>
  )
}
