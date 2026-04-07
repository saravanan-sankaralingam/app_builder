'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatMessage } from './ChatMessage'
import { ThinkingIndicator } from './ThinkingIndicator'
import { ConversationInput } from './ConversationInput'
import {
  Message,
  Role,
  ConversationPhase
} from './types'
import {
  getMockResponse,
  MOCK_USER_STORIES,
  AI_WELCOME_MESSAGE,
  simulateProcessing,
  analyzePromptForQuestions
} from './mockData'

interface ConversationViewProps {
  initialPrompt: string
  onBack: () => void
  onPhaseChange?: (phase: ConversationPhase, data?: { appName: string; messages: Message[] }) => void
}

export function ConversationView({ initialPrompt, onBack, onPhaseChange }: ConversationViewProps) {
  const [phase, setPhase] = useState<ConversationPhase>('processing')
  const [messages, setMessages] = useState<Message[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([])
  const [appName, setAppName] = useState<string>('')
  const [clarifyingAnswers, setClarifyingAnswers] = useState<Record<string, string>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initRef = useRef(false)

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking])

  // Initialize conversation with welcome + user prompt + app suggestion + roles
  useEffect(() => {
    // Prevent double initialization in React strict mode
    if (initRef.current) return
    initRef.current = true

    const initConversation = async () => {
      // Step 1: Show welcome message with delay
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'ai',
        content: AI_WELCOME_MESSAGE,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])

      // Wait before showing user message
      await simulateProcessing(800)

      // Step 2: Show user's prompt
      const userMessage: Message = {
        id: 'user-prompt',
        type: 'user',
        content: initialPrompt,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, userMessage])

      // Wait before showing thinking
      await simulateProcessing(600)

      // Step 3: Show thinking indicator briefly
      setIsThinking(true)
      await simulateProcessing(1500)
      setIsThinking(false)

      // Step 4: Check if we need clarifying questions
      const questions = analyzePromptForQuestions(initialPrompt)

      if (questions.length > 0) {
        // Show clarifying questions
        await simulateProcessing(300)

        const clarifyMessage: Message = {
          id: 'ai-clarify',
          type: 'ai',
          content: "A few quick questions to help me build your app:",
          timestamp: new Date(),
          component: 'clarifying-questions',
          data: { questions },
        }
        setMessages(prev => [...prev, clarifyMessage])
        setPhase('clarifying')
      }
    }

    initConversation()
  }, [initialPrompt])

  // Generate app suggestion (called after clarifying or if no questions needed)
  const generateAppSuggestion = async () => {
    setIsThinking(true)

    // Simulate AI processing - longer delay
    await simulateProcessing(3000)

    // Get mock response with app info and roles
    const mockResponse = getMockResponse(initialPrompt)

    // Store the app name for later reference
    setAppName(mockResponse.appName)

    // Hide thinking and show combined app + roles card
    setIsThinking(false)

    // Small delay before showing card
    await simulateProcessing(300)

    const rolesResponse: Message = {
      id: 'ai-roles',
      type: 'ai',
      content: "Based on your requirements, here's what I've put together:",
      timestamp: new Date(),
      component: 'role-suggestion',
      data: mockResponse,
    }

    setMessages(prev => [...prev, rolesResponse])
    setPhase('roles')
  }

  // Handle clarifying question answers
  const handleClarifyingAnswer = async (answers: Record<string, string>) => {
    setClarifyingAnswers(answers)

    // Show user's selections as a message
    const answerText = Object.values(answers).join(', ')
    const userMessage: Message = {
      id: `user-clarify-${Date.now()}`,
      type: 'user',
      content: answerText,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Small delay before generating app
    await simulateProcessing(400)

    // Proceed to generate app
    await generateAppSuggestion()
  }

  // Handle clarifying question skip
  const handleClarifyingSkip = async () => {
    // Show user skipped
    const userMessage: Message = {
      id: `user-skip-${Date.now()}`,
      type: 'user',
      content: "Let's continue",
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Small delay before generating app
    await simulateProcessing(400)

    // Proceed to generate app
    await generateAppSuggestion()
  }

  // Handle role confirmation
  const handleRolesConfirm = async (roles: Role[]) => {
    setSelectedRoles(roles)

    // Wait a moment before showing user message
    await simulateProcessing(400)

    // Add user confirmation message - short feedback
    const userConfirm: Message = {
      id: `user-confirm-${Date.now()}`,
      type: 'user',
      content: `Looks good! I'll go with these ${roles.length} roles.`,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userConfirm])

    // Wait before showing AI response
    await simulateProcessing(600)
    setIsThinking(true)

    // Short thinking delay
    await simulateProcessing(1200)
    setIsThinking(false)

    // Small delay before showing AI response
    await simulateProcessing(300)

    // Add AI positive response and ask about app name
    const aiResponse: Message = {
      id: `ai-roles-confirmed-${Date.now()}`,
      type: 'ai',
      content: `Great choice! I've set up ${roles.map(r => r.name).join(', ')} as the roles for your app.\n\nBefore we proceed, would you like to change the app name? Currently it's "${appName}". You can type a new name below, or just say "continue" to keep it as is.`,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, aiResponse])
    setPhase('app-name')
  }

  // Handle proceeding to user stories after app name confirmation
  const proceedToUserStories = async () => {
    setIsThinking(true)

    // Simulate generating user stories - longer delay
    await simulateProcessing(3000)

    // Filter user stories for selected roles
    const selectedRoleIds = selectedRoles.map(r => r.id)
    const relevantStories = MOCK_USER_STORIES.filter(
      story => selectedRoleIds.includes(story.roleId)
    )

    setIsThinking(false)

    // Small delay before showing stories
    await simulateProcessing(300)

    // Add AI response with user stories
    const storiesResponse: Message = {
      id: 'ai-stories',
      type: 'ai',
      content: "I've generated user stories for each role. Review and approve them to continue:",
      timestamp: new Date(),
      component: 'user-stories',
      data: relevantStories,
    }

    setMessages(prev => [...prev, storiesResponse])
    setPhase('stories')
  }

  // Handle story approval - show confirm generate after stories are approved
  const handleStoriesApprove = async (roleId: string) => {
    console.log('Stories approved for role:', roleId)

    // Wait a moment before showing user message
    await simulateProcessing(400)

    // Add user confirmation message
    const userConfirm: Message = {
      id: `user-stories-approved-${Date.now()}`,
      type: 'user',
      content: "The user stories look good!",
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userConfirm])

    // Wait before showing AI response
    await simulateProcessing(600)
    setIsThinking(true)
    await simulateProcessing(1000)
    setIsThinking(false)

    // Show confirm generate card
    await simulateProcessing(300)

    const confirmMessage: Message = {
      id: `ai-confirm-generate-${Date.now()}`,
      type: 'ai',
      content: "Everything is set up and ready to go!",
      timestamp: new Date(),
      component: 'confirm-generate',
    }
    setMessages(prev => [...prev, confirmMessage])
    setPhase('confirm-generate')
  }

  // Handle confirm generate
  const handleConfirmGenerate = () => {
    // Trigger phase change to generating - pass data to parent
    onPhaseChange?.('generating', { appName, messages })
  }

  // Handle modify from confirm generate
  const handleModifyGenerate = () => {
    // User wants to make changes - could navigate back or show options
    console.log('User wants to modify before generating')
  }

  // Handle story edit
  const handleStoryEdit = (storyId: string, newText: string) => {
    console.log('Story edited:', storyId, newText)
    // In a real app, this would update the story text
  }

  // Handle new user message
  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])

    // Handle app-name phase responses
    if (phase === 'app-name') {
      const lowerText = text.toLowerCase().trim()

      // Check if user wants to continue with current name
      if (lowerText === 'continue' || lowerText === 'keep it' || lowerText === 'looks good' || lowerText === 'ok' || lowerText === 'yes') {
        setIsThinking(true)
        await simulateProcessing(800)
        setIsThinking(false)

        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: `Perfect! We'll keep the app name as "${appName}". Now let me generate user stories for your roles...`,
          timestamp: new Date(),
        }

        setMessages(prev => [...prev, aiResponse])
        await simulateProcessing(600)
        await proceedToUserStories()
      } else {
        // User provided a new app name
        const newAppName = text.trim()
        setAppName(newAppName)

        setIsThinking(true)
        await simulateProcessing(1000)
        setIsThinking(false)

        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: `Great! I've updated the app name to "${newAppName}". Now let me generate user stories for your roles...`,
          timestamp: new Date(),
        }

        setMessages(prev => [...prev, aiResponse])
        await simulateProcessing(600)
        await proceedToUserStories()
      }
      return
    }

    // Default response for other phases
    setIsThinking(true)
    await simulateProcessing(1500)

    const aiResponse: Message = {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content: "I understand. Let me help you with that. Could you provide more details about what you'd like to change?",
      timestamp: new Date(),
    }

    setIsThinking(false)
    setMessages(prev => [...prev, aiResponse])
  }

  return (
    <div
      className="h-[calc(100vh-3.5rem)] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #FDF2F8 0%, #F5F3FF 50%, #EDE9FE 100%)',
      }}
    >
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-4 flex items-center gap-3 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="w-9 h-9 hover:bg-gray-200/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-sm font-medium text-gray-900">Building Your App</h1>
          <p className="text-xs text-gray-500">
            {phase === 'processing' && 'Analyzing your requirements...'}
            {phase === 'clarifying' && 'Answer a few questions'}
            {phase === 'roles' && 'Review and confirm roles'}
            {phase === 'app-name' && 'Confirm app name'}
            {phase === 'stories' && 'Review user stories'}
            {phase === 'confirm-generate' && 'Ready to generate'}
            {phase === 'complete' && 'Ready to build!'}
          </p>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4 pb-4">
          {messages.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              onClarifyingAnswer={handleClarifyingAnswer}
              onClarifyingSkip={handleClarifyingSkip}
              onRolesConfirm={handleRolesConfirm}
              onStoriesApprove={handleStoriesApprove}
              onStoryEdit={handleStoryEdit}
              onConfirmGenerate={handleConfirmGenerate}
              onModifyGenerate={handleModifyGenerate}
            />
          ))}

          {/* Thinking Indicator */}
          {isThinking && <ThinkingIndicator />}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <ConversationInput
          onSubmit={handleSendMessage}
          placeholder="Ask a follow-up question..."
          disabled={isThinking}
        />
      </div>
    </div>
  )
}
