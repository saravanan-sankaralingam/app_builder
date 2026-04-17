'use client'

import { useState, useEffect } from 'react'
import { Search, Home, Navigation, ClipboardList, LayoutGrid, Workflow, Filter, Table, Image, Sheet, BarChart3, Grid3x3, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { listViews, type View } from '@/lib/api/views'
import { listReports, type Report } from '@/lib/api/reports'
import { listDataLayers, type DataLayer } from '@/lib/api/data-layers'

interface Role {
  id: string
  name: string
  defaultPage?: string
  defaultNavigation?: string
  type: 'in-app' | 'linked'
}

interface DataEntity {
  id: string
  name: string
  type: 'dataform' | 'board' | 'process'
}

interface ViewReport {
  id: string
  name: string
  type: 'view' | 'report'
  viewType?: 'datatable' | 'gallery' | 'sheet'
  reportType?: 'table' | 'chart' | 'pivot' | 'card'
}

interface EntityViewsReports {
  views: View[]
  reports: Report[]
  loading: boolean
}

interface RolesEditorProps {
  appId: string
}

// Mock data for demonstration
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    defaultPage: 'Dashboard',
    defaultNavigation: 'Main Menu',
    type: 'in-app',
  },
  {
    id: '2',
    name: 'Manager',
    defaultPage: 'Reports',
    defaultNavigation: 'Manager Nav',
    type: 'in-app',
  },
  {
    id: '3',
    name: 'Employee',
    defaultPage: 'My Tasks',
    defaultNavigation: 'Employee Nav',
    type: 'in-app',
  },
  {
    id: '4',
    name: 'Team Lead',
    defaultPage: 'Team Dashboard',
    defaultNavigation: 'Team Nav',
    type: 'in-app',
  },
  {
    id: '5',
    name: 'Finance Officer',
    defaultPage: 'Finance Dashboard',
    defaultNavigation: 'Finance Nav',
    type: 'in-app',
  },
  {
    id: '6',
    name: 'HR Manager',
    defaultPage: 'HR Dashboard',
    defaultNavigation: 'HR Nav',
    type: 'in-app',
  },
  {
    id: '7',
    name: 'Sales Representative',
    defaultPage: 'Sales Pipeline',
    defaultNavigation: 'Sales Nav',
    type: 'in-app',
  },
  {
    id: '8',
    name: 'Customer Support',
    defaultPage: 'Support Tickets',
    defaultNavigation: 'Support Nav',
    type: 'in-app',
  },
  {
    id: '9',
    name: 'External Reviewer',
    defaultPage: 'Review Queue',
    defaultNavigation: 'Reviewer Nav',
    type: 'linked',
  },
  {
    id: '10',
    name: 'External Auditor',
    defaultPage: 'Audit Dashboard',
    defaultNavigation: 'Auditor Nav',
    type: 'linked',
  },
]

