'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  PlusCircle,
  Plus,
  Database,
  Layout,
  Network,
  UserKey,
  Settings,
  ClipboardList,
  LayoutGrid,
  Workflow,
  FileText,
  Navigation,
  Component,
  Plug,
  List,
  ExternalLink,
  Variable,
  FolderOpen,
  Search,
  Inbox,
  Cable,
  Palette,
  Bell,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { API_BASE_URL } from '@/lib/config'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface SidebarItem {
  icon: React.ElementType
  label: string
  id: string
  emphasized?: boolean
  hasPopover?: boolean
}

interface CreateMenuItem {
  icon: React.ElementType
  label: string
  id: string
}

// Icon colors for each module type
const moduleIconColors: Record<string, string> = {
  dataform: '#22C55E',  // green
  board: '#8B5CF6',     // purple
  process: '#F97316',   // orange
  'external-data': '#EAB308', // yellow
  list: '#3B82F6',      // blue
  page: '#0EA5E9',      // sky blue
  navigation: '#EC4899', // pink
  component: '#B94E15', // rust
  components: '#B94E15', // rust
  integration: '#8B5CF6', // purple
  connections: '#22C55E', // green
  role: '#14B8A6',      // teal
  variables: '#F97316', // orange
  resources: '#EAB308', // yellow
  'app-settings': '#06B6D4',  // cyan
  'theme-settings': '#A855F7', // purple
  'notification-settings': '#EF4444', // red
}

// Create menu items with separators
const createMenuItems: (CreateMenuItem | 'separator')[] = [
  { icon: ClipboardList, label: 'Data Form', id: 'dataform' },
  { icon: LayoutGrid, label: 'Board', id: 'board' },
  { icon: Workflow, label: 'Process', id: 'process' },
  { icon: ExternalLink, label: 'External Data', id: 'external-data' },
  { icon: List, label: 'List', id: 'list' },
  'separator',
  { icon: FileText, label: 'Page', id: 'page' },
  { icon: Navigation, label: 'Navigation', id: 'navigation' },
  'separator',
  { icon: Plug, label: 'Integration', id: 'integration' },
  'separator',
  { icon: UserKey, label: 'Role', id: 'role' },
]

// Data layer items with extended popover flag
interface DataLayerItem extends CreateMenuItem {
  hasExtendedPopover?: boolean
}

const dataLayerItems: (DataLayerItem | 'separator')[] = [
  { icon: ClipboardList, label: 'Data Form', id: 'dataform', hasExtendedPopover: true },
  { icon: LayoutGrid, label: 'Board', id: 'board', hasExtendedPopover: true },
  { icon: Workflow, label: 'Process', id: 'process', hasExtendedPopover: true },
  { icon: ExternalLink, label: 'External Data', id: 'external-data', hasExtendedPopover: true },
  { icon: List, label: 'List', id: 'list', hasExtendedPopover: true },
  'separator',
  { icon: Variable, label: 'Variables', id: 'variables' },
  { icon: FolderOpen, label: 'Resources', id: 'resources' },
]

// Interface layer items
const interfaceLayerItems: (DataLayerItem | 'separator')[] = [
  { icon: FileText, label: 'Page', id: 'page', hasExtendedPopover: true },
  { icon: Navigation, label: 'Navigation', id: 'navigation', hasExtendedPopover: true },
  'separator',
  { icon: Component, label: 'Components', id: 'components' },
]

// Logic layer items
const logicLayerItems: (DataLayerItem | 'separator')[] = [
  { icon: Plug, label: 'Integration', id: 'integration', hasExtendedPopover: true },
  'separator',
  { icon: Cable, label: 'Connections', id: 'connections' },
]

// Settings layer items
const settingsLayerItems: (DataLayerItem | 'separator')[] = [
  { icon: Settings, label: 'App Settings', id: 'app-settings', hasExtendedPopover: true },
  { icon: Palette, label: 'Theme Settings', id: 'theme-settings', hasExtendedPopover: true },
  { icon: Bell, label: 'Notification Settings', id: 'notification-settings', hasExtendedPopover: true },
]

