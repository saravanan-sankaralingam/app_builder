'use client'

import { AnimatedCopilotAvatar, AnimationType } from './AnimatedCopilotAvatar'
import { LoadingProgressIndicator } from './LoadingProgressIndicator'

interface CopilotLoadingMessageProps {
  stages: string[]
  duration?: number
  animationType?: AnimationType
  onComplete?: () => void
  showResult?: boolean
  resultContent?: React.ReactNode
}

export function CopilotLoadingMessage({
  stages,
  duration = 5000,
  animationType = 'pulse',
  onComplete,
  showResult = false,
  resultContent
}: CopilotLoadingMessageProps) {
  return (
    <div className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Avatar with loading animation next to it */}
      <div className="flex items-center gap-2">
        <AnimatedCopilotAvatar animationType={animationType} size="sm" />

        {/* Loading dots next to avatar (when loading) */}
        {!showResult && (
          <div className="flex items-center gap-1">
            <span
              className="w-1 h-1 bg-purple-500 rounded-full animate-smooth-bounce shadow-sm"
              style={{ animationDelay: '0ms' }}
              aria-hidden="true"
            />
            <span
              className="w-1 h-1 bg-purple-500 rounded-full animate-smooth-bounce shadow-sm"
              style={{ animationDelay: '200ms' }}
              aria-hidden="true"
            />
            <span
              className="w-1 h-1 bg-purple-500 rounded-full animate-smooth-bounce shadow-sm"
              style={{ animationDelay: '400ms' }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Result content below avatar (when complete) */}
      {showResult && resultContent && (
        <div className="animate-in fade-in duration-500">
          {resultContent}
        </div>
      )}
    </div>
  )
}
