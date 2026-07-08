'use client'

import { useState, useMemo, useEffect } from 'react'
import { ExplorerHeader } from './ExplorerHeader'
import { ExplorerToolbar } from './ExplorerToolbar'
import { AppsGrid } from './AppsGrid'
import { AppsGroupedByType } from './AppsGroupedByType'
import { listApps, App, AppStatus } from '@/lib/api/apps'
import { getIconByName } from '@/lib/icons'
import { AppData, AppGroupType, APP_GROUP_TYPES } from '@/types/app'
import { Loader2, ShoppingBag, Boxes, Receipt, Building2 } from 'lucide-react'

type FilterType = 'live' | 'managed' | 'others'
type ViewMode = 'grid' | 'list'
type SortOption = 'recent' | 'name' | 'type' | 'created' | 'published' | 'modified'

// Deterministic hash → bucket the app into one of the 5 type categories.
// Stable per app id so the grouping doesn't shuffle between renders.
function deriveAppType(id: string): AppGroupType {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0
  }
  return APP_GROUP_TYPES[Math.abs(hash) % APP_GROUP_TYPES.length]
}

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
    // Static apps that always appear
    const staticApps: AppData[] = [
      {
        id: 'vendor-onboarding-and-management',
        name: 'Vendor Onboarding and Management',
        description:
          'Track vendors end-to-end from onboarding through renewal. Coordinate procurement, legal, and compliance sign-offs, and manage documents, contracts, and performance reviews in one place.',
        icon: Building2,
        iconBg: '#F7F2FF',
        createdBy: 'System',
        type: 'Application',
      },
      {
        id: 'retail-one',
        name: 'Retail One',
        description: 'Comprehensive retail management application',
        icon: ShoppingBag,
        iconBg: '#DBEAFE',
        createdBy: 'System',
        type: 'Application',
      },
      {
        id: 'inventory-management',
        name: 'Inventory Management',
        description: 'Track stock levels, movements, and replenishment across warehouses',
        icon: Boxes,
        iconBg: '#FFF4ED',
        createdBy: 'System',
        type: 'Application',
      },
      {
        id: 'expense-management',
        name: 'Expense Management',
        description: 'Submit, approve, and track employee expense claims and reimbursements',
        icon: Receipt,
        iconBg: '#F7F2FF',
        createdBy: 'System',
        type: 'Application',
      },
    ]

    // Transform API apps to AppData format
    let transformed: AppData[] = apps.map((app) => ({
      id: app.id,
      name: app.name,
      description: app.description || 'No description added',
      icon: getIconByName(app.icon),
      iconBg: app.iconBg,
      createdBy: app.createdBy.name,
      type: deriveAppType(app.id),
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
      // Add static apps to live apps
      transformed = [...staticApps, ...transformed]
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
        case 'type':
          // Type sort still alphabetises within each type — the accordion handles the grouping.
          return a.name.localeCompare(b.name)
        case 'created': {
          const aDate = appsSortData.get(a.id)?.createdAt || ''
          const bDate = appsSortData.get(b.id)?.createdAt || ''
          return new Date(bDate).getTime() - new Date(aDate).getTime()
        }
        case 'published':
        case 'modified':
        case 'recent':
        default: {
          // No separate publishedAt today — all three fall back to updatedAt.
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
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading apps...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
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
    <div className="min-h-[calc(100vh-50px)] bg-gray-200">
      {/* Header card wrapper — matches Retail One outer header padding */}
      <div className="px-5 py-3">
        <ExplorerHeader
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      {/* Content area — 12px top so header→toolbar gap totals 24px (header's py-3 + this pt-3) */}
      <div className="px-6 pb-6 pt-3 space-y-6">
        {/* Toolbar with search, sort, view toggle */}
        <ExplorerToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Apps grid/list — accordion-by-type when sortBy is 'type' */}
        <div>
          {filteredApps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No apps found</p>
            </div>
          ) : sortBy === 'type' ? (
            <AppsGroupedByType apps={filteredApps} viewMode={viewMode} />
          ) : (
            <AppsGrid apps={filteredApps} viewMode={viewMode} />
          )}
        </div>
      </div>
    </div>
  )
}
