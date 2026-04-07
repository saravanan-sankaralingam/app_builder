'use client'

import { cn } from '@/lib/utils'

type FilterType = 'live' | 'managed' | 'others'

interface ExplorerHeaderProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

export function ExplorerHeader({ activeFilter, onFilterChange }: ExplorerHeaderProps) {
  const filters: { value: FilterType; label: string }[] = [
    { value: 'live', label: 'Live' },
    { value: 'managed', label: 'Managed by me' },
    { value: 'others', label: 'Others' },
  ]

  return (
    <div className="flex items-center gap-6">
      {/* Title with refined typography */}
      <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
        Explore
      </h1>

      {/* Filter pills with premium styling */}
      <div className="flex items-center gap-1.5">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              'px-3.5 py-1.5 text-sm font-medium rounded-full transition-all duration-150',
              activeFilter === filter.value
                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/80'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  )
}
