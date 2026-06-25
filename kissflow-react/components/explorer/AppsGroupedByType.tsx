'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppData, AppGroupType, APP_GROUP_TYPES } from '@/types/app'
import { AppsGrid } from './AppsGrid'

interface AppsGroupedByTypeProps {
  apps: AppData[]
  viewMode: 'grid' | 'list'
}

export function AppsGroupedByType({ apps, viewMode }: AppsGroupedByTypeProps) {
  // All sections expanded by default
  const [expanded, setExpanded] = useState<Set<AppGroupType>>(
    () => new Set(APP_GROUP_TYPES)
  )

  function toggle(type: AppGroupType) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const groups = APP_GROUP_TYPES.map((type) => ({
    type,
    apps: apps.filter((a) => (a.type ?? 'Application') === type),
  }))

  return (
    <div className="space-y-2">
      {groups.map(({ type, apps: groupApps }) => {
        const isOpen = expanded.has(type)
        return (
          <div key={type}>
            <button
              type="button"
              onClick={() => toggle(type)}
              className="flex items-center gap-2 py-2 text-sm font-medium text-gray-900 hover:text-gray-700"
            >
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-gray-500 transition-transform duration-150',
                  !isOpen && '-rotate-90'
                )}
              />
              {type}
            </button>
            {isOpen && groupApps.length > 0 && (
              <div className="mt-3 mb-4">
                <AppsGrid apps={groupApps} viewMode={viewMode} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
