'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  AGENTS,
  INITIAL_TICK_COUNT,
  TICK_SCHEDULE,
  currentIdxFor,
  phaseIdxFor,
} from '@/lib/generation-spec'

// Root-level context that owns the "app being generated" tick loop so state
// survives the route change from /new/app → /builder/[appId]. Both
// AppCreatingView (right pane on /new/app) and GenerationLoadingPane
// (chat-slot replacement in the Builder) read from this single source of
// truth — the user sees continuous phase progression, no restart.

export interface GenerationState {
  isGenerating: boolean
  appId: string | null
  appName: string
  appDescription: string
  tickCount: number
  currentIdx: number
  phaseIdx: number
  allDone: boolean
  startGeneration: (input: {
    appId: string
    appName: string
    appDescription: string
  }) => void
  stopGeneration: () => void
}

const GenerationContext = createContext<GenerationState | null>(null)

export function GenerationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [appId, setAppId] = useState<string | null>(null)
  const [appName, setAppName] = useState('')
  const [appDescription, setAppDescription] = useState('')
  const [tickCount, setTickCount] = useState(INITIAL_TICK_COUNT)

  // Track live timeouts so a re-start or unmount cleanly cancels the schedule.
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }, [])

  const startGeneration = useCallback(
    (input: { appId: string; appName: string; appDescription: string }) => {
      clearAllTimeouts()
      setAppId(input.appId)
      setAppName(input.appName)
      setAppDescription(input.appDescription)
      setTickCount(INITIAL_TICK_COUNT)
      setIsGenerating(true)
      // Same pattern AppCreatingView used before the lift — one setTimeout per
      // tick advance so each agent's phases fire at their own configured
      // duration. The last tick also flips `isGenerating` off so the Builder
      // swaps GenerationLoadingPane → CopilotPanel automatically.
      timeoutsRef.current = TICK_SCHEDULE.map((delayMs, idx) => {
        const isFinalTick = idx === TICK_SCHEDULE.length - 1
        return setTimeout(() => {
          setTickCount(INITIAL_TICK_COUNT + idx + 1)
          if (isFinalTick) setIsGenerating(false)
        }, delayMs)
      })
    },
    [clearAllTimeouts],
  )

  const stopGeneration = useCallback(() => {
    clearAllTimeouts()
    setIsGenerating(false)
  }, [clearAllTimeouts])

  // Clean up on unmount (e.g. hot reload) so we never leak timeouts.
  useEffect(() => clearAllTimeouts, [clearAllTimeouts])

  const currentIdx = currentIdxFor(tickCount)
  const phaseIdx = phaseIdxFor(tickCount)
  const allDone = currentIdx >= AGENTS.length

  const value = useMemo<GenerationState>(
    () => ({
      isGenerating,
      appId,
      appName,
      appDescription,
      tickCount,
      currentIdx,
      phaseIdx,
      allDone,
      startGeneration,
      stopGeneration,
    }),
    [
      isGenerating,
      appId,
      appName,
      appDescription,
      tickCount,
      currentIdx,
      phaseIdx,
      allDone,
      startGeneration,
      stopGeneration,
    ],
  )

  return (
    <GenerationContext.Provider value={value}>
      {children}
    </GenerationContext.Provider>
  )
}

export function useGeneration(): GenerationState {
  const ctx = useContext(GenerationContext)
  if (!ctx) {
    throw new Error('useGeneration must be used within GenerationProvider')
  }
  return ctx
}
