'use client'

import { Sparkles, User } from 'lucide-react'
import { Message } from './types'
import { ClarifyingQuestionsCard } from './ClarifyingQuestionsCard'
import { RoleSuggestionCard } from './RoleSuggestionCard'
import { UserStoriesCard } from './UserStoriesCard'
import { ConfirmGenerateCard } from './ConfirmGenerateCard'
import { RoleSuggestionData, UserStoriesData, Role, ClarifyingQuestionsData } from './types'

interface ChatMessageProps {
  message: Message
  onClarifyingAnswer?: (answers: Record<string, string>) => void
  onClarifyingSkip?: () => void
  onRolesConfirm?: (roles: Role[]) => void
  onStoriesApprove?: (roleId: string) => void
  onStoryEdit?: (storyId: string, newText: string) => void
  onConfirmGenerate?: () => void
  onModifyGenerate?: () => void
  animate?: boolean
}

export function ChatMessage({ message, onClarifyingAnswer, onClarifyingSkip, onRolesConfirm, onStoriesApprove, onStoryEdit, onConfirmGenerate, onModifyGenerate, animate = true }: ChatMessageProps) {
  const isAI = message.type === 'ai'
  const animationClass = animate ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''

  // Render special components
  const renderComponent = () => {
    if (message.component === 'clarifying-questions' && message.data) {
      const clarifyingData = message.data as ClarifyingQuestionsData
      return (
        <ClarifyingQuestionsCard
          questions={clarifyingData.questions}
          onAnswer={onClarifyingAnswer || (() => {})}
          onSkip={onClarifyingSkip || (() => {})}
        />
      )
    }

    if (message.component === 'role-suggestion' && message.data) {
      return (
        <RoleSuggestionCard
          data={message.data as RoleSuggestionData}
          onConfirm={onRolesConfirm}
        />
      )
    }

    if (message.component === 'user-stories' && message.data) {
      return (
        <UserStoriesCard
          data={message.data as UserStoriesData[]}
          onApprove={onStoriesApprove}
          onEdit={onStoryEdit}
        />
      )
    }

    if (message.component === 'confirm-generate') {
      return (
        <ConfirmGenerateCard
          onConfirm={onConfirmGenerate || (() => {})}
          onModify={onModifyGenerate || (() => {})}
        />
      )
    }

    return null
  }

  if (isAI) {
    return (
      <div className={`flex items-start gap-3 max-w-3xl ${animationClass}`}>
        {/* AI Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <Sparkles className="h-4 w-4 text-white" />
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {message.content && (
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 inline-block">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.content}</p>
            </div>
          )}
          {renderComponent()}
        </div>
      </div>
    )
  }

  // User message
  return (
    <div className={`flex items-start gap-3 max-w-3xl ml-auto justify-end ${animationClass}`}>
      {/* Message Content */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm max-w-[80%]">
        <p className="text-sm text-white whitespace-pre-wrap">{message.content}</p>
      </div>

      {/* User Avatar */}
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
        <User className="h-4 w-4 text-gray-600" />
      </div>
    </div>
  )
}
