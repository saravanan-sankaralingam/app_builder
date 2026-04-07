'use client'

import { X, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TabType = 'home' | 'dataform' | 'board' | 'process' | 'list' | 'navigation' | 'page' | 'variables' | 'resources' | 'components' | 'connections'

export interface Tab {
  id: string
  label: string
  icon?: React.ElementType
  closable?: boolean
  type?: TabType
  entityId?: string  // ID of the entity (data layer, page, etc.)
}

interface BuilderTabBarProps {
  tabs: Tab[]
  activeTabId: string
  onTabClick: (tabId: string) => void
  onTabClose: (tabId: string) => void
}

// Icon colors for each module type
const tabIconColors: Record<TabType, string> = {
  home: '#3B82F6',      // primary-500 (blue-500)
  dataform: '#22C55E',  // green
  board: '#8B5CF6',     // purple
  process: '#F97316',   // orange
  list: '#3B82F6',      // blue
  navigation: '#EC4899', // pink
  page: '#0EA5E9',      // sky blue
  variables: '#F97316', // orange
  resources: '#EAB308', // yellow
  components: '#B94E15', // rust
  connections: '#22C55E', // green
}

export function BuilderTabBar({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
}: BuilderTabBarProps) {
  return (
    <div className="bg-white flex items-center px-2 border-b border-gray-300" style={{ height: '40px' }}>
      {tabs.map((tab, index) => {
        const Icon = tab.icon
        const isActive = tab.id === activeTabId
        const prevTab = tabs[index - 1]
        const isPrevActive = prevTab?.id === activeTabId

        const isHomeTab = tab.type === 'home'
        const iconColor = tab.type ? tabIconColors[tab.type] : '#6B7280'

        // Hide separator if current or previous tab is active (handled via CSS for hover)
        const hideSeparator = isActive || isPrevActive

        return (
          <div key={tab.id} className="group/tab flex items-center">
            {/* Separator before each tab (except first) */}
            {index > 0 && (
              <div
                className={cn(
                  "w-px h-4 bg-gray-200 mx-1",
                  hideSeparator ? "opacity-0" : "group-hover/tab:opacity-0"
                )}
              />
            )}
            <div
              onClick={() => onTabClick(tab.id)}
              className={cn(
                'group flex items-center gap-2 px-3 h-7 text-xs cursor-pointer rounded-lg',
                isHomeTab ? 'w-auto' : 'min-w-[120px] max-w-[160px]',
                isActive
                  ? 'bg-gray-300 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: iconColor }} />}
              <span className="truncate flex-1">{tab.label}</span>
              {tab.closable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onTabClose(tab.id)
                  }}
                  className={cn(
                    'flex-shrink-0 p-0.5 rounded-full hover:bg-gray-200',
                    isActive ? 'opacity-60 hover:opacity-100' : 'opacity-0 group-hover:opacity-60 hover:!opacity-100'
                  )}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Default Home tab - not closable
export const HOME_TAB: Tab = {
  id: 'home',
  label: 'Home',
  icon: Home,
  closable: false,
  type: 'home',
}
