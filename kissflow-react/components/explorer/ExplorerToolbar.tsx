'use client'

import Link from 'next/link'
import { Search, List, Grid3x3, Sparkles, Plus, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type ViewMode = 'grid' | 'list'
type SortOption = 'recent' | 'name' | 'created'

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
      {/* Search - Premium styling */}
      <div className="relative flex-1 min-w-[280px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-gray-400 rounded-lg placeholder:text-gray-500 hover:border-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all duration-150"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Sort Dropdown - Refined */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 hidden sm:inline">Sort by</span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-9 w-[160px] bg-white border-gray-200/80 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-150">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-gray-200/80 shadow-lg">
              <SelectItem value="recent" className="text-sm">Recently opened</SelectItem>
              <SelectItem value="name" className="text-sm">Name</SelectItem>
              <SelectItem value="created" className="text-sm">Date created</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subtle divider */}
        <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />

        {/* View Toggle - Premium button group */}
        <div className="flex rounded-lg border border-gray-200/80 bg-white p-0.5">
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150',
              viewMode === 'list'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150',
              viewMode === 'grid'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
        </div>

        {/* Subtle divider */}
        <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />

        {/* Template Gallery - Secondary button */}
        <Button
          variant="ghost"
          className="h-9 gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-150"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden md:inline">Templates</span>
        </Button>

        {/* Create Button - Premium primary */}
        <Link href="/create">
          <Button className="h-9 gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm hover:shadow transition-all duration-150">
            <Plus className="h-4 w-4" />
            <span>Create</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
