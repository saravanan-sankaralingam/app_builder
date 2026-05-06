'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TOTAL_STEPS = 6
const TOTAL_CYCLES = 1 // Play full sequence once

interface CreationStep {
  title: string
  description: string
  progress: number
  duration: number // Duration in milliseconds
}

const CREATION_STEPS: CreationStep[] = [
  {
    title: 'Creating roles',
    description: 'Defining user permissions and roles',
    progress: 16,
    duration: 24000, // 2 cycles of 12s SVG animation
  },
  {
    title: 'Create data entities',
    description: 'Setting up data models',
    progress: 33,
    duration: 48000, // 1 cycle of 48s SVG animation
  },
  {
    title: 'Creating views',
    description: 'Building visualization views',
    progress: 50,
    duration: 48000, // 2 cycles of 24s SVG animation
  },
  {
    title: 'Creating reports',
    description: 'Generating analytics and reports',
    progress: 67,
    duration: 48000, // 2 cycles of 24s SVG animation
  },
  {
    title: 'Creating pages',
    description: 'Designing custom pages',
    progress: 83,
    duration: 72000, // 2 cycles of 36s SVG animation
  },
  {
    title: 'Finalising app',
    description: 'Finalizing app configurations',
    progress: 100,
    duration: 80000, // 2 cycles of 40s SVG animation
  },
]

export function LoaderDemoView() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const stepCountRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get the appropriate SVG for the current step
  const getSvgForStep = (stepIndex: number): string => {
    switch (stepIndex) {
      case 0: // Creating roles
        return '/role-creation-loader.svg'
      case 1: // Create data entities
        return '/data-entity-loader.svg'
      case 2: // Creating views
        return '/view-loader.svg'
      case 3: // Creating reports
        return '/report-loader.svg'
      case 4: // Creating pages
        return '/page-loader.svg'
      default:
        return '/ai-app-loader.svg'
    }
  }

  useEffect(() => {
    const totalSteps = TOTAL_STEPS * TOTAL_CYCLES
    const totalDuration = CREATION_STEPS.reduce((sum, step) => sum + step.duration, 0) * TOTAL_CYCLES
    console.log(`🎨 LoaderDemoView mounted - Will play ${TOTAL_CYCLES} complete cycles (${totalSteps} total steps, ${totalDuration / 1000} seconds)`)

    // Function to schedule the next step
    const scheduleNextStep = () => {
      const currentStepIndex = currentStep
      const stepDuration = CREATION_STEPS[currentStepIndex].duration

      intervalRef.current = setTimeout(() => {
        stepCountRef.current += 1

        // Check if we've completed all cycles
        if (stepCountRef.current >= totalSteps) {
          console.log('✅ Completed all cycles, stopping animation')
          return
        }

        setCurrentStep((prev) => {
          const nextStep = (prev + 1) % TOTAL_STEPS
          const currentCycle = Math.floor(stepCountRef.current / TOTAL_STEPS) + 1

          if (nextStep === 0 && prev === TOTAL_STEPS - 1) {
            console.log(`🔁 Completed cycle ${currentCycle - 1}/${TOTAL_CYCLES}`)
          }

          console.log(`➡️ Step ${stepCountRef.current}/${totalSteps} - Moving to step ${nextStep} (Cycle ${currentCycle}/${TOTAL_CYCLES})`)
          return nextStep
        })
      }, stepDuration)
    }

    scheduleNextStep()

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [currentStep])

  const handleBack = () => {
    router.push('/create/app')
  }

  return (
    <div
      className="min-h-[calc(100vh-3.5rem)] p-6 flex flex-col items-center justify-center relative"
      style={{
        background: 'linear-gradient(180deg, #FDF2F8 0%, #F5F3FF 50%, #EDE9FE 100%)',
      }}
    >
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="w-11 h-11 bg-gray-100 hover:bg-gray-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Centered Content */}
      <div className="flex flex-col items-center w-full max-w-[640px]">

        {/* Heading */}
        <h2 className="text-[24px] font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Your Demo App app is being created
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-800 text-center max-w-md mb-8">
          We're setting up your workspace with roles, data models, views, and workflows.
          This will only take a moment.
        </p>

        {/* SVG Animation */}
        <div className="w-[240px] h-[192px] mb-[20px]">
          <img
            src={getSvgForStep(currentStep)}
            alt="Creating app"
            className="w-full h-full object-contain"
            key={currentStep}
          />
        </div>

        {/* Current Step Title & Description */}
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-[14px] font-medium text-gray-900 text-center mb-1">
            {CREATION_STEPS[currentStep].title}
          </h1>
          <p className="text-[12px] text-gray-600 text-center max-w-[240px]">
            {CREATION_STEPS[currentStep].description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-[240px]">
          <div className="h-2 bg-white/50 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 ease-out relative overflow-hidden rounded-full"
              style={{
                width: `${CREATION_STEPS[currentStep].progress}%`,
                background: 'linear-gradient(265deg, #d341a5, #6e6edb)',
              }}
            >
              <div
                className="absolute inset-0 w-full h-full animate-shimmer"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
