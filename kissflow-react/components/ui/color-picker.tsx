'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// Color definitions
interface ColorOption {
  name: string
  value: string
}

// System colors - grayscale
const systemColors: ColorOption[] = [
  { name: 'Gray 900', value: '#111827' },
  { name: 'Gray 800', value: '#1f2937' },
  { name: 'Gray 700', value: '#374151' },
  { name: 'Gray 600', value: '#4b5563' },
  { name: 'Gray 500', value: '#6b7280' },
  { name: 'Gray 400', value: '#9ca3af' },
  { name: 'Gray 300', value: '#d1d5db' },
  { name: 'Gray 200', value: '#e5e7eb' },
  { name: 'Gray 100', value: '#f3f4f6' },
  { name: 'Gray 50', value: '#f9fafb' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' },
]

// Semantic colors - Success, Error, Warning, Info
const semanticColors: ColorOption[] = [
  // Success row (Green)
  { name: 'Success 600', value: '#16a34a' },
  { name: 'Success 100', value: '#dcfce7' },
  { name: 'Success 200', value: '#bbf7d0' },
  { name: 'Success 300', value: '#86efac' },
  { name: 'Success 400', value: '#4ade80' },
  { name: 'Success 500', value: '#22c55e' },
  { name: 'Success 700', value: '#15803d' },
  // Error row (Red)
  { name: 'Error 600', value: '#dc2626' },
  { name: 'Error 100', value: '#fee2e2' },
  { name: 'Error 200', value: '#fecaca' },
  { name: 'Error 300', value: '#fca5a5' },
  { name: 'Error 400', value: '#f87171' },
  { name: 'Error 500', value: '#ef4444' },
  { name: 'Error 700', value: '#b91c1c' },
  // Warning row (Yellow)
  { name: 'Warning 600', value: '#ca8a04' },
  { name: 'Warning 100', value: '#fef9c3' },
  { name: 'Warning 200', value: '#fef08a' },
  { name: 'Warning 300', value: '#fde047' },
  { name: 'Warning 400', value: '#facc15' },
  { name: 'Warning 500', value: '#eab308' },
  { name: 'Warning 700', value: '#a16207' },
  // Info row (Blue)
  { name: 'Info 600', value: '#2563eb' },
  { name: 'Info 100', value: '#dbeafe' },
  { name: 'Info 200', value: '#bfdbfe' },
  { name: 'Info 300', value: '#93c5fd' },
  { name: 'Info 400', value: '#60a5fa' },
  { name: 'Info 500', value: '#3b82f6' },
  { name: 'Info 700', value: '#1d4ed8' },
]

// Primary & secondary colors
const primarySecondaryColors: ColorOption[] = [
  // Blue row
  { name: 'Blue 600', value: '#2563eb' },
  { name: 'Blue 50', value: '#eff6ff' },
  { name: 'Blue 100', value: '#dbeafe' },
  { name: 'Blue 200', value: '#bfdbfe' },
  { name: 'Blue 400', value: '#60a5fa' },
  { name: 'Blue 700', value: '#1d4ed8' },
  { name: 'Blue 900', value: '#1e3a8a' },
  // Green row
  { name: 'Green 600', value: '#16a34a' },
  { name: 'Green 50', value: '#f0fdf4' },
  { name: 'Green 100', value: '#dcfce7' },
  { name: 'Green 200', value: '#bbf7d0' },
  { name: 'Green 400', value: '#4ade80' },
  { name: 'Green 700', value: '#15803d' },
  { name: 'Green 900', value: '#14532d' },
  // Pink row
  { name: 'Pink 600', value: '#db2777' },
  { name: 'Pink 50', value: '#fdf2f8' },
  { name: 'Pink 100', value: '#fce7f3' },
  { name: 'Pink 200', value: '#fbcfe8' },
  { name: 'Pink 400', value: '#f472b6' },
  { name: 'Pink 700', value: '#be185d' },
  { name: 'Pink 900', value: '#831843' },
  // Amber row
  { name: 'Amber 600', value: '#d97706' },
  { name: 'Amber 50', value: '#fffbeb' },
  { name: 'Amber 100', value: '#fef3c7' },
  { name: 'Amber 200', value: '#fde68a' },
  { name: 'Amber 400', value: '#fbbf24' },
  { name: 'Amber 700', value: '#b45309' },
  { name: 'Amber 900', value: '#78350f' },
  // Red row
  { name: 'Red 600', value: '#dc2626' },
  { name: 'Red 50', value: '#fef2f2' },
  { name: 'Red 100', value: '#fee2e2' },
  { name: 'Red 200', value: '#fecaca' },
  { name: 'Red 400', value: '#f87171' },
  { name: 'Red 700', value: '#b91c1c' },
  { name: 'Red 900', value: '#7f1d1d' },
  // Orange row
  { name: 'Orange 600', value: '#ea580c' },
  { name: 'Orange 50', value: '#fff7ed' },
  { name: 'Orange 100', value: '#ffedd5' },
  { name: 'Orange 200', value: '#fed7aa' },
  { name: 'Orange 400', value: '#fb923c' },
  { name: 'Orange 700', value: '#c2410c' },
  { name: 'Orange 900', value: '#7c2d12' },
  // Purple row
  { name: 'Purple 600', value: '#9333ea' },
  { name: 'Purple 50', value: '#faf5ff' },
  { name: 'Purple 100', value: '#f3e8ff' },
  { name: 'Purple 200', value: '#e9d5ff' },
  { name: 'Purple 400', value: '#c084fc' },
  { name: 'Purple 700', value: '#7e22ce' },
  { name: 'Purple 900', value: '#581c87' },
  // Indigo row
  { name: 'Indigo 600', value: '#4f46e5' },
  { name: 'Indigo 50', value: '#eef2ff' },
  { name: 'Indigo 100', value: '#e0e7ff' },
  { name: 'Indigo 200', value: '#c7d2fe' },
  { name: 'Indigo 400', value: '#818cf8' },
  { name: 'Indigo 700', value: '#4338ca' },
  { name: 'Indigo 900', value: '#312e81' },
  // Cyan row
  { name: 'Cyan 600', value: '#0891b2' },
  { name: 'Cyan 50', value: '#ecfeff' },
  { name: 'Cyan 100', value: '#cffafe' },
  { name: 'Cyan 200', value: '#a5f3fc' },
  { name: 'Cyan 400', value: '#22d3ee' },
  { name: 'Cyan 700', value: '#0e7490' },
  { name: 'Cyan 900', value: '#164e63' },
  // Teal row
  { name: 'Teal 600', value: '#0d9488' },
  { name: 'Teal 50', value: '#f0fdfa' },
  { name: 'Teal 100', value: '#ccfbf1' },
  { name: 'Teal 200', value: '#99f6e4' },
  { name: 'Teal 400', value: '#2dd4bf' },
  { name: 'Teal 700', value: '#0f766e' },
  { name: 'Teal 900', value: '#134e4a' },
]

// All colors combined for lookup
const allColors: ColorOption[] = [
  ...systemColors,
  ...semanticColors,
  ...primarySecondaryColors,
]

// Find color name by value
function findColorName(value: string): string {
  const color = allColors.find(c => c.value.toLowerCase() === value.toLowerCase())
  return color?.name || value
}

interface ColorPickerProps {
  value: string
  colorName?: string
  onChange: (value: string, name: string) => void
  className?: string
}

export function ColorPicker({ value, colorName: selectedColorName, onChange, className }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [customColors, setCustomColors] = React.useState<ColorOption[]>([])

  const displayName = selectedColorName || findColorName(value)

  const handleColorSelect = (color: ColorOption) => {
    onChange(color.value, color.name)
    setOpen(false)
  }

  const handleAddCustomColor = () => {
    // For now, just open a native color picker
    const input = document.createElement('input')
    input.type = 'color'
    input.value = value
    input.onchange = (e) => {
      const newColor = (e.target as HTMLInputElement).value
      const newCustomColor: ColorOption = {
        name: newColor.toUpperCase(),
        value: newColor,
      }
      setCustomColors([...customColors, newCustomColor])
      onChange(newColor, newCustomColor.name)
    }
    input.click()
  }

  const ColorSwatch = ({ color }: { color: ColorOption }) => {
    const isSelected = selectedColorName === color.name
    return (
      <button
        onClick={() => handleColorSelect(color)}
        title={color.name}
        className={cn(
          "w-4 h-4 rounded-full border border-gray-300 transition-transform hover:scale-110 focus:outline-none",
          isSelected && "ring-1 ring-offset-1 ring-gray-700"
        )}
        style={{ backgroundColor: color.value }}
      />
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center justify-between w-full h-8 px-3 text-xs border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            className
          )}
        >
          <span className="text-gray-700 truncate">{displayName}</span>
          <div
            className={cn(
              'w-5 h-5 rounded-full flex-shrink-0 ml-2',
              value.toLowerCase() === '#ffffff' && 'border border-gray-200'
            )}
            style={{ backgroundColor: value }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        align="start"
        sideOffset={4}
        className="w-auto p-0 rounded-sm"
      >
        {/* Fixed Header */}
        <div className="px-3 py-2 border-b border-gray-200">
          <h4 className="text-xs font-medium text-gray-900">Pick color</h4>
        </div>

        {/* Scrollable color sections */}
        <div className="p-3 max-h-[320px] overflow-y-auto">
          {/* Custom colors section */}
          <div className="mb-4">
            <h5 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Custom colors</h5>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAddCustomColor}
                className="w-4 h-4 rounded-full border border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-2.5 h-2.5 text-gray-400" />
              </button>
              {customColors.map((color, index) => (
                <ColorSwatch key={index} color={color} />
              ))}
            </div>
          </div>

          {/* System colors section */}
          <div className="mb-4">
            <h5 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">System colors</h5>
            <div className="grid grid-cols-7 gap-2">
              {systemColors.map((color, index) => (
                <ColorSwatch key={index} color={color} />
              ))}
            </div>
          </div>

          {/* Semantic colors section */}
          <div className="mb-4">
            <h5 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Semantic colors</h5>
            <div className="grid grid-cols-7 gap-2">
              {semanticColors.map((color, index) => (
                <ColorSwatch key={index} color={color} />
              ))}
            </div>
          </div>

          {/* Primary & secondary colors section */}
          <div>
            <h5 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Primary & secondary colors</h5>
            <div className="grid grid-cols-7 gap-2">
              {primarySecondaryColors.map((color, index) => (
                <ColorSwatch key={index} color={color} />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
