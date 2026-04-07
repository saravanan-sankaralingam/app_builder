'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Paperclip, X, Sparkles, LayoutGrid, Check } from 'lucide-react'
import { AIScanningDialog } from './AIScanningDialog'
import { AppReviewDialog } from './AppReviewDialog'
import { createApp } from '@/lib/api/apps'

interface AIPromptViewNewProps {
  onBack: () => void
  onSubmit: (prompt: string, attachments: File[]) => void
  onAppCreate?: (data: { name: string; description: string; icon: string; iconBg: string }) => void
}

const MAX_CHARACTERS = 3000
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_FILE_TYPES = '.pdf,.csv,.xls,.xlsx,.png,.jpg,.jpeg'

const PLACEHOLDER_TEXT = `For example, create a leave request process where an employee submits a form with their requested dates. The request goes to their manager, who can either approve or deny it. The employee should receive an email notification with the final decision.`

export function AIPromptViewNew({ onBack, onSubmit, onAppCreate }: AIPromptViewNewProps) {
  const [prompt, setPrompt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [showScanningDialog, setShowScanningDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showCreatingScreen, setShowCreatingScreen] = useState(false)
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)
  const [generatedAppName, setGeneratedAppName] = useState('')
  const [generatedAppDescription, setGeneratedAppDescription] = useState('')
  const [createdAppName, setCreatedAppName] = useState('')
  const [createdAppId, setCreatedAppId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Get file icon path based on file extension
  const getFileIconPath = (file: File): string => {
    const extension = file.name.split('.').pop()?.toLowerCase() || ''

    switch (extension) {
      case 'pdf':
        return '/icons/file-pdf.svg'
      case 'xls':
      case 'xlsx':
        return '/icons/file-xls.svg'
      case 'csv':
        return '/icons/file-csv.svg'
      case 'png':
        return '/icons/file-png.svg'
      case 'jpg':
      case 'jpeg':
        return '/icons/file-jpg.svg'
      default:
        return '/icons/file-default.svg'
    }
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

    // Need either prompt or attachments
    if (!prompt.trim() && attachments.length === 0) {
      textareaRef.current?.focus()
      return
    }

    // Show scanning dialog
    setShowScanningDialog(true)
  }

  const handleScanningComplete = useCallback(() => {
    setShowScanningDialog(false)

    // Generate app name and description - prioritize document over prompt
    let appName = 'My App'
    let appDescription = 'An app generated from your requirements'

    if (attachments.length > 0) {
      // Extract name from filename (remove extension and clean up)
      const fileName = attachments[0].name
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[_-]/g, ' ')    // Replace underscores and hyphens with spaces
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capitals (camelCase)
        .trim()

      appName = fileName.charAt(0).toUpperCase() + fileName.slice(1)
      appDescription = `App generated from ${attachments[0].name}`
    } else if (prompt.trim()) {
      // Use first few words from prompt as name
      const words = prompt.trim().split(' ').slice(0, 4).join(' ').replace(/[^\w\s]/g, '')
      appName = words.charAt(0).toUpperCase() + words.slice(1) || 'My App'
      appDescription = prompt.trim()
    }

    setGeneratedAppName(appName)
    setGeneratedAppDescription(appDescription)
    setShowReviewDialog(true)
  }, [prompt, attachments])

  const handleScanningAbort = () => {
    setShowScanningDialog(false)
  }

  const handleReviewCancel = () => {
    setShowReviewDialog(false)
  }

  const handleCreateApp = async (data: { name: string; description: string; icon: string; iconBg: string }) => {
    setShowReviewDialog(false)
    setCreatedAppName(data.name)
    setShowCreatingScreen(true)

    const startTime = Date.now()

    try {
      // Call API to create the app
      const newApp = await createApp({
        name: data.name,
        description: data.description,
        icon: data.icon,
        iconBg: data.iconBg,
      })

      setCreatedAppId(newApp.id)

      // Ensure minimum 10 seconds of loading screen for consistent UX
      const elapsed = Date.now() - startTime
      const remainingTime = Math.max(0, 10000 - elapsed)

      setTimeout(() => {
        setShowCreatingScreen(false)
        setShowSuccessScreen(true)
      }, remainingTime)
    } catch (error) {
      console.error('Failed to create app:', error)
      // For now, still show success after 10 seconds (mock behavior)
      // In production, would show error state
      setTimeout(() => {
        setShowCreatingScreen(false)
        setShowSuccessScreen(true)
      }, 10000)
    }

    if (onAppCreate) {
      onAppCreate(data)
    }
  }

  const handleOpenApp = () => {
    // Open builder in new tab
    if (createdAppId) {
      window.open(`/builder/${createdAppId}`, '_blank')
    }

    // Reset all states and go back to selection screen
    setShowSuccessScreen(false)
    setCreatedAppId(null)
    setCreatedAppName('')
    setPrompt('')
    setAttachments([])
    setGeneratedAppName('')
    setGeneratedAppDescription('')
    onBack()
  }

  const charactersLeft = MAX_CHARACTERS - prompt.length
  const isOverLimit = charactersLeft < 0
  const canSubmit = (prompt.trim().length > 0 || attachments.length > 0) && !isOverLimit && !isSubmitting

  // Progress Screen - shown while app is being created
  if (showCreatingScreen) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-[#FDF8FC] p-6 flex flex-col">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="w-11 h-11 rounded-full bg-white hover:bg-gray-50 shadow-sm border border-gray-200"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Button>

        {/* Centered Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            {/* Orbital Loader */}
            <div className="mb-8">
              <img
                src="/orbital-loader.svg"
                alt="Creating app"
                className="w-[200px] h-[200px]"
              />
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Your {createdAppName} app is being created
            </h2>

            {/* Subtitle */}
            <p className="text-sm text-gray-500">
              (Created application will open in a new tab)
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Success Screen - shown when app is created successfully
  if (showSuccessScreen) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-[#FDF8FC] p-6 flex flex-col">
        {/* Centered Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center max-w-[320px]">
            {/* Green Checkmark */}
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-white" />
            </div>

            {/* Success Message */}
            <p className="text-base text-gray-700 text-center mb-4">
              Your app, <span className="font-medium">{createdAppName}</span>, is created successfully!
            </p>

            {/* Open App Button */}
            <Button
              onClick={handleOpenApp}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
            >
              Open app
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#FDF8FC] p-6 flex flex-col">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="w-11 h-11 rounded-full bg-white hover:bg-gray-50 shadow-sm border border-gray-200"
      >
        <ArrowLeft className="h-5 w-5 text-gray-600" />
      </Button>

      {/* Centered Content */}
      <div className="flex-1 flex items-start justify-center pt-[10vh]">
        <div className="max-w-[620px] w-full">
          {/* Title */}
          <div className="flex items-center gap-2 mb-8">
            <LayoutGrid className="w-5 h-5 text-pink-500" />
            <h1 className="text-xl font-semibold text-gray-900">
              How would you like to build this app?{' '}
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                AI
              </span>
            </h1>
          </div>

          {/* BRD Upload Section */}
          <div className="mb-6">
            <div className="mb-1">
              <span className="text-sm font-medium text-gray-900">Turn your BRDs into a app</span>
            </div>
            <p className="text-gray-700 mb-3" style={{ fontSize: '11px' }}>
              Supported formats: PDF, CSV, PNG, JPG, or JPEG.
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

            {/* Upload Box */}
            <div
              className={`relative rounded-lg transition-colors overflow-hidden h-[60px] ${
                attachments.length > 0
                  ? 'border border-gray-200 bg-white'
                  : isDragging
                    ? 'border border-dashed border-purple-400 bg-purple-50'
                    : 'border border-dashed border-purple-300 bg-white'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {/* AI icon - top left with triangular gradient background (only show when no files) */}
              {attachments.length === 0 && (
                <div
                  className="absolute top-0 left-0 w-[30px] h-[30px] z-10"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251, 207, 232, 0.7) 0%, rgba(221, 214, 254, 0.7) 50%, transparent 50%)',
                  }}
                >
                  <Sparkles className="w-3 h-3 text-purple-500 absolute top-1 left-1" />
                </div>
              )}

              {/* Empty state - Center content */}
              {attachments.length === 0 && (
                <>
                  <div className="flex flex-col items-center justify-center h-full">
                    {/* Attach button and text - centered */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm mb-1"
                    >
                      <Paperclip className="w-4 h-4" />
                      Attach
                    </button>
                    <span className="text-gray-600" style={{ fontSize: '10px' }}>Drag and drop or paste from clipboard</span>
                  </div>

                  {/* BRDs button - absolute right */}
                  <div className="absolute top-1/2 right-4 -translate-y-1/2">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-pink-100 border border-pink-200 rounded-lg hover:bg-pink-150 transition-colors"
                    >
                      BRDs
                    </button>
                  </div>
                </>
              )}

              {/* File list state - when files are attached */}
              {attachments.length > 0 && (
                <div className="h-full flex items-center px-3">
                  {attachments.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-2">
                        {/* File icon */}
                        <img
                          src={getFileIconPath(file)}
                          alt={file.name}
                          className="w-6 h-8"
                        />
                        {/* File info */}
                        <div className="flex flex-col">
                          <span className="text-gray-600 truncate max-w-[280px]" style={{ fontSize: '12px' }} title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-gray-300" style={{ fontSize: '10px' }}>
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      </div>
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="w-5 h-5 rounded-full bg-gray-500 hover:bg-gray-600 flex items-center justify-center transition-colors"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-900">Or describe the app you want AI to build</span>
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={PLACEHOLDER_TEXT}
            className={`w-full h-[160px] p-4 resize-none border border-purple-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 text-sm text-gray-900 placeholder:text-gray-400 block ${
              isOverLimit ? 'border-red-300 focus:ring-red-300' : ''
            }`}
            disabled={isSubmitting}
          />

          {/* Character Counter */}
          <div className="mt-2 mb-3">
            <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
              {charactersLeft} characters left.
            </span>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start building
            </Button>
          </div>
        </div>
      </div>

      {/* AI Scanning Dialog */}
      <AIScanningDialog
        open={showScanningDialog}
        onClose={() => setShowScanningDialog(false)}
        onComplete={handleScanningComplete}
        onAbort={handleScanningAbort}
      />

      {/* App Review Dialog */}
      <AppReviewDialog
        open={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        onCancel={handleReviewCancel}
        onCreateApp={handleCreateApp}
        suggestedName={generatedAppName}
        suggestedDescription={generatedAppDescription}
      />
    </div>
  )
}
