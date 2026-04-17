'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Rocket, HelpCircle, MessageSquareText, Pencil, Search, RotateCcw, Loader2, ChevronDown, LayoutGrid, Hammer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecentApp {
  id: string
  name: string
  icon: string
  iconBg: string
}

interface BuilderTopBarProps {
  appName: string
  appIcon: string
  appIconBg: string
  onIconChange?: (icon: string) => void
  onColorChange?: (color: string) => void
  onNameChange?: (name: string) => Promise<{ success: boolean; error?: string }>
  recentApps?: RecentApp[]
  onAppSwitch?: (appId: string) => void
  onGoToExplorer?: () => void
  isRunMode?: boolean
  onRunModeToggle?: () => void
}

function AppIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name]
  if (!IconComponent) {
    return <LucideIcons.Folder className={className} />
  }
  return <IconComponent className={className} />
}

// Icon categories for the picker
const iconCategories = [
  {
    name: 'System icons',
    icons: ['BarChart3', 'Component', 'LayoutGrid', 'Workflow', 'Database', 'Settings', 'Cog', 'Terminal', 'Code', 'Server', 'Cloud', 'Shield', 'Lock', 'Key', 'RefreshCw', 'Zap', 'Activity', 'Bell']
  },
  {
    name: 'General',
    icons: ['FileText', 'Folder', 'File', 'Clipboard', 'Calendar', 'Clock', 'Mail', 'MessageSquare', 'Phone', 'MapPin', 'Home', 'Search', 'Star', 'Heart', 'Flag', 'Bookmark', 'Tag', 'Link']
  },
  {
    name: 'Accounting & Finance',
    icons: ['DollarSign', 'CreditCard', 'Wallet', 'Receipt', 'PiggyBank', 'Landmark', 'TrendingUp', 'TrendingDown', 'BarChart2', 'PieChart', 'Calculator', 'Percent', 'Coins', 'Banknote', 'CircleDollarSign', 'BadgeDollarSign', 'Scale', 'FileSpreadsheet']
  },
  {
    name: 'Sales & Marketing',
    icons: ['Target', 'Megaphone', 'ShoppingCart', 'ShoppingBag', 'Store', 'Gift', 'Award', 'Trophy', 'Sparkles', 'Rocket', 'Send', 'Share2', 'Users', 'UserPlus', 'HandCoins', 'Handshake', 'BadgePercent', 'Presentation']
  },
  {
    name: 'Production & Manufacturing',
    icons: ['Factory', 'Wrench', 'Hammer', 'Cog', 'Settings2', 'Box', 'Package', 'Truck', 'Container', 'Warehouse', 'HardHat', 'Drill', 'Ruler', 'Layers', 'Boxes', 'PackageCheck', 'ClipboardCheck', 'Gauge']
  },
  {
    name: 'HR & Operations',
    icons: ['Users', 'User', 'UserCheck', 'UserCog', 'Briefcase', 'GraduationCap', 'BadgeCheck', 'IdCard', 'Building2', 'ClipboardList', 'ListChecks', 'CalendarCheck', 'Clock4', 'Timer', 'FileCheck', 'FolderKanban', 'Kanban', 'GitBranch']
  },
  {
    name: 'Business',
    icons: ['Building', 'Building2', 'Briefcase', 'PresentationChart', 'LineChart', 'BarChart3', 'Network', 'Globe', 'Globe2', 'Landmark', 'Crown', 'Shield', 'CheckCircle', 'Award', 'Medal', 'Target', 'Lightbulb', 'Puzzle']
  },
  {
    name: 'Sports & Entertainment',
    icons: ['Trophy', 'Medal', 'Dumbbell', 'Bike', 'Gamepad2', 'Music', 'Film', 'Camera', 'Tv', 'Headphones', 'Mic', 'Radio', 'Ticket', 'PartyPopper', 'Palette', 'Brush', 'Drama', 'Volleyball']
  }
]

