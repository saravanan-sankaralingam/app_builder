'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

// Forked from components/create/AppReviewDialog.tsx for the /new/app flow.
// Differences from the source:
//   - No icon picker (selection state, lucide icons, color palette, popover all removed)
//   - Title gradient uses --magenta-500 → --purple-500 at 265° (closest brand-token
//     matches for the requested rgb(211,65,165) → rgb(110,110,219) pair)
//   - Sized to match AIScanningDialog (w-[480px] h-[500px], p-8) so the frame
//     doesn't jump when scanning closes and review opens
//   - onCreateApp callback no longer includes icon/iconBg

interface AppReviewDialogProps {
  open: boolean
  onClose: () => void
  onCancel: () => void
  onCreateApp: (data: { name: string; description: string }) => void
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

  useEffect(() => {
    setName(suggestedName)
    setDescription(suggestedDescription)
  }, [suggestedName, suggestedDescription])

  if (!open) return null

  const handleCreateApp = () => {
    onCreateApp({ name, description })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative flex flex-col bg-white rounded-xl shadow-xl w-[550px] h-[460px] p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header — gradient text using brand tokens (closest match to rgb(211,65,165) → rgb(110,110,219)) */}
        <div>
          <h2
            className="text-2xl font-semibold bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(265deg, var(--magenta-500), var(--purple-500))',
            }}
          >
            Review the app details
          </h2>
        </div>
        <p className="text-xs font-normal text-gray-700 mb-6">
          Almost there. Just review the app details before proceeding
        </p>

        {/* App name field */}
        <div className="mb-4">
          <Label>
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
          <Label>
            Description
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none h-24"
            placeholder="Enter app description"
          />
        </div>

        {/* Action buttons — pinned to the bottom so the dialog frame stays at 500px */}
        <div className="mt-auto flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} className="px-6">
            Cancel
          </Button>
          <Button
            onClick={handleCreateApp}
            disabled={!name.trim()}
            className="px-6 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Create app
          </Button>
        </div>
      </div>
    </div>
  )
}
