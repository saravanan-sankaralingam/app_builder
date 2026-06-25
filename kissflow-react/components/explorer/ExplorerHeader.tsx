'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type FilterType = 'live' | 'managed' | 'others'

interface ExplorerHeaderProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

function TemplateGalleryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <polygon points="4.5,1.5 8.2,7.5 0.8,7.5" fill="#EF4444" />
      <circle cx="11.5" cy="4.5" r="3" fill="#22C55E" />
      <rect x="8" y="9" width="6.5" height="6" rx="1" fill="#3B82F6" />
    </svg>
  )
}

export function ExplorerHeader({ activeFilter, onFilterChange }: ExplorerHeaderProps) {
  const filters: { value: FilterType; label: string }[] = [
    { value: 'live', label: 'Live' },
    { value: 'managed', label: 'Managed by me' },
    { value: 'others', label: 'Others' },
  ]

  return (
    <div className="bg-white rounded-lg h-[86px] px-5 py-3 flex flex-col justify-between">
      {/* Top row: Title + Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Explorer</h1>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="gap-2 h-8 text-[13px]"
          >
            <TemplateGalleryIcon className="h-3.5 w-3.5" />
            Template gallery
          </Button>
          <Link href="/create">
            <Button
              size="sm"
              className="gap-2 h-8 text-[13px] bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              Create
            </Button>
          </Link>
        </div>
      </div>

      {/* Bottom row: Tabs — underline-on-active (Retail One pattern) */}
      <div className="flex gap-3 -mb-3">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              'relative px-1 pt-1 pb-3 text-sm transition-colors',
              activeFilter === filter.value
                ? 'text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900'
                : 'text-gray-600 font-normal hover:text-gray-900'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  )
}
