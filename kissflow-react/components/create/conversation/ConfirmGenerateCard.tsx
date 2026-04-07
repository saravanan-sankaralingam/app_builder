'use client'

import { useState } from 'react'
import { Rocket, Sparkles } from 'lucide-react'

interface ConfirmGenerateCardProps {
  onConfirm: () => void
  onModify: () => void
}

export function ConfirmGenerateCard({ onConfirm, onModify }: ConfirmGenerateCardProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleConfirm = () => {
    setIsSubmitted(true)
    onConfirm()
  }

  const handleModify = () => {
    setIsSubmitted(true)
    onModify()
  }

  return (
    <div className="mt-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-md animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100">
      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Ready to build your app?</h3>
            <p className="text-xs text-gray-500">I'll generate your app based on the requirements</p>
          </div>
        </div>

        {!isSubmitted && (
          <div className="flex gap-2">
            <button
              onClick={handleModify}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Make changes
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #EC4899, #A855F7)',
              }}
            >
              <Rocket className="w-4 h-4" />
              Generate App
            </button>
          </div>
        )}

        {isSubmitted && (
          <div className="text-center py-2">
            <p className="text-sm text-purple-600 font-medium">Generating your app...</p>
          </div>
        )}
      </div>
    </div>
  )
}
