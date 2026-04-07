'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

interface ConversationInputProps {
  onSubmit: (message: string) => void
  placeholder?: string
  disabled?: boolean
}

export function ConversationInput({ onSubmit, placeholder = 'Type a message...', disabled = false }: ConversationInputProps) {
  const [message, setMessage] = useState('')
  const [isMac, setIsMac] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Detect Mac vs Windows
  useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes('mac'))
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const newHeight = Math.min(textarea.scrollHeight, 120) // Max 120px (about 5 lines)
      textarea.style.height = `${newHeight}px`
    }
  }, [message])

  const handleSubmit = () => {
    if (!message.trim() || disabled) return
    onSubmit(message.trim())
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const canSubmit = message.trim().length > 0 && !disabled

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className="relative rounded-xl p-[2px]"
        style={{
          background: 'linear-gradient(135deg, #FBCFE8, #E9D5FF, #C4B5FD)',
        }}
      >
        <div className="relative bg-white rounded-[10px] flex items-end gap-2 p-2">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 px-3 py-2 resize-none border-0 focus:outline-none focus:ring-0 text-sm text-gray-700 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '40px' }}
          />

          {/* Keyboard Shortcut Hint */}
          <span className="text-xs text-gray-400 hidden sm:inline pb-2.5">
            Enter to send
          </span>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            style={{
              background: canSubmit
                ? 'linear-gradient(135deg, #EC4899, #A855F7)'
                : '#E5E7EB',
            }}
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
