'use client'

import { useState, useCallback, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { iconColorFromBg } from '@/lib/icon-color'

interface AppRuntimePreviewProps {
  appName: string
  appIcon: string
  appIconBg: string
  onAddNavItem?: (callback: (pageId: string, pageLabel: string) => void) => void
  onSwitchToPage?: (callback: (pageId: string) => void) => void
}

type UserRole = 'employee' | 'manager' | 'finance' | 'admin'

const ROLE_LABELS: Record<UserRole, string> = {
  employee: 'Employee',
  manager: 'Manager',
  finance: 'Finance Admin',
  admin: 'Admin',
}

function AppIcon({ name, className, style, strokeWidth }: { name: string; className?: string; style?: React.CSSProperties; strokeWidth?: number }) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>>)[name]
  if (!IconComponent) {
    return <LucideIcons.Folder className={className} style={style} strokeWidth={strokeWidth} />
  }
  return <IconComponent className={className} style={style} strokeWidth={strokeWidth} />
}

interface NavItem {
  id: string
  label: string
  hasDropdown?: boolean
}

// Play mode starts as an empty runtime shell. Pages are added by the
// CopilotPanel via `addNavItem` (exposed through `onAddNavItem`).
const INITIAL_NAV_ITEMS: NavItem[] = []

export function AppRuntimePreview({ appName, appIcon, appIconBg, onAddNavItem, onSwitchToPage }: AppRuntimePreviewProps) {
  const [navItems, setNavItems] = useState<NavItem[]>(INITIAL_NAV_ITEMS)
  const [activeNav, setActiveNav] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee')

  // Method to add new page to navigation
  const addNavItem = useCallback((pageId: string, pageLabel: string) => {
    setNavItems(prev => [...prev, { id: pageId, label: pageLabel }])
    setActiveNav(pageId) // Automatically switch to new page
  }, [])

  // Method to switch to an existing page
  const switchToPage = useCallback((pageId: string) => {
    setActiveNav(pageId)
  }, [])

  // Expose addNavItem to parent via callback
  useEffect(() => {
    if (onAddNavItem) {
      onAddNavItem(addNavItem)
    }
  }, [addNavItem, onAddNavItem])

  // Expose switchToPage to parent via callback
  useEffect(() => {
    if (onSwitchToPage) {
      onSwitchToPage(switchToPage)
    }
  }, [switchToPage, onSwitchToPage])

  // Render dynamic page based on type/name
  const renderDynamicPage = (pageId: string) => {
    const pageData = navItems.find(item => item.id === pageId)
    if (!pageData) return null

    const pageName = pageData.label.toLowerCase()

    // To Do page template
    if (pageName.includes('to do') || pageName.includes('todo') || pageName.includes('task')) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageData.label}</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your tasks and to-do items</p>
          </div>

          {/* Mock To Do List */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="divide-y divide-gray-200">
              {[
                { id: 1, title: 'Review project proposal', completed: false },
                { id: 2, title: 'Update documentation', completed: true },
                { id: 3, title: 'Schedule team meeting', completed: false },
              ].map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300"
                    readOnly
                  />
                  <span className={cn(
                    "text-sm",
                    task.completed ? "line-through text-gray-500" : "text-gray-900"
                  )}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100">
            + Add Task
          </button>
        </div>
      )
    }

    // Default page template (blank)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageData.label}</h1>
          <p className="text-sm text-gray-600 mt-1">This is a blank page. Add components to get started.</p>
        </div>
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Page content will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full gap-3">
      {/* Header Section — h-[86px] px-5 py-3, matches Platform in-app header card */}
      <header className="flex-shrink-0 bg-white rounded-lg h-[86px] px-5 py-3 flex items-stretch justify-between">
        {/* Left: App identity (top) + Navigation (bottom), distributed vertically */}
        <div className="flex flex-col justify-between">
          {/* App Icon and Name — matches Platform in-app header */}
          <div className="flex items-center gap-3">
            <AppIcon
              name={appIcon}
              className="w-5 h-5 flex-shrink-0"
              style={{ color: iconColorFromBg(appIconBg) }}
              strokeWidth={1.25}
            />
            <h1 className="text-lg font-semibold text-gray-900">{appName}</h1>
          </div>

          {/* Navigation — line-underline-on-active, matches Platform tab strip.
              -mb-3 pulls the active-tab underline flush with the 86px card bottom. */}
          <nav className="flex gap-3 -mb-3">
            {navItems.map((item) => {
              const isActive = activeNav === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={cn(
                    'relative px-1 pt-1 pb-3 text-sm transition-colors flex items-center gap-1',
                    isActive
                      ? 'text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900'
                      : 'text-gray-600 font-normal hover:text-gray-900'
                  )}
                >
                  {item.label}
                  {item.hasDropdown && (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Right: Viewing as dropdown */}
        <div className="flex items-center">
          <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
              <SelectTrigger className="w-[200px] !h-8 !min-h-0 border-gray-300 bg-white px-2 gap-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-gray-500 flex-shrink-0">Viewing as</span>
                  <span className="font-medium text-gray-900 truncate">{ROLE_LABELS[selectedRole]}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee" className="text-xs">Employee</SelectItem>
                <SelectItem value="manager" className="text-xs">Manager</SelectItem>
                <SelectItem value="finance" className="text-xs">Finance Admin</SelectItem>
                <SelectItem value="admin" className="text-xs">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
      </header>

      {/* Content Section */}
      <main className="flex-1 overflow-hidden rounded-lg bg-white">
        {activeNav ? (
          <div className="p-6 h-full overflow-auto">
            {renderDynamicPage(activeNav)}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <p className="text-sm font-medium text-gray-700">Preview is empty</p>
              <p className="text-xs text-gray-500 mt-1">
                Add a page via the Copilot panel or open one from the navigation to see it rendered here.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
