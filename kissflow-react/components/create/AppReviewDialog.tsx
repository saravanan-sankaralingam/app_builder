'use client'

import { useState, useEffect } from 'react'
import { X, Pencil, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Users,
  FileText,
  Folder,
  Calendar,
  CheckSquare,
  Package,
  ShoppingCart,
  DollarSign,
  Mail,
  Settings,
  Clock,
  Star,
  Heart,
  BookOpen,
  Briefcase,
  Database,
  Layers,
  Grid,
  List,
  BarChart,
} from 'lucide-react'
import { APP_COLORS, AppIconName, AppColor } from '@/lib/schema/types'
import { cn } from '@/lib/utils'

// Map icon names to components
const iconMap: Record<AppIconName, React.ComponentType<{ className?: string }>> = {
  Users,
  FileText,
  Folder,
  Calendar,
  CheckSquare,
  Package,
  ShoppingCart,
  DollarSign,
  Mail,
  Settings,
  Clock,
  Star,
  Heart,
  BookOpen,
  Briefcase,
  Database,
  Layers,
  Grid,
  List,
  BarChart,
}

interface AppReviewDialogProps {
  open: boolean
  onClose: () => void
  onCancel: () => void
  onCreateApp: (data: { name: string; description: string; icon: string; iconBg: string }) => void
  suggestedName: string
  suggestedDescription: string
}

export function AppReviewDialog({
  open,
  onClose,
  onCancel,
  onCreateApp,
  suggestedName,
  suggestedDescription,
}: AppReviewDialogProps) {
  const [name, setName] = useState(suggestedName)
  const [description, setDescription] = useState(suggestedDescription)
  const [selectedIcon, setSelectedIcon] = useState<AppIconName>('Folder')
  const [selectedColor, setSelectedColor] = useState<AppColor>(APP_COLORS[0])
  const [iconPickerOpen, setIconPickerOpen] = useState(false)

  // Update form when suggestions change
  useEffect(() => {
    setName(suggestedName)
    setDescription(suggestedDescription)
  }, [suggestedName, suggestedDescription])

  if (!open) return null

  const handleCreateApp = () => {
    onCreateApp({
      name,
      description,
      icon: selectedIcon,
      iconBg: selectedColor.value,
    })
  }

  const SelectedIconComponent = iconMap[selectedIcon]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl w-[480px] p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="mb-2">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Review the app details
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Almost there. Just review the app details before proceeding
        </p>

        {/* Icon Picker */}
        <div className="mb-5">
          <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="group relative inline-flex"
              >
                {/* Icon Preview */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-150 group-hover:scale-105"
                  style={{ backgroundColor: selectedColor.value }}
                >
                  <SelectedIconComponent className="h-7 w-7 text-white" />
                </div>

                {/* Edit indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center border border-gray-200">
                  <Pencil className="w-3 h-3 text-gray-500" />
                </div>
              </button>
            </PopoverTrigger>

            <PopoverContent
              className="w-80 p-4"
              align="start"
              sideOffset={8}
            >
              {/* Icon Grid */}
              <div className="space-y-3">
                <Label className="text-xs text-gray-500 uppercase tracking-wide">
                  Choose icon
                </Label>
                <div className="grid grid-cols-10 gap-1">
                  {(Object.keys(iconMap) as AppIconName[]).map((iconName) => {
                    const IconComponent = iconMap[iconName]
                    const isSelected = selectedIcon === iconName
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setSelectedIcon(iconName)}
                        className={cn(
                          'w-7 h-7 rounded-md flex items-center justify-center transition-all duration-150',
                          isSelected
                            ? 'bg-blue-100 ring-1 ring-blue-500'
                            : 'hover:bg-gray-100'
                        )}
                        title={iconName}
                      >
                        <IconComponent
                          className={cn(
                            'h-4 w-4',
                            isSelected ? 'text-blue-600' : 'text-gray-500'
                          )}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="my-4 h-px bg-gray-100" />

              {/* Color Picker */}
              <div className="space-y-3">
                <Label className="text-xs text-gray-500 uppercase tracking-wide">
                  Choose color
                </Label>
                <div className="flex gap-2">
                  {APP_COLORS.map((color) => {
                    const isSelected = selectedColor.value === color.value
                    return (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150',
                          isSelected && 'ring-2 ring-offset-2'
                        )}
                        style={{
                          backgroundColor: color.value,
                          '--tw-ring-color': color.value,
                        } as React.CSSProperties}
                        title={color.name}
                      >
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* App name field */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            App name <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
            placeholder="Enter app name"
          />
        </div>

        {/* Description field */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none h-24"
            placeholder="Enter app description"
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateApp}
            disabled={!name.trim()}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create app
          </Button>
        </div>
      </div>
    </div>
  )
}
