'use client'

import { useState, useEffect } from 'react'
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
  Check,
  Pencil,
  Loader2,
  Bug,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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

interface AppSuggestionDialogProps {
  open: boolean
  suggestedName: string
  suggestedDescription: string
  onConfirm: (data: { name: string; description: string; icon: string; iconBg: string }) => void
  onBack: () => void
  isLoading?: boolean
}

export function AppSuggestionDialog({
  open,
  suggestedName,
  suggestedDescription,
  onConfirm,
  onBack,
  isLoading = false,
}: AppSuggestionDialogProps) {
  const [name, setName] = useState(suggestedName)
  const [description, setDescription] = useState(suggestedDescription)
  const [selectedIcon, setSelectedIcon] = useState<AppIconName>('Folder')
  const [selectedColor, setSelectedColor] = useState<AppColor>(APP_COLORS[0])
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [error, setError] = useState('')

  // Update local state when suggestions change
  useEffect(() => {
    setName(suggestedName)
    setDescription(suggestedDescription)
  }, [suggestedName, suggestedDescription])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('App name is required')
      return
    }

    onConfirm({
      name: name.trim(),
      description: description.trim(),
      icon: selectedIcon,
      iconBg: selectedColor.value,
    })
  }

  const SelectedIconComponent = iconMap[selectedIcon]

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onBack()}>
      <DialogContent className="sm:max-w-[480px] bg-white">
        <DialogHeader className="space-y-0">
          <DialogTitle className="text-[20px] font-semibold text-gray-900 flex items-center gap-2">
            <span
              className="inline-block w-6 h-6"
              style={{
                background: 'linear-gradient(to right, #EC4899, #9333EA)',
                WebkitMaskImage: 'url(/ic_magic_wand.svg)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: 'url(/ic_magic_wand.svg)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
              }}
            />
            All set! Your app is almost ready
          </DialogTitle>
          <p className="text-[12px] text-gray-700 mt-1">
            Almost there. Just review the app details before proceeding
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Icon Selector */}
          <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="relative inline-block"
              >
                {/* Icon Preview */}
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-200">
                  <Bug className="h-6 w-6 text-green-500" fill="currentColor" />
                </div>

                {/* Edit indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-700 border border-white flex items-center justify-center">
                  <Pencil className="h-2.5 w-2.5 text-white" />
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

          {/* App Name */}
          <div className="space-y-2">
            <Label htmlFor="app-name" className="text-[12px] font-semibold text-gray-900">
              App name <span className="text-destructive-500">*</span>
            </Label>
            <Input
              id="app-name"
              placeholder="Enter an app name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              className={cn(
                'h-10 text-[14px] font-medium text-gray-999',
                error && 'border-red-500 focus-visible:ring-red-500'
              )}
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="app-description" className="text-[12px] font-semibold text-gray-900">
              Description
            </Label>
            <Textarea
              id="app-description"
              placeholder="Provide a description for your app"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none text-[14px] font-medium text-gray-999"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-10 px-6 rounded-lg"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 px-6 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
