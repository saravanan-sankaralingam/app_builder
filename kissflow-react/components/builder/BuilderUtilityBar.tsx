'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, LayoutGrid, FileBarChart, Share2, Settings, FileText, Workflow, ShieldCheck } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface BuilderUtilityBarProps {
  title: string
  tabType?: 'home' | 'dataform' | 'board' | 'process' | 'list' | 'navigation' | 'page' | 'variables' | 'resources' | 'components' | 'connections' | 'permissions'
  activeView?: 'form' | 'workflow' | 'permission' | 'views' | 'reports' | 'share' | 'settings' | 'view-detail' | 'report-detail' | 'component-detail'
  onViewChange?: (view: 'form' | 'workflow' | 'permission') => void
  onViewsClick?: () => void
  onReportsClick?: () => void
  onShareClick?: () => void
  onSettingsClick?: () => void
  onBreadcrumbBack?: () => void
  onBreadcrumbMiddleClick?: () => void
  breadcrumb?: { parent: string; middle?: string; current: string }
  onRenameClick?: () => void
  onDuplicateClick?: () => void
  onDetailShareClick?: () => void
  onDetailSaveClick?: () => void
  onDetailDeleteClick?: () => void
}

export function BuilderUtilityBar({
  title,
  tabType = 'home',
  activeView = 'form',
  onViewChange,
  onViewsClick,
  onReportsClick,
  onShareClick,
  onSettingsClick,
  onBreadcrumbBack,
  onBreadcrumbMiddleClick,
  breadcrumb,
  onRenameClick,
  onDuplicateClick,
  onDetailShareClick,
  onDetailSaveClick,
  onDetailDeleteClick,
}: BuilderUtilityBarProps) {
  // Refs for measuring button positions
  const containerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLButtonElement>(null)
  const workflowRef = useRef<HTMLButtonElement>(null)
  const permissionRef = useRef<HTMLButtonElement>(null)

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 2, width: 70 })
  // Check if we're in drill-through mode (views, reports, share, settings, or view-detail/report-detail sub-page)
  const isDrillThrough = activeView === 'views' || activeView === 'reports' || activeView === 'share' || activeView === 'settings' || activeView === 'view-detail' || activeView === 'report-detail' || activeView === 'component-detail'

  const showActions = tabType !== 'home' && tabType !== 'variables' && tabType !== 'resources' && tabType !== 'components' && tabType !== 'connections' && tabType !== 'permissions' && !isDrillThrough
  const showViewSwitcher = (tabType === 'board' || tabType === 'process') && !isDrillThrough
  const showDetailActions = activeView === 'view-detail' || activeView === 'report-detail'

  // Conditional button visibility per tab type
  const showViewsButton = tabType === 'dataform' || tabType === 'board' || tabType === 'process' || tabType === 'list'
  const showReportsButton = tabType === 'dataform' || tabType === 'board' || tabType === 'process' || tabType === 'list'
  const showShareButton = tabType === 'dataform' || tabType === 'board' || tabType === 'process'
  const showSettingsButton = tabType === 'dataform' || tabType === 'board' || tabType === 'process'

  // Update indicator position when activeView changes
  useEffect(() => {
    const updateIndicator = () => {
      let targetRef: React.RefObject<HTMLButtonElement | null>
      if (activeView === 'form') targetRef = formRef
      else if (activeView === 'workflow') targetRef = workflowRef
      else targetRef = permissionRef

      if (targetRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const buttonRect = targetRef.current.getBoundingClientRect()
        setIndicatorStyle({
          left: buttonRect.left - containerRect.left,
          width: buttonRect.width,
        })
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(updateIndicator, 10)
    return () => clearTimeout(timer)
  }, [activeView, tabType])

  return (
    <div className="h-11 bg-white border-b border-gray-200 flex items-center justify-between px-4 relative">
      {/* Left - Title or Breadcrumb */}
      {isDrillThrough && breadcrumb ? (
        <div className="flex items-center text-sm">
          <button
            onClick={onBreadcrumbBack}
            className="font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            {breadcrumb.parent}
          </button>
          <span className="mx-2 text-gray-400">/</span>
          {breadcrumb.middle ? (
            <>
              <button
                onClick={onBreadcrumbMiddleClick}
                className="font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                {breadcrumb.middle}
              </button>
              <span className="mx-2 text-gray-400">/</span>
              <span className="font-medium text-gray-900">{breadcrumb.current}</span>
            </>
          ) : (
            <span className="font-medium text-gray-900">{breadcrumb.current}</span>
          )}
        </div>
      ) : (
        <h1 className="text-sm font-medium text-gray-900">{title}</h1>
      )}

      {/* Center - View Switcher (only for board and process) - absolutely centered */}
      {showViewSwitcher && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div ref={containerRef} className="relative flex items-center bg-gray-100 rounded-lg p-0.5">
            {/* Sliding indicator */}
            <div
              className="absolute h-7 bg-white rounded-md shadow-sm transition-all duration-300 ease-in-out"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
            />
            <button
              ref={formRef}
              onClick={() => onViewChange?.('form')}
              className={cn(
                'relative z-10 flex items-center gap-1.5 h-7 px-3 text-xs font-medium rounded-md transition-colors duration-200 cursor-pointer',
                activeView === 'form'
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <FileText className={cn('h-3.5 w-3.5 transition-colors duration-200', activeView === 'form' && 'text-blue-500')} />
              Form
            </button>
            <button
              ref={workflowRef}
              onClick={() => onViewChange?.('workflow')}
              className={cn(
                'relative z-10 flex items-center gap-1.5 h-7 px-3 text-xs font-medium rounded-md transition-colors duration-200 cursor-pointer',
                activeView === 'workflow'
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Workflow className={cn('h-3.5 w-3.5 transition-colors duration-200', activeView === 'workflow' && 'text-blue-500')} />
              Workflow
            </button>
            {tabType === 'process' && (
              <button
                ref={permissionRef}
                onClick={() => onViewChange?.('permission')}
                className={cn(
                  'relative z-10 flex items-center gap-1.5 h-7 px-3 text-xs font-medium rounded-md transition-colors duration-200 cursor-pointer',
                  activeView === 'permission'
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <ShieldCheck className={cn('h-3.5 w-3.5 transition-colors duration-200', activeView === 'permission' && 'text-blue-500')} />
                Permission
              </button>
            )}
          </div>
        </div>
      )}

      {showActions && (
        <div className="flex items-center gap-2">
          {/* Views Button */}
          {showViewsButton && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs !px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 cursor-pointer"
              onClick={onViewsClick}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Views
            </Button>
          )}

          {/* Reports Button */}
          {showReportsButton && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs !px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 cursor-pointer"
              onClick={onReportsClick}
            >
              <FileBarChart className="h-3.5 w-3.5" />
              Reports
            </Button>
          )}

          {/* Share Button */}
          {showShareButton && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-700 hover:text-gray-900 hover:bg-gray-200 cursor-pointer"
              onClick={onShareClick}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}

          {/* Settings Button */}
          {showSettingsButton && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-700 hover:text-gray-900 hover:bg-gray-200 cursor-pointer"
              onClick={onSettingsClick}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}

          {/* Save Button */}
          <Button size="sm" className="h-6 text-xs px-3 bg-gray-900 hover:bg-gray-800 cursor-pointer">
            Save
          </Button>

          {/* More Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-gray-300 hover:bg-gray-400 active:bg-gray-400 cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" alignOffset={-8} className="w-40 p-1.5 rounded-xl border-0">
              <DropdownMenuItem
                className="text-[13px] py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={onRenameClick}
              >
                Rename
              </DropdownMenuItem>
              {/* Duplicate and Archive only for dataform, board, process - not for list */}
              {tabType !== 'list' && (
                <>
                  <DropdownMenuItem
                    className="text-[13px] py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={onDuplicateClick}
                  >
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-[13px] py-2 px-3 rounded-lg cursor-pointer text-red-500 focus:text-red-500 hover:bg-red-50">
                    Archive
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Detail Actions - for view-detail and report-detail pages */}
      {showDetailActions && (
        <div className="flex items-center gap-2">
          {/* Share Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-700 hover:text-gray-900 hover:bg-gray-200 cursor-pointer"
            onClick={onDetailShareClick}
          >
            <Share2 className="h-4 w-4" />
          </Button>

          {/* Save Button */}
          <Button
            size="sm"
            className="h-6 text-xs px-3 bg-gray-900 hover:bg-gray-800 cursor-pointer"
            onClick={onDetailSaveClick}
          >
            Save
          </Button>

          {/* More Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-gray-300 hover:bg-gray-400 active:bg-gray-400 cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" alignOffset={-8} className="w-40 p-1.5 rounded-xl border-0">
              <DropdownMenuItem
                className="text-[13px] py-2 px-3 rounded-lg cursor-pointer text-red-500 focus:text-red-500 hover:bg-red-50"
                onClick={onDetailDeleteClick}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
