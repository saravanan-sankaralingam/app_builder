'use client'

import { useRef, useEffect } from 'react'
import { Sparkles, User, Send } from 'lucide-react'
import { Message } from '../conversation/types'

interface ChatPanelProps {
  messages: Message[]
  disabled?: boolean
  onSend?: (text: string) => void
}

function CompactMessage({ message }: { message: Message }) {
  const isAI = message.type === 'ai'

  if (isAI) {
    return (
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          {message.content && (
            <div className="bg-white rounded-lg rounded-tl-sm px-3 py-2 shadow-sm border border-gray-100 inline-block">
              <p className="text-xs text-gray-700 whitespace-pre-wrap">{message.content}</p>
            </div>
          )}
          {/* Show simplified component indicator if present */}
          {message.component && message.component !== 'text' && (
            <div className="mt-1 px-2 py-1 bg-purple-50 rounded text-xs text-purple-600 inline-block">
              {message.component === 'role-suggestion' && 'Roles configured'}
              {message.component === 'user-stories' && 'User stories defined'}
              {message.component === 'clarifying-questions' && 'Questions answered'}
              {message.component === 'confirm-generate' && 'Ready to generate'}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2 justify-end">
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg rounded-tr-sm px-3 py-2 shadow-sm max-w-[85%]">
        <p className="text-xs text-white whitespace-pre-wrap">{message.content}</p>
      </div>
      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        <User className="h-3 w-3 text-gray-600" />
      </div>
    </div>
  )
}

export function ChatPanel({ messages, disabled = false, onSend }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-purple-50/50 to-pink-50/50">
      {/* Chat Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <h2 className="text-sm font-medium text-gray-900">Conversation</h2>
        <p className="text-xs text-gray-500">Your app requirements</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <CompactMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200/50 bg-white/50">
        <div className={`
          flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <input
            type="text"
            placeholder={disabled ? 'Generation in progress...' : 'Type a message...'}
            disabled={disabled}
            className="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder-gray-400 disabled:cursor-not-allowed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !disabled && onSend) {
                const target = e.target as HTMLInputElement
                if (target.value.trim()) {
                  onSend(target.value)
                  target.value = ''
                }
              }
            }}
          />
          <button
            disabled={disabled}
            className={`
              p-1.5 rounded-md transition-colors
              ${disabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-purple-500 hover:bg-purple-50'
              }
            `}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
