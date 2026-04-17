'use client'

import { ReactNode, useState, useEffect } from 'react'
import { BuilderThemeRoot } from '@/context/BuilderThemeContext'
import { ClipboardList, LayoutGrid, Workflow, Navigation, FileText, List, Variable, FolderOpen, Plus, Inbox, Search, Component, Cable, UserKey } from 'lucide-react'
import { BuilderTopBar } from './BuilderTopBar'
import { BuilderSidebar } from './BuilderSidebar'
import { BuilderTabBar, Tab, HOME_TAB } from './BuilderTabBar'
import { BuilderUtilityBar } from './BuilderUtilityBar'
import { DataFormCreateDialog } from './DataFormCreateDialog'
import { BoardCreateDialog } from './BoardCreateDialog'
import { ProcessCreateDialog } from './ProcessCreateDialog'
import { NavigationCreateDialog } from './NavigationCreateDialog'
import { PageCreateDialog } from './PageCreateDialog'
import { ListCreateDialog } from './ListCreateDialog'
import { FormBuilder } from './FormBuilder'
import { ListEditor } from './ListEditor'
import { VariablesEditor } from './VariablesEditor'
import { ResourcesEditor } from './ResourcesEditor'
import { ComponentsEditor } from './ComponentsEditor'
import { ComponentEditor } from './ComponentEditor'
import { RolesEditor } from './RolesEditor'
import { ComponentData } from './ComponentCard'
import { NavigationEditor } from './NavigationEditor'
import { PageEditor } from './PageEditor'
import { ViewCreateDialog } from './ViewCreateDialog'
import { ReportCreateDialog, ReportType } from './ReportCreateDialog'
import { RenameDialog } from './RenameDialog'
import { DuplicateDialog } from './DuplicateDialog'
import { ViewCard } from './ViewCard'
import { ReportCard } from './ReportCard'
import { DataFormShareEditor } from './DataFormShareEditor'
import { DataFormSettingsEditor } from './DataFormSettingsEditor'
import { CopilotPanel } from './CopilotPanel'
import { AppRuntimePreview } from './AppRuntimePreview'
import { View, listViews, createView } from '@/lib/api/views'
import { Report, listReports, createReport } from '@/lib/api/reports'
import { listComponents as fetchComponentsApi } from '@/lib/api/components'

interface BuilderLayoutProps {
  children?: ReactNode
  appId: string
  appName: string
  appDescription?: string
  appIcon: string
  appIconBg: string
  onSidebarItemClick?: (id: string) => void
  onNameChange?: (name: string) => Promise<{ success: boolean; error?: string }>
}

