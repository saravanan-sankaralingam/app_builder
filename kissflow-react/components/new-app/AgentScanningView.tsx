'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ClipboardCheck, Layers } from 'lucide-react'
import {
  LeftPane,
  BackgroundAtmosphere,
  InlineKeyframes,
} from './AppCreatingView'
import { type Agent } from '@/lib/generation-spec'

// AI-at-work screen for the /new/app flow. Shows the same shared LeftPane as
// AppCreatingView but with the pre-review roster: two agents (Requirements
// Analyst + Solutions Architect) working through variable-length sub-item
// checklists. Once both finish, the AppReviewDialog opens on top of this view.

interface AgentScanningViewProps {
  onComplete: () => void
  onAbort: () => void
}

// Per-agent phase duration. Requirements Analyst reads through the prompt
// quickly (3s per sub-item); Solutions Architect spends longer on each
// architectural decision (5s per sub-item). Order matches SCANNING_AGENTS.
const AGENT_PHASE_DURATIONS_MS = [3_000, 5_000]

// Pre-review analysis agents. Different roster from the post-review `AGENTS`
// (which actually generates the app). These two interpret the prompt and
// draft a blueprint before the user reviews + approves.
//
// Variable phase counts and per-agent phase durations — the tick schedule
// below derives per-phase start times so each agent occupies as many ticks
// as it has sub-items, at its own pace.
const SCANNING_AGENTS: Agent[] = [
  {
    id: 'requirements-analyst',
    name: 'Requirements Analyst',
    sectionTitle: 'Requirements',
    icon: ClipboardCheck,
    color: 'magenta',
    phases: [
      'Reading your prompt and attachments',
      'Distilling intent and success criteria',
    ],
    successPhrase: 'has captured the requirements',
  },
  {
    id: 'solutions-architect',
    name: 'Solutions Architect',
    sectionTitle: 'Architecture',
    icon: Layers,
    color: 'purple',
    phases: [
      'Framing the app scope and boundaries',
      'Mapping roles to jobs-to-be-done',
      'Modelling the data entities',
      'Architecting fields and constraints',
      'Composing pages and end-user flows',
      'Enriching entities with context',
      'Weaving it into a cohesive blueprint',
    ],
    successPhrase: 'has drafted the app blueprint',
  },
]

// Cumulative tick boundaries — agent i owns ticks [cumulativeTicks[i-1],
// cumulativeTicks[i]). Last entry is the total tick count.
const CUMULATIVE_TICKS = SCANNING_AGENTS.reduce<number[]>((acc, agent) => {
  const last = acc[acc.length - 1] ?? 0
  acc.push(last + agent.phases.length)
  return acc
}, [])
// Tick transition schedule — TICK_SCHEDULE[i] is the wall-clock ms at which
// `tickCount` advances from `i` to `i + 1`. Built from AGENT_PHASE_DURATIONS_MS
// so Requirements Analyst ticks fire every 3s and Solutions Architect ticks
// fire every 5s, chained one after the other.
const TICK_SCHEDULE: number[] = (() => {
  const schedule: number[] = []
  let cumulativeMs = 0
  SCANNING_AGENTS.forEach((agent, agentIdx) => {
    const phaseDuration = AGENT_PHASE_DURATIONS_MS[agentIdx]
    agent.phases.forEach(() => {
      cumulativeMs += phaseDuration
      schedule.push(cumulativeMs)
    })
  })
  return schedule
})()

// Pop the review dialog open almost immediately after the last agent flips
// to done — just enough of a beat (200ms) for the double-tick to render on
// screen so the user registers it before the popup opens on top.
const SCANNING_TOTAL_DURATION_MS =
  TICK_SCHEDULE[TICK_SCHEDULE.length - 1] + 200

export function AgentScanningView({
  onComplete,
  onAbort,
}: AgentScanningViewProps) {
  const [tickCount, setTickCount] = useState(0)

  useEffect(() => {
    // Schedule each tick advance individually so per-agent durations kick in
    // at the right moment (3s per Requirements Analyst sub-item, 5s per
    // Solutions Architect sub-item).
    const timeouts = TICK_SCHEDULE.map((delayMs, idx) =>
      setTimeout(() => setTickCount(idx + 1), delayMs),
    )
    // Trigger review-dialog open shortly after the last agent transitions
    // to done so the user sees the completion check tick first.
    const complete = setTimeout(onComplete, SCANNING_TOTAL_DURATION_MS)

    return () => {
      timeouts.forEach(clearTimeout)
      clearTimeout(complete)
    }
  }, [onComplete])

  // Derive currentIdx / phaseIdx from cumulative counts so agents can carry
  // different phase counts (2 for Requirements Analyst, 7 for Solutions
  // Architect). If tickCount is past the final boundary, every agent is done.
  const activeIdx = CUMULATIVE_TICKS.findIndex((c) => c > tickCount)
  const currentIdx = activeIdx === -1 ? SCANNING_AGENTS.length : activeIdx
  const priorCumulative =
    currentIdx === 0 ? 0 : CUMULATIVE_TICKS[currentIdx - 1]
  const phaseIdx = tickCount - priorCumulative

  return (
    <div className="relative h-[calc(100vh-3.5rem)] bg-[#FDF8FC] overflow-hidden flex flex-col">
      <InlineKeyframes />
      <BackgroundAtmosphere />

      {/* Back button — floats top-left */}
      <div className="absolute top-6 left-6 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={onAbort}
          aria-label="Abort"
          className="w-11 h-11 rounded-full bg-white/80 backdrop-blur-md hover:bg-white shadow-sm border border-white/80"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Button>
      </div>

      {/* Top-aligned agent timeline — title/hero pin to a fixed top position
          so the rest of the screen does not shift up as the agent activity
          grows downward. The wrapper itself scrolls if content ever exceeds
          the viewport. */}
      <div className="relative z-10 flex-1 flex items-start justify-center overflow-y-auto pt-6">
        <LeftPane
          currentIdx={currentIdx}
          phaseIdx={phaseIdx}
          agents={SCANNING_AGENTS}
          title="Decoding your requirements"
          description="Our Requirements Analyst and Solutions Architect are interpreting your prompt and drafting the blueprint for your app."
          hero={
            // Two-stage pre-review loader — the hero swaps out based on
            // which of the two scanning agents is active. The scan-animation
            // plays while Requirements Analyst is at work (currentIdx 0);
            // the doc-generation animation takes over the moment Solutions
            // Architect kicks in (currentIdx >= 1) and stays for the rest
            // of the sequence. Both SVGs share the 286×260 viewBox, so
            // 176×160 is proportional for either. Rendered by React key so
            // the browser re-plays the SMIL animation on swap.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={currentIdx === 0 ? 'scan' : 'doc-gen'}
              src={
                currentIdx === 0
                  ? '/agent-scanning-loader.svg'
                  : '/doc-generation-loader.svg'
              }
              alt=""
              width={176}
              height={160}
              className="w-[176px] h-[160px]"
              aria-hidden="true"
            />
          }
        />
      </div>
    </div>
  )
}
