'use client'

import { useState } from 'react'
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
import { Loader2, List } from 'lucide-react'

interface ListCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; description?: string }) => void
  isLoading?: boolean
}

export function ListCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: ListCreateDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setName('')
      setDescription('')
      setError('')
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="!bg-gradient-to-br !from-purple-50 !via-white !to-blue-50 sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-500">
              <List className="h-4 w-4 text-white" />
            </div>
            <DialogTitle className="text-base font-semibold">
              Create List
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="list-name" className="text-sm text-gray-600">
              Name
            </Label>
            <Input
              id="list-name"
              placeholder="Enter list name"
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="list-description" className="text-sm text-gray-600">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="list-description"
              placeholder="Describe what this list is for (e.g., Departments, Countries, Status values)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end items-center gap-3 pt-2">
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
              className="h-9 bg-blue-600 hover:bg-blue-700"
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
