'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STEP_DURATION = 10000 // 10 seconds per step (60 seconds total / 6 steps)
const TOTAL_STEPS = 6

interface CreationStep {
  title: string
  description: string
  progress: number
}

const CREATION_STEPS: CreationStep[] = [
  {
    title: 'Creating roles',
    description: 'Defining user permissions and roles',
    progress: 16,
  },
  {
    title: 'Create data entities',
    description: 'Setting up data models',
    progress: 33,
  },
  {
    title: 'Creating views',
    description: 'Building visualization views',
    progress: 50,
  },
  {
    title: 'Creating reports',
    description: 'Generating analytics and reports',
    progress: 67,
  },
  {
    title: 'Creating pages',
    description: 'Designing custom pages',
    progress: 83,
  },
  {
    title: 'Finalising app',
    description: 'Finalizing app configurations',
    progress: 100,
  },
]

export function LoaderDemoView() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  // Get the appropriate SVG for the current step
  const getSvgForStep = (stepIndex: number): string => {
    switch (stepIndex) {
      case 0: // Creating roles
        return '/role-creation-loader.svg'
      case 1: // Creating data
        return '/data-entity-loader.svg'
      case 2: // Creating views
        return '/view-loader.svg'
      default:
        return '/ai-app-loader.svg'
    }
  }

  // Determine the state of each step
  const getStepState = (stepIndex: number): 'pending' | 'active' | 'completed' => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'active'
    return 'pending'
  }

  // Render the appropriate icon based on step state
  const renderStepIcon = (stepIndex: number) => {
    const state = getStepState(stepIndex)

    switch (state) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />
      case 'active':
        return <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
      case 'pending':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />
    }
  }

  useEffect(() => {
    console.log('🎨 LoaderDemoView mounted - Starting animation loop')

    // Simple interval to advance through steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = (prev + 1) % TOTAL_STEPS
        console.log(`➡️ Moving from step ${prev} to step ${nextStep}`)
        return nextStep
      })
    }, STEP_DURATION)

    return () => {
      clearInterval(stepInterval)
    }
  }, [])

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
        <div className="w-[240px] h-[192px] mb-6">
          <img
            src={getSvgForStep(currentStep)}
            alt="Creating app"
            className="w-full h-full object-contain"
            key={currentStep}
          />
        </div>

        {/* Steps List */}
        <div className="w-full max-w-[480px] space-y-3">
          {CREATION_STEPS.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-3"
            >
              {/* Left Icon */}
              <div className="flex-shrink-0 w-4 h-4 mt-0.5 flex items-center justify-center">
                {renderStepIcon(index)}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-[14px] font-medium text-gray-900">
                  {step.title}
                </h3>
                <p className="text-[12px] text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