export function BuilderTopBar({ appName, appIcon, appIconBg, onIconChange, onColorChange, onNameChange, recentApps = [], onAppSwitch, onGoToExplorer, isRunMode = false, onRunModeToggle }: BuilderTopBarProps) {
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false)
  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'icons' | 'custom'>('icons')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIcon, setSelectedIcon] = useState(appIcon)
  const [selectedColor, setSelectedColor] = useState(appIconBg)

  // App name editing state
  const [isEditingName, setIsEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState(appName)
  const [isNameSaving, setIsNameSaving] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // No longer need to focus/select since the input is always visible
  // The cursor will naturally be placed where the user clicks

  const handleNameClick = () => {
    setEditNameValue(appName) // Sync with current prop value when entering edit mode
    setIsEditingName(true)
    setNameError(null)
  }

  const handleNameSave = async () => {
    const trimmedName = editNameValue.trim()

    // Validation
    if (!trimmedName) {
      setNameError('Name cannot be empty')
      return
    }

    if (trimmedName.length > 100) {
      setNameError('Name must be 100 characters or less')
      return
    }

    // If name hasn't changed, just exit edit mode
    if (trimmedName === appName) {
      setIsEditingName(false)
      setNameError(null)
      return
    }

    // Save the name
    if (onNameChange) {
      setIsNameSaving(true)
      setNameError(null)

      const result = await onNameChange(trimmedName)

      setIsNameSaving(false)

      if (result.success) {
        setIsEditingName(false)
      } else {
        setNameError(result.error || 'Failed to save name')
      }
    } else {
      setIsEditingName(false)
    }
  }

  const handleNameCancel = () => {
    setEditNameValue(appName)
    setIsEditingName(false)
    setNameError(null)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleNameSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleNameCancel()
    }
  }

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName)
    onIconChange?.(iconName)
    setIsIconPickerOpen(false)
  }

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    onColorChange?.(color)
  }

  const handleReset = () => {
    setSelectedIcon(appIcon)
    setSelectedColor(appIconBg)
    setSearchQuery('')
  }

  const filterIcons = (icons: string[]) => {
    if (!searchQuery) return icons
    return icons.filter(icon =>
      icon.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  return (
    <header className="h-full">
      <div className="flex h-11 items-center justify-between relative">
        {/* Left Side - App Info */}
        <div className="flex items-center pl-[2px]">
          {/* App Icon - centered in sidebar-width container to align with sidebar icons */}
          <div className="w-10 flex items-center justify-center">
            <Popover open={isIconPickerOpen} onOpenChange={setIsIconPickerOpen}>
              <PopoverTrigger asChild>
                <button
                  className="relative w-7 h-7 rounded-md flex items-center justify-center group cursor-pointer"
                  style={{ backgroundColor: selectedColor }}
                >
                  <AppIcon name={selectedIcon} className="h-3.5 w-3.5 text-white" />
                  {/* Edit indicator on hover */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil className="h-2 w-2 text-white" />
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[280px] p-0"
                align="start"
                sideOffset={0}
              >
                {/* Header with tabs */}
                <div className="flex items-center justify-between px-3 pt-3 border-b border-gray-300">
                  <div className="flex items-center gap-4">
                    <button
                      className={cn(
                        "text-xs font-medium pb-3 -mb-px border-b-2 transition-colors",
                        activeTab === 'icons'
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-700 border-transparent hover:text-gray-900"
                      )}
                      onClick={() => setActiveTab('icons')}
                    >
                      Icons
                    </button>
                    <button
                      className={cn(
                        "text-xs font-medium pb-3 -mb-px border-b-2 transition-colors",
                        activeTab === 'custom'
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-700 border-transparent hover:text-gray-900"
                      )}
                      onClick={() => setActiveTab('custom')}
                    >
                      Custom
                    </button>
                  </div>
                  <button
                    className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 transition-colors pb-3"
                    onClick={handleReset}
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                </div>

                {activeTab === 'icons' && (
                  <div className="pl-3 pt-3 pb-3">
                    {/* Search and Color Picker */}
                    <div className="flex items-center gap-2 mb-3 pr-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                        <Input
                          placeholder="Search icons"
                          className="pl-8 h-8 text-xs bg-white border-gray-400 placeholder:text-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 shadow-none"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      {/* Color Picker Button */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                          >
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: selectedColor }}
                            />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-2.5"
                          align="end"
                          sideOffset={4}
                        >
                          <div className="grid grid-cols-6 gap-1.5">
                            {['#22C55E', '#EC4899', '#EAB308', '#EF4444', '#8B5CF6', '#3B82F6', '#14B8A6', '#06B6D4', '#F97316', '#F43F5E', '#A855F7', '#6B7280'].map((color) => (
                              <button
                                key={color}
                                className={cn(
                                  "w-5 h-5 rounded-full transition-all",
                                  selectedColor === color ? "ring-2 ring-offset-1 ring-blue-500" : "hover:scale-110"
                                )}
                                style={{ backgroundColor: color }}
                                title={color}
                                onClick={() => handleColorSelect(color)}
                              />
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Icon Categories */}
                    <div className="max-h-[224px] overflow-y-auto overflow-x-hidden space-y-3 scrollbar-sleek pr-1">
                      {iconCategories.map((category, index) => {
                        const filteredIcons = filterIcons(category.icons)
                        if (filteredIcons.length === 0) return null
                        return (
                          <div key={category.name} className="pr-2">
                            <h4 className="text-[11px] font-medium text-gray-800 mb-2">{category.name}</h4>
                            <div className="grid grid-cols-8 gap-0.5">
                              {filteredIcons.map((iconName) => (
                                <button
                                  key={iconName}
                                  className={cn(
                                    "w-7 h-7 rounded flex items-center justify-center transition-colors",
                                    selectedIcon === iconName
                                      ? "bg-blue-100 text-blue-600"
                                      : "hover:bg-gray-100 text-gray-600"
                                  )}
                                  onClick={() => handleIconSelect(iconName)}
                                  title={iconName}
                                >
                                  <AppIcon name={iconName} className="h-4 w-4" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'custom' && (
                  <div className="p-3">
                    <p className="text-xs text-gray-500 text-center py-6">
                      Upload a custom icon for your app
                    </p>
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">
                      Upload Image
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
          {/* App Name - Editable */}
          <div className="relative flex items-center gap-1">
            <input
              ref={nameInputRef}
              type="text"
              value={isEditingName ? editNameValue : appName}
              onChange={(e) => setEditNameValue(e.target.value)}
              onFocus={handleNameClick}
              onBlur={handleNameSave}
              onKeyDown={handleNameKeyDown}
              disabled={isNameSaving}
              maxLength={100}
              className={cn(
                "font-medium text-sm text-gray-900 bg-transparent border-b border-dashed border-transparent outline-none transition-colors cursor-text pb-0.5",
                nameError
                  ? "border-red-500"
                  : isEditingName
                    ? "border-gray-600"
                    : "hover:border-gray-500"
              )}
              style={{ width: `${Math.max((isEditingName ? editNameValue : appName).length * 8, 80)}px` }}
            />
            {isNameSaving && (
              <Loader2 className="h-3.5 w-3.5 text-gray-400 animate-spin" />
            )}
            {nameError && (
              <div className="absolute top-full left-0 mt-1 text-xs text-red-600 whitespace-nowrap">
                {nameError}
              </div>
            )}
          </div>
          {/* App Switcher */}
          <Popover open={isAppSwitcherOpen} onOpenChange={setIsAppSwitcherOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "p-0.5 rounded-full hover:bg-gray-300 active:bg-gray-400 transition-colors ml-1 group",
                  isAppSwitcherOpen && "bg-gray-400"
                )}
              >
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 text-gray-500 transition-colors group-hover:text-gray-700 group-active:text-gray-800",
                  isAppSwitcherOpen && "text-gray-800"
                )} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[220px] p-1.5 rounded-lg"
              align="start"
              sideOffset={8}
            >
              {/* App Explorer Link */}
              <button
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors"
                onClick={() => {
                  onGoToExplorer?.()
                  setIsAppSwitcherOpen(false)
                }}
              >
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                  <LayoutGrid className="h-3.5 w-3.5 text-gray-600" />
                </div>
                <span className="text-[13px] font-medium text-gray-800">App explorer</span>
              </button>

              {/* Separator */}
              {recentApps.length > 0 && (
                <div className="my-1.5 border-t border-gray-200" />
              )}

              {/* Recent Apps */}
              {recentApps.length > 0 && (
                <div className="space-y-1">
                  {recentApps.slice(0, 5).map((app) => (
                    <button
                      key={app.id}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        onAppSwitch?.(app.id)
                        setIsAppSwitcherOpen(false)
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: app.iconBg }}
                      >
                        <AppIcon name={app.icon} className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-[13px] font-medium text-gray-800 truncate">{app.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Center - Build/Play Toggle */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => isRunMode && onRunModeToggle?.()}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                !isRunMode
                  ? "bg-purple-600 text-white"
                  : "text-gray-900 hover:bg-gray-200"
              )}
            >
              Build
            </button>
            <button
              onClick={() => !isRunMode && onRunModeToggle?.()}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                isRunMode
                  ? "bg-purple-600 text-white"
                  : "text-gray-900 hover:bg-gray-200"
              )}
            >
              Play
            </button>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-4 pr-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-[28px] w-[28px] p-0 text-gray-600 hover:bg-white/30 hover:text-gray-800 rounded-full cursor-pointer"
          >
            <HelpCircle className="!h-[16px] !w-[16px]" strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-[28px] w-[28px] p-0 text-gray-600 hover:bg-white/30 hover:text-gray-800 rounded-full cursor-pointer"
          >
            <MessageSquareText className="!h-[16px] !w-[16px]" strokeWidth={1.5} />
          </Button>
          <div className="h-4 w-px bg-gray-400/50 mx-1" />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-[28px] w-8 p-0 cursor-pointer bg-white/80 text-purple-700 hover:bg-white hover:text-purple-800 border border-purple-300"
            >
              <Play className="size-3" />
            </Button>
            <Button
              size="sm"
              className="h-[28px] w-8 p-0 bg-purple-600 hover:bg-purple-700 cursor-pointer"
            >
              <Rocket className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
