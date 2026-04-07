'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Loader2, Table, BarChart3, Grid3X3, CreditCard } from 'lucide-react'

export type ReportType = 'table' | 'chart' | 'pivot' | 'card'

interface ReportCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; type: ReportType }) => void
  isLoading?: boolean
}

// Report type options
const reportTypeOptions: { id: ReportType; icon: React.ElementType; title: string; description: string; color: string; bgColor: string }[] = [
  {
    id: 'table',
    icon: Table,
    title: 'Table',
    description: 'Tabular report with rows and columns',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
  },
  {
    id: 'chart',
    icon: BarChart3,
    title: 'Chart',
    description: 'Visual charts and graphs',
    color: '#F97316',
    bgColor: '#FFEDD5',
  },
  {
    id: 'pivot',
    icon: Grid3X3,
    title: 'Pivot',
    description: 'Cross-tabulation pivot tables',
    color: '#EC4899',
    bgColor: '#FCE7F3',
  },
  {
    id: 'card',
    icon: CreditCard,
    title: 'Card',
    description: 'Summary cards with key metrics',
    color: '#22C55E',
    bgColor: '#DCFCE7',
  },
]

export function ReportCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: ReportCreateDialogProps) {
  const [name, setName] = useState('')
  const [selectedType, setSelectedType] = useState<ReportType>('table')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    onSubmit({
      name: name.trim(),
      type: selectedType,
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setName('')
      setSelectedType('table')
      setError('')
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[680px] bg-white p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-base font-semibold">
            Create New Report
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="report-name" className="text-sm text-gray-600">
              Name
            </Label>
            <Input
              id="report-name"
              placeholder="Enter report name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              className={cn(
                'h-10',
                error && 'border-red-500 focus-visible:ring-red-500'
              )}
              autoFocus
              disabled={isLoading}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Report Type Section */}
          <div>
            <Label className="text-sm text-gray-600">
              Report type
            </Label>
            <div className="grid grid-cols-4 gap-3 mt-2">
              {reportTypeOptions.map((reportType) => {
                const Icon = reportType.icon
                const isSelected = selectedType === reportType.id
                return (
                  <button
                    key={reportType.id}
                    type="button"
                    onClick={() => setSelectedType(reportType.id)}
                    disabled={isLoading}
                    className={cn(
                      'flex flex-col items-start p-4 rounded-xl border transition-all text-left',
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{ backgroundColor: reportType.bgColor }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: reportType.color }}
                      />
                    </div>
                    {/* Title */}
                    <p className="text-sm font-medium text-gray-900 mb-1">{reportType.title}</p>
                    {/* Description */}
                    <p className="text-xs text-gray-500 leading-relaxed">{reportType.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="h-9"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-9 bg-gray-900 hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
