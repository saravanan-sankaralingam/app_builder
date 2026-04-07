'use client'

import { useState, useEffect } from 'react'
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
import { Loader2, Check } from 'lucide-react'

interface DuplicateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; includeViews: boolean; includeReports: boolean }) => Promise<void>
  isLoading?: boolean
  moduleName: string
  currentName: string
}

export function DuplicateDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  moduleName,
  currentName,
}: DuplicateDialogProps) {
  const [name, setName] = useState(`Copy of ${currentName}`)
  const [includeViews, setIncludeViews] = useState(false)
  const [includeReports, setIncludeReports] = useState(false)
  const [error, setError] = useState('')

  // Update default name when currentName changes
  useEffect(() => {
    setName(`Copy of ${currentName}`)
  }, [currentName])

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setName(`Copy of ${currentName}`)
      setIncludeViews(false)
      setIncludeReports(false)
      setError('')
    }
  }, [open, currentName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    if (name.trim().length > 100) {
      setError('Name must be 100 characters or less')
      return
    }

    await onSubmit({
      name: name.trim(),
      includeViews,
      includeReports,
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError('')
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Duplicate {moduleName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="duplicate-name" className="text-sm text-gray-600">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="duplicate-name"
              placeholder="Enter name"
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
              maxLength={100}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-2">
            {/* Include Views */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={cn(
                  'h-4 w-4 rounded border flex items-center justify-center transition-colors',
                  includeViews
                    ? 'bg-gray-900 border-gray-900'
                    : 'border-gray-300 group-hover:border-gray-400'
                )}
                onClick={() => !isLoading && setIncludeViews(!includeViews)}
              >
                {includeViews && <Check className="h-3 w-3 text-white" />}
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={includeViews}
                onChange={(e) => setIncludeViews(e.target.checked)}
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700">Include Views</span>
            </label>

            {/* Include Reports */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={cn(
                  'h-4 w-4 rounded border flex items-center justify-center transition-colors',
                  includeReports
                    ? 'bg-gray-900 border-gray-900'
                    : 'border-gray-300 group-hover:border-gray-400'
                )}
                onClick={() => !isLoading && setIncludeReports(!includeReports)}
              >
                {includeReports && <Check className="h-3 w-3 text-white" />}
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={includeReports}
                onChange={(e) => setIncludeReports(e.target.checked)}
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700">Include Reports</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
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
                  Duplicating...
                </>
              ) : (
                'Duplicate'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