export function RolesEditor({ appId }: RolesEditorProps) {
  const [activeRoleType, setActiveRoleType] = useState<'in-app' | 'linked'>('in-app')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [dataEntities, setDataEntities] = useState<DataEntity[]>([])
  const [isLoadingEntities, setIsLoadingEntities] = useState(false)

  // Filter roles by type and search query
  const filteredRoles = mockRoles.filter(
    (role) =>
      role.type === activeRoleType &&
      role.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Fetch data entities when component mounts
  useEffect(() => {
    const fetchDataEntities = async () => {
      console.log('RolesEditor: Fetching data entities for appId:', appId)
      setIsLoadingEntities(true)
      try {
        const layers = await listDataLayers(appId)
        console.log('RolesEditor: Fetched layers:', layers)
        const entities: DataEntity[] = layers
          .filter(layer => layer.type !== 'list') // Exclude list type
          .map(layer => ({
            id: layer.id,
            name: layer.name,
            type: layer.type as 'dataform' | 'board' | 'process'
          }))
        console.log('RolesEditor: Filtered entities:', entities)
        setDataEntities(entities)
      } catch (error) {
        console.error('Error fetching data entities:', error)
        setDataEntities([])
      } finally {
        setIsLoadingEntities(false)
      }
    }

    fetchDataEntities()
  }, [appId])

  // Select first role when component mounts or when activeRoleType changes
  useEffect(() => {
    const firstRole = mockRoles.find((role) => role.type === activeRoleType)
    if (firstRole) {
      setSelectedRoleId(firstRole.id)
    }
  }, [activeRoleType])

  // Ensure selected role is in filtered list, otherwise select first filtered role
  useEffect(() => {
    if (filteredRoles.length > 0) {
      const isSelectedInFiltered = filteredRoles.some((role) => role.id === selectedRoleId)
      if (!isSelectedInFiltered) {
        setSelectedRoleId(filteredRoles[0].id)
      }
    }
  }, [filteredRoles, selectedRoleId])

  return (
    <div className="h-full w-full flex bg-white">
      {/* Left Pane - Fixed 300px */}
      <div className="w-[300px] flex-shrink-0 border-r border-gray-200 flex flex-col">
        {/* Button Bar */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveRoleType('in-app')}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                activeRoleType === 'in-app'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              In-app roles
            </button>
            <button
              onClick={() => setActiveRoleType('linked')}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                activeRoleType === 'linked'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Linked roles
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-400 rounded-md placeholder:text-gray-500 hover:border-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Roles List */}
        <div className="flex-1 overflow-auto px-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
          <div className="space-y-2">
            {filteredRoles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-all',
                  selectedRoleId === role.id
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                )}
              >
                {/* Role Name */}
                <div className="font-medium text-sm text-gray-900 mb-2">
                  {role.name}
                </div>

                {/* Default Page and Navigation */}
                <div className="space-y-1.5">
                  {role.defaultPage && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center justify-center w-5 h-5 rounded bg-blue-100">
                        <Home className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="text-gray-600 truncate flex-1">
                        {role.defaultPage}
                      </span>
                    </div>
                  )}
                  {role.defaultNavigation && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center justify-center w-5 h-5 rounded" style={{ backgroundColor: '#EC489920' }}>
                        <Navigation className="h-3 w-3" style={{ color: '#EC4899' }} />
                      </div>
                      <span className="text-gray-600 truncate flex-1">
                        {role.defaultNavigation}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Empty State */}
          {filteredRoles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No roles found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try adjusting your search
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Remaining space */}
      <div className="flex-1 flex flex-col bg-gray-50 p-4">
        {selectedRoleId ? (
          <PermissionsPanel
            role={mockRoles.find(r => r.id === selectedRoleId)!}
            dataEntities={dataEntities}
            isLoadingEntities={isLoadingEntities}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Select a role to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Permissions Panel Component
interface PermissionsPanelProps {
  role: Role
  dataEntities: DataEntity[]
  isLoadingEntities: boolean
}

function PermissionsPanel({ role, dataEntities, isLoadingEntities }: PermissionsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'views' | 'reports'>('views')
  const [viewReportSearchQuery, setViewReportSearchQuery] = useState('')
  const [entityData, setEntityData] = useState<Record<string, EntityViewsReports>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Filter data entities by search
  const filteredEntities = dataEntities.filter(entity =>
    entity.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group entities by type
  const groupedEntities = {
    dataform: filteredEntities.filter(e => e.type === 'dataform'),
    board: filteredEntities.filter(e => e.type === 'board'),
    process: filteredEntities.filter(e => e.type === 'process'),
  }

  // Auto-select first entity
  useEffect(() => {
    if (filteredEntities.length > 0 && !selectedEntityId) {
      setSelectedEntityId(filteredEntities[0].id)
    }
  }, [filteredEntities, selectedEntityId])

  // Fetch views and reports when entity is selected
  useEffect(() => {
    if (!selectedEntityId) return

    // Check if we already have data for this entity
    if (entityData[selectedEntityId]) return

    const fetchViewsAndReports = async () => {
      setIsLoading(true)
      try {
        const [views, reports] = await Promise.all([
          listViews(selectedEntityId),
          listReports(selectedEntityId)
        ])

        setEntityData(prev => ({
          ...prev,
          [selectedEntityId]: {
            views,
            reports,
            loading: false
          }
        }))
      } catch (error) {
        console.error('Error fetching views and reports:', error)
        // Set empty data on error
        setEntityData(prev => ({
          ...prev,
          [selectedEntityId]: {
            views: [],
            reports: [],
            loading: false
          }
        }))
      } finally {
        setIsLoading(false)
      }
    }

    fetchViewsAndReports()
  }, [selectedEntityId, entityData])

  const selectedEntity = dataEntities.find(e => e.id === selectedEntityId)
  const currentEntityData = selectedEntityId ? entityData[selectedEntityId] : null

  // Convert API data to ViewReport format for display
  const viewsReports: ViewReport[] = currentEntityData
    ? [
        ...currentEntityData.views.map(v => ({
          id: v.id,
          name: v.name,
          type: 'view' as const,
          viewType: v.type
        })),
        ...currentEntityData.reports.map(r => ({
          id: r.id,
          name: r.name,
          type: 'report' as const,
          reportType: r.type
        }))
      ]
    : []

  const views = viewsReports.filter(vr => vr.type === 'view')
  const reports = viewsReports.filter(vr => vr.type === 'report')
  const allActiveItems = activeTab === 'views' ? views : reports

  // Filter by search query
  const activeItems = allActiveItems.filter(item =>
    item.name.toLowerCase().includes(viewReportSearchQuery.toLowerCase())
  )

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'dataform': return ClipboardList
      case 'board': return LayoutGrid
      case 'process': return Workflow
      default: return ClipboardList
    }
  }

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'dataform': return '#22C55E'
      case 'board': return '#8B5CF6'
      case 'process': return '#F97316'
      default: return '#6B7280'
    }
  }

  const getPermissionOptions = (type: string) => {
    switch (type) {
      case 'dataform':
        return ['No access', 'Read-only', 'Edit', 'Manage']
      case 'board':
        return ['No access', 'Read-only', 'Initiate', 'Edit', 'Manage']
      case 'process':
        return ['No access', 'Initiate', 'Manage']
      default:
        return ['No access', 'Read-only', 'Edit', 'Manage']
    }
  }

  const getViewTypeIcon = (viewType?: string) => {
    switch (viewType) {
      case 'datatable': return Table
      case 'gallery': return Image
      case 'sheet': return Sheet
      default: return Table
    }
  }

  const getViewTypeColor = () => {
    return '#9CA3AF' // gray-400
  }

  const getReportTypeIcon = (reportType?: string) => {
    switch (reportType) {
      case 'table': return Table
      case 'chart': return BarChart3
      case 'pivot': return Grid3x3
      case 'card': return CreditCard
      default: return Table
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-auto gap-3">
      {/* Header */}
      <div className="px-6 py-4 border border-gray-200 rounded-lg bg-white flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Manage permissions for &ldquo;{role.name}&rdquo;
        </h2>

        {/* Default Home Page and Navigation */}
        <div className="flex items-center gap-4 text-xs">
          {role.defaultPage && (
            <div className="flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-gray-500">Default page:</span>
              <span className="text-gray-900 font-medium">{role.defaultPage}</span>
            </div>
          )}
          {role.defaultNavigation && (
            <div className="flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5" style={{ color: '#EC4899' }} />
              <span className="text-gray-500">Default navigation:</span>
              <span className="text-gray-900 font-medium">{role.defaultNavigation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Two-pane layout */}
      <div className="flex-1 flex overflow-hidden gap-3">
        {/* Left Pane - Data Entities (260px) */}
        <div className="w-[260px] flex-shrink-0 border border-gray-200 rounded-lg flex flex-col bg-white overflow-hidden">
          {/* Search and Filter */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-xs bg-white border border-gray-400 rounded-md placeholder:text-gray-500 hover:border-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                />
              </div>
              <button className="flex items-center justify-center w-7 h-7 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors">
                <Filter className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Data Entities List */}
          <div className="flex-1 overflow-auto p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
            {isLoadingEntities ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-xs text-gray-500">Loading entities...</p>
              </div>
            ) : filteredEntities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-gray-500">No data entities found</p>
                <p className="text-xs text-gray-400 mt-1">Create a data form, board, or process first</p>
              </div>
            ) : (
              <>
            {/* Data Forms */}
            {groupedEntities.dataform.length > 0 && (
              <div className="mb-3">
                <div className="px-2 py-1 text-xs font-medium text-gray-500">
                  Data forms
                </div>
                <div className="space-y-1.5 mt-1">
                  {groupedEntities.dataform.map(entity => {
                    const Icon = getEntityIcon(entity.type)
                    const color = getEntityColor(entity.type)
                    return (
                      <button
                        key={entity.id}
                        onClick={() => setSelectedEntityId(entity.id)}
                        className={cn(
                          'w-full flex items-center gap-2 px-2 py-2.5 rounded transition-colors text-left',
                          selectedEntityId === entity.id
                            ? 'bg-blue-50 text-gray-900'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                        style={{ fontSize: '13px' }}
                      >
                        <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color }} />
                        <span className="truncate">{entity.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Boards */}
            {groupedEntities.board.length > 0 && (
              <div className="mb-3">
                <div className="px-2 py-1 text-xs font-medium text-gray-500">
                  Boards
                </div>
                <div className="space-y-1.5 mt-1">
                  {groupedEntities.board.map(entity => {
                    const Icon = getEntityIcon(entity.type)
                    const color = getEntityColor(entity.type)
                    return (
                      <button
                        key={entity.id}
                        onClick={() => setSelectedEntityId(entity.id)}
                        className={cn(
                          'w-full flex items-center gap-2 px-2 py-2.5 rounded transition-colors text-left',
                          selectedEntityId === entity.id
                            ? 'bg-blue-50 text-gray-900'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                        style={{ fontSize: '13px' }}
                      >
                        <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color }} />
                        <span className="truncate">{entity.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Processes */}
            {groupedEntities.process.length > 0 && (
              <div className="mb-3">
                <div className="px-2 py-1 text-xs font-medium text-gray-500">
                  Processes
                </div>
                <div className="space-y-1.5 mt-1">
                  {groupedEntities.process.map(entity => {
                    const Icon = getEntityIcon(entity.type)
                    const color = getEntityColor(entity.type)
                    return (
                      <button
                        key={entity.id}
                        onClick={() => setSelectedEntityId(entity.id)}
                        className={cn(
                          'w-full flex items-center gap-2 px-2 py-2.5 rounded transition-colors text-left',
                          selectedEntityId === entity.id
                            ? 'bg-blue-50 text-gray-900'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                        style={{ fontSize: '13px' }}
                      >
                        <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color }} />
                        <span className="truncate">{entity.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
              </>
            )}
          </div>
        </div>

        {/* Right Pane - Permissions Details */}
        <div className="flex-1 flex flex-col overflow-hidden border border-gray-200 rounded-lg bg-white gap-3">
          {selectedEntity ? (
            <>
              {/* Entity Context and Overall Permissions */}
              <div className="px-6 pt-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = getEntityIcon(selectedEntity.type)
                        const color = getEntityColor(selectedEntity.type)
                        return (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <Icon className="h-4 w-4" style={{ color }} />
                          </div>
                        )
                      })()}
                      <div>
                        <h3 className="font-semibold text-gray-900" style={{ fontSize: '13px' }}>{selectedEntity.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {getPermissionOptions(selectedEntity.type).map((option, index) => (
                        <label key={option} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="overall-permission"
                            className="w-4 h-4 border-gray-400"
                            defaultChecked={index === 1}
                          />
                          <span className="text-gray-700" style={{ fontSize: '13px' }}>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Views/Reports Tab */}
              <div className="px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('views')}
                      className={cn(
                        'px-3 py-1 text-xs font-medium rounded-full transition-all border',
                        activeTab === 'views'
                          ? 'bg-gray-900 border-gray-900 text-white'
                          : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50'
                      )}
                    >
                      Views
                    </button>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className={cn(
                        'px-3 py-1 text-xs font-medium rounded-full transition-all border',
                        activeTab === 'reports'
                          ? 'bg-gray-900 border-gray-900 text-white'
                          : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50'
                      )}
                    >
                      Reports
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-48">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={viewReportSearchQuery}
                      onChange={(e) => setViewReportSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-2 py-1 text-xs bg-white border border-gray-400 rounded-md placeholder:text-gray-500 hover:border-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* Permissions Matrix */}
              <div className="flex-1 overflow-hidden px-6 pb-6 flex flex-col">
                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-gray-500" style={{ fontSize: '13px' }}>Loading...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                    <div className="overflow-auto flex-1">
                      <table className="w-full h-full">
                        <thead className="sticky top-0 bg-gray-50">
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-medium text-gray-700 w-[40%]" style={{ fontSize: '13px' }}>
                              {activeTab === 'views' ? 'View Name' : 'Report Name'}
                            </th>
                            {activeTab === 'views' ? (
                              <>
                                <th className="text-center py-2 px-3 font-medium text-gray-700 w-[15%]" style={{ fontSize: '13px' }}>
                                  No access
                                </th>
                                <th className="text-center py-2 px-3 font-medium text-gray-700 w-[15%]" style={{ fontSize: '13px' }}>
                                  Read-only
                                </th>
                                <th className="text-center py-2 px-3 font-medium text-gray-700 w-[15%]" style={{ fontSize: '13px' }}>
                                  Edit
                                </th>
                                <th className="text-center py-2 px-3 font-medium text-gray-700 w-[15%]" style={{ fontSize: '13px' }}>
                                  Manage
                                </th>
                              </>
                            ) : (
                              <>
                                <th className="text-center py-2 px-3 font-medium text-gray-700 w-[30%]" style={{ fontSize: '13px' }}>
                                  No access
                                </th>
                                <th className="text-center py-2 px-3 font-medium text-gray-700 w-[30%]" style={{ fontSize: '13px' }}>
                                  View report
                                </th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {activeItems.length > 0 ? (
                            activeItems.map((item, index) => {
                            const ViewIcon = item.viewType ? getViewTypeIcon(item.viewType) : null
                            const ReportIcon = item.reportType ? getReportTypeIcon(item.reportType) : null
                            const iconColor = getViewTypeColor()
                            return (
                              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-2.5 px-3 text-gray-900" style={{ fontSize: '13px' }}>
                                  <div className="flex items-center gap-2">
                                    {ViewIcon && activeTab === 'views' && (
                                      <ViewIcon className="h-3.5 w-3.5" style={{ color: iconColor }} />
                                    )}
                                    {ReportIcon && activeTab === 'reports' && (
                                      <ReportIcon className="h-3.5 w-3.5" style={{ color: iconColor }} />
                                    )}
                                    {item.name}
                                  </div>
                                </td>
                                {activeTab === 'views' ? (
                                  <>
                                    <td className="py-2.5 px-3 text-center">
                                      <input
                                        type="radio"
                                        name={`permission-${item.id}`}
                                        className="w-4 h-4 border-gray-400"
                                      />
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <input
                                        type="radio"
                                        name={`permission-${item.id}`}
                                        className="w-4 h-4 border-gray-400"
                                        defaultChecked={index === 0}
                                      />
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <input
                                        type="radio"
                                        name={`permission-${item.id}`}
                                        className="w-4 h-4 border-gray-400"
                                      />
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <input
                                        type="radio"
                                        name={`permission-${item.id}`}
                                        className="w-4 h-4 border-gray-400"
                                      />
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="py-2.5 px-3 text-center">
                                      <input
                                        type="radio"
                                        name={`permission-${item.id}`}
                                        className="w-4 h-4 border-gray-400"
                                      />
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <input
                                        type="radio"
                                        name={`permission-${item.id}`}
                                        className="w-4 h-4 border-gray-400"
                                        defaultChecked={index === 0}
                                      />
                                    </td>
                                  </>
                                )}
                              </tr>
                            )
                          })
                          ) : (
                            <tr>
                              <td colSpan={activeTab === 'views' ? 5 : 3} className="text-center h-full p-0">
                                <div className="flex flex-col items-center justify-center min-h-[400px]">
                                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                    {activeTab === 'views' ? (
                                      <LayoutGrid className="h-8 w-8 text-gray-400" />
                                    ) : (
                                      <BarChart3 className="h-8 w-8 text-gray-400" />
                                    )}
                                  </div>
                                  <p className="text-gray-500 font-medium" style={{ fontSize: '13px' }}>
                                    {viewReportSearchQuery ? 'No matching items found' : `No ${activeTab} available`}
                                  </p>
                                  <p className="text-gray-400 text-xs mt-1">
                                    {viewReportSearchQuery ? 'Try adjusting your search' : `Create a ${activeTab === 'views' ? 'view' : 'report'} to get started`}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-gray-500">Select a data entity to manage permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
