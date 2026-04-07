'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  Folder,
  Compass,
  Plus,
  Store,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
}

const topNavItems: NavItem[] = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Folder, label: 'My Items', href: '/my-items' },
]

const middleNavItems: NavItem[] = [
  { icon: Compass, label: 'Explorer', href: '/explorer' },
]

const bottomNavItems: NavItem[] = [
  { icon: Store, label: 'Marketplace', href: '/store' },
]

function NavButton({
  item,
  isActive,
}: {
  item: NavItem
  isActive: boolean
}) {
  const Icon = item.icon

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150',
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/70'
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.5 : 2} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="bg-gray-900 text-white text-xs px-2 py-1">
          {item.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function AddButton() {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/create"
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100/70 transition-all duration-150"
          >
            <Plus className="h-[18px] w-[18px]" strokeWidth={2} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="bg-gray-900 text-white text-xs px-2 py-1">
          Create new
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="h-full bg-white border-r border-gray-100 flex flex-col items-center py-3">
      {/* Top Navigation */}
      <nav className="flex flex-col items-center gap-1">
        {topNavItems.map((item) => (
          <NavButton
            key={item.href + item.label}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
      </nav>

      {/* Visual spacer instead of harsh separator */}
      <div className="my-3 w-6 h-px bg-gray-200/80" />

      {/* Middle Navigation */}
      <nav className="flex flex-col items-center gap-1">
        {middleNavItems.map((item) => (
          <NavButton
            key={item.href + item.label}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
      </nav>

      {/* Bottom Navigation */}
      <nav className="flex flex-col items-center gap-1 mt-auto">
        <AddButton />

        {/* Visual spacer */}
        <div className="my-1 w-6 h-px bg-gray-200/80" />

        {bottomNavItems.map((item) => (
          <NavButton
            key={item.href + item.label}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
      </nav>
    </aside>
  )
}
