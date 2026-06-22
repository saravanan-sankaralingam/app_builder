'use client'

import { LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apps, type AppFilter } from '@/lib/mock/my-items'

interface MyItemsSidebarProps {
  selectedAppId: string | null // null = "All items"
  onSelect: (appId: string | null) => void
  /** Which count to read off each AppFilter — depends on the active tab. */
  countKey: 'assignedCount' | 'createdCount'
  totalCount: number
}

export function MyItemsSidebar({
  selectedAppId,
  onSelect,
  countKey,
  totalCount,
}: MyItemsSidebarProps) {
  const isAllSelected = selectedAppId === null

  return (
    <aside className="bg-white border border-gray-200 rounded-xl p-2 flex flex-col gap-0.5 h-full">
      {/* All items */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left',
          isAllSelected
            ? 'bg-blue-50 text-blue-700 font-medium'
            : 'text-gray-700 hover:bg-gray-50'
        )}
      >
        <LayoutGrid
          className={cn(
            'h-4 w-4 flex-shrink-0',
            isAllSelected ? 'text-blue-600' : 'text-gray-500'
          )}
        />
        <span className="flex-1 truncate">All items</span>
        <span
          className={cn(
            'text-xs',
            isAllSelected ? 'text-blue-600' : 'text-gray-500'
          )}
        >
          ({totalCount})
        </span>
      </button>

      {/* Per-app filters */}
      {apps
        .filter((a) => a[countKey] > 0)
        .map((app) => {
          const isSelected = selectedAppId === app.id
          const Icon = app.icon
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => onSelect(app.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                isSelected
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon
                className={cn('h-4 w-4 flex-shrink-0', app.iconColor)}
              />
              <span className="flex-1 truncate">{app.name}</span>
              <span
                className={cn(
                  'text-xs',
                  isSelected ? 'text-blue-600' : 'text-gray-500'
                )}
              >
                ({app[countKey]})
              </span>
            </button>
          )
        })}
    </aside>
  )
}
