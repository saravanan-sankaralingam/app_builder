'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createApp } from '@/lib/api/apps'

const STEP_DURATION = 8571 // ~8.5 seconds per step (60 seconds total / 7 steps)
const FADE_START_OFFSET = 7571 // Start fade-out 1 second before step ends
const TOTAL_STEPS = 7

interface CreationStep {
  title: string
  description: string
  progress: number
}

const CREATION_STEPS: CreationStep[] = [
  {
    title: 'Creating roles',
    description: 'Defining user permissions and access controls for your application',
    progress: 14,
  },
  {
    title: 'Creating data',
    description: 'Setting up data models, fields, and relationships based on your requirements',
    progress: 28,
  },
  {
    title: 'Creating views',
    description: 'Building table, kanban, calendar, and gallery views to visualize your data',
    progress: 42,
  },
  {
    title: 'Creating reports',
    description: 'Generating analytics dashboards and custom reports for insights',
    progress: 57,
  },
  {
    title: 'Creating pages',
    description: 'Designing custom pages with layouts, forms, and interactive elements',
    progress: 71,
  },
  {
    title: 'Creating navigation',
    description: 'Organizing app structure with menus and navigation paths',
    progress: 85,
  },
  {
    title: 'Assembling apps',
    description: 'Finalizing configurations and preparing your app for deployment',
    progress: 100,
  },
]

interface AppCreatingViewProps {
  appName: string
  appDescription?: string
  appIcon?: string
  appIconBg?: string
  onComplete?: () => void
}

export function AppCreatingView({
  appName,
  appDescription = '',
  appIcon = 'Folder',
  appIconBg = '#6E6EDB',
  onComplete,
}: AppCreatingViewProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [animationState, setAnimationState] = useState<'entering' | 'visible' | 'exiting'>('entering')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    console.log('🚀 NEW AppCreatingView mounted - 7 steps, 60 seconds total')
    const timers: NodeJS.Timeout[] = []

    // Initial fade-in
    const initialFadeIn = setTimeout(() => {
      setAnimationState('visible')
    }, 50)
    timers.push(initialFadeIn)

    // For each step (0-6)
    for (let i = 0; i < TOTAL_STEPS; i++) {
      // Fade-out before step transition
      if (i < TOTAL_STEPS - 1) {
        const fadeOutTimer = setTimeout(() => {
          setAnimationState('exiting')
        }, FADE_START_OFFSET + i * STEP_DURATION)
        timers.push(fadeOutTimer)

        // Advance to next step
        const stepTimer = setTimeout(() => {
          setCurrentStep(i + 1)
          setAnimationState('entering')

          // Fade-in new content
          const fadeInTimer = setTimeout(() => setAnimationState('visible'), 50)
          timers.push(fadeInTimer)
        }, (i + 1) * STEP_DURATION)
        timers.push(stepTimer)
      }
    }

    // Completion timer - show success screen after last step
    const completeTimer = setTimeout(() => {
      setAnimationState('exiting')
      // After fade-out completes, show success screen
      const showSuccessTimer = setTimeout(() => {
        setShowSuccess(true)
        if (onComplete) {
          onComplete()
        }
      }, 300)
      timers.push(showSuccessTimer)
    }, TOTAL_STEPS * STEP_DURATION)
    timers.push(completeTimer)

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [onComplete])

  const handleOpenBuilder = async () => {
    setIsCreating(true)

    try {
      const newApp = await createApp({
        name: appName,
        description: appDescription,
        icon: appIcon,
        iconBg: appIconBg,
      })

      // Open builder in new tab
      window.open(`/builder/${newApp.id}`, '_blank')

      // Navigate back to explorer
      router.push('/explorer')
    } catch (error) {
      console.error('Failed to create app:', error)
      // TODO: Show error message to user (toast/alert)
    } finally {
      setIsCreating(false)
    }
  }

  const handleBackToCreate = () => {
    router.push('/create')
  }

  // Success Screen
  if (showSuccess) {
    return (
      <div
        className="min-h-[calc(100vh-3.5rem)] p-6 flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #FDF2F8 0%, #F5F3FF 50%, #EDE9FE 100%)',
        }}
      >
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
          <Check className="w-8 h-8 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
          Your <span className="text-purple-600">{appName}</span> app is ready!
        </h1>
        <p className="text-sm text-gray-600 text-center max-w-md mb-8">
          Your app has been successfully created with all the features you requested.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleBackToCreate} className="h-10 px-6">
            Back to Create
          </Button>
          <Button onClick={handleOpenBuilder} disabled={isCreating} className="h-10 px-6">
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Open App Builder'
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Creating Progress Screen
  return (
    <div
      className="min-h-[calc(100vh-3.5rem)] p-6 flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #FDF2F8 0%, #F5F3FF 50%, #EDE9FE 100%)',
      }}
    >
      {/* SVG Animation */}
      <div className="w-[300px] h-[240px] mb-8">
        <img src="/ai-app-loader.svg" alt="Creating app" className="w-full h-full object-contain" />
      </div>

      {/* Animated Title & Description */}
      <div
        className={cn(
          'transition-all duration-300 ease-out',
          animationState === 'entering' && 'opacity-0 translate-y-2',
          animationState === 'visible' && 'opacity-100 translate-y-0',
          animationState === 'exiting' && 'opacity-0 -translate-y-2'
        )}
      >
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-3">
          {CREATION_STEPS[currentStep].title}
        </h1>
        <p className="text-sm text-gray-600 text-center max-w-md mb-6">
          {CREATION_STEPS[currentStep].description}
        </p>
      </div>

      {/* Progress Percentage */}
      <div className="text-4xl font-bold text-purple-600">
        {CREATION_STEPS[currentStep].progress}%
      </div>
    </div>
  )
}
