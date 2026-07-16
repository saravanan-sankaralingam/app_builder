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
  AGENT_PHASE_DURATIONS_MS,
  APP_BUILDER_AGENT_IDX,
  DESIGNER_AGENT_IDX,
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
  // Active generation record, kept in a ref so the setTimeout callbacks can
  // read the current appId when deciding whether to loop the tick schedule
  // (demo-only, gated on the Vendor Onboarding mock — see below).
  const activeRef = useRef<StoredGeneration | null>(null)

  // Loop flag — previously kept the Vendor Onboarding mock cycling so the
  // chat card design could be iterated on. Now that the visual is settled,
  // no app loops: the animation runs through once, isGenerating flips off,
  // and the seed success message (`CopilotPanel.tsx:777`) re-enters the
  // chat list to confirm completion.
  const shouldLoop = (_id: string) => false

  // Skip-App-Builder flag — the mock assumes Requirements Analyst /
  // Solutions Architect / App Builder are already done by the time the
  // user reaches the Builder. Applying `LOOP_OFFSET_MS` at start makes
  // the scheduler treat App Builder's ticks as already elapsed so
  // Interface Designer is the first visible active agent.
  const shouldSkipAppBuilder = (id: string) =>
    id === 'vendor-onboarding-and-management'

  // Cumulative ms consumed through App Builder — used by the offset flag
  // above to shift `startedAt` so App Builder's ticks fire immediately.
  const LOOP_OFFSET_MS = (() => {
    let total = 0
    for (
      let agentIdx = APP_BUILDER_AGENT_IDX;
      agentIdx < DESIGNER_AGENT_IDX;
      agentIdx++
    ) {
      for (const d of AGENT_PHASE_DURATIONS_MS[agentIdx]) total += d
    }
    return total
  })()

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }, [])

  // Schedule the setTimeouts that remain given a known `startedAt`. Any tick
  // whose delay has already elapsed is skipped — the state is already updated
  // via `setTickCount(tickCountFromElapsed(elapsed))` before this fires. On
  // the final tick, either restart the cycle (Vendor Onboarding demo loop)
  // or flip `isGenerating` off and clear storage.
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
            const active = activeRef.current
            if (active && shouldLoop(active.appId)) {
              // Restart the tick loop, but shift the startedAt so App Builder
              // reads as already-done — loop cycles through Designer +
              // Publisher only (matches the "Builder is reached after App
              // Builder finished" mental model).
              const newStartedAt = Date.now() - LOOP_OFFSET_MS
              const next: StoredGeneration = { ...active, startedAt: newStartedAt }
              activeRef.current = next
              writeStored(next)
              setTickCount(INITIAL_TICK_COUNT + AGENTS[APP_BUILDER_AGENT_IDX].phases.length)
              // Recurse into the same scheduler with the new start time.
              scheduleRemainingTicks(newStartedAt)
            } else {
              setIsGenerating(false)
              clearStored()
              activeRef.current = null
            }
          }
        }, remaining)
        timeoutsRef.current.push(t)
      })
    },
    [clearAllTimeouts],
  )

  const startGeneration = useCallback(
    (input: { appId: string; appName: string; appDescription: string }) => {
      const skipAppBuilder = shouldSkipAppBuilder(input.appId)
      // Vendor Onboarding demo: pre-seed the schedule past App Builder so
      // Interface Designer is the first visible active agent.
      const startedAt = skipAppBuilder
        ? Date.now() - LOOP_OFFSET_MS
        : Date.now()
      const next: StoredGeneration = { startedAt, ...input }
      activeRef.current = next
      setAppId(input.appId)
      setAppName(input.appName)
      setAppDescription(input.appDescription)
      setTickCount(
        skipAppBuilder
          ? INITIAL_TICK_COUNT + AGENTS[APP_BUILDER_AGENT_IDX].phases.length
          : INITIAL_TICK_COUNT,
      )
      setIsGenerating(true)
      writeStored(next)
      scheduleRemainingTicks(startedAt)
    },
    [scheduleRemainingTicks],
  )

  const stopGeneration = useCallback(() => {
    clearAllTimeouts()
    setIsGenerating(false)
    clearStored()
    activeRef.current = null
  }, [clearAllTimeouts])

  // On mount, pick up any in-flight generation from `localStorage` — this is
  // the handoff mechanism for the Builder tab opened via "Preview app".
  useEffect(() => {
    const stored = readStored()
    if (!stored) return
    let startedAt = stored.startedAt
    let elapsed = Date.now() - startedAt
    if (elapsed >= TOTAL_DURATION_MS) {
      if (!shouldLoop(stored.appId)) {
        clearStored()
        return
      }
      // Demo loop app whose stored startedAt is stale (schedule would have
      // ended by now). Restart the cycle with the loop offset applied so
      // Designer is active immediately (App Builder reads as already done).
      startedAt = Date.now() - LOOP_OFFSET_MS
      elapsed = LOOP_OFFSET_MS
      writeStored({ ...stored, startedAt })
    }
    activeRef.current = { ...stored, startedAt }
    setAppId(stored.appId)
    setAppName(stored.appName)
    setAppDescription(stored.appDescription)
    setTickCount(tickCountFromElapsed(elapsed))
    setIsGenerating(true)
    scheduleRemainingTicks(startedAt)
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
        activeRef.current = null
        return
      }
      try {
        const stored = JSON.parse(e.newValue) as StoredGeneration
        let startedAt = stored.startedAt
        let elapsed = Date.now() - startedAt
        if (elapsed >= TOTAL_DURATION_MS) {
          if (!shouldLoop(stored.appId)) {
            setIsGenerating(false)
            activeRef.current = null
            return
          }
          startedAt = Date.now() - LOOP_OFFSET_MS
          elapsed = LOOP_OFFSET_MS
          writeStored({ ...stored, startedAt })
        }
        activeRef.current = { ...stored, startedAt }
        setAppId(stored.appId)
        setAppName(stored.appName)
        setAppDescription(stored.appDescription)
        setTickCount(tickCountFromElapsed(elapsed))
        setIsGenerating(true)
        scheduleRemainingTicks(startedAt)
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