// App Construction Layers - ordered by layer hierarchy
const sidebarItems: SidebarItem[] = [
  { icon: PlusCircle, label: 'Create', id: 'create', emphasized: true },
  { icon: Database, label: 'Data', id: 'data', hasPopover: true },
  { icon: Layout, label: 'Interface', id: 'interface', hasPopover: true },
  { icon: Network, label: 'Logic', id: 'logic', hasPopover: true },
  { icon: UserKey, label: 'Permissions', id: 'permissions' },
]

// Settings item - displayed at bottom
const settingsItem: SidebarItem = { icon: Settings, label: 'Settings', id: 'settings', hasPopover: true }

interface DataLayer {
  id: string
  name: string
  slug: string
  type: string
}

interface InterfaceItem {
  id: string
  name: string
  slug: string
}

interface BuilderSidebarProps {
  activeItem?: string
  onItemClick?: (id: string) => void
  onCreateItem?: (type: string) => void
  appId?: string
  onDataFormClick?: (dataForm: DataLayer) => void
  onBoardClick?: (board: DataLayer) => void
  onProcessClick?: (process: DataLayer) => void
  onListClick?: (list: DataLayer) => void
  onNavigationClick?: (navigation: InterfaceItem) => void
  onPageClick?: (page: InterfaceItem) => void
  onVariablesClick?: () => void
  onResourcesClick?: () => void
  onComponentsClick?: () => void
  onConnectionsClick?: () => void
  onPermissionsClick?: () => void
}

