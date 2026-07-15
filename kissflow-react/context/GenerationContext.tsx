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

// Root-level context that owns the "app being generated" tick loop. State is
// mirrored into `localStorage` so it survives *both* a route change from
// /new/app → /builder/[appId] (same tab) AND a `window.open('_blank')` handoff
// into a fresh Builder tab. Any tab mounting `GenerationProvider` picks up
// the in-flight generation from storage and derives its tickCount from the
// wall-clock delta against a shared `startedAt` timestamp.

const STORAGE_KEY = 'kissflow-generation'

interface StoredGeneration {
  startedAt: number
  appId: string
  appName: string
  appDescription: string
}

function readStored(): StoredGeneration | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredGeneration
  } catch {
    return null
  }
}

function writeStored(value: StoredGeneration) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {}
}

function clearStored() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

// Wall-clock ms from `startedAt` to the final tick. Used to decide whether
// a stored generation is still in flight when a new tab picks it up.
const TOTAL_DURATION_MS =
  TICK_SCHEDULE.length === 0 ? 0 : TICK_SCHEDULE[TICK_SCHEDULE.length - 1] + 500

function tickCountFromElapsed(elapsedMs: number): number {
  let advanced = 0
  for (const delay of TICK_SCHEDULE) {
    if (elapsedMs >= delay) advanced++
    else break
  }
  return INITIAL_TICK_COUNT + advanced
}

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

  // Track live timeouts so a re-start (or unmount, or storage event pointing
  // at a different `startedAt`) cleanly cancels the previous schedule.
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }, [])

  // Schedule the setTimeouts that remain given a known `startedAt`. Any tick
  // whose delay has already elapsed is skipped — the state is already updated
  // via `setTickCount(tickCountFromElapsed(elapsed))` before this fires.
  const scheduleRemainingTicks = useCallback(
    (startedAt: number) => {
      clearAllTimeouts()
      const now = Date.now()
      TICK_SCHEDULE.forEach((delayMs, idx) => {
        const isFinalTick = idx === TICK_SCHEDULE.length - 1
        const remaining = startedAt + delayMs - now
        if (remaining <= 0) return
        const t = setTimeout(() => {
          setTickCount(INITIAL_TICK_COUNT + idx + 1)
          if (isFinalTick) {
            setIsGenerating(false)
            clearStored()
          }
        }, remaining)
        timeoutsRef.current.push(t)
      })
    },
    [clearAllTimeouts],
  )

  const startGeneration = useCallback(
    (input: { appId: string; appName: string; appDescription: string }) => {
      const startedAt = Date.now()
      setAppId(input.appId)
      setAppName(input.appName)
      setAppDescription(input.appDescription)
      setTickCount(INITIAL_TICK_COUNT)
      setIsGenerating(true)
      writeStored({ startedAt, ...input })
      scheduleRemainingTicks(startedAt)
    },
    [scheduleRemainingTicks],
  )

  const stopGeneration = useCallback(() => {
    clearAllTimeouts()
    setIsGenerating(false)
    clearStored()
  }, [clearAllTimeouts])

  // On mount, pick up any in-flight generation from `localStorage` — this is
  // the handoff mechanism for the Builder tab opened via "Preview app".
  useEffect(() => {
    const stored = readStored()
    if (!stored) return
    const elapsed = Date.now() - stored.startedAt
    if (elapsed >= TOTAL_DURATION_MS) {
      clearStored()
      return
    }
    setAppId(stored.appId)
    setAppName(stored.appName)
    setAppDescription(stored.appDescription)
    setTickCount(tickCountFromElapsed(elapsed))
    setIsGenerating(true)
    scheduleRemainingTicks(stored.startedAt)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cross-tab reactivity — if generation starts, restarts, or is cleared in
  // another tab, sync this tab. `storage` events do not fire in the tab that
  // originated the write, so no feedback loops.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      clearAllTimeouts()
      if (!e.newValue) {
        setIsGenerating(false)
        return
      }
      try {
        const stored = JSON.parse(e.newValue) as StoredGeneration
        const elapsed = Date.now() - stored.startedAt
        if (elapsed >= TOTAL_DURATION_MS) {
          setIsGenerating(false)
          return
        }
        setAppId(stored.appId)
        setAppName(stored.appName)
        setAppDescription(stored.appDescription)
        setTickCount(tickCountFromElapsed(elapsed))
        setIsGenerating(true)
        scheduleRemainingTicks(stored.startedAt)
      } catch {}
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [clearAllTimeouts, scheduleRemainingTicks])

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
