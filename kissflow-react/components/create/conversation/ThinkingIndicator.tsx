'use client'

import { Sparkles } from 'lucide-react'

export function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md animate-pulse">
        <Sparkles className="h-4 w-4 text-white" />
      </div>

      {/* Thinking bubble */}
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-500">AI is thinking</span>
          <div className="flex gap-1 ml-1">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
