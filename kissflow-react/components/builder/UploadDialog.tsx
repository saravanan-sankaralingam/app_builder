'use client'

import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { uploadBundleFile, UploadedFile } from '@/lib/api/upload'

interface UploadDialogProps {
  isOpen: boolean
  onClose: () => void
  file: File | null
  appId: string
  componentId: string
  onComplete: (fileInfo: UploadedFile) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function UploadDialog({
  isOpen,
  onClose,
  file,
  appId,
  componentId,
  onComplete,
}: UploadDialogProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploadComplete, setIsUploadComplete] = useState(false)
  const [isVerificationComplete, setIsVerificationComplete] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const isAllComplete = isUploadComplete && isVerificationComplete

  // Reset state when dialog opens with new file
  useEffect(() => {
    if (isOpen && file) {
      setUploadProgress(0)
      setIsUploadComplete(false)
      setIsVerificationComplete(false)
      setIsUploading(false)

      // Start simulated upload progress (2x slower)
      const uploadDuration = 4000 // 4 seconds
      const interval = 50 // Update every 50ms
      const increment = 100 / (uploadDuration / interval)

      let progress = 0
      const timer = setInterval(() => {
        progress += increment
        if (progress >= 100) {
          progress = 100
          clearInterval(timer)
          setUploadProgress(100)
          setIsUploadComplete(true)

          // Start verification step after upload completes (2x slower)
          setTimeout(() => {
            setIsVerificationComplete(true)
          }, 3000) // 3 second delay for verification
        } else {
          setUploadProgress(Math.round(progress))
        }
      }, interval)

      return () => clearInterval(timer)
    }
  }, [isOpen, file])

  const handleDone = async () => {
    if (!file || !isAllComplete) return

    setIsUploading(true)
    try {
      const result = await uploadBundleFile(appId, componentId, file)
      onComplete(result.file)
      onClose()
    } catch (err) {
      console.error('Failed to upload file:', err)
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen || !file) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl w-[480px] max-w-[90vw]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Import a ZIP file</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Steps Container */}
          <div className="relative">
            {/* Step 1: File Upload */}
            <div className="flex gap-4">
              {/* Step Indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isUploadComplete
                      ? 'bg-green-500'
                      : ''
                  }`}
                >
                  {isUploadComplete ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="none"
                        className="text-blue-100"
                      />
                      <path
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                        className="text-blue-500"
                      />
                    </svg>
                  )}
                </div>
                {/* Connecting Line */}
                <div className={`w-0.5 h-16 border-l-2 border-dashed ${isUploadComplete ? 'border-green-500' : 'border-gray-300'}`} />
              </div>

              {/* Step Content */}
              <div className="flex-1 pb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">File upload</h3>

                {/* File Card */}
                <div className={`rounded-lg p-2 flex items-center gap-3 h-12 ${
                  isUploadComplete ? 'bg-gray-100' : 'bg-gray-800'
                }`}>
                  {/* Progress/Icon Container */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isUploadComplete ? 'bg-gray-200' : 'bg-gray-700'
                  }`}>
                    {isUploadComplete ? (
                      /* ZIP Icon */
                      <div className="relative w-6 h-7">
                        <div className="absolute inset-0 bg-orange-500 rounded-[2px]" style={{ clipPath: 'polygon(0 0, 70% 0, 100% 25%, 100% 100%, 0 100%)' }}>
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white text-[7px] font-bold">ZIP</span>
                        </div>
                        <div className="absolute top-0 right-0 w-2 h-2 bg-orange-300" style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }} />
                      </div>
                    ) : (
                      /* Circular Progress */
                      <div className="relative w-10 h-10">
                        <svg className="w-full h-full -rotate-90">
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className="text-gray-600"
                          />
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 16}`}
                            strokeDashoffset={`${2 * Math.PI * 16 * (1 - uploadProgress / 100)}`}
                            className="text-white transition-all duration-100"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-medium">
                          {uploadProgress}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-medium truncate ${isUploadComplete ? 'text-gray-900' : 'text-white'}`}>
                      {file.name}
                    </p>
                    <p className={`text-[10px] ${isUploadComplete ? 'text-gray-700' : 'text-gray-400'}`}>
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: File Verification */}
            <div className="flex gap-4">
              {/* Step Indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isVerificationComplete
                      ? 'bg-green-500'
                      : !isUploadComplete
                        ? 'border-2 border-gray-300'
                        : ''
                  }`}
                >
                  {isVerificationComplete ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : isUploadComplete ? (
                    <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="none"
                        className="text-blue-100"
                      />
                      <path
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                        className="text-blue-500"
                      />
                    </svg>
                  ) : null}
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 mb-1">File verification</h3>
                <p className="text-xs font-medium text-gray-700">
                  {isVerificationComplete
                    ? 'File validation complete.'
                    : 'Checking if the uploaded ZIP contains a valid page component.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleDone}
            disabled={!isAllComplete || isUploading}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isAllComplete && !isUploading
                ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                : 'bg-blue-100 text-blue-300 cursor-not-allowed'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  )
}
