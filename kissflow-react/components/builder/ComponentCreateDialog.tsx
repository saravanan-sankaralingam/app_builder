'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Loader2, Component, Sparkles, PenLine, ArrowLeft, FileText, Form } from 'lucide-react'

const MAX_PROMPT_LENGTH = 250

interface ComponentCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    description?: string
    prompt?: string
    method: 'ai' | 'scratch'
    componentType?: 'page' | 'form'
  }) => void
  isLoading?: boolean
  externalError?: string | null
}

export function ComponentCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  externalError = null,
}: ComponentCreateDialogProps) {
  const [step, setStep] = useState<'method' | 'details'>('method')
  const [selectedMethod, setSelectedMethod] = useState<'ai' | 'scratch' | null>(null)
  const [selectedType, setSelectedType] = useState<'page' | 'form' | null>('page')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState('')

  const creationMethods = [
    {
      id: 'ai' as const,
      icon: Sparkles,
      iconColor: '#9333EA',
      title: 'Build with AI',
      description: 'Describe your component and let AI generate it for you.',
    },
    {
      id: 'scratch' as const,
      icon: PenLine,
      iconColor: '#2563EB',
      title: 'Create from scratch',
      description: 'Build your component manually with full control.',
    },
  ]

  const componentTypes = [
    {
      id: 'page' as const,
      icon: FileText,
      label: 'Page',
    },
    {
      id: 'form' as const,
      icon: Form,
      label: 'Form',
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedType) {
      return // Type is required for both methods
    }

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    if (!selectedMethod) return

    onSubmit({
      name: name.trim(),
      description: selectedMethod === 'scratch' ? (description.trim() || undefined) : undefined,
      prompt: selectedMethod === 'ai' ? (prompt.trim() || undefined) : undefined,
      method: selectedMethod,
      componentType: selectedType || undefined,
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setStep('method')
      setSelectedMethod(null)
      setSelectedType(null)
      setName('')
      setDescription('')
      setPrompt('')
      setError('')
    }
    onOpenChange(newOpen)
  }

  const handleMethodSelect = (methodId: 'ai' | 'scratch') => {
    setSelectedMethod(methodId)
    setStep('details')
  }

  const handleBack = () => {
    setStep('method')
    setSelectedMethod(null)
    setSelectedType(null)
  }

  const getDialogTitle = () => {
    switch (step) {
      case 'method':
        return 'How do you wish to create the Component?'
      case 'details':
        return 'Create Component'
      default:
        return 'Create Component'
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn(
        '!bg-white',
        step === 'method' ? 'sm:max-w-[520px]' : 'sm:max-w-[480px]'
      )}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-purple-500">
              <Component className="h-4 w-4 text-white" />
            </div>
            <DialogTitle className="text-base font-semibold">
              {getDialogTitle()}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Step 1: Method Selection */}
        {step === 'method' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {creationMethods.map((method) => {
              const Icon = method.icon
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => handleMethodSelect(method.id)}
                  className="group relative flex flex-col items-start text-left p-5 min-h-[180px] rounded-2xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-200 ease-out cursor-pointer"
                >
                  <Icon className="h-6 w-6 mb-4" style={{ color: method.iconColor }} fill={method.iconColor} />
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    {method.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {method.description}
                  </p>
                </button>
              )
            })}
          </div>
        )}

        {/* Step 2: Details Form */}
        {step === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {/* Component Type Selection (for both methods) */}
            <div className="space-y-1">
              <Label className="text-sm text-gray-600">Component Type</Label>
              <div className="flex gap-3">
                {componentTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        'flex flex-col items-center justify-center w-[60px] p-2 rounded-lg border transition-all cursor-pointer',
                        selectedType === type.id
                          ? 'border-blue-500 bg-white shadow-[0_0_0_2px_rgba(219,234,254,1)]'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-6 w-6 mb-1',
                          selectedType === type.id ? 'text-blue-600' : 'text-gray-500'
                        )}
                        strokeWidth={1}
                      />
                      <span className={cn(
                        'text-[11px]',
                        selectedType === type.id ? 'text-blue-700' : 'text-gray-900'
                      )}>
                        {type.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="component-name" className="text-sm text-gray-600">
                Name
              </Label>
              <Input
                id="component-name"
                placeholder="Enter component name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                className={cn(
                  'h-10',
                  error && 'border-red-500 focus-visible:ring-red-500'
                )}
                autoFocus
                disabled={isLoading}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              {externalError && <p className="text-sm text-red-500">{externalError}</p>}
            </div>

            {/* Description (for scratch method) */}
            {selectedMethod === 'scratch' && (
              <div className="space-y-1">
                <Label htmlFor="component-description" className="text-sm text-gray-600">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="component-description"
                  placeholder="Describe what this component is for"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="resize-none"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Prompt (for AI method) */}
            {selectedMethod === 'ai' && (
              <div className="space-y-1">
                <Label htmlFor="component-prompt" className="text-sm text-gray-600">
                  Describe the process you want to create
                </Label>
                <Textarea
                  id="component-prompt"
                  placeholder="E.g., A form to collect customer feedback with rating, comments, and email fields..."
                  value={prompt}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_PROMPT_LENGTH) {
                      setPrompt(e.target.value)
                    }
                  }}
                  rows={6}
                  className="resize-none"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-400 text-right">
                  {MAX_PROMPT_LENGTH - prompt.length} characters left
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  className="h-9"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || !selectedType}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
