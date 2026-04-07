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
import { Loader2, FileText, Sparkles, LayoutTemplate, PenLine, ArrowLeft } from 'lucide-react'

interface PageCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; description?: string }) => void
  isLoading?: boolean
}

export function PageCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: PageCreateDialogProps) {
  const [step, setStep] = useState<'method' | 'details'>('method')
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const creationMethods = [
    {
      id: 'ai',
      icon: Sparkles,
      iconBg: '#F3E8FF',
      iconColor: '#9333EA',
      title: 'Build with AI',
      description: 'Turn your ideas into a complete page in seconds.',
    },
    {
      id: 'template',
      icon: LayoutTemplate,
      iconBg: '#FEF3C7',
      iconColor: '#F59E0B',
      title: 'Templates',
      description: 'Install a page template from the template gallery',
    },
    {
      id: 'scratch',
      icon: PenLine,
      iconBg: '#DBEAFE',
      iconColor: '#2563EB',
      title: 'Create from scratch',
      description: 'Build your page in the page editor.',
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setStep('method')
      setSelectedMethod(null)
      setName('')
      setDescription('')
      setError('')
    }
    onOpenChange(newOpen)
  }

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
    setStep('details')
  }

  const handleBack = () => {
    setStep('method')
    setSelectedMethod(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn(
        '!bg-gradient-to-br !from-sky-50 !via-white !to-blue-50',
        step === 'method' ? 'sm:max-w-[720px]' : 'sm:max-w-[480px]'
      )}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-sky-500">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <DialogTitle className="text-base font-semibold">
              {step === 'method' ? 'How do you wish to create the Page?' : 'Create Page'}
            </DialogTitle>
          </div>
        </DialogHeader>

        {step === 'method' ? (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {creationMethods.map((method) => {
              const Icon = method.icon
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => method.id === 'scratch' && handleMethodSelect(method.id)}
                  className="group relative flex flex-col items-start text-left p-5 min-h-[180px] rounded-2xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-200 ease-out"
                >
                  {/* Icon - top left, filled */}
                  <Icon className="h-6 w-6 mb-4" style={{ color: method.iconColor }} fill={method.iconColor} />

                  {/* Title - left aligned, bold */}
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    {method.title}
                  </h3>

                  {/* Description - left aligned, gray */}
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {method.description}
                  </p>
                </button>
              )
            })}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="page-name" className="text-sm text-gray-600">
                Name
              </Label>
              <Input
                id="page-name"
                placeholder="Enter page name"
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
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="page-description" className="text-sm text-gray-600">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Textarea
                id="page-description"
                placeholder="Describe what this page is for"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
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
                disabled={isLoading}
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
