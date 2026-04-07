'use client'

import { useEffect } from 'react'
import { ArrowLeft, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AISuggestionResult } from '../conversation/types'

const ANALYZING_DURATION = 5000 // 5 seconds

function MorphingBlobAnimation() {
  return (
    <div className="relative w-48 h-48 mb-8">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full animate-blob-morph"
      >
        <defs>
          <linearGradient id="blob-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC4899">
              <animate
                attributeName="stop-color"
                values="#EC4899;#A855F7;#EC4899"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#A855F7">
              <animate
                attributeName="stop-color"
                values="#A855F7;#EC4899;#A855F7"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
          <filter id="blob-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* Main morphing blob */}
        <path
          fill="url(#blob-gradient)"
          filter="url(#blob-blur)"
        >
          <animate
            attributeName="d"
            dur="8s"
            repeatCount="indefinite"
            values="
              M100,30 C140,30 170,60 170,100 C170,140 140,170 100,170 C60,170 30,140 30,100 C30,60 60,30 100,30;
              M100,25 C150,40 175,70 165,110 C155,150 120,175 80,165 C40,155 25,120 35,80 C45,40 50,10 100,25;
              M100,35 C135,25 175,55 170,95 C165,135 135,175 95,170 C55,165 25,135 30,95 C35,55 65,45 100,35;
              M100,30 C140,30 170,60 170,100 C170,140 140,170 100,170 C60,170 30,140 30,100 C30,60 60,30 100,30
            "
          />
        </path>

        {/* Inner glow layer */}
        <circle cx="100" cy="100" r="40" fill="white" opacity="0.3">
          <animate
            attributeName="r"
            values="35;45;35"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.2;0.4;0.2"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* Floating particles - Outer orbit (slow) */}
      <div className="absolute inset-0 animate-spin-slow">
        <div className="absolute -top-2 left-1/2 w-2.5 h-2.5 bg-purple-400 rounded-full opacity-70" />
        <div className="absolute top-1/4 -right-2 w-2 h-2 bg-pink-400 rounded-full opacity-60" />
        <div className="absolute -bottom-1 left-1/3 w-2 h-2 bg-purple-300 rounded-full opacity-50" />
        <div className="absolute top-1/3 -left-1 w-1.5 h-1.5 bg-pink-300 rounded-full opacity-60" />
      </div>

      {/* Floating particles - Inner orbit (faster, reverse) */}
      <div className="absolute inset-4 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '12s' }}>
        <div className="absolute top-0 right-1/4 w-1.5 h-1.5 bg-purple-500 rounded-full opacity-80" />
        <div className="absolute bottom-1/4 left-0 w-2 h-2 bg-pink-500 rounded-full opacity-70" />
        <div className="absolute top-1/2 right-0 w-1 h-1 bg-purple-400 rounded-full opacity-60" />
      </div>

      {/* Floating particles - Middle orbit */}
      <div className="absolute inset-2 animate-spin-slow" style={{ animationDuration: '15s' }}>
        <div className="absolute bottom-0 right-1/3 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-purple-300 rounded-full opacity-40" />
      </div>
    </div>
  )
}

interface AIAnalyzingViewProps {
  prompt: string
  onComplete: (suggestion: AISuggestionResult) => void
  onBack: () => void
}

export function AIAnalyzingView({ prompt, onComplete, onBack }: AIAnalyzingViewProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const suggestion = generateMockSuggestion(prompt)
      onComplete(suggestion)
    }, ANALYZING_DURATION)

    return () => clearTimeout(timer)
  }, [prompt, onComplete])

  return (
    <div
      className="min-h-[calc(100vh-3.5rem)] p-6 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #FDF2F8 0%, #F5F3FF 50%, #EDE9FE 100%)',
      }}
    >
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 shadow-sm"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      {/* Centered Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl w-full">
          {/* Centered Animation */}
          <div className="flex flex-col items-center justify-center">
            {/* Morphing Blob Animation */}
            <MorphingBlobAnimation />

            {/* Text */}
            <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-6">
              AI is analysing your app requirement
            </p>

            {/* Abort Button */}
            <Button
              variant="ghost"
              onClick={onBack}
              className="h-[30px] rounded-full bg-destructive-100 text-destructive-500 hover:bg-destructive-500 hover:text-white text-[14px] font-medium transition-colors"
            >
              <Ban className="h-3.5 w-3.5 mr-0.5" />
              Abort
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock suggestion generator based on prompt
function generateMockSuggestion(prompt: string): AISuggestionResult {
  const lowerPrompt = prompt.toLowerCase()

  if (lowerPrompt.includes('leave') || lowerPrompt.includes('vacation') || lowerPrompt.includes('pto')) {
    return {
      appName: 'Leave Management System',
      appDescription: 'A comprehensive leave management application that allows employees to request time off, managers to approve or reject requests, and HR to track leave balances and generate reports.'
    }
  }

  if (lowerPrompt.includes('expense') || lowerPrompt.includes('reimbursement')) {
    return {
      appName: 'Expense Tracker',
      appDescription: 'An expense management app for submitting, tracking, and approving expense reports with receipt uploads, category management, and budget tracking capabilities.'
    }
  }

  if (lowerPrompt.includes('project') || lowerPrompt.includes('task')) {
    return {
      appName: 'Project Management Hub',
      appDescription: 'A project management application to organize tasks, track progress, manage team assignments, and monitor project timelines with visual dashboards.'
    }
  }

  if (lowerPrompt.includes('customer') || lowerPrompt.includes('feedback') || lowerPrompt.includes('survey')) {
    return {
      appName: 'Customer Feedback Portal',
      appDescription: 'A feedback collection system to gather customer insights, manage surveys, analyze responses, and track satisfaction scores over time.'
    }
  }

  if (lowerPrompt.includes('onboarding') || lowerPrompt.includes('employee') || lowerPrompt.includes('hr')) {
    return {
      appName: 'Employee Onboarding',
      appDescription: 'A streamlined onboarding application to manage new hire documentation, training schedules, task checklists, and orientation progress tracking.'
    }
  }

  if (lowerPrompt.includes('inventory') || lowerPrompt.includes('stock') || lowerPrompt.includes('warehouse')) {
    return {
      appName: 'Inventory Management',
      appDescription: 'An inventory tracking system to monitor stock levels, manage suppliers, track orders, and generate low-stock alerts with barcode scanning support.'
    }
  }

  // Default suggestion
  const words = prompt.split(' ').slice(0, 3).join(' ')
  return {
    appName: `${words.charAt(0).toUpperCase() + words.slice(1)} App`,
    appDescription: `A custom application based on your requirements: ${prompt.slice(0, 150)}${prompt.length > 150 ? '...' : ''}`
  }
}
