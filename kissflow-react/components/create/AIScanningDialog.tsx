'use client'

import { useEffect } from 'react'
import { X, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AIScanningDialogProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
  onAbort: () => void
}

export function AIScanningDialog({ open, onClose, onComplete, onAbort }: AIScanningDialogProps) {
  useEffect(() => {
    if (open) {
      // Auto-complete after 5 seconds
      const timer = setTimeout(() => {
        onComplete()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [open, onComplete])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl w-[480px] p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center">
          {/* Header with AI icon */}
          <div className="flex items-center gap-2 mb-8">
            <img
              src="/ic_magic_wand.svg"
              alt="AI"
              className="w-6 h-6"
            />
            <h2 className="text-xl font-semibold text-gray-900">AI at work</h2>
          </div>

          {/* Animated loader */}
          <div className="mb-6">
            <img
              src="/ai-app-loader.svg"
              alt="Scanning document"
              className="w-[231px] h-[260px]"
            />
          </div>

          {/* Status text */}
          <p className="text-gray-600 mb-6">Scanning the document...</p>

          {/* Abort button */}
          <Button
            variant="ghost"
            onClick={onAbort}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Ban className="w-4 h-4 mr-2" />
            Abort
          </Button>
        </div>
      </div>
    </div>
  )
}
