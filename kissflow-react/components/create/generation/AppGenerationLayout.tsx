'use client'

import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Rocket, Pencil, Folder } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatPanel } from './ChatPanel'
import { GenerationProgress } from './GenerationProgress'
import { DashboardPreview } from './DashboardPreview'
import { Message, GenerationStep, ConversationPhase } from '../conversation/types'

interface AppGenerationLayoutProps {
  appName: string
  appIcon?: string
  appIconBg?: string
  messages: Message[]
  phase: 'generating' | 'preview'
  onPhaseChange: (phase: ConversationPhase) => void
  onDeploy?: () => void
}

// Default generation steps
const GENERATION_STEPS: GenerationStep[] = [
  { id: 'roles', name: 'Roles', description: 'Setting up user roles', status: 'pending', duration: 2000 },
  { id: 'data', name: 'Data', description: 'Creating data models', status: 'pending', duration: 3000 },
  { id: 'interface', name: 'Interface', description: 'Building UI components', status: 'pending', duration: 3000 },
  { id: 'logic', name: 'Logic', description: 'Adding automations', status: 'pending', duration: 2000 },
]

// Dynamic icon component
function AppIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name]
  if (!IconComponent) {
    return <Folder className={className} />
  }
  return <IconComponent className={className} />
}

function AppGenerationContent({
  appName,
  appIcon = 'Rocket',
  appIconBg = '#8B5CF6',
  messages,
  phase,
  onPhaseChange,
  onDeploy,
}: AppGenerationLayoutProps) {
  const [isGenerating, setIsGenerating] = useState(phase === 'generating')
  const [generationComplete, setGenerationComplete] = useState(phase === 'preview')

  const handleGenerationComplete = useCallback(() => {
    setIsGenerating(false)
    setGenerationComplete(true)
    onPhaseChange('preview')
  }, [onPhaseChange])

  const handleEdit = () => {
    onPhaseChange('building')
  }

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen flex flex-col bg-gray-50">
      {/* Top Bar - App Builder Style */}
      <header className="h-12 flex-shrink-0 bg-white border-b border-gray-200">
        <div className="flex h-12 items-center justify-between">
          {/* Left Side - App Info */}
          <div className="flex items-center">
            {/* App Icon - centered in sidebar-width container to align with sidebar icons */}
            <div className="w-12 flex items-center justify-center">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ backgroundColor: appIconBg }}
              >
                <AppIcon name={appIcon} className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            {/* App Name */}
            <span className="font-medium text-gray-900 text-sm">
              {appName}
            </span>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2 pr-4">
            {/* Edit Button - shown after generation, in preview mode it says "Edit" */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              disabled={isGenerating}
              className={`gap-1.5 h-7 px-2.5 text-xs ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            {/* Deploy Button - disabled during generation */}
            <Button
              size="sm"
              onClick={onDeploy}
              disabled={isGenerating}
              className={`gap-1.5 h-7 px-2.5 text-xs bg-gray-900 hover:bg-gray-800 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Rocket className="h-3.5 w-3.5" />
              Deploy
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat Panel (320px) */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200">
          <ChatPanel
            messages={messages}
            disabled={isGenerating}
          />
        </div>

        {/* Right: Generation Progress or Dashboard Preview */}
        <div className="flex-1 overflow-hidden">
          {isGenerating ? (
            <GenerationProgress
              steps={GENERATION_STEPS}
              onComplete={handleGenerationComplete}
            />
          ) : (
            <DashboardPreview appName={appName} />
          )}
        </div>
      </div>
    </div>
  )
}

export function AppGenerationLayout(props: AppGenerationLayoutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Use portal to render at document body level, covering the entire screen
  if (!mounted) {
    return null
  }

  return createPortal(
    <AppGenerationContent {...props} />,
    document.body
  )
}
