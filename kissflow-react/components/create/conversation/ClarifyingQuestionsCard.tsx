'use client'

import { useState } from 'react'
import { ClarifyingQuestion } from './types'

interface ClarifyingQuestionsCardProps {
  questions: ClarifyingQuestion[]
  onAnswer: (answers: Record<string, string>) => void
  onSkip: () => void
}

export function ClarifyingQuestionsCard({ questions, onAnswer, onSkip }: ClarifyingQuestionsCardProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSelect = (questionId: string, optionLabel: string) => {
    if (isSubmitted) return
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionLabel
    }))
  }

  const handleContinue = () => {
    if (Object.keys(answers).length === 0) return
    setIsSubmitted(true)
    onAnswer(answers)
  }

  const handleSkip = () => {
    setIsSubmitted(true)
    onSkip()
  }

  const allQuestionsAnswered = questions.every(q => answers[q.id])

  return (
    <div className="mt-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-lg animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100">
      {/* Content */}
      <div className="p-4 space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <p className="text-sm font-medium text-gray-700">{question.question}</p>
            <div className="flex flex-wrap gap-2">
              {question.options.map((option) => {
                const isSelected = answers[question.id] === option.label
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(question.id, option.label)}
                    disabled={isSubmitted}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150
                      ${isSubmitted ? 'cursor-default' : 'cursor-pointer'}
                      ${isSelected
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {!isSubmitted && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleContinue}
            disabled={!allQuestionsAnswered}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: allQuestionsAnswered
                ? 'linear-gradient(135deg, #EC4899, #A855F7)'
                : '#E5E7EB',
            }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Submitted state */}
      {isSubmitted && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">Thanks! Generating your app...</p>
        </div>
      )}
    </div>
  )
}
