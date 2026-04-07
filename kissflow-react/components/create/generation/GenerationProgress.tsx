'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2, Circle } from 'lucide-react'
import { GenerationStep, GenerationStepStatus } from '../conversation/types'

interface GenerationProgressProps {
  steps: GenerationStep[]
  onComplete: () => void
}

export function GenerationProgress({ steps, onComplete }: GenerationProgressProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [stepStatuses, setStepStatuses] = useState<GenerationStepStatus[]>(
    steps.map((_, i) => (i === 0 ? 'in-progress' : 'pending'))
  )

  useEffect(() => {
    if (currentStepIndex >= steps.length) {
      onComplete()
      return
    }

    const currentStep = steps[currentStepIndex]
    const timer = setTimeout(() => {
      // Complete current step
      setStepStatuses(prev => {
        const updated = [...prev]
        updated[currentStepIndex] = 'completed'
        // Start next step if there is one
        if (currentStepIndex + 1 < steps.length) {
          updated[currentStepIndex + 1] = 'in-progress'
        }
        return updated
      })
      setCurrentStepIndex(prev => prev + 1)
    }, currentStep.duration)

    return () => clearTimeout(timer)
  }, [currentStepIndex, steps, onComplete])

  const getStepIcon = (status: GenerationStepStatus) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center animate-in zoom-in duration-300">
            <Check className="w-4 h-4 text-white" />
          </div>
        )
      case 'in-progress':
        return (
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          </div>
        )
      case 'pending':
        return (
          <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
            <Circle className="w-3 h-3 text-gray-300" />
          </div>
        )
    }
  }

  const allCompleted = stepStatuses.every(s => s === 'completed')

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      {/* Header */}
      <div className="mb-12 text-center">
        {!allCompleted ? (
          <>
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
              <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Generating Your App...
            </h2>
            <p className="text-sm text-gray-500">
              This will only take a moment
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center animate-in zoom-in duration-300">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              App Generated!
            </h2>
            <p className="text-sm text-gray-500">
              Your app is ready to preview
            </p>
          </>
        )}
      </div>

      {/* Progress Steps */}
      <div className="w-full max-w-sm space-y-4">
        {steps.map((step, index) => {
          const status = stepStatuses[index]
          return (
            <div
              key={step.id}
              className={`
                flex items-center gap-4 p-3 rounded-lg transition-all duration-300
                ${status === 'in-progress' ? 'bg-purple-50 border border-purple-200' : ''}
                ${status === 'completed' ? 'bg-green-50 border border-green-200' : ''}
                ${status === 'pending' ? 'bg-gray-50 border border-gray-100' : ''}
              `}
            >
              {getStepIcon(status)}
              <div className="flex-1">
                <p className={`
                  font-medium text-sm
                  ${status === 'completed' ? 'text-green-700' : ''}
                  ${status === 'in-progress' ? 'text-purple-700' : ''}
                  ${status === 'pending' ? 'text-gray-400' : ''}
                `}>
                  {step.name}
                </p>
                <p className={`
                  text-xs
                  ${status === 'completed' ? 'text-green-500' : ''}
                  ${status === 'in-progress' ? 'text-purple-500' : ''}
                  ${status === 'pending' ? 'text-gray-300' : ''}
                `}>
                  {step.description}
                </p>
              </div>
              {status === 'completed' && (
                <span className="text-xs text-green-500 font-medium">Done</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
