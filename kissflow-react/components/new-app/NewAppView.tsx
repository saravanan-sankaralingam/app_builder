'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Grid2x2Plus, WandSparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BuildWithAIView } from './BuildWithAIView'

type Mode = 'selection' | 'build-with-ai'

// Left-nav Create > App entry point. Design-only for now; no backend writes.
// Kept independent of the Explorer's /create flow (components/create/*) until
// the design is signed off and we consolidate the two.
export function NewAppView() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('selection')

  const handleBuildWithAI = () => {
    setMode('build-with-ai')
  }

  const handleCreateFromScratch = () => {
    // TODO: open the name/icon form for this flow (no backend yet)
    console.log('Create from scratch selected')
  }

  const handleBackToSelection = () => {
    setMode('selection')
  }

  if (mode === 'build-with-ai') {
    return <BuildWithAIView onBack={handleBackToSelection} />
  }

  return (
    <div className="relative min-h-[calc(100vh-50px)] bg-white flex items-center justify-center">
      {/* Back arrow — pinned to the top-left so it stays out of the centering flow */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        aria-label="Back"
        className="absolute top-8 left-12 h-10 w-10 rounded-full hover:bg-gray-100"
      >
        <ArrowLeft className="h-5 w-5 text-gray-700" />
      </Button>

      <div>
        {/* Page mark — 58×58 magenta-100 tile wrapping a 32×32 magenta-500 inset with a 20×20 white glyph */}
        <div className="flex h-[58px] w-[58px] items-center justify-center rounded-[4px] bg-magenta-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-magenta-500">
            <Grid2x2Plus className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Title — 16px below the icon, 24px medium gray-900 */}
        <h1 className="mt-4 text-2xl font-medium text-gray-900">Create an app</h1>

        {/* Description — 4px below the title, 16px regular gray-600 */}
        <p className="mt-1 text-base font-normal text-gray-600">
          Choose how you want to create your app
        </p>

        {/* Card grid — 40px below the description; cards are 220×120 fixed */}
        <div className="mt-10 flex flex-wrap gap-6">
          <MethodCard
            icon={WandSparkles}
            iconClassName="text-purple-500"
            borderClassName="new-app-ai-border hover:shadow-lg"
            title="Build with AI"
            description="Build an app in minutes with just a few inputs."
            onClick={handleBuildWithAI}
          />
          <MethodCard
            icon={Grid2x2Plus}
            iconClassName="text-magenta-500"
            borderClassName="new-app-scratch-border hover:shadow-lg"
            title="Create from scratch"
            description="Build your app manually in the app builder."
            onClick={handleCreateFromScratch}
          />
        </div>
      </div>
    </div>
  )
}

interface MethodCardProps {
  icon: React.ElementType
  iconClassName: string
  borderClassName: string
  title: string
  description: string
  onClick: () => void
}

function MethodCard({
  icon: Icon,
  iconClassName,
  borderClassName,
  title,
  description,
  onClick,
}: MethodCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-[270px] flex-col items-start text-left rounded-xl border-2 px-7 py-6 transition-all duration-200 hover:-translate-y-1 ${borderClassName}`}
    >
      <Icon className={`h-6 w-6 ${iconClassName}`} strokeWidth={1.75} />
      <h2 className="mt-3 text-base font-medium text-gray-900">{title}</h2>
      <p className="mt-1.5 text-xs font-normal text-gray-600 line-clamp-2">{description}</p>
    </button>
  )
}
