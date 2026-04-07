'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, PenLine } from 'lucide-react'
import { CreateMethodCard } from './CreateMethodCard'
import { AppNameForm } from './AppNameForm'
import { AIPromptView } from './AIPromptView'
import { AIPromptViewNew } from './AIPromptViewNew'
import { ConversationView, Message, ConversationPhase, AISuggestionResult } from './conversation'
import { AIAnalyzingView, AppSuggestionDialog, AppCreatingView } from './analyzing'
import { AppGenerationLayout } from './generation'
import { createApp } from '@/lib/api/apps'

type CreateMode = 'selection' | 'ai-prompt' | 'ai-prompt-new' | 'analyzing' | 'name-dialog' | 'creating' | 'conversation' | 'generating' | 'preview' | 'building'

export function AppCreateView() {
  const router = useRouter()
  const [mode, setMode] = useState<CreateMode>('selection')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [generatedAppName, setGeneratedAppName] = useState('')
  const [generatedAppDescription, setGeneratedAppDescription] = useState('')
  const [conversationMessages, setConversationMessages] = useState<Message[]>([])

  const handleCreateFromScratch = () => {
    setIsFormOpen(true)
  }

  const handleBuildWithAI = () => {
    setMode('ai-prompt')
  }

  const handleBuildWithAINew = () => {
    setMode('ai-prompt-new')
  }

  const handleBackToSelection = () => {
    setMode('selection')
    setAiPrompt('')
    setAttachments([])
  }

  const [attachments, setAttachments] = useState<File[]>([])

  const handleAIPromptSubmitNew = async (prompt: string, files: File[]) => {
    console.log('New AI Prompt submitted:', prompt)
    console.log('Attachments:', files.map(f => ({ name: f.name, size: f.size, type: f.type })))

    // Store the prompt and attachments, transition to analyzing view
    setAiPrompt(prompt)
    setAttachments(files)
    setMode('analyzing')
  }

  const handleAIPromptSubmit = async (prompt: string, attachments: File[]) => {
    console.log('AI Prompt submitted:', prompt)
    console.log('Attachments:', attachments.map(f => ({ name: f.name, size: f.size, type: f.type })))

    // Store the prompt and transition to analyzing view
    setAiPrompt(prompt)
    setMode('analyzing')
  }

  const handleAnalyzingComplete = (suggestion: AISuggestionResult) => {
    setGeneratedAppName(suggestion.appName)
    setGeneratedAppDescription(suggestion.appDescription)
    setMode('name-dialog')
  }

  const handleBackFromAnalyzing = () => {
    setMode('ai-prompt')
  }

  const handleNameDialogConfirm = (data: { name: string; description: string; icon: string; iconBg: string }) => {
    setGeneratedAppName(data.name)
    setGeneratedAppDescription(data.description)
    // Transition to creating view
    setMode('creating')
    console.log('App confirmed:', data)
  }

  const handleCreatingComplete = () => {
    // For now, just log completion - in real app would navigate to builder
    console.log('App creation complete:', generatedAppName)
    // Could navigate to builder or show success message
    // window.open(`/builder/${newAppId}`, '_blank')
  }

  const handleNameDialogBack = () => {
    setMode('ai-prompt')
    setGeneratedAppName('')
    setGeneratedAppDescription('')
  }

  const handleBackFromConversation = () => {
    setMode('ai-prompt')
    setAiPrompt('')
  }

  const handleConversationPhaseChange = (phase: ConversationPhase, data?: { appName: string; messages: Message[] }) => {
    if (phase === 'generating' && data) {
      setGeneratedAppName(data.appName)
      setConversationMessages(data.messages)
      setMode('generating')
    }
  }

  const handleGenerationPhaseChange = (phase: ConversationPhase) => {
    if (phase === 'preview') {
      setMode('preview')
    } else if (phase === 'building') {
      setMode('building')
    }
  }

  const handleDeploy = () => {
    console.log('Deploying app:', generatedAppName)
    // In a real app, this would deploy the generated app
  }

  const handleFormSubmit = async (data: { name: string; icon: string; iconBg: string; description?: string }) => {
    setIsCreating(true)
    try {
      // Create the app via API
      const newApp = await createApp({
        name: data.name,
        icon: data.icon,
        iconBg: data.iconBg,
        description: data.description,
      })

      // Close the form
      setIsFormOpen(false)

      // Open builder in new tab
      window.open(`/builder/${newApp.id}`, '_blank')

      // Navigate back to explorer in current tab
      router.push('/explorer')
    } catch (error) {
      console.error('Failed to create app:', error)
      // Re-throw the error so the form can display it
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  // Render Generation/Preview Layout
  if (mode === 'generating' || mode === 'preview') {
    return (
      <AppGenerationLayout
        appName={generatedAppName}
        messages={conversationMessages}
        phase={mode}
        onPhaseChange={handleGenerationPhaseChange}
        onDeploy={handleDeploy}
      />
    )
  }

  // Render Building View (full builder) - placeholder for now
  if (mode === 'building') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">App Builder</h2>
          <p className="text-gray-500 mb-4">Full builder view coming soon</p>
          <Button onClick={() => setMode('preview')}>Back to Preview</Button>
        </div>
      </div>
    )
  }

  // Render AI Analyzing View
  if (mode === 'analyzing') {
    return (
      <AIAnalyzingView
        prompt={aiPrompt}
        onComplete={handleAnalyzingComplete}
        onBack={handleBackFromAnalyzing}
      />
    )
  }

  // Render Name Dialog View
  if (mode === 'name-dialog') {
    return (
      <AppSuggestionDialog
        open={true}
        suggestedName={generatedAppName}
        suggestedDescription={generatedAppDescription}
        onConfirm={handleNameDialogConfirm}
        onBack={handleNameDialogBack}
      />
    )
  }

  // Render Creating View
  if (mode === 'creating') {
    return (
      <AppCreatingView
        appName={generatedAppName}
        onComplete={handleCreatingComplete}
      />
    )
  }

  // Render Conversation View (kept for potential future use)
  if (mode === 'conversation') {
    return (
      <ConversationView
        initialPrompt={aiPrompt}
        onBack={handleBackFromConversation}
        onPhaseChange={handleConversationPhaseChange}
      />
    )
  }

  // Render New AI Prompt View
  if (mode === 'ai-prompt-new') {
    return (
      <AIPromptViewNew
        onBack={handleBackToSelection}
        onSubmit={handleAIPromptSubmitNew}
      />
    )
  }

  // Render AI Prompt View (old)
  if (mode === 'ai-prompt') {
    return (
      <AIPromptView
        onBack={handleBackToSelection}
        onStartOver={handleBackToSelection}
        onSubmit={handleAIPromptSubmit}
      />
    )
  }

  // Render Selection View
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 p-6 flex flex-col">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="w-11 h-11 bg-gray-100 hover:bg-gray-200"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Content positioned at 40% from top */}
      <div className="flex-1 flex items-start justify-center pt-[15vh]">
        <div className="max-w-2xl w-full">
        {/* Icon */}
        <div className="mb-4">
          <img
            src="/ic_magic_wand.svg"
            alt="Magic wand"
            className="w-7 h-7"
          />
        </div>

        {/* Title and Subtitle */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1.5">
            Create an app
          </h1>
          <p className="text-sm text-gray-600">
            Choose your preferred method to create an app
          </p>
        </div>

        {/* Method Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CreateMethodCard
            icon={Sparkles}
            iconColor="#EC4899"
            gradientFrom="#FBCFE8"
            gradientTo="#F9A8D4"
            hoverGradientFrom="#F472B6"
            hoverGradientTo="#EC4899"
            title="Build with AI"
            description="Turn your BRDs or ideas into a complete app."
            onClick={handleBuildWithAINew}
          />
          <CreateMethodCard
            icon={Sparkles}
            iconColor="#9333EA"
            gradientFrom="#E9D5FF"
            gradientTo="#D8B4FE"
            hoverGradientFrom="#C084FC"
            hoverGradientTo="#A855F7"
            title="Build with AI (old)"
            description="Turn your ideas into a complete app in seconds."
            onClick={handleBuildWithAI}
          />
          <CreateMethodCard
            icon={PenLine}
            iconColor="#3B82F6"
            gradientFrom="#BFDBFE"
            gradientTo="#93C5FD"
            hoverGradientFrom="#60A5FA"
            hoverGradientTo="#3B82F6"
            title="Create from scratch"
            description="Build your desired app using the app builder from scratch."
            onClick={handleCreateFromScratch}
          />
        </div>
        </div>
      </div>

      {/* App Name Form Modal */}
      <AppNameForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        isLoading={isCreating}
      />
    </div>
  )
}