export function BuilderSidebar({ activeItem, onItemClick, onCreateItem, appId, onDataFormClick, onBoardClick, onProcessClick, onListClick, onNavigationClick, onPageClick, onVariablesClick, onResourcesClick, onComponentsClick, onConnectionsClick, onPermissionsClick }: BuilderSidebarProps) {
  const [active, setActive] = useState(activeItem)
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const [openPopover, setOpenPopover] = useState<string | null>(null)
  const [selectedDataItem, setSelectedDataItem] = useState<string | null>(null)
  const [dataForms, setDataForms] = useState<DataLayer[]>([])
  const [boards, setBoards] = useState<DataLayer[]>([])
  const [processes, setProcesses] = useState<DataLayer[]>([])
  const [lists, setLists] = useState<DataLayer[]>([])
  const [navigations, setNavigations] = useState<InterfaceItem[]>([])
  const [pages, setPages] = useState<InterfaceItem[]>([])
  const [isLoadingDataForms, setIsLoadingDataForms] = useState(false)
  const [isLoadingBoards, setIsLoadingBoards] = useState(false)
  const [isLoadingProcesses, setIsLoadingProcesses] = useState(false)
  const [isLoadingLists, setIsLoadingLists] = useState(false)
  const [isLoadingNavigations, setIsLoadingNavigations] = useState(false)
  const [isLoadingPages, setIsLoadingPages] = useState(false)

  // Fetch data forms when dataform is selected
  useEffect(() => {
    if (selectedDataItem === 'dataform' && appId) {
      setIsLoadingDataForms(true)
      fetch(`${API_BASE_URL}/api/apps/${appId}/data-layers`)
        .then((res) => res.json())
        .then((result) => {
          const forms = result.data?.filter((d: DataLayer) => d.type === 'dataform') || []
          setDataForms(forms)
        })
        .catch((err) => {
          console.error('Failed to fetch data forms:', err)
          setDataForms([])
        })
        .finally(() => {
          setIsLoadingDataForms(false)
        })
    }
  }, [selectedDataItem, appId])

  // Fetch boards when board is selected
  useEffect(() => {
    if (selectedDataItem === 'board' && appId) {
      setIsLoadingBoards(true)
      fetch(`${API_BASE_URL}/api/apps/${appId}/data-layers`)
        .then((res) => res.json())
        .then((result) => {
          const boardsList = result.data?.filter((d: DataLayer) => d.type === 'board') || []
          setBoards(boardsList)
        })
        .catch((err) => {
          console.error('Failed to fetch boards:', err)
          setBoards([])
        })
        .finally(() => {
          setIsLoadingBoards(false)
        })
    }
  }, [selectedDataItem, appId])

  // Fetch processes when process is selected
  useEffect(() => {
    if (selectedDataItem === 'process' && appId) {
      setIsLoadingProcesses(true)
      fetch(`${API_BASE_URL}/api/apps/${appId}/data-layers`)
        .then((res) => res.json())
        .then((result) => {
          const processesList = result.data?.filter((d: DataLayer) => d.type === 'process') || []
          setProcesses(processesList)
        })
        .catch((err) => {
          console.error('Failed to fetch processes:', err)
          setProcesses([])
        })
        .finally(() => {
          setIsLoadingProcesses(false)
        })
    }
  }, [selectedDataItem, appId])

  // Fetch lists when list is selected
  useEffect(() => {
    if (selectedDataItem === 'list' && appId) {
      setIsLoadingLists(true)
      fetch(`${API_BASE_URL}/api/apps/${appId}/data-layers`)
        .then((res) => res.json())
        .then((result) => {
          const listItems = result.data?.filter((d: DataLayer) => d.type === 'list') || []
          setLists(listItems)
        })
        .catch((err) => {
          console.error('Failed to fetch lists:', err)
          setLists([])
        })
        .finally(() => {
          setIsLoadingLists(false)
        })
    }
  }, [selectedDataItem, appId])

  // Fetch navigations when navigation is selected
  useEffect(() => {
    if (selectedDataItem === 'navigation' && appId) {
      setIsLoadingNavigations(true)
      fetch(`${API_BASE_URL}/api/apps/${appId}/navigations`)
        .then((res) => res.json())
        .then((result) => {
          setNavigations(result.data || [])
        })
        .catch((err) => {
          console.error('Failed to fetch navigations:', err)
          setNavigations([])
        })
        .finally(() => {
          setIsLoadingNavigations(false)
        })
    }
  }, [selectedDataItem, appId])

  // Fetch pages when page is selected
  useEffect(() => {
    if (selectedDataItem === 'page' && appId) {
      setIsLoadingPages(true)
      fetch(`${API_BASE_URL}/api/apps/${appId}/pages`)
        .then((res) => res.json())
        .then((result) => {
          setPages(result.data || [])
        })
        .catch((err) => {
          console.error('Failed to fetch pages:', err)
          setPages([])
        })
        .finally(() => {
          setIsLoadingPages(false)
        })
    }
  }, [selectedDataItem, appId])

  const handleClick = (id: string) => {
    if (id === 'create') {
      return // Create is handled by popover
    }
    if (id === 'permissions') {
      onPermissionsClick?.()
      return
    }
    setActive(id)
    onItemClick?.(id)
  }

  const handleCreateItemClick = (type: string) => {
    setCreateMenuOpen(false)
    if (type === 'external-data') {
      return // Do nothing for now - placeholder for future implementation
    }
    onCreateItem?.(type)
  }

  const handlePopoverChange = (id: string, open: boolean) => {
    setOpenPopover(open ? id : null)
    if (!open) {
      setSelectedDataItem(null)
    }
  }

  const handleDataItemClick = (itemId: string, hasExtendedPopover?: boolean) => {
    if (hasExtendedPopover) {
      setSelectedDataItem(selectedDataItem === itemId ? null : itemId)
    } else if (itemId === 'variables') {
      // Variables doesn't have extended popover - directly open the tab
      onVariablesClick?.()
      setOpenPopover(null)
      setSelectedDataItem(null)
    } else if (itemId === 'resources') {
      // Resources doesn't have extended popover - directly open the tab
      onResourcesClick?.()
      setOpenPopover(null)
      setSelectedDataItem(null)
    } else if (itemId === 'components') {
      // Components doesn't have extended popover - directly open the tab
      onComponentsClick?.()
      setOpenPopover(null)
      setSelectedDataItem(null)
    } else if (itemId === 'connections') {
      // Connections doesn't have extended popover - directly open the tab
      onConnectionsClick?.()
      setOpenPopover(null)
      setSelectedDataItem(null)
    }
  }

  const getSelectedDataItemLabel = () => {
    // Check in data layer items
    let item = dataLayerItems.find(i => i !== 'separator' && i.id === selectedDataItem)
    if (item && item !== 'separator') return item.label

    // Check in interface layer items
    item = interfaceLayerItems.find(i => i !== 'separator' && i.id === selectedDataItem)
    if (item && item !== 'separator') return item.label

    // Check in logic layer items
    item = logicLayerItems.find(i => i !== 'separator' && i.id === selectedDataItem)
    if (item && item !== 'separator') return item.label

    // Check in settings layer items
    item = settingsLayerItems.find(i => i !== 'separator' && i.id === selectedDataItem)
    if (item && item !== 'separator') return item.label

    return ''
  }

  return (
    <>
      {/* Overlay for Create menu */}
      {createMenuOpen && (
        <div
          className="fixed bg-black/60 z-40 rounded-tl-lg"
          style={{ top: '44px', left: '44px', right: 0, bottom: 0 }}
          onClick={() => setCreateMenuOpen(false)}
        />
      )}
      {/* Overlay for Data, Interface, Logic, Settings popovers */}
      {openPopover && (
        <div
          className="fixed bg-black/60 z-40 rounded-tl-lg"
          style={{ top: '44px', left: '44px', right: 0, bottom: 0 }}
          onClick={() => setOpenPopover(null)}
        />
      )}
      <aside className="h-full w-11 flex-shrink-0 flex flex-col items-center py-2">
      {/* App Layer Navigation */}
      <nav className="flex flex-col items-center gap-4">
        {sidebarItems.map((item, itemIndex) => {
          const Icon = item.icon
          const isActive = active === item.id
          const isEmphasized = item.emphasized

          // Calculate alignOffset to position all popovers at 44px from top
          // Each button is 32px tall with 16px gap = 48px per item
          // Create (index 0) uses -8, others need additional offset based on position
          const baseAlignOffset = -8
          const itemOffset = itemIndex * 48 // 32px button + 16px gap
          const calculatedAlignOffset = baseAlignOffset - itemOffset

          // Create button with popover
          if (item.id === 'create') {
            return (
              <Popover key={item.id} open={createMenuOpen} onOpenChange={setCreateMenuOpen}>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <PopoverTrigger asChild>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            'flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150',
                            createMenuOpen
                              ? 'bg-white'
                              : 'text-gray-900 hover:bg-white/50'
                          )}
                        >
                          <Icon
                            className="h-5 w-5 [&>circle]:fill-gray-900 [&>circle]:stroke-gray-900 [&>path]:stroke-white [&>line]:stroke-white"
                            strokeWidth={2.5}
                          />
                        </button>
                      </TooltipTrigger>
                    </PopoverTrigger>
                    {!createMenuOpen && (
                      <TooltipContent side="right" sideOffset={8} className="bg-gray-900 text-white text-xs px-2 py-1">
                        {item.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                <PopoverContent side="right" align="start" sideOffset={6} alignOffset={-8} className="w-48 p-2 rounded-lg">
                  <div className="flex flex-col gap-1">
                    {createMenuItems.map((menuItem, index) => {
                      if (menuItem === 'separator') {
                        return <div key={`sep-${index}`} className="h-px bg-gray-200 my-1" />
                      }
                      const MenuIcon = menuItem.icon
                      return (
                        <button
                          key={menuItem.id}
                          onClick={() => handleCreateItemClick(menuItem.id)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <MenuIcon className="h-4 w-4" style={{ color: moduleIconColors[menuItem.id] || '#6B7280' }} />
                          {menuItem.label}
                        </button>
                      )
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            )
          }

          // Items with popover (Data, Interface, Logic)
          if (item.hasPopover) {
            const isPopoverOpen = openPopover === item.id
            return (
              <Popover key={item.id} open={isPopoverOpen} onOpenChange={(open) => handlePopoverChange(item.id, open)}>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <PopoverTrigger asChild>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            'flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150',
                            isPopoverOpen
                              ? 'bg-white'
                              : 'text-gray-900 hover:bg-white/50'
                          )}
                        >
                          <Icon
                            className="h-4 w-4"
                            strokeWidth={2}
                          />
                        </button>
                      </TooltipTrigger>
                    </PopoverTrigger>
                    {!isPopoverOpen && (
                      <TooltipContent side="right" sideOffset={8} className="bg-gray-900 text-white text-xs px-2 py-1">
                        {item.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                <PopoverContent side="right" align="start" sideOffset={6} alignOffset={calculatedAlignOffset} className={cn("p-0 h-[calc(100vh-44px)] rounded-lg", (item.id === 'data' || item.id === 'interface' || item.id === 'logic') && selectedDataItem ? "w-[32rem]" : "w-64")}>
                  <div className="flex h-full">
                    {/* Primary panel */}
                    <div className="flex flex-col h-full w-64 flex-shrink-0">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <h2 className="text-sm font-medium text-gray-900">{item.label}</h2>
                      </div>
                      <div className="flex-1 overflow-auto p-2">
                        {item.id === 'data' && (
                          <div className="flex flex-col gap-1">
                            {dataLayerItems.map((menuItem, index) => {
                              if (menuItem === 'separator') {
                                return <div key={`sep-${index}`} className="h-px bg-gray-200 my-1" />
                              }
                              const MenuIcon = menuItem.icon
                              const isSelected = selectedDataItem === menuItem.id
                              return (
                                <button
                                  key={menuItem.id}
                                  onClick={() => handleDataItemClick(menuItem.id, menuItem.hasExtendedPopover)}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors w-full",
                                    isSelected
                                      ? "bg-gray-100 text-gray-900"
                                      : "text-gray-700 hover:bg-gray-100"
                                  )}
                                >
                                  <MenuIcon className="h-4 w-4 text-gray-500" />
                                  <span className="flex-1 text-left">{menuItem.label}</span>
                                  {menuItem.hasExtendedPopover && (
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )}
                        {item.id === 'interface' && (
                          <div className="flex flex-col gap-1">
                            {interfaceLayerItems.map((menuItem, index) => {
                              if (menuItem === 'separator') {
                                return <div key={`sep-${index}`} className="h-px bg-gray-200 my-1" />
                              }
                              const MenuIcon = menuItem.icon
                              const isSelected = selectedDataItem === menuItem.id
                              return (
                                <button
                                  key={menuItem.id}
                                  onClick={() => handleDataItemClick(menuItem.id, menuItem.hasExtendedPopover)}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors w-full",
                                    isSelected
                                      ? "bg-gray-100 text-gray-900"
                                      : "text-gray-700 hover:bg-gray-100"
                                  )}
                                >
                                  <MenuIcon className="h-4 w-4 text-gray-500" />
                                  <span className="flex-1 text-left">{menuItem.label}</span>
                                  {menuItem.hasExtendedPopover && (
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )}
                        {item.id === 'logic' && (
                          <div className="flex flex-col gap-1">
                            {logicLayerItems.map((menuItem, index) => {
                              if (menuItem === 'separator') {
                                return <div key={`sep-${index}`} className="h-px bg-gray-200 my-1" />
                              }
                              const MenuIcon = menuItem.icon
                              const isSelected = selectedDataItem === menuItem.id
                              return (
                                <button
                                  key={menuItem.id}
                                  onClick={() => handleDataItemClick(menuItem.id, menuItem.hasExtendedPopover)}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors w-full",
                                    isSelected
                                      ? "bg-gray-100 text-gray-900"
                                      : "text-gray-700 hover:bg-gray-100"
                                  )}
                                >
                                  <MenuIcon className="h-4 w-4 text-gray-500" />
                                  <span className="flex-1 text-left">{menuItem.label}</span>
                                  {menuItem.hasExtendedPopover && (
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Extended panel */}
                    {(item.id === 'data' || item.id === 'interface' || item.id === 'logic') && selectedDataItem && (
                      <div className="flex flex-col h-full w-64 border-l border-gray-200 flex-shrink-0">
                        <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                          <h2 className="text-sm font-medium text-gray-900">{getSelectedDataItemLabel()}</h2>
                          <button
                            onClick={() => onCreateItem?.(selectedDataItem)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            New
                          </button>
                        </div>
                        {/* Search */}
                        <div className="px-3 py-2 border-b border-gray-200">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                              type="text"
                              placeholder="Search..."
                              className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-gray-400 rounded-md placeholder:text-gray-500 hover:border-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                            />
                          </div>
                        </div>
                        {/* Items list or empty state */}
                        <div className="flex-1 overflow-auto">
                          {/* Data Forms */}
                          {selectedDataItem === 'dataform' && dataForms.length > 0 ? (
                            <div className="p-2">
                              {dataForms.map((form) => (
                                <button
                                  key={form.id}
                                  onClick={() => {
                                    onDataFormClick?.(form)
                                    setOpenPopover(null)
                                    setSelectedDataItem(null)
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                                >
                                  <ClipboardList className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <span className="truncate">{form.name}</span>
                                </button>
                              ))}
                            </div>
                          ) : selectedDataItem === 'dataform' && isLoadingDataForms ? (
                            <div className="flex-1 p-4 flex items-center justify-center">
                              <p className="text-sm text-gray-500">Loading...</p>
                            </div>
                          ) : selectedDataItem === 'board' && boards.length > 0 ? (
                            <div className="p-2">
                              {boards.map((board) => (
                                <button
                                  key={board.id}
                                  onClick={() => {
                                    onBoardClick?.(board)
                                    setOpenPopover(null)
                                    setSelectedDataItem(null)
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                                >
                                  <LayoutGrid className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <span className="truncate">{board.name}</span>
                                </button>
                              ))}
                            </div>
                          ) : selectedDataItem === 'board' && isLoadingBoards ? (
                            <div className="flex-1 p-4 flex items-center justify-center">
                              <p className="text-sm text-gray-500">Loading...</p>
                            </div>
                          ) : selectedDataItem === 'process' && processes.length > 0 ? (
                            <div className="p-2">
                              {processes.map((process) => (
                                <button
                                  key={process.id}
                                  onClick={() => {
                                    onProcessClick?.(process)
                                    setOpenPopover(null)
                                    setSelectedDataItem(null)
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                                >
                                  <Workflow className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <span className="truncate">{process.name}</span>
                                </button>
                              ))}
                            </div>
                          ) : selectedDataItem === 'process' && isLoadingProcesses ? (
                            <div className="flex-1 p-4 flex items-center justify-center">
                              <p className="text-sm text-gray-500">Loading...</p>
                            </div>
                          ) : selectedDataItem === 'list' && lists.length > 0 ? (
                            <div className="p-2">
                              {lists.map((list) => (
                                <button
                                  key={list.id}
                                  onClick={() => {
                                    onListClick?.(list)
                                    setOpenPopover(null)
                                    setSelectedDataItem(null)
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                                >
                                  <List className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <span className="truncate">{list.name}</span>
                                </button>
                              ))}
                            </div>
                          ) : selectedDataItem === 'list' && isLoadingLists ? (
                            <div className="flex-1 p-4 flex items-center justify-center">
                              <p className="text-sm text-gray-500">Loading...</p>
                            </div>
                          ) : selectedDataItem === 'navigation' && navigations.length > 0 ? (
                            <div className="p-2">
                              {navigations.map((navigation) => (
                                <button
                                  key={navigation.id}
                                  onClick={() => {
                                    onNavigationClick?.(navigation)
                                    setOpenPopover(null)
                                    setSelectedDataItem(null)
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                                >
                                  <Navigation className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <span className="truncate">{navigation.name}</span>
                                </button>
                              ))}
                            </div>
                          ) : selectedDataItem === 'navigation' && isLoadingNavigations ? (
                            <div className="flex-1 p-4 flex items-center justify-center">
                              <p className="text-sm text-gray-500">Loading...</p>
                            </div>
                          ) : selectedDataItem === 'page' && pages.length > 0 ? (
                            <div className="p-2">
                              {pages.map((page) => (
                                <button
                                  key={page.id}
                                  onClick={() => {
                                    onPageClick?.(page)
                                    setOpenPopover(null)
                                    setSelectedDataItem(null)
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                                >
                                  <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <span className="truncate">{page.name}</span>
                                </button>
                              ))}
                            </div>
                          ) : selectedDataItem === 'page' && isLoadingPages ? (
                            <div className="flex-1 p-4 flex items-center justify-center">
                              <p className="text-sm text-gray-500">Loading...</p>
                            </div>
                          ) : (
                            <div className="flex-1 p-4 flex flex-col items-center justify-center text-center h-full">
                              <Inbox className="h-12 w-12 text-gray-300 mb-3" />
                              <p className="text-sm text-gray-500">No items yet</p>
                              <p className="text-xs text-gray-400 mt-1">Create your first {getSelectedDataItemLabel().toLowerCase()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )
          }

          return (
            <TooltipProvider key={item.id} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleClick(item.id)}
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150',
                      isActive
                        ? 'bg-white'
                        : 'text-gray-900 hover:bg-white/50'
                    )}
                  >
                    <Icon
                      className="h-4 w-4"
                      strokeWidth={2}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="bg-gray-900 text-white text-xs px-2 py-1">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </nav>

      {/* Settings & Kissflow Logo - Bottom */}
      <nav className="flex flex-col items-center mt-auto gap-4">
        {/* Settings Button */}
        <Popover open={openPopover === 'settings'} onOpenChange={(open) => handlePopoverChange('settings', open)}>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150',
                      openPopover === 'settings'
                        ? 'bg-white'
                        : 'text-gray-900 hover:bg-white/50'
                    )}
                  >
                    <Settings className="h-4 w-4" strokeWidth={2} />
                  </button>
                </TooltipTrigger>
              </PopoverTrigger>
              {openPopover !== 'settings' && (
                <TooltipContent side="right" sideOffset={8} className="bg-gray-900 text-white text-xs px-2 py-1">
                  Settings
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <PopoverContent side="right" align="end" sideOffset={6} alignOffset={-8} className="w-52 p-2 rounded-lg">
            <div className="flex flex-col gap-1">
              {settingsLayerItems.map((menuItem, index) => {
                if (menuItem === 'separator') {
                  return <div key={`sep-${index}`} className="h-px bg-gray-200 my-1" />
                }
                const MenuIcon = menuItem.icon
                return (
                  <button
                    key={menuItem.id}
                    onClick={() => {
                      setOpenPopover(null)
                      // Handle settings item click here if needed
                    }}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <MenuIcon className="h-4 w-4 text-gray-500" />
                    {menuItem.label}
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Kissflow Logo */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  const platformUrl = `${window.location.origin}/explorer`
                  window.open(platformUrl, 'kissflow-platform')
                }}
                className="flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150 text-gray-500 hover:bg-gray-100"
              >
                <Image
                  src="/kissflow-logo.svg"
                  alt="Kissflow"
                  width={16}
                  height={16}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8} className="bg-gray-900 text-white text-xs px-2 py-1">
              Go to Kissflow
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
    </>
  )
}
