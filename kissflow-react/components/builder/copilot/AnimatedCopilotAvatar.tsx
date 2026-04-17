'use client'

import { Bot, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AnimationType = 'pulse' | 'spin' | 'morph' | 'none'

interface AnimatedCopilotAvatarProps {
  animationType?: AnimationType
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AnimatedCopilotAvatar({
  animationType = 'pulse',
  size = 'sm',
  className
}: AnimatedCopilotAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const baseClasses = cn(
    'rounded-full flex items-center justify-center flex-shrink-0',
    sizeClasses[size],
    className
  )

  // Pulse animation (default) - Static Bot icon (no pulse on avatar, just icon)
  if (animationType === 'pulse') {
    return (
      <div
        aria-label="AI assistant is processing"
        className={cn(
          baseClasses,
          'border border-purple-200 bg-purple-50'
        )}
      >
        <Bot className={cn(iconSizes[size], 'text-purple-600 fill-purple-600')} />
      </div>
    )
  }

  // Spin animation - Static Bot icon (keep consistent)
  if (animationType === 'spin') {
    return (
      <div
        aria-label="AI assistant is processing"
        className={cn(
          baseClasses,
          'border border-purple-200 bg-purple-50'
        )}
      >
        <Bot className={cn(iconSizes[size], 'text-purple-600 fill-purple-600')} />
      </div>
    )
  }

  // Morph animation - Static Bot icon (keep consistent)
  if (animationType === 'morph') {
    return (
      <div
        aria-label="AI assistant is processing"
        className={cn(
          baseClasses,
          'border border-purple-200 bg-purple-50'
        )}
      >
        <Bot className={cn(iconSizes[size], 'text-purple-600 fill-purple-600')} />
      </div>
    )
  }

  // None - static avatar
  return (
    <div
      aria-label="AI assistant"
      className={cn(
        baseClasses,
        'border border-purple-200 bg-purple-50'
      )}
    >
      <Bot className={cn(iconSizes[size], 'text-purple-600 fill-purple-600')} />
    </div>
  )
}