export function BuilderLayout({
  children,
  appId,
  appName,
  appDescription,
  appIcon,
  appIconBg,
  onSidebarItemClick,
  onNameChange,
}: BuilderLayoutProps) {

  const [tabs, setTabs] = useState<Tab[]>([HOME_TAB])
  const [activeTabId, setActiveTabId] = useState('home')
  const [activeView, setActiveView] = useState<'form' | 'workflow' | 'permission' | 'views' | 'reports' | 'share' | 'settings' | 'view-detail' | 'report-detail' | 'component-detail'>('form')

  // Component state
  const [selectedComponent, setSelectedComponent] = useState<ComponentData | null>(null)
  const [isComponentNewlyCreated, setIsComponentNewlyCreated] = useState(false)
  const [components, setComponents] = useState<ComponentData[]>([])
  const [isLoadingComponents, setIsLoadingComponents] = useState(false)

  // Views state
  const [views, setViews] = useState<View[]>([])
  const [selectedView, setSelectedView] = useState<View | null>(null)
  const [isLoadingViews, setIsLoadingViews] = useState(false)

  // Reports state
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isLoadingReports, setIsLoadingReports] = useState(false)

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createType, setCreateType] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // View create dialog state
  const [viewCreateDialogOpen, setViewCreateDialogOpen] = useState(false)
  const [isCreatingView, setIsCreatingView] = useState(false)

  // Report create dialog state
  const [reportCreateDialogOpen, setReportCreateDialogOpen] = useState(false)
  const [isCreatingReport, setIsCreatingReport] = useState(false)

  // Rename dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [entityDetails, setEntityDetails] = useState<{ name: string; description?: string } | null>(null)
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)

  // Duplicate dialog state
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

  // Run mode state
  const [isRunMode, setIsRunMode] = useState(false)

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId)
  }

  const handleTabClose = (tabId: string) => {
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== tabId))
    // If closing active tab, switch to the first remaining tab
    if (tabId === activeTabId) {
      const remainingTabs = tabs.filter((tab) => tab.id !== tabId)
      if (remainingTabs.length > 0) {
        setActiveTabId(remainingTabs[0].id)
      }
    }
  }

  // Handle create item from sidebar
  const handleCreateItem = (type: string) => {
    setCreateType(type)
    setCreateDialogOpen(true)
  }

  // Handle data form creation
  const handleDataFormCreate = async (data: { name: string; description?: string }) => {
    if (!appId) return

    setIsCreating(true)
    try {
      const response = await fetch(`http://localhost:3000/api/apps/${appId}/data-layers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          type: 'dataform',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create data form')
      }

      const result = await response.json()
      const newDataForm = result.data

      // Create new tab for the data form
      const newTab: Tab = {
        id: `dataform-${newDataForm.id}`,
        label: newDataForm.name,
        icon: ClipboardList,
        closable: true,
        type: 'dataform',
        entityId: newDataForm.id,
      }

      // Add tab and switch to it
      setTabs((prevTabs) => [...prevTabs, newTab])
      setActiveTabId(newTab.id)

      // Close dialog
      setCreateDialogOpen(false)
      setCreateType(null)
    } catch (error) {
      console.error('Failed to create data form:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle board creation
  const handleBoardCreate = async (data: { name: string; description?: string }) => {
    if (!appId) return

    setIsCreating(true)
    try {
      const response = await fetch(`http://localhost:3000/api/apps/${appId}/data-layers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          type: 'board',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create board')
      }

      const result = await response.json()
      const newBoard = result.data

      // Create new tab for the board
      const newTab: Tab = {
        id: `board-${newBoard.id}`,
        label: newBoard.name,
        icon: LayoutGrid,
        closable: true,
        type: 'board',
        entityId: newBoard.id,
      }

      // Add tab and switch to it
      setTabs((prevTabs) => [...prevTabs, newTab])
      setActiveTabId(newTab.id)

      // Close dialog
      setCreateDialogOpen(false)
      setCreateType(null)
    } catch (error) {
      console.error('Failed to create board:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle process creation
  const handleProcessCreate = async (data: { name: string; description?: string }) => {
    if (!appId) return

    setIsCreating(true)
    try {
      const response = await fetch(`http://localhost:3000/api/apps/${appId}/data-layers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          type: 'process',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create process')
      }

      const result = await response.json()
      const newProcess = result.data

      // Create new tab for the process
      const newTab: Tab = {
        id: `process-${newProcess.id}`,
        label: newProcess.name,
        icon: Workflow,
        closable: true,
        type: 'process',
        entityId: newProcess.id,
      }

      // Add tab and switch to it
      setTabs((prevTabs) => [...prevTabs, newTab])
      setActiveTabId(newTab.id)

      // Close dialog
      setCreateDialogOpen(false)
      setCreateType(null)
    } catch (error) {
      console.error('Failed to create process:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle navigation creation
  const handleNavigationCreate = async (data: { name: string; description?: string }) => {
    if (!appId) return

    setIsCreating(true)
    try {
      const response = await fetch(`http://localhost:3000/api/apps/${appId}/navigations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create navigation')
      }

      const result = await response.json()
      const newNavigation = result.data

      // Create new tab for the navigation
      const newTab: Tab = {
        id: `navigation-${newNavigation.id}`,
        label: newNavigation.name,
        icon: Navigation,
        closable: true,
        type: 'navigation',
        entityId: newNavigation.id,
      }

      // Add tab and switch to it
      setTabs((prevTabs) => [...prevTabs, newTab])
      setActiveTabId(newTab.id)

      // Close dialog
      setCreateDialogOpen(false)
      setCreateType(null)
    } catch (error) {
      console.error('Failed to create navigation:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle page creation
  const handlePageCreate = async (data: { name: string; description?: string }) => {
    if (!appId) return

    setIsCreating(true)
    try {
      const response = await fetch(`http://localhost:3000/api/apps/${appId}/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create page')
      }

      const result = await response.json()
      const newPage = result.data

      // Create new tab for the page
      const newTab: Tab = {
        id: `page-${newPage.id}`,
        label: newPage.name,
        icon: FileText,
        closable: true,
        type: 'page',
        entityId: newPage.id,
      }

      // Add tab and switch to it
      setTabs((prevTabs) => [...prevTabs, newTab])
      setActiveTabId(newTab.id)

      // Close dialog
      setCreateDialogOpen(false)
      setCreateType(null)
    } catch (error) {
      console.error('Failed to create page:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle list creation
  const handleListCreate = async (data: { name: string; description?: string }) => {
    if (!appId) return

    setIsCreating(true)
    try {
      const response = await fetch(`http://localhost:3000/api/apps/${appId}/data-layers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          type: 'list',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create list')
      }

      const result = await response.json()
      const newList = result.data

      // Create new tab for the list
      const newTab: Tab = {
        id: `list-${newList.id}`,
        label: newList.name,
        icon: List,
        closable: true,
        type: 'list',
        entityId: newList.id,
      }

      // Add tab and switch to it
      setTabs((prevTabs) => [...prevTabs, newTab])
      setActiveTabId(newTab.id)

      // Close dialog
      setCreateDialogOpen(false)
      setCreateType(null)
    } catch (error) {
      console.error('Failed to create list:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Get the active tab
  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  // Fetch views when navigating to views page
  useEffect(() => {
    if (activeView === 'views' && activeTab?.entityId) {
      setIsLoadingViews(true)
      listViews(activeTab.entityId)
        .then(views => setViews(views.filter(v => !v.isDefault)))
        .catch(console.error)
        .finally(() => setIsLoadingViews(false))
    }
  }, [activeView, activeTab?.entityId])

  // Fetch reports when navigating to reports page
  useEffect(() => {
    if (activeView === 'reports' && activeTab?.entityId) {
      setIsLoadingReports(true)
      listReports(activeTab.entityId)
        .then(reports => setReports(reports.filter(r => !r.isDefault)))
        .catch(console.error)
        .finally(() => setIsLoadingReports(false))
    }
  }, [activeView, activeTab?.entityId])

  // Fetch components when navigating to components tab
  useEffect(() => {
    if (activeTab?.type === 'components' && appId) {
      setIsLoadingComponents(true)
      fetchComponentsApi(appId)
        .then(fetchedComponents => {
          const componentData: ComponentData[] = fetchedComponents.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description || undefined,
            type: c.type,
            method: c.method,
            prompt: c.prompt || undefined,
            status: 'draft' as const,
            createdAt: new Date(c.createdAt),
          }))
          setComponents(componentData)
        })
        .catch(console.error)
        .finally(() => setIsLoadingComponents(false))
    }
  }, [activeTab?.type, appId])

  // Handle view change (form/workflow/permission switcher)
  const handleViewChange = (view: 'form' | 'workflow' | 'permission') => {
    setActiveView(view)
  }

  // Handle views button click - navigate to views drill-through
  const handleViewsClick = () => {
    setActiveView('views')
  }

  // Handle reports button click - navigate to reports drill-through
  const handleReportsClick = () => {
    setActiveView('reports')
  }

  // Handle share button click - navigate to share drill-through
  const handleShareClick = () => {
    setActiveView('share')
  }

  // Handle settings button click - navigate to settings drill-through
  const handleSettingsClick = () => {
    setActiveView('settings')
  }

  // Handle component click - navigate to component detail
  const handleComponentClick = (component: ComponentData, isNewlyCreated = false) => {
    setSelectedComponent(component)
    setIsComponentNewlyCreated(isNewlyCreated)
    setActiveView('component-detail')
  }

  // Handle adding a new component
  const handleAddComponent = (component: ComponentData) => {
    setComponents(prev => [...prev, component])
  }

  // Handle duplicating a component
  const handleDuplicateComponent = (component: ComponentData) => {
    const duplicated: ComponentData = {
      ...component,
      id: `component-${Date.now()}`,
      name: `${component.name} (Copy)`,
      createdAt: new Date(),
    }
    setComponents(prev => [...prev, duplicated])
  }

  // Handle breadcrumb back - return to previous view
  const handleBreadcrumbBack = () => {
    if (activeView === 'view-detail') {
      setActiveView('views')
      setSelectedView(null)
    } else if (activeView === 'report-detail') {
      setActiveView('reports')
      setSelectedReport(null)
    } else if (activeView === 'component-detail') {
      setActiveView('form')
      setSelectedComponent(null)
    } else {
      setActiveView('form')
    }
  }

  // Handle breadcrumb middle click (for three-level navigation)
  const handleBreadcrumbMiddleClick = () => {
    if (activeView === 'view-detail') {
      setActiveView('views')
      setSelectedView(null)
    } else if (activeView === 'report-detail') {
      setActiveView('reports')
      setSelectedReport(null)
    }
  }

  // Handle view card click - navigate to view detail
  const handleViewClick = (view: View) => {
    setSelectedView(view)
    setActiveView('view-detail')
  }

  // Handle report card click - navigate to report detail
  const handleReportClick = (report: Report) => {
    setSelectedReport(report)
    setActiveView('report-detail')
  }

  // Handle new view button click
  const handleNewViewClick = () => {
    setViewCreateDialogOpen(true)
  }

  // Handle new report button click
  const handleNewReportClick = () => {
    setReportCreateDialogOpen(true)
  }

  // Handle report creation
  const handleReportCreate = async (data: { name: string; type: ReportType }) => {
    if (!activeTab?.entityId) return

    setIsCreatingReport(true)
    try {
      const newReport = await createReport(activeTab.entityId, {
        name: data.name,
        type: data.type,
      })

      setReportCreateDialogOpen(false)
      setSelectedReport(newReport)
      setActiveView('report-detail')
    } catch (error) {
      console.error('Failed to create report:', error)
    } finally {
      setIsCreatingReport(false)
    }
  }

  // Handle view creation
  const handleViewCreate = async (data: { name: string; type: string }) => {
    if (!activeTab?.entityId) return

    setIsCreatingView(true)
    try {
      const newView = await createView(activeTab.entityId, {
        name: data.name,
        type: data.type as 'datatable' | 'gallery' | 'sheet',
      })

      setViewCreateDialogOpen(false)
      setSelectedView(newView)
      setActiveView('view-detail')
    } catch (error) {
      console.error('Failed to create view:', error)
    } finally {
      setIsCreatingView(false)
    }
  }

  // Handle rename click - fetch entity details and open dialog
  const handleRenameClick = async () => {
    if (!activeTab?.entityId) return

    setRenameDialogOpen(true)
    setIsFetchingDetails(true)

    try {
      const response = await fetch(
        `http://localhost:3000/api/data-layers/${activeTab.entityId}`
      )
      if (response.ok) {
        const result = await response.json()
        setEntityDetails({
          name: result.data.name,
          description: result.data.description || ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch entity details:', error)
      // Fallback to tab label
      setEntityDetails({ name: activeTab.label, description: '' })
    } finally {
      setIsFetchingDetails(false)
    }
  }

  // Handle rename submit
  const handleRename = async (data: { name: string; description?: string }) => {
    if (!activeTab?.entityId) return

    setIsRenaming(true)
    try {
      const response = await fetch(
        `http://localhost:3000/api/apps/${appId}/data-layers/${activeTab.entityId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) throw new Error('Failed to rename')

      // Update tab label
      setTabs(prev => prev.map(tab =>
        tab.id === activeTabId ? { ...tab, label: data.name } : tab
      ))

      setRenameDialogOpen(false)
      setEntityDetails(null)
    } catch (error) {
      console.error('Rename failed:', error)
    } finally {
      setIsRenaming(false)
    }
  }

  // Get module name for rename dialog
  const getModuleName = (type?: string): string => {
    switch (type) {
      case 'dataform': return 'Dataform'
      case 'board': return 'Board'
      case 'process': return 'Process'
      case 'list': return 'List'
      default: return 'Item'
    }
  }

  // Handle duplicate click - open duplicate dialog
  const handleDuplicateClick = () => {
    if (!activeTab?.entityId) return
    setDuplicateDialogOpen(true)
  }

  // Handle duplicate submit
  const handleDuplicate = async (data: { name: string; includeViews: boolean; includeReports: boolean }) => {
    if (!activeTab?.entityId) return

    setIsDuplicating(true)
    try {
      const response = await fetch(
        `http://localhost:3000/api/apps/${appId}/data-layers/${activeTab.entityId}/duplicate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) throw new Error('Failed to duplicate')

      const result = await response.json()
      const newDataLayer = result.data

      // Get icon for the new data layer type
      const getIconForType = (type: string) => {
        switch (type) {
          case 'dataform': return ClipboardList
          case 'board': return LayoutGrid
          case 'process': return Workflow
          case 'list': return List
          default: return ClipboardList
        }
      }

      // Create new tab and switch to it
      const newTab: Tab = {
        id: `${newDataLayer.type}-${newDataLayer.id}`,
        label: newDataLayer.name,
        icon: getIconForType(newDataLayer.type),
        closable: true,
        type: newDataLayer.type,
        entityId: newDataLayer.id,
      }
      setTabs(prev => [...prev, newTab])
      setActiveTabId(newTab.id)

      setDuplicateDialogOpen(false)
    } catch (error) {
      console.error('Duplicate failed:', error)
    } finally {
      setIsDuplicating(false)
    }
  }

  // Generate breadcrumb for drill-through pages
  const getBreadcrumb = () => {
    if (activeView === 'view-detail' && selectedView && activeTab) {
      return {
        parent: activeTab.label,
        middle: 'Views',
        current: selectedView.name
      }
    }
    if (activeView === 'report-detail' && selectedReport && activeTab) {
      return {
        parent: activeTab.label,
        middle: 'Reports',
        current: selectedReport.name
      }
    }
    if (activeView === 'component-detail' && selectedComponent && activeTab) {
      return {
        parent: 'Components',
        current: selectedComponent.name
      }
    }
    if (activeView === 'views' && activeTab) {
      return { parent: activeTab.label, current: 'Views' }
    }
    if (activeView === 'reports' && activeTab) {
      return { parent: activeTab.label, current: 'Reports' }
    }
    if (activeView === 'share' && activeTab) {
      return { parent: activeTab.label, current: 'Share' }
    }
    if (activeView === 'settings' && activeTab) {
      return { parent: activeTab.label, current: 'Settings' }
    }
    return undefined
  }

  // Render content based on active tab type and active view
  const renderContent = () => {
    if (!activeTab || activeTab.type === 'home') {
      return children
    }

    // Handle view-detail (third-level drill-through)
    if (activeView === 'view-detail' && selectedView) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-gray-500">View editor for &ldquo;{selectedView.name}&rdquo; coming soon...</p>
        </div>
      )
    }

    // Handle report-detail (third-level drill-through)
    if (activeView === 'report-detail' && selectedReport) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-gray-500">Report editor for &ldquo;{selectedReport.name}&rdquo; coming soon...</p>
        </div>
      )
    }

    // Handle component-detail (component drill-through)
    if (activeView === 'component-detail' && selectedComponent) {
      return <ComponentEditor component={selectedComponent} appId={appId} isNewlyCreated={isComponentNewlyCreated} />
    }

    // Handle drill-through views (views, reports) for data layers
    if (activeView === 'views' && (activeTab.type === 'dataform' || activeTab.type === 'board' || activeTab.type === 'process' || activeTab.type === 'list')) {
      // Loading state - centered
      if (isLoadingViews) {
        return (
          <div className="h-full w-full bg-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )
      }

      // Empty state - centered with no header
      if (views.length === 0) {
        return (
          <div className="h-full w-full bg-white flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <Inbox className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-sm text-gray-500 mb-4">Your views will appear here.</p>
              <button
                onClick={handleNewViewClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
              >
                <Plus className="h-4 w-4" />
                New view
              </button>
            </div>
          </div>
        )
      }

      // Has views - show header + grid
      return (
        <div className="h-full w-full bg-white p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Views</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search views..."
                  className="pl-8 pr-3 py-1.5 text-xs border border-gray-400 rounded-md bg-white placeholder:text-gray-500 hover:border-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 w-48"
                />
              </div>
              <button
                onClick={handleNewViewClick}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                New view
              </button>
            </div>
          </div>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {views.map(view => (
              <ViewCard key={view.id} view={view} onClick={handleViewClick} />
            ))}
          </div>
        </div>
      )
    }

    if (activeView === 'reports' && (activeTab.type === 'dataform' || activeTab.type === 'board' || activeTab.type === 'process' || activeTab.type === 'list')) {
      // Loading state - centered
      if (isLoadingReports) {
        return (
          <div className="h-full w-full bg-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )
      }

      // Empty state - centered with no header
      if (reports.length === 0) {
        return (
          <div className="h-full w-full bg-white flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <Inbox className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-sm text-gray-500 mb-4">Your reports will appear here.</p>
              <button
                onClick={handleNewReportClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
              >
                <Plus className="h-4 w-4" />
                New report
              </button>
            </div>
          </div>
        )
      }

      // Has reports - show header + grid
      return (
        <div className="h-full w-full bg-white p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  className="pl-8 pr-3 py-1.5 text-xs border border-gray-400 rounded-md bg-white placeholder:text-gray-500 hover:border-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 w-48"
                />
              </div>
              <button
                onClick={handleNewReportClick}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                New report
              </button>
            </div>
          </div>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {reports.map(report => (
              <ReportCard key={report.id} report={report} onClick={handleReportClick} />
            ))}
          </div>
        </div>
      )
    }

    // Handle share drill-through for dataform, board, process
    if (activeView === 'share' && activeTab.type === 'dataform') {
      return <DataFormShareEditor dataFormName={activeTab.label} />
    }

    if (activeView === 'share' && (activeTab.type === 'board' || activeTab.type === 'process')) {
      return (
        <div className="h-full w-full bg-white flex items-center justify-center">
          <p className="text-gray-500">Share settings coming soon...</p>
        </div>
      )
    }

    // Handle settings drill-through for dataform, board, process
    if (activeView === 'settings' && activeTab.type === 'dataform') {
      return <DataFormSettingsEditor dataFormName={activeTab.label} />
    }

    if (activeView === 'settings' && (activeTab.type === 'board' || activeTab.type === 'process')) {
      return (
        <div className="h-full w-full bg-white flex items-center justify-center">
          <p className="text-gray-500">Settings coming soon...</p>
        </div>
      )
    }

    // For board and process, check the active view
    if (activeTab.type === 'board' || activeTab.type === 'process') {
      if (activeView === 'workflow') {
        return (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            {/* Empty workflow view */}
          </div>
        )
      }
      if (activeView === 'permission') {
        return (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            {/* Empty permission view */}
          </div>
        )
      }
    }

    if (activeTab.type === 'dataform' && activeTab.entityId) {
      return (
        <FormBuilder
          entityId={activeTab.entityId}
          entityName={activeTab.label}
          entityType="dataform"
        />
      )
    }

    if (activeTab.type === 'board' && activeTab.entityId) {
      return (
        <FormBuilder
          entityId={activeTab.entityId}
          entityName={activeTab.label}
          entityType="board"
        />
      )
    }

    if (activeTab.type === 'process' && activeTab.entityId) {
      return (
        <FormBuilder
          entityId={activeTab.entityId}
          entityName={activeTab.label}
          entityType="process"
        />
      )
    }

    if (activeTab.type === 'list' && activeTab.entityId) {
      return (
        <ListEditor
          entityId={activeTab.entityId}
          entityName={activeTab.label}
        />
      )
    }

    if (activeTab.type === 'navigation') {
      return <NavigationEditor navigationId={activeTab.entityId} navigationName={activeTab.label} />
    }

    if (activeTab.type === 'page' && activeTab.entityId) {
      return <PageEditor pageId={activeTab.entityId} pageName={activeTab.label} />
    }

    if (activeTab.type === 'variables') {
      return <VariablesEditor />
    }

    if (activeTab.type === 'resources') {
      return <ResourcesEditor />
    }

    if (activeTab.type === 'components') {
      return (
        <ComponentsEditor
          appId={appId}
          components={components}
          isLoading={isLoadingComponents}
          onComponentClick={handleComponentClick}
          onAddComponent={handleAddComponent}
          onDuplicateComponent={handleDuplicateComponent}
        />
      )
    }

    if (activeTab.type === 'permissions') {
      return <RolesEditor appId={appId} />
    }

    // Default fallback
    return children
  }

  return (
    <BuilderThemeRoot className="h-screen flex flex-col bg-gradient-to-br from-slate-200 via-blue-100 to-purple-100">
      {/* Top Bar */}
      <header className="flex-shrink-0">
        <div className="h-11">
          <BuilderTopBar
            appName={appName}
            appIcon={appIcon}
            appIconBg={appIconBg}
            onNameChange={onNameChange}
            recentApps={[
              { id: '1', name: 'Test App', icon: 'Puzzle', iconBg: '#F97316' },
              { id: '2', name: 'Procurement app', icon: 'ShoppingCart', iconBg: '#EC4899' },
              { id: '3', name: 'Order Management', icon: 'Package', iconBg: '#14B8A6' },
              { id: '4', name: 'Test application', icon: 'Component', iconBg: '#8B5CF6' },
              { id: '5', name: 'EM Test', icon: 'User', iconBg: '#10B981' },
            ]}
            onAppSwitch={(appId) => console.log('Switch to app:', appId)}
            onGoToExplorer={() => console.log('Go to explorer')}
            isRunMode={isRunMode}
            onRunModeToggle={() => setIsRunMode(!isRunMode)}
          />
        </div>
      </header>

      {/* Main area with sidebar and content */}
      <div className="flex-1 flex overflow-hidden">
        {isRunMode ? (
          // Run Mode Layout
          <>
            {/* Copilot Panel - 320px with spacing */}
            <CopilotPanel
              appName={appName}
              appDescription={appDescription}
              appIcon={appIcon}
              appIconBg={appIconBg}
            />

            {/* Runtime Preview - remaining space */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden rounded-tl-lg bg-white">
                <AppRuntimePreview appName={appName} appIcon={appIcon} appIconBg={appIconBg} />
              </div>
            </div>
          </>
        ) : (
          // Build Mode Layout
          <>
        {/* Sidebar */}
        <div>
        <BuilderSidebar
          onItemClick={onSidebarItemClick}
          onCreateItem={handleCreateItem}
          appId={appId}
          onDataFormClick={(dataForm) => {
            // Create new tab for the data form if not already open
            const existingTab = tabs.find((tab) => tab.entityId === dataForm.id)
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: `dataform-${dataForm.id}`,
                label: dataForm.name,
                icon: ClipboardList,
                closable: true,
                type: 'dataform',
                entityId: dataForm.id,
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onBoardClick={(board) => {
            // Create new tab for the board if not already open
            const existingTab = tabs.find((tab) => tab.entityId === board.id)
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: `board-${board.id}`,
                label: board.name,
                icon: LayoutGrid,
                closable: true,
                type: 'board',
                entityId: board.id,
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onProcessClick={(process) => {
            // Create new tab for the process if not already open
            const existingTab = tabs.find((tab) => tab.entityId === process.id)
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: `process-${process.id}`,
                label: process.name,
                icon: Workflow,
                closable: true,
                type: 'process',
                entityId: process.id,
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onListClick={(list) => {
            // Create new tab for the list if not already open
            const existingTab = tabs.find((tab) => tab.entityId === list.id)
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: `list-${list.id}`,
                label: list.name,
                icon: List,
                closable: true,
                type: 'list',
                entityId: list.id,
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onNavigationClick={(navigation) => {
            // Create new tab for the navigation if not already open
            const existingTab = tabs.find((tab) => tab.entityId === navigation.id)
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: `navigation-${navigation.id}`,
                label: navigation.name,
                icon: Navigation,
                closable: true,
                type: 'navigation',
                entityId: navigation.id,
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onPageClick={(page) => {
            // Create new tab for the page if not already open
            const existingTab = tabs.find((tab) => tab.entityId === page.id)
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: `page-${page.id}`,
                label: page.name,
                icon: FileText,
                closable: true,
                type: 'page',
                entityId: page.id,
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onVariablesClick={() => {
            // Create new tab for variables if not already open
            const existingTab = tabs.find((tab) => tab.type === 'variables')
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: 'variables',
                label: 'Variables',
                icon: Variable,
                closable: true,
                type: 'variables',
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onResourcesClick={() => {
            // Create new tab for resources if not already open
            const existingTab = tabs.find((tab) => tab.type === 'resources')
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: 'resources',
                label: 'Resources',
                icon: FolderOpen,
                closable: true,
                type: 'resources',
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onComponentsClick={() => {
            // Create new tab for components if not already open
            const existingTab = tabs.find((tab) => tab.type === 'components')
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: 'components',
                label: 'Components',
                icon: Component,
                closable: true,
                type: 'components',
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onConnectionsClick={() => {
            // Create new tab for connections if not already open
            const existingTab = tabs.find((tab) => tab.type === 'connections')
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: 'connections',
                label: 'Connections',
                icon: Cable,
                closable: true,
                type: 'connections',
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onPermissionsClick={() => {
            // Create new tab for permissions if not already open
            const existingTab = tabs.find((tab) => tab.type === 'permissions')
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: 'permissions',
                label: 'Roles',
                icon: UserKey,
                closable: true,
                type: 'permissions',
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
        />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Rounded content wrapper */}
          <div className="flex-1 flex flex-col overflow-hidden rounded-tl-lg bg-white">
            {/* Tab Bar */}
            <BuilderTabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onTabClick={handleTabClick}
              onTabClose={handleTabClose}
            />

            {/* Utility Bar */}
            <BuilderUtilityBar
              title={activeTab?.label || ''}
              tabType={activeTab?.type}
              activeView={activeView}
              onViewChange={handleViewChange}
              onViewsClick={handleViewsClick}
              onReportsClick={handleReportsClick}
              onShareClick={() => setActiveView('share')}
              onSettingsClick={() => setActiveView('settings')}
              onBreadcrumbBack={handleBreadcrumbBack}
              onBreadcrumbMiddleClick={handleBreadcrumbMiddleClick}
              breadcrumb={getBreadcrumb()}
              onRenameClick={handleRenameClick}
              onDuplicateClick={handleDuplicateClick}
            />

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto bg-gray-50">
              {renderContent()}
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Data Form Create Dialog */}
      {createType === 'dataform' && (
        <DataFormCreateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleDataFormCreate}
          isLoading={isCreating}
        />
      )}

      {/* Board Create Dialog */}
      {createType === 'board' && (
        <BoardCreateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleBoardCreate}
          isLoading={isCreating}
        />
      )}

      {/* Process Create Dialog */}
      {createType === 'process' && (
        <ProcessCreateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleProcessCreate}
          isLoading={isCreating}
        />
      )}

      {/* Navigation Create Dialog */}
      {createType === 'navigation' && (
        <NavigationCreateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleNavigationCreate}
          isLoading={isCreating}
        />
      )}

      {/* Page Create Dialog */}
      {createType === 'page' && (
        <PageCreateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handlePageCreate}
          isLoading={isCreating}
        />
      )}

      {/* List Create Dialog */}
      {createType === 'list' && (
        <ListCreateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleListCreate}
          isLoading={isCreating}
        />
      )}

      {/* View Create Dialog */}
      <ViewCreateDialog
        open={viewCreateDialogOpen}
        onOpenChange={setViewCreateDialogOpen}
        onSubmit={handleViewCreate}
        isLoading={isCreatingView}
      />

      {/* Report Create Dialog */}
      <ReportCreateDialog
        open={reportCreateDialogOpen}
        onOpenChange={setReportCreateDialogOpen}
        onSubmit={handleReportCreate}
        isLoading={isCreatingReport}
      />

      {/* Rename Dialog */}
      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={(open) => {
          setRenameDialogOpen(open)
          if (!open) setEntityDetails(null)
        }}
        onSubmit={handleRename}
        isLoading={isRenaming}
        isFetchingDetails={isFetchingDetails}
        moduleName={getModuleName(activeTab?.type)}
        currentName={entityDetails?.name || activeTab?.label || ''}
        currentDescription={entityDetails?.description || ''}
      />

      {/* Duplicate Dialog */}
      <DuplicateDialog
        open={duplicateDialogOpen}
        onOpenChange={setDuplicateDialogOpen}
        onSubmit={handleDuplicate}
        isLoading={isDuplicating}
        moduleName={getModuleName(activeTab?.type)}
        currentName={activeTab?.label || ''}
      />
    </BuilderThemeRoot>
  )
}
