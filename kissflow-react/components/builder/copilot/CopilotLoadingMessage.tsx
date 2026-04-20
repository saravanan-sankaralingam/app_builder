'use client'

import { useState, useEffect } from 'react'
import { AnimatedCopilotAvatar, AnimationType } from './AnimatedCopilotAvatar'
import { LoadingProgressIndicator } from './LoadingProgressIndicator'

interface CopilotLoadingMessageProps {
  stages: string[]
  duration?: number
  stageDurations?: number[] // Individual duration for each stage
  animationType?: AnimationType
  onComplete?: () => void
  showResult?: boolean
  resultContent?: React.ReactNode
}

export function CopilotLoadingMessage({
  stages,
  duration = 5000,
  stageDurations,
  animationType = 'pulse',
  onComplete,
  showResult = false,
  resultContent
}: CopilotLoadingMessageProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (showResult || stages.length === 0) return

    // Use stageDurations if provided, otherwise split duration evenly
    const durations = stageDurations ||
      Array(stages.length).fill(duration / stages.length)

    let elapsedTime = 0
    const timers: NodeJS.Timeout[] = []

    // Set up timers for each stage transition
    durations.forEach((stageDuration, index) => {
      if (index < stages.length - 1) {
        elapsedTime += stageDuration
        const timer = setTimeout(() => {
          setIsTransitioning(true)
          // After fade-out (300ms), move to next stage
          setTimeout(() => {
            setCurrentStageIndex(index + 1)
            setIsTransitioning(false)
          }, 300)
        }, elapsedTime - 300) // Start fade-out 300ms before transition
        timers.push(timer)
      }
    })

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [stages, duration, stageDurations, showResult])

  const currentStage = stages[currentStageIndex] || stages[0]
  const isFirstStage = currentStageIndex === 0 && currentStage === 'Loading...'

  return (
    <div className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {!showResult && (
        <>
          {/* First stage: Avatar with dots NEXT TO it (horizontal) */}
          {isFirstStage && (
            <div className="flex items-center gap-2">
              <AnimatedCopilotAvatar animationType={animationType} size="sm" />
              <div className={`flex items-center gap-1 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
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
            </div>
          )}

          {/* Other stages: Avatar with text NEXT TO it (horizontal) */}
          {!isFirstStage && (
            <div className="flex items-center gap-2">
              <AnimatedCopilotAvatar animationType={animationType} size="sm" />
              <div
                className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
                role="status"
                aria-live="polite"
              >
                <span className="inline-block text-xs text-gray-600 font-normal italic animate-pulse-fade-in">
                  {currentStage}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Result content with avatar (when complete) */}
      {showResult && resultContent && (
        <div className="space-y-2">
          <AnimatedCopilotAvatar animationType={animationType} size="sm" />
          <div className="animate-in fade-in duration-500">
            {resultContent}
          </div>
        </div>
      )}
    </div>
  )
}
