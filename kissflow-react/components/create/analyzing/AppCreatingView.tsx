'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const CREATING_DURATION = 15000 // 15 seconds total
const STEP_DURATION = CREATING_DURATION / 4 // Each step takes 3.75 seconds

interface ProgressStep {
  label: string
  status: 'pending' | 'in_progress' | 'completed'
}

interface AppCreatingViewProps {
  appName: string
  onComplete: () => void
}

export function AppCreatingView({ appName, onComplete }: AppCreatingViewProps) {
  const [steps, setSteps] = useState<ProgressStep[]>([
    { label: 'Generating roles', status: 'pending' },
    { label: 'Generating data artefacts', status: 'pending' },
    { label: 'Generating views & reports', status: 'pending' },
    { label: 'Generating pages', status: 'pending' },
  ])

  useEffect(() => {
    // Start with first step in progress
    setSteps(prev => prev.map((step, idx) => ({
      ...step,
      status: idx === 0 ? 'in_progress' : 'pending'
    })))

    // Progress through steps
    const timers: NodeJS.Timeout[] = []

    for (let i = 0; i < 4; i++) {
      // Complete current step and start next
      const timer = setTimeout(() => {
        setSteps(prev => prev.map((step, idx) => {
          if (idx < i + 1) {
            return { ...step, status: 'completed' }
          } else if (idx === i + 1) {
            return { ...step, status: 'in_progress' }
          }
          return step
        }))
      }, STEP_DURATION * (i + 1))

      timers.push(timer)
    }

    // Complete all and trigger onComplete
    const completeTimer = setTimeout(() => {
      onComplete()
    }, CREATING_DURATION)

    timers.push(completeTimer)

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [onComplete])

  return (
    <div
      className="min-h-[calc(100vh-3.5rem)] p-6 flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #FDF2F8 0%, #F5F3FF 50%, #EDE9FE 100%)',
      }}
    >
      {/* Orbital Animation */}
      <div className="w-[300px] h-[300px] mb-8">
        <img
          src="/orbital-loader.svg"
          alt="Creating app"
          className="w-full h-full"
        />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
        Your <span className="text-purple-600">{appName}</span> app is being created
      </h1>

      {/* Estimated Time */}
      <p className="text-sm text-gray-600 mb-2">
        Estimated time: 3-4 minutes
      </p>

      {/* Note */}
      <p className="text-xs text-gray-500 mb-8">
        (Created application will open in a new tab)
      </p>

      {/* Progress Steps */}
      <div className="flex flex-col gap-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            {/* Status Indicator */}
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300',
                step.status === 'completed' && 'bg-green-500',
                step.status === 'in_progress' && 'bg-purple-500',
                step.status === 'pending' && 'bg-gray-200'
              )}
            >
              {step.status === 'completed' ? (
                <Check className="w-3 h-3 text-white" />
              ) : step.status === 'in_progress' ? (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              ) : null}
            </div>

            {/* Step Label */}
            <span
              className={cn(
                'text-sm transition-colors duration-300',
                step.status === 'completed' && 'text-green-600',
                step.status === 'in_progress' && 'text-purple-600 font-medium',
                step.status === 'pending' && 'text-gray-400'
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
