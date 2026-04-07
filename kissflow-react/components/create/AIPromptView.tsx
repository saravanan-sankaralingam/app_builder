'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowUp, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react'

interface AIPromptViewProps {
  onBack: () => void
  onStartOver: () => void
  onSubmit: (prompt: string, attachments: File[]) => void
}

const MAX_CHARACTERS = 1000
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_FILE_TYPES = '.png,.jpg,.jpeg,.gif,.webp,.svg,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json,.md'

const SUGGESTED_APPS = [
  {
    label: 'Build an expense reporting app with manager approvals',
    prompt: 'I want to build an Expense Reporting app. Employees should be able to log expenses, upload receipts, and submit for approval. Managers can review and approve expenses.',
  },
  {
    label: 'Create a leave management system for my team',
    prompt: 'I want to build a Leave Management app where employees can request time off and managers can approve or reject requests.',
  },
  {
    label: 'Build an employee onboarding workflow tracking app',
    prompt: 'I want to build an Employee Onboarding app to manage new hire tasks, document collection, training schedules, and orientation checklists.',
  },
  {
    label: 'Create a customer feedback collection and analysis app',
    prompt: 'I want to build a Customer Feedback Tracker to collect, categorize, and analyze customer feedback with ratings and response management.',
  },
]

export function AIPromptView({ onBack, onStartOver, onSubmit }: AIPromptViewProps) {
  const [prompt, setPrompt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [showPlaceholderWarning, setShowPlaceholderWarning] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // No auto-resize - use fixed height with scroll
  // The textarea will maintain its size and scroll when content overflows

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Get appropriate icon for file type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4 text-purple-500" />
    }
    return <FileText className="h-4 w-4 text-blue-500" />
  }

  // Handle file selection from input or drop
  const handleFileSelect = (files: FileList) => {
    const newFiles = Array.from(files).filter(file => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        console.warn(`File ${file.name} exceeds maximum size of 10MB`)
        return false
      }
      // Check if file already exists
      if (attachments.some(existing => existing.name === file.name && existing.size === file.size)) {
        return false
      }
      return true
    })
    setAttachments(prev => [...prev, ...newFiles])
  }

  // Remove attachment by index
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  // Drag event handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set false if we're leaving the drop zone entirely
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    if (!prompt.trim()) {
      setShowPlaceholderWarning(true)
      textareaRef.current?.focus()
      setTimeout(() => setShowPlaceholderWarning(false), 3000)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(prompt.trim(), attachments)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSuggestionClick = (promptText: string) => {
    setPrompt(promptText)
    textareaRef.current?.focus()
  }

  const charactersUsed = prompt.length
  const isOverLimit = charactersUsed > MAX_CHARACTERS
  const canSubmit = prompt.trim().length > 0 && !isOverLimit && !isSubmitting

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
      <div className="flex-1 flex items-start justify-center pt-[15vh]">
        <div className="max-w-3xl w-full">
          {/* Title */}
          <div className="text-center mb-1">
            <h1 className="text-2xl font-semibold text-gray-900">
              Create an app using{' '}
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                AI
              </span>
              {' '}
              <span
                className="inline-block w-6 h-6 align-middle relative -top-0.5"
                style={{
                  background: 'linear-gradient(to right, #EC4899, #9333EA)',
                  WebkitMaskImage: 'url(/ic_magic_wand.svg)',
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskImage: 'url(/ic_magic_wand.svg)',
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                }}
              />
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-center text-base text-gray-700 mb-8">
            Describe your vision and our AI will build it for you
          </p>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            accept={ACCEPTED_FILE_TYPES}
            multiple
            hidden
          />

          {/* Prompt Box */}
          <div
            className={`relative rounded-xl p-[2px] mb-6 transition-opacity duration-200 ${isSubmitting ? 'opacity-50' : ''}`}
            style={{
              background: 'linear-gradient(135deg, #F9A8D4, #D8B4FE, #F9A8D4)',
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className={`relative bg-white rounded-[10px] flex flex-col ${isSubmitting ? 'pointer-events-none' : ''}`}>
              {/* Textarea - full width */}
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value)
                  if (showPlaceholderWarning) setShowPlaceholderWarning(false)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Describe the app you want to build..."
                className={`w-full h-[86px] p-4 pb-1 resize-none border-0 focus:outline-none focus:ring-0 text-[14px] text-gray-900 placeholder:text-gray-400 overflow-y-auto ${showPlaceholderWarning ? 'animate-shake' : ''}`}
                disabled={isSubmitting}
                autoFocus
              />

              {/* Bottom Action Bar */}
              <div className="flex items-center gap-2 px-2 pb-2">
                {/* Attachment Button with Tooltip */}
                <div className="group relative">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Paperclip className="h-4 w-4 text-gray-700" strokeWidth={1.5} />
                  </button>
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-gray-800 rounded-lg shadow-lg z-20 whitespace-nowrap">
                    Attach files (max 10MB)
                    <div className="absolute left-3 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
                  </div>
                </div>

                {/* Attachment Chips */}
                {attachments.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full"
                  >
                    {getFileIcon(file)}
                    <span className="text-xs text-gray-700 truncate max-w-[100px]" title={file.name}>
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-0.5 rounded-full hover:bg-gray-200 transition-colors"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                ))}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Character Counter */}
                <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-700'}`}>
                  {charactersUsed}/{MAX_CHARACTERS}
                </span>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>

              {/* Drag overlay */}
              {isDragging && (
                <div className="absolute inset-0 bg-purple-50/95 border-2 border-dashed border-purple-400 rounded-[10px] flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <Paperclip className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-purple-600 font-medium">Drop files here</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Suggested Apps */}
          <div className="mb-8">
            <p className="text-[10px] text-gray-700 uppercase text-center mb-3">
              Get started with below examples
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_APPS.map((app) => (
                <button
                  key={app.label}
                  type="button"
                  onClick={() => handleSuggestionClick(app.prompt)}
                  className="px-3 py-1.5 text-xs rounded-full border border-purple-300 text-gray-900 hover:bg-white/25 hover:shadow-sm transition-all duration-150"
                >
                  {app.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
