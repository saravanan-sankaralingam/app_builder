'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface LoadingProgressIndicatorProps {
  stages: string[]
  totalDuration: number
  onComplete?: () => void
  className?: string
}

export function LoadingProgressIndicator({
  stages,
  totalDuration,
  onComplete,
  className
}: LoadingProgressIndicatorProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (stages.length === 0) return

    const stageDuration = totalDuration / stages.length

    const interval = setInterval(() => {
      setIsVisible(false) // Fade out

      setTimeout(() => {
        setCurrentStageIndex(prev => {
          const nextIndex = prev + 1

          // If we've completed all stages, call onComplete
          if (nextIndex >= stages.length) {
            clearInterval(interval)
            onComplete?.()
            return prev // Stay on last stage
          }

          return nextIndex
        })
        setIsVisible(true) // Fade in
      }, 200) // 200ms fade transition
    }, stageDuration)

    return () => clearInterval(interval)
  }, [stages, totalDuration, onComplete])

  if (stages.length === 0) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "text-[12px] text-gray-600 transition-opacity duration-200",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      <span className="sr-only">Loading: </span>
      {stages[currentStageIndex]}
    </div>
  )
}
