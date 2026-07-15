'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Paperclip, X, Sparkles, LayoutGrid, Check } from 'lucide-react'
import { AgentScanningView } from './AgentScanningView'
import { AppCreatingView } from './AppCreatingView'

// Forked from components/create/AIPromptViewNew.tsx for the left-nav-driven
// /new/app flow. The Explorer's /create/app flow still uses the original.
// Differences from the source component:
//   - No createApp() call. Mock flow only — we'll wire the backend once the
//     design is signed off.
//   - "Open app" on the success screen just returns to method selection
//     (no new-tab Builder launch, since there's no real app to open).

interface BuildWithAIViewProps {
  onBack: () => void
}

const MAX_CHARACTERS = 3000
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_FILE_TYPES = '.pdf,.csv,.xls,.xlsx,.png,.jpg,.jpeg'

const PLACEHOLDER_TEXT = `For example, create a leave request process where an employee submits a form with their requested dates. The request goes to their manager, who can either approve or deny it. The employee should receive an email notification with the final decision.`

// MOCK: the demo flow always commits to the same polished Vendor Onboarding
// name + description once scanning finishes, regardless of what the user
// actually typed or uploaded. Swap when wiring real AI.
const MOCK_APP_NAME = 'Vendor Onboarding and Management'
const MOCK_APP_DESCRIPTION =
  'Onboard new vendors and manage existing ones end-to-end. Procurement, Legal, and Finance teams review submissions, approve partnerships, and track document renewals with clear status visibility and a complete audit trail.'

export function BuildWithAIView({ onBack }: BuildWithAIViewProps) {
  const [prompt, setPrompt] = useState('')
  const [isSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [showScanningDialog, setShowScanningDialog] = useState(false)
  const [showCreatingScreen, setShowCreatingScreen] = useState(false)
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)
  const [createdAppName, setCreatedAppName] = useState('')
  const [createdAppDescription, setCreatedAppDescription] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

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

  const handleFileSelect = (files: FileList) => {
    const newFiles = Array.from(files).filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        console.warn(`File ${file.name} exceeds maximum size of 10MB`)
        return false
      }
      if (attachments.some((existing) => existing.name === file.name && existing.size === file.size)) {
        return false
      }
      return true
    })
    setAttachments((prev) => [...prev, ...newFiles])
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

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
    if (!prompt.trim() && attachments.length === 0) {
      textareaRef.current?.focus()
      return
    }
    setShowScanningDialog(true)
  }

  // No review popover: once Requirements Analyst + Solutions Architect finish,
  // the system commits to the generated name/description itself and hands off
  // directly to the creating screen. The `AppCreatingView` mount handles the
  // seamless LeftPane centred → left-column animation so the transition looks
  // continuous with the scanning screen.
  const handleScanningComplete = useCallback(() => {
    setCreatedAppName(MOCK_APP_NAME)
    setCreatedAppDescription(MOCK_APP_DESCRIPTION)
    setShowScanningDialog(false)
    setShowCreatingScreen(true)
  }, [])

  const handleScanningAbort = () => {
    setShowScanningDialog(false)
  }

  const handleCreatingComplete = () => {
    setShowCreatingScreen(false)
    setShowSuccessScreen(true)
  }

  // Mock: no real app to open. Reset state and return to method selection.
  const handleOpenApp = () => {
    setShowSuccessScreen(false)
    setCreatedAppName('')
    setCreatedAppDescription('')
    setPrompt('')
    setAttachments([])
    onBack()
  }

  const charactersLeft = MAX_CHARACTERS - prompt.length
  const isOverLimit = charactersLeft < 0
  const canSubmit = (prompt.trim().length > 0 || attachments.length > 0) && !isOverLimit && !isSubmitting

  // Progress Screen — shown after the user confirms in the Review dialog.
  // Delegated to AppCreatingView so we can iterate on its design progressively.
  if (showCreatingScreen) {
    return (
      <AppCreatingView
        appName={createdAppName}
        appDescription={createdAppDescription}
        onBack={onBack}
        onComplete={handleCreatingComplete}
      />
    )
  }

  // Pre-creation "AI at work" screen — centred agent timeline. Once scanning
  // completes we hand off directly to AppCreatingView (no confirmation
  // popover): the system commits to the generated name/description on its own.
  if (showScanningDialog) {
    return (
      <AgentScanningView
        onComplete={handleScanningComplete}
        onAbort={handleScanningAbort}
      />
    )
  }

  // Success Screen
  if (showSuccessScreen) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-[#FDF8FC] p-6 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center max-w-[320px]">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-white" />
            </div>
            <p className="text-base text-gray-700 text-center mb-4">
              Your app, <span className="font-medium">{createdAppName}</span>, is created successfully!
            </p>
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

  // Default prompt + upload screen
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#FDF8FC] p-6 flex flex-col">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="w-11 h-11 rounded-full bg-white hover:bg-gray-50 shadow-sm border border-gray-200"
      >
        <ArrowLeft className="h-5 w-5 text-gray-600" />
      </Button>

      <div className="flex-1 flex items-start justify-center pt-[10vh]">
        <div className="max-w-[620px] w-full">
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

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              accept={ACCEPTED_FILE_TYPES}
              multiple
              hidden
            />

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
              {attachments.length === 0 && (
                <div
                  className="absolute top-0 left-0 w-[30px] h-[30px] z-10"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(251, 207, 232, 0.7) 0%, rgba(221, 214, 254, 0.7) 50%, transparent 50%)',
                  }}
                >
                  <Sparkles className="w-3 h-3 text-purple-500 absolute top-1 left-1" />
                </div>
              )}

              {attachments.length === 0 && (
                <>
                  <div className="flex flex-col items-center justify-center h-full">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm mb-1"
                    >
                      <Paperclip className="w-4 h-4" />
                      Attach
                    </button>
                    <span className="text-gray-600" style={{ fontSize: '10px' }}>
                      Drag and drop or paste from clipboard
                    </span>
                  </div>

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

              {attachments.length > 0 && (
                <div className="h-full flex items-center px-3">
                  {attachments.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <img src={getFileIconPath(file)} alt={file.name} className="w-6 h-8" />
                        <div className="flex flex-col">
                          <span
                            className="text-gray-600 truncate max-w-[280px]"
                            style={{ fontSize: '12px' }}
                            title={file.name}
                          >
                            {file.name}
                          </span>
                          <span className="text-gray-300" style={{ fontSize: '10px' }}>
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      </div>
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

          <div className="mt-2 mb-3">
            <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
              {charactersLeft} characters left.
            </span>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start building
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}
