'use client'

import { useState, useMemo, useEffect } from 'react'
import { ExplorerHeader } from './ExplorerHeader'
import { ExplorerToolbar } from './ExplorerToolbar'
import { AppsGrid } from './AppsGrid'
import { listApps, App, AppStatus } from '@/lib/api/apps'
import { getIconByName } from '@/lib/icons'
import { AppData } from '@/types/app'
import { Loader2 } from 'lucide-react'

type FilterType = 'live' | 'managed' | 'others'
type ViewMode = 'grid' | 'list'
type SortOption = 'recent' | 'name' | 'created'

export function ExplorerView() {
  const [apps, setApps] = useState<App[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>('live')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Fetch apps from API
  useEffect(() => {
    async function fetchApps() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await listApps()
        setApps(response.apps)
      } catch (err) {
        console.error('Failed to fetch apps:', err)
        setError('Failed to load apps. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchApps()
  }, [])

  // Transform API apps to AppData format and apply filters
  const filteredApps = useMemo(() => {
    // Transform API apps to AppData format
    let transformed: AppData[] = apps.map((app) => ({
      id: app.id,
      name: app.name,
      description: app.description || 'No description added',
      icon: getIconByName(app.icon),
      iconBg: app.iconBg,
      createdBy: app.createdBy.name,
    }))

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      transformed = transformed.filter(
        (app) =>
          app.name.toLowerCase().includes(query) ||
          app.description.toLowerCase().includes(query) ||
          app.createdBy.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (activeFilter === 'live') {
      // Show live apps - filter by status from original apps
      const liveAppIds = new Set(apps.filter(a => a.status === 'live').map(a => a.id))
      transformed = transformed.filter((app) => liveAppIds.has(app.id))
    } else if (activeFilter === 'managed') {
      // Show apps managed by the current user (for now, show all draft apps)
      const draftAppIds = new Set(apps.filter(a => a.status === 'draft').map(a => a.id))
      transformed = transformed.filter((app) => draftAppIds.has(app.id))
    }
    // 'others' shows all remaining apps

    // Apply sorting
    const appsSortData = new Map(apps.map(a => [a.id, a]))
    transformed.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created': {
          const aDate = appsSortData.get(a.id)?.createdAt || ''
          const bDate = appsSortData.get(b.id)?.createdAt || ''
          return new Date(bDate).getTime() - new Date(aDate).getTime()
        }
        case 'recent':
        default: {
          const aDate = appsSortData.get(a.id)?.updatedAt || ''
          const bDate = appsSortData.get(b.id)?.updatedAt || ''
          return new Date(bDate).getTime() - new Date(aDate).getTime()
        }
      }
    })

    return transformed
  }, [apps, searchQuery, activeFilter, sortBy])

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading apps...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header with title and filters */}
      <ExplorerHeader
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Toolbar with search, sort, view toggle */}
      <ExplorerToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Apps grid/list */}
      <div className="pt-1">
        {filteredApps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No apps found</p>
          </div>
        ) : (
          <AppsGrid apps={filteredApps} viewMode={viewMode} />
        )}
      </div>
    </div>
  )
}
