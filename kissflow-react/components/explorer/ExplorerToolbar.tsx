'use client'

import { Search, List, LayoutGrid } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type ViewMode = 'grid' | 'list'
type SortOption = 'recent' | 'name' | 'type' | 'created' | 'published' | 'modified'

interface ExplorerToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  sortBy: SortOption
  onSortChange: (value: SortOption) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function ExplorerToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: ExplorerToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Left: Search */}
      <div className="relative flex-1 min-w-[280px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-700" />
        <input
          type="text"
          placeholder="Type here to search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-gray-300 rounded-lg placeholder:text-gray-400 hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all duration-150"
        />
      </div>

      {/* Right: Sort + view toggle */}
      <div className="flex items-center gap-3">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger
            aria-label="Sort"
            className="h-9 w-auto gap-2 rounded-lg border border-gray-300 bg-white px-3 shadow-none hover:border-gray-400 focus:outline-none focus:ring-0 focus-visible:ring-0 [&_svg]:size-4 [&_svg]:text-gray-500 [&_svg]:opacity-100"
          >
            <span className="font-normal text-gray-500">Sort</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" className="w-56">
            <SelectItem value="recent" className="text-sm">Recently opened</SelectItem>
            <SelectItem value="name" className="text-sm">Name</SelectItem>
            <SelectItem value="type" className="text-sm">Type</SelectItem>
            <SelectItem value="created" className="text-sm">Recently created</SelectItem>
            <SelectItem value="published" className="text-sm">Recently published</SelectItem>
            <SelectItem value="modified" className="text-sm">Recently modified</SelectItem>
          </SelectContent>
        </Select>

        {/* View toggle — pill bar with lavender-active */}
        <div className="flex items-center rounded-full border border-gray-200 bg-white p-0.5">
          <button
            onClick={() => onViewModeChange('list')}
            aria-label="List view"
            className={cn(
              'flex items-center justify-center h-7 w-9 rounded-full transition-all duration-150',
              viewMode === 'list'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            aria-label="Grid view"
            className={cn(
              'flex items-center justify-center h-7 w-9 rounded-full transition-all duration-150',
              viewMode === 'grid'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
