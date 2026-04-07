'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface RenameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; description?: string }) => Promise<void>
  isLoading?: boolean
  isFetchingDetails?: boolean
  moduleName: string
  currentName: string
  currentDescription?: string
}

export function RenameDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  isFetchingDetails = false,
  moduleName,
  currentName,
  currentDescription = '',
}: RenameDialogProps) {
  const [name, setName] = useState(currentName)
  const [description, setDescription] = useState(currentDescription)
  const [error, setError] = useState('')

  // Update local state when props change (after fetching)
  useEffect(() => {
    setName(currentName)
    setDescription(currentDescription)
  }, [currentName, currentDescription])

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
      description: description.trim() || undefined,
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset error when closing
      setError('')
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Rename {moduleName}
          </DialogTitle>
        </DialogHeader>

        {isFetchingDetails ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="rename-name" className="text-sm text-gray-600">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="rename-name"
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

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="rename-description" className="text-sm text-gray-600">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Textarea
                id="rename-description"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
                disabled={isLoading}
                maxLength={500}
              />
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
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
