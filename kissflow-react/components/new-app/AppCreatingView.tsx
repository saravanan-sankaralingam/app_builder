'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Wand2,
  Palette,
  Rocket,
  Database,
  FileText,
  Compass,
  Workflow,
  Check,
  CheckCheck,
  Circle,
  ClipboardCheck,
  Layers,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Post-create screen for the /new/app flow.
//
// Asymmetric two-pane layout (5/7 split — the spec is the artifact, so it gets
// the larger share). Left = progress narrative (chip + title + liquid morph +
// connected agent timeline). Right = a glassmorphic "App spec" card that grows
// section by section as each agent activates, with gradient-tinted shimmer
// skeletons and per-section status pills.
//
// Visual references: v0 / Lovable / Linear AI / Anthropic console / Apple
// Intelligence. Stays inside the project's design tokens.

interface AppCreatingViewProps {
  appName: string
  appDescription: string
  onBack: () => void
  onComplete: () => void
}

export interface Agent {
  id: string
  name: string
  sectionTitle: string
  icon: LucideIcon
  // Brand colour family used for the agent's avatar gradient (-400 → -500)
  color: 'magenta' | 'purple' | 'blue' | 'cyan' | 'green'
  // Verb phrases surfaced as sub-items in the active-agent checklist box.
  // Length is variable — the post-review AGENTS use 4 phrases each; the
  // pre-review SCANNING_AGENTS use different counts per agent.
  phases: string[]
  // Success verb phrase shown alongside the green double-tick when the agent
  // transitions to Done (or during the final 3s of its active window).
  successPhrase: string
}

// Post-review roster — four agents. Requirements Analyst and Solutions
// Architect already completed on the pre-review scanning screen, so they
// render as 'done' from the moment this screen mounts. App Builder and
// Validator are the two new agents that actually run here.
//
// Keeping all four in one array (rather than passing pre-done ones as
// props) means the LeftPane timeline reads as one continuous narrative
// across both screens — the user sees the completed steps carried over,
// and the App Builder appears as the *third* agent in sequence.
const AGENTS: Agent[] = [
  {
    id: 'requirements-analyst',
    name: 'Requirements Analyst agent',
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
    name: 'Solutions Architect agent',
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
  {
    id: 'app-builder',
    name: 'App Builder agent',
    sectionTitle: 'App',
    icon: Wand2,
    color: 'blue',
    phases: [
      'Creating the user roles',
      'Allocating stable identifiers',
      'Creating the master lists',
      'Creating the data entities',
      'Creating fields, views and reports',
      'Wiring up the workflows',
    ],
    successPhrase: 'has built the app structure',
  },
  {
    id: 'designer',
    name: 'Interface Designer agent',
    sectionTitle: 'Design',
    icon: Palette,
    color: 'cyan',
    phases: [
      'Composing the page layouts',
      'Building the navigation menus',
    ],
    successPhrase: 'has designed the interface',
  },
  {
    id: 'publisher',
    name: 'App Publisher agent',
    sectionTitle: 'Publish',
    icon: Rocket,
    color: 'green',
    phases: ['Publishing the app'],
    successPhrase: 'has published the app',
  },
]

// Indexes of the three post-review agents in AGENTS. The two agents before
// App Builder (Requirements Analyst and Solutions Architect) already ran on
// the pre-review screen, so we start the tick counter at the boundary
// between them and App Builder.
const APP_BUILDER_AGENT_IDX = 2
const DESIGNER_AGENT_IDX = 3

// Per-agent phase duration (ms). Order matches AGENTS. Only App Builder
// (5s × 5 = 25s), Designer (5s × 2 = 10s), and Publisher (5s × 1 = 5s)
// actually run — the first two entries are populated for shape completeness
// but never fire since those agents are already 'done' when the screen mounts.
const AGENT_PHASE_DURATIONS_MS = [3_000, 5_000, 5_000, 5_000, 5_000]

// Confetti burst around the success tick — 12 particles fanned across the
// full compass, colours pulled from the AI brand palette + green. Kept as a
// constant so the render is deterministic and doesn't reshuffle on re-render.
// Upward y is constrained to ~-55px so particles don't get clipped by the
// card's top edge; downward y goes further since the modal has room below.
const CONFETTI_PARTICLES: Array<{
  x: number
  y: number
  rot: number
  color: string
  size: number
  shape: 'square' | 'circle'
  delay: number
}> = [
  { x: 60, y: -50, rot: 320, color: 'var(--magenta-500)', size: 10, shape: 'square', delay: 0 },
  { x: -65, y: -40, rot: -280, color: 'var(--purple-500)', size: 9, shape: 'circle', delay: 40 },
  { x: 90, y: -10, rot: 240, color: 'var(--blue-500)', size: 8, shape: 'square', delay: 80 },
  { x: -90, y: 5, rot: -220, color: 'var(--cyan-500)', size: 9, shape: 'circle', delay: 20 },
  { x: 55, y: 80, rot: 300, color: 'var(--green-500)', size: 11, shape: 'square', delay: 60 },
  { x: -55, y: 85, rot: -260, color: 'var(--magenta-400)', size: 8, shape: 'circle', delay: 100 },
  { x: 20, y: -55, rot: 210, color: 'var(--purple-400)', size: 9, shape: 'square', delay: 30 },
  { x: -20, y: 95, rot: -200, color: 'var(--blue-400)', size: 8, shape: 'circle', delay: 70 },
  { x: 80, y: 45, rot: 280, color: 'var(--magenta-500)', size: 9, shape: 'square', delay: 50 },
  { x: -80, y: 40, rot: -240, color: 'var(--green-400)', size: 8, shape: 'circle', delay: 90 },
  { x: 35, y: -55, rot: 260, color: 'var(--cyan-400)', size: 8, shape: 'circle', delay: 110 },
  { x: -35, y: -50, rot: -300, color: 'var(--purple-500)', size: 9, shape: 'square', delay: 10 },
]

// Set to `true` to suppress the completion popover during design iteration
// (the resolved right-pane spec stays visible after both agents finish).
// Now `false` — the popover is the primary CTA at the end of the flow.
const HOLD_COMPLETION_DIALOG = false

// Cumulative tick boundaries — agent i owns ticks [cumulativeTicks[i-1],
// cumulativeTicks[i]). Last entry is the total tick count (18 for this roster).
const CUMULATIVE_TICKS = AGENTS.reduce<number[]>((acc, agent) => {
  const last = acc[acc.length - 1] ?? 0
  acc.push(last + agent.phases.length)
  return acc
}, [])

// Initial tick count on mount — set past the two pre-run agents' ticks so
// they read as 'done' and App Builder starts at its phase 0.
const INITIAL_TICK_COUNT = CUMULATIVE_TICKS[APP_BUILDER_AGENT_IDX - 1]

// TICK_SCHEDULE[i] is the wall-clock ms at which `tickCount` advances from
// `INITIAL_TICK_COUNT + i` to `INITIAL_TICK_COUNT + i + 1`. Only App Builder
// and Validator phases contribute — the pre-run agents don't schedule any
// ticks since they're already done.
const TICK_SCHEDULE: number[] = (() => {
  const schedule: number[] = []
  let cumulativeMs = 0
  for (let agentIdx = APP_BUILDER_AGENT_IDX; agentIdx < AGENTS.length; agentIdx++) {
    const phaseDuration = AGENT_PHASE_DURATIONS_MS[agentIdx]
    for (let p = 0; p < AGENTS[agentIdx].phases.length; p++) {
      cumulativeMs += phaseDuration
      schedule.push(cumulativeMs)
    }
  }
  return schedule
})()

type AgentState = 'queued' | 'active' | 'done'

function stateFor(idx: number, currentIdx: number): AgentState {
  if (idx < currentIdx) return 'done'
  if (idx === currentIdx) return 'active'
  return 'queued'
}

export function AppCreatingView({
  appName,
  appDescription,
  onBack,
  onComplete,
}: AppCreatingViewProps) {
  // Single counter — starts at INITIAL_TICK_COUNT so the two pre-run agents
  // read as 'done' immediately, then advances on the schedule in TICK_SCHEDULE
  // (which covers only the App Builder + Validator phases).
  const [tickCount, setTickCount] = useState(INITIAL_TICK_COUNT)
  // Local dismiss flag — once the user closes the completion popover, keep
  // it closed so they can inspect the resolved spec without it re-opening.
  const [dialogClosed, setDialogClosed] = useState(false)

  useEffect(() => {
    setTickCount(INITIAL_TICK_COUNT)
    // One setTimeout per tick advance — lets each agent's phases run at their
    // own pace (App Builder 5s, Validator 5s) rather than a global interval.
    const timeouts = TICK_SCHEDULE.map((delayMs, idx) =>
      setTimeout(() => setTickCount(INITIAL_TICK_COUNT + idx + 1), delayMs),
    )
    return () => timeouts.forEach(clearTimeout)
  }, [onComplete])

  // Which agent + phase are we on right now?
  const activeIdx = CUMULATIVE_TICKS.findIndex((c) => c > tickCount)
  const currentIdx = activeIdx === -1 ? AGENTS.length : activeIdx
  const priorCumulative =
    currentIdx === 0 ? 0 : CUMULATIVE_TICKS[currentIdx - 1]
  const phaseIdx = tickCount - priorCumulative
  const allAgentsDone = currentIdx >= AGENTS.length

  return (
    <div className="relative h-[calc(100vh-3.5rem)] bg-[#FDF8FC] overflow-hidden flex flex-col">
      <InlineKeyframes />

      {/* Atmospheric background — soft colour fields behind everything */}
      <BackgroundAtmosphere />

      {/* Back button — floats over the left pane area so the right pane can take the full height */}
      <div className="absolute top-6 left-6 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Back"
          className="w-11 h-11 rounded-full bg-white/80 backdrop-blur-md hover:bg-white shadow-sm border border-white/80"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Button>
      </div>

      {/* Asymmetric split — left 5fr (narrative), right 7fr (artifact). 24px around, 24px gap. */}
      <div className="relative z-10 flex-1 grid grid-cols-[5fr_7fr] gap-6 p-6 min-h-0">
        <LeftPane
          currentIdx={currentIdx}
          phaseIdx={phaseIdx}
          agents={AGENTS}
          title="Your app is being crafted, layer by layer"
          description={
            <>
              AI is bringing your{' '}
              <span className="font-semibold">{appName}</span> app to life —
              roles, data, pages, and more.
            </>
          }
          hero={
            // Animated app-mock loader — a shimmering browser-frame preview
            // that morphs through Dashboard → Table → Form states while the
            // App Builder is at work. Static SVG served from /public with
            // built-in SMIL animation. Only shown on this post-review screen.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/app-builder-loader.svg"
              alt=""
              width={180}
              height={145}
              className="w-[180px] h-[145px]"
              aria-hidden="true"
            />
          }
        />
        <RightPane
          currentIdx={currentIdx}
          phaseIdx={phaseIdx}
          appName={appName}
          appDescription={appDescription}
        />
      </div>

      {/* Completion popover — normally opens on top of the building screen
          the moment both agents finish. Temporarily HELD OFF while we iterate
          on the building screen itself. Flip HOLD_COMPLETION_DIALOG to false
          to re-enable the popup. */}
      <AppCreatedDialog
        open={allAgentsDone && !HOLD_COMPLETION_DIALOG && !dialogClosed}
        onOpen={onComplete}
        onClose={() => setDialogClosed(true)}
        appName={appName}
      />
    </div>
  )
}

/* ---------- Completion dialog ---------- */

function AppCreatedDialog({
  open,
  onOpen,
  onClose,
  appName,
}: {
  open: boolean
  onOpen: () => void
  onClose: () => void
  appName: string
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop — soft blur so the resolved spec is glimpsed but muted. */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />

      {/* Outer card — gradient hairline ring wrapping a white surface. */}
      <div
        className="relative rounded-[20px] p-[1.5px] w-[460px] ai-fade-up shadow-[0_24px_60px_rgba(34,42,59,0.18),0_2px_8px_rgba(34,42,59,0.08)]"
        style={{
          background:
            'linear-gradient(246.77deg, var(--purple-200) 0%, var(--magenta-200) 100%)',
        }}
      >
        <div className="rounded-[18.5px] px-9 pt-20 pb-16 flex flex-col items-center text-center overflow-hidden relative bg-white">
          {/* Close button — top-right corner. */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
          >
            <X className="w-4 h-4 text-gray-500" strokeWidth={2.25} />
          </button>

          {/* Success badge — solid green circle with a static halo behind
              and two continuously-pulsing rings to grab attention. */}
          <div className="relative z-10 w-14 h-14">
            {/* Static soft halo behind everything. */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'radial-gradient(circle at center, color-mix(in srgb, var(--green-500) 32%, transparent), transparent 65%)',
                filter: 'blur(14px)',
                transform: 'scale(1.6)',
              }}
              aria-hidden="true"
            />
            {/* Attention-grabbing pulses — two rings offset by 1.6s so the
                effect is nearly continuous. Sits behind the solid badge. */}
            <span
              className="absolute inset-0 rounded-full ai-pulse-ping"
              style={{ backgroundColor: 'var(--green-500)', opacity: 0.28 }}
              aria-hidden="true"
            />
            <span
              className="absolute inset-0 rounded-full ai-pulse-ping"
              style={{
                backgroundColor: 'var(--green-500)',
                opacity: 0.28,
                animationDelay: '1.6s',
              }}
              aria-hidden="true"
            />
            {/* Solid badge — sits on top, with the tick popping in on mount. */}
            <span
              className="absolute inset-0 inline-flex items-center justify-center rounded-full ring-4 ring-white"
              style={{
                background:
                  'linear-gradient(135deg, var(--green-500) 0%, color-mix(in srgb, var(--green-500) 78%, black) 100%)',
                boxShadow:
                  '0 8px 20px -6px color-mix(in srgb, var(--green-500) 55%, transparent)',
              }}
            >
              <CheckCheck
                className="w-6 h-6 text-white success-check-pop"
                strokeWidth={2.75}
              />
            </span>

            {/* Confetti burst — 12 particles fly outward from the badge on
                mount. Colours pick from the AI brand palette + green so the
                celebration reads on-brand. */}
            {CONFETTI_PARTICLES.map((p, i) => (
              <span
                key={i}
                className="confetti-particle"
                style={
                  {
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                    borderRadius: p.shape === 'square' ? '2px' : '999px',
                    boxShadow: `0 1px 3px color-mix(in srgb, ${p.color} 40%, transparent)`,
                    animationDelay: `${p.delay}ms`,
                    '--cx': `${p.x}px`,
                    '--cy': `${p.y}px`,
                    '--cr': `${p.rot}deg`,
                  } as React.CSSProperties
                }
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Title — solid green, echoing the success badge. */}
          <h2
            className="relative z-10 mt-8 text-[22px] font-semibold tracking-tight leading-snug"
            style={{ color: 'var(--green-600)' }}
          >
            App Generated Successfully
          </h2>
          <p className="relative z-10 mt-2 text-[13px] text-gray-600 leading-relaxed max-w-[340px]">
            Your requested app{' '}
            <span className="font-semibold text-gray-900">{appName}</span> is
            now ready to view.
          </p>

          {/* Primary CTA — same blue button style as the review dialog's
              "Create app" (shared <Button> + `px-6 bg-blue-500`). */}
          <Button
            onClick={onOpen}
            className="relative z-10 mt-7 px-6 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Open app
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Background atmosphere ---------- */

export function BackgroundAtmosphere() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-40 -left-40 w-[620px] h-[620px] rounded-full"
        style={{
          background:
            'radial-gradient(circle at center, rgba(222, 31, 142, 0.18), transparent 60%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute top-1/3 -right-32 w-[540px] h-[540px] rounded-full"
        style={{
          background:
            'radial-gradient(circle at center, rgba(109, 43, 240, 0.16), transparent 60%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute -bottom-40 left-1/4 w-[480px] h-[480px] rounded-full"
        style={{
          background:
            'radial-gradient(circle at center, rgba(5, 101, 255, 0.10), transparent 60%)',
          filter: 'blur(60px)',
        }}
      />
    </div>
  )
}

/* ---------- Left pane: progress narrative ---------- */

export function LeftPane({
  currentIdx,
  phaseIdx,
  agents,
  title,
  description,
  completedAction,
  hero,
}: {
  currentIdx: number
  phaseIdx: number
  agents: Agent[]
  title: string
  description: React.ReactNode
  // Optional CTA rendered below the agent timeline once all agents are
  // 'done'. Used by AppCreatingView to surface "App generated successfully
  // → Open app". AgentScanningView leaves this undefined.
  completedAction?: React.ReactNode
  // Optional hero visual replacing the default Sparkles-on-blob glyph.
  // AppCreatingView passes an animated app-mock loader here; AgentScanningView
  // leaves it undefined, so the default sparkle composition renders.
  hero?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-start py-10 px-8 overflow-y-auto">
      <div className="w-full max-w-[540px]">
        {/* Title block — pinned to the top of the pane */}
        <div className="flex flex-col items-center text-center mb-8">
          <h1
            className="text-[24px] leading-[1.15] font-semibold bg-clip-text text-transparent tracking-tight"
            style={{
              backgroundImage:
                'linear-gradient(265deg, var(--magenta-500), var(--purple-500))',
            }}
          >
            {title}
          </h1>

          {/* Description — gray-900, app name highlighted in semibold */}
          <p className="mt-3 text-[13px] text-gray-900 max-w-[440px] leading-relaxed">
            {description}
          </p>
        </div>

        {/* AI hero — either a custom visual passed via the `hero` prop
            (used by AppCreatingView for the animated app-mock loader) or
            the default composition: a custom AI sparkle from
            /Downloads/ai_icon.svg on top of a settled liquid-morph blob
            (soft AI-gradient halo). A periodic diagonal white shine sweeps
            across the icon silhouette via SVG SMIL. */}
        <div className="flex justify-center mb-8">
        {hero ?? (
          <div className="relative w-[88px] h-[88px] flex items-center justify-center">
            {/* Settled liquid blob behind the icon — 50% opacity so it
                reads as a soft halo, not a competing surface. Animation
                comes from `.flat-liquid` (ai-liquid-i border-radius morph).
                The flash sweep now lives inside the SVG and is clipped to
                the icon's silhouette, so the blob itself stays calm. */}
            <div
              className="absolute inset-0 flat-liquid"
              style={{
                background:
                  'linear-gradient(135deg, var(--magenta-300) 0%, var(--purple-300) 50%, var(--blue-300) 100%)',
                opacity: 0.5,
              }}
              aria-hidden="true"
            />
            <svg
              width="48"
              height="48"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="relative"
            >
              <defs>
                <linearGradient
                  id="ai-hero-sparkle-grad"
                  x1="35.584"
                  y1="3.32936"
                  x2="1.92087"
                  y2="6.07464"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#D341A5" />
                  <stop offset="1" stopColor="#6E6EDB" />
                </linearGradient>
                {/* Flash gradient — narrow white shine band, fully
                    transparent at the edges so it reads as a moving
                    highlight rather than a hard rectangle. */}
                <linearGradient
                  id="ai-hero-sparkle-flash"
                  x1="0"
                  y1="0"
                  x2="14"
                  y2="0"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="white" stopOpacity="0" />
                  <stop offset="0.5" stopColor="white" stopOpacity="0.95" />
                  <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>
                {/* Clip path matching the icon shapes — restricts the
                    flash sweep to the icon silhouette so the shine never
                    appears over the blob area. The stroke-only ring is
                    represented as the filled circle for clipping. */}
                <clipPath id="ai-hero-sparkle-clip">
                  <path d="M18.3617 4.69C18.4331 4.30768 18.636 3.96236 18.9352 3.71387C19.2344 3.46537 19.6111 3.32935 20 3.32935C20.3889 3.32935 20.7656 3.46537 21.0648 3.71387C21.364 3.96236 21.5669 4.30768 21.6383 4.69L23.39 13.9533C23.5144 14.6119 23.8345 15.2177 24.3084 15.6916C24.7823 16.1655 25.3881 16.4856 26.0467 16.61L35.31 18.3617C35.6923 18.4331 36.0376 18.636 36.2861 18.9352C36.5346 19.2344 36.6707 19.6111 36.6707 20C36.6707 20.3889 36.5346 20.7656 36.2861 21.0648C36.0376 21.364 35.6923 21.5669 35.31 21.6383L26.0467 23.39C25.3881 23.5144 24.7823 23.8345 24.3084 24.3084C23.8345 24.7823 23.5144 25.3881 23.39 26.0467L21.6383 35.31C21.5669 35.6923 21.364 36.0376 21.0648 36.2861C20.7656 36.5346 20.3889 36.6707 20 36.6707C19.6111 36.6707 19.2344 36.5346 18.9352 36.2861C18.636 36.0376 18.4331 35.6923 18.3617 35.31L16.61 26.0467C16.4856 25.3881 16.1655 24.7823 15.6916 24.3084C15.2177 23.8345 14.6119 23.5144 13.9533 23.39L4.69 21.6383C4.30768 21.5669 3.96236 21.364 3.71387 21.0648C3.46537 20.7656 3.32935 20.3889 3.32935 20C3.32935 19.6111 3.46537 19.2344 3.71387 18.9352C3.96236 18.636 4.30768 18.4331 4.69 18.3617L13.9533 16.61C14.6119 16.4856 15.2177 16.1655 15.6916 15.6916C16.1655 15.2177 16.4856 14.6119 16.61 13.9533L18.3617 4.69Z" />
                  <path d="M33.333 2.08301C34.0233 2.08301 34.5829 2.64276 34.583 3.33301V5.41699H36.667C37.3572 5.41717 37.917 5.97674 37.917 6.66699C37.9169 7.35713 37.3571 7.91682 36.667 7.91699H34.583V10C34.5828 10.6902 34.0233 11.25 33.333 11.25C32.6429 11.2498 32.0832 10.6901 32.083 10V7.91699H30C29.3097 7.91699 28.7501 7.35724 28.75 6.66699C28.75 5.97664 29.3096 5.41699 30 5.41699H32.083V3.33301C32.0831 2.64289 32.6429 2.08321 33.333 2.08301Z" />
                  <circle cx="6.66671" cy="33.3333" r="3.3333" />
                </clipPath>
              </defs>
              <path
                d="M18.3617 4.69C18.4331 4.30768 18.636 3.96236 18.9352 3.71387C19.2344 3.46537 19.6111 3.32935 20 3.32935C20.3889 3.32935 20.7656 3.46537 21.0648 3.71387C21.364 3.96236 21.5669 4.30768 21.6383 4.69L23.39 13.9533C23.5144 14.6119 23.8345 15.2177 24.3084 15.6916C24.7823 16.1655 25.3881 16.4856 26.0467 16.61L35.31 18.3617C35.6923 18.4331 36.0376 18.636 36.2861 18.9352C36.5346 19.2344 36.6707 19.6111 36.6707 20C36.6707 20.3889 36.5346 20.7656 36.2861 21.0648C36.0376 21.364 35.6923 21.5669 35.31 21.6383L26.0467 23.39C25.3881 23.5144 24.7823 23.8345 24.3084 24.3084C23.8345 24.7823 23.5144 25.3881 23.39 26.0467L21.6383 35.31C21.5669 35.6923 21.364 36.0376 21.0648 36.2861C20.7656 36.5346 20.3889 36.6707 20 36.6707C19.6111 36.6707 19.2344 36.5346 18.9352 36.2861C18.636 36.0376 18.4331 35.6923 18.3617 35.31L16.61 26.0467C16.4856 25.3881 16.1655 24.7823 15.6916 24.3084C15.2177 23.8345 14.6119 23.5144 13.9533 23.39L4.69 21.6383C4.30768 21.5669 3.96236 21.364 3.71387 21.0648C3.46537 20.7656 3.32935 20.3889 3.32935 20C3.32935 19.6111 3.46537 19.2344 3.71387 18.9352C3.96236 18.636 4.30768 18.4331 4.69 18.3617L13.9533 16.61C14.6119 16.4856 15.2177 16.1655 15.6916 15.6916C16.1655 15.2177 16.4856 14.6119 16.61 13.9533L18.3617 4.69Z"
                fill="url(#ai-hero-sparkle-grad)"
              />
              <path
                d="M33.333 2.08301C34.0233 2.08301 34.5829 2.64276 34.583 3.33301V5.41699H36.667C37.3572 5.41717 37.917 5.97674 37.917 6.66699C37.9169 7.35713 37.3571 7.91682 36.667 7.91699H34.583V10C34.5828 10.6902 34.0233 11.25 33.333 11.25C32.6429 11.2498 32.0832 10.6901 32.083 10V7.91699H30C29.3097 7.91699 28.7501 7.35724 28.75 6.66699C28.75 5.97664 29.3096 5.41699 30 5.41699H32.083V3.33301C32.0831 2.64289 32.6429 2.08321 33.333 2.08301Z"
                fill="#D341A5"
              />
              <path
                d="M6.66671 36.6667C8.50766 36.6667 10 35.1743 10 33.3333C10 31.4924 8.50766 30 6.66671 30C4.82576 30 3.33337 31.4924 3.33337 33.3333C3.33337 35.1743 4.82576 36.6667 6.66671 36.6667Z"
                stroke="#6E6EDB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Flash overlay — a narrow white band that sweeps left→right
                  every 3.6s. The `<g clipPath>` restricts the shine to
                  the icon silhouette so it only flashes over the visible
                  shapes, not the blob. */}
              <g clipPath="url(#ai-hero-sparkle-clip)">
                <rect
                  x="-14"
                  y="0"
                  width="14"
                  height="40"
                  fill="url(#ai-hero-sparkle-flash)"
                >
                  <animate
                    attributeName="x"
                    from="-14"
                    to="40"
                    dur="3.6s"
                    repeatCount="indefinite"
                  />
                </rect>
              </g>
            </svg>
          </div>
        )}
        </div>

        {/* Agent timeline — AI-gradient border ring around a flat white-50 surface */}
        <div
          className="rounded-[24px] p-[1.5px] w-full max-w-[520px] mx-auto"
          style={{
            background:
              'linear-gradient(246.77deg, var(--purple-200) 0%, var(--magenta-200) 100%)',
          }}
        >
          <div
            className="rounded-[22.5px] p-9"
            style={{ background: 'color-mix(in srgb, var(--white) 90%, transparent)' }}
          >
            <ol className="relative space-y-4 max-w-[360px] mx-auto">
              {/* Vertical connector line */}
              <div
                className="absolute left-[16px] top-3 bottom-3 w-px"
                style={{
                  background:
                    'linear-gradient(to bottom, transparent, var(--gray-300), transparent)',
                }}
              />
              {agents.map((agent, i) => {
                const state = stateFor(i, currentIdx)
                // Only render agents that have started — queued agents stay
                // hidden until their turn so the timeline grows progressively.
                if (state === 'queued') return null
                return (
                  <AgentRow
                    key={agent.id}
                    agent={agent}
                    state={state}
                    phaseIdx={i === currentIdx ? phaseIdx : 0}
                  />
                )
              })}
            </ol>
          </div>
        </div>

        {/* Completion CTA — appears only after all agents have transitioned
            to done. Sits below the gradient-ringed timeline, fading in. */}
        {completedAction && (
          <div className="mt-16 flex flex-col items-center text-center ai-fade-up">
            {completedAction}
          </div>
        )}
      </div>
    </div>
  )
}

function AgentRow({
  agent,
  state,
  phaseIdx,
}: {
  agent: Agent
  state: AgentState
  phaseIdx: number
}) {
  const accentColor = `var(--${agent.color}-500)`

  return (
    <li
      className={cn(
        'relative flex items-start gap-3 py-1.5 transition-opacity duration-300 ai-fade-up',
        state === 'done' && 'opacity-90',
      )}
    >
      <div className="relative z-10 mt-0.5 flex-shrink-0">
        <AgentStatus state={state} color={agent.color} icon={agent.icon} />
      </div>
      <div className="flex-1 min-w-0 pt-px">
        {state === 'queued' ? (
          <div className="space-y-2.5">
            <SkeletonBar width="60%" height="14px" shimmering />
            <SkeletonBar width="85%" height="10px" shimmering />
          </div>
        ) : state === 'done' ? (
          <>
            {/* Line 1: agent name */}
            <p className="text-[13px] font-semibold text-gray-900 leading-snug whitespace-nowrap">
              {agent.name}
            </p>
            {/* Line 2: meaningful success message + double tick */}
            <p className="text-[13px] leading-snug text-gray-600 whitespace-nowrap mt-0.5">
              {agent.successPhrase}
              <CheckCheck
                className="inline-block ml-1.5 w-3.5 h-3.5 align-middle"
                strokeWidth={2.5}
                style={{ color: 'var(--green-500)' }}
              />
            </p>
          </>
        ) : (
          <>
            {/* Line 1: agent name */}
            <p className="text-[13px] font-semibold text-gray-900 leading-snug whitespace-nowrap">
              {agent.name}
            </p>
            {/* Line 2: "working on it" + animated dot trail */}
            <p className="text-[13px] leading-snug whitespace-nowrap mt-0.5">
              <span className="text-gray-600">is working on it</span>
              <DotTrail color={accentColor} />
            </p>

            {/* Phase checklist box — opens below the title */}
            <div
              className="mt-2 rounded-md p-2.5 space-y-1.5 ai-fade-up"
              style={{
                background: 'var(--gray-50)',
                border: '1px solid var(--gray-100)',
              }}
            >
              {agent.phases.map((phrase, i) => {
                const isPast = i < phaseIdx
                const isCurrent = i === phaseIdx
                // Hide yet-to-start sub-items — only render past (done) and
                // current (in-flight) phases. The box grows as the agent
                // progresses through its phases.
                if (!isPast && !isCurrent) return null
                const label = stripIsPrefix(phrase)
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-[12px]"
                  >
                    {isPast && (
                      <Check
                        className="w-3.5 h-3.5 flex-shrink-0"
                        strokeWidth={3}
                        style={{ color: 'var(--green-500)' }}
                      />
                    )}
                    {isCurrent && (
                      <span
                        className="relative flex items-center justify-center flex-shrink-0"
                        style={{ width: '14px', height: '14px' }}
                        aria-hidden="true"
                      >
                        <span className="relative flex w-1.5 h-1.5">
                          <span className="absolute inset-0 rounded-full bg-blue-500 ai-pulse-ping" />
                          <span className="relative rounded-full w-1.5 h-1.5 bg-blue-500" />
                        </span>
                      </span>
                    )}
                    {!isPast && !isCurrent && (
                      <Circle
                        className="w-3.5 h-3.5 flex-shrink-0 text-gray-300"
                        strokeWidth={1.5}
                      />
                    )}
                    <span
                      className={cn(
                        'leading-snug whitespace-nowrap',
                        isPast && 'text-gray-700',
                        isCurrent && 'text-shimmer font-medium',
                        !isPast && !isCurrent && 'text-gray-400',
                      )}
                      style={
                        isCurrent
                          ? {
                              backgroundImage:
                                'linear-gradient(90deg, var(--gray-900) 0%, var(--gray-900) 35%, var(--gray-400) 50%, var(--gray-900) 65%, var(--gray-900) 100%)',
                            }
                          : undefined
                      }
                    >
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </li>
  )
}

// Three pulsing dots after "working on it" — same staggered pulse pattern as
// before, just abstracted into a tiny component.
function DotTrail({ color }: { color: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        marginLeft: '6px',
        verticalAlign: 'middle',
      }}
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="dot-pulse"
          style={{
            width: '4px',
            height: '4px',
            borderRadius: '9999px',
            background: color,
            animationDelay: `${i * 200}ms`,
          }}
        />
      ))}
    </span>
  )
}

// Strip a leading "is " from a phase so the checklist rows read cleanly
// ("is creating roles for your team" → "creating roles for your team").
function stripIsPrefix(phrase: string): string {
  return phrase.replace(/^is\s+/, '')
}

// Rounded-corner square — 32×32 native coordinate space with 12px corner
// radius. Since the avatar renders at 32×32 on screen, viewBox units map 1:1
// to rendered pixels (12 path units = 12 visual pixels).
const AVATAR_PATH_D =
  'M 12 0 H 20 A 12 12 0 0 1 32 12 V 20 A 12 12 0 0 1 20 32 H 12 A 12 12 0 0 1 0 20 V 12 A 12 12 0 0 1 12 0 Z'

const AVATAR_VIEW_BOX = '0 0 32 32'

// 12 dot positions evenly spaced around a circle (clock positions) for the
// iOS-style sequence loader. Computed once at module load — radius 5 inside
// the 14×14 viewBox, starting at 12 o'clock.
const IOS_DOT_POSITIONS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * 30 - 90) * (Math.PI / 180)
  return {
    cx: 7 + 5 * Math.cos(angle),
    cy: 7 + 5 * Math.sin(angle),
  }
})

// Three states map to three avatar treatments:
//   • active — bold gradient avatar whose fill rotates 360° via SVG
//              <animateTransform> (`gradient-shift`), so colours appear to
//              flow through the squircle
//   • queued — same static `-400 → -500` gradient avatar as Done, but the
//              wrapper is dimmed to 35% opacity to read as "waiting"
//   • done   — bold static `-400 → -500` gradient avatar (full opacity)
// Other explored active-state variants are archived in
// `kissflow-react/docs/AGENT_ACTIVE_VARIANTS.md`.
function AgentStatus({
  state,
  color,
  icon: Icon,
}: {
  state: AgentState
  color: Agent['color']
  icon: LucideIcon
}) {
  if (state === 'active') {
    return <ActiveGradientShiftAvatar color={color} Icon={Icon} />
  }
  return <StaticBoldAvatar color={color} Icon={Icon} />
}

function ActiveGradientShiftAvatar({
  color,
  Icon,
}: {
  color: Agent['color']
  Icon: LucideIcon
}) {
  const gradId = `agent-grad-${color}`
  return (
    <div className="relative w-[32px] h-[32px]">
      <svg
        viewBox={AVATAR_VIEW_BOX}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={gradId}
            gradientUnits="objectBoundingBox"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor={`var(--${color}-300)`} />
            <stop offset="50%" stopColor={`var(--${color}-600)`} />
            <stop offset="100%" stopColor={`var(--${color}-300)`} />
            <animateTransform
              attributeName="gradientTransform"
              type="rotate"
              from="0 0.5 0.5"
              to="360 0.5 0.5"
              dur="4.5s"
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>
        <path d={AVATAR_PATH_D} fill={`url(#${gradId})`} />
      </svg>
      <Icon
        className="absolute inset-0 m-auto w-4 h-4"
        strokeWidth={2.25}
        style={{ color: 'var(--white)' }}
      />
    </div>
  )
}

function StaticBoldAvatar({
  color,
  Icon,
}: {
  color: Agent['color']
  Icon: LucideIcon
}) {
  const gradId = `agent-grad-${color}`
  return (
    <div className="relative w-[32px] h-[32px]">
      <svg
        viewBox={AVATAR_VIEW_BOX}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`var(--${color}-400)`} />
            <stop offset="100%" stopColor={`var(--${color}-500)`} />
          </linearGradient>
        </defs>
        <path d={AVATAR_PATH_D} fill={`url(#${gradId})`} />
      </svg>
      <Icon
        className="absolute inset-0 m-auto w-4 h-4"
        strokeWidth={2.25}
        style={{ color: 'var(--white)' }}
      />
    </div>
  )
}

/* ---------- Right pane: spec artifact ---------- */

// ----- Mock spec content -----
// Demo content for "Vendor Onboarding and Management" (the locked-in mock
// app from BuildWithAIView). Replace these constants when wiring real AI.

interface RoleSpec {
  name: string
  responsibilities: string[]
}

interface EntityField {
  id: string
  name: string
  type: string
  required: boolean
}

type PermissionLevel = 'read' | 'edit' | 'manage'

interface EntityPermission {
  role: string
  level: PermissionLevel
}

interface EntitySpec {
  name: string
  description: string
  fields: EntityField[]
  permissions: EntityPermission[]
}

interface PageSpec {
  name: string
  description: string
}

interface NavMenuItem {
  label: string
  page?: string
  children?: NavMenuItem[]
}

interface NavigationSpec {
  title: string
  sharedWith: string[] // role names this navigation is exposed to
  menu: NavMenuItem[]
}

const MOCK_ROLES: RoleSpec[] = [
  {
    name: 'Vendor Manager',
    responsibilities: [
      'Oversees the entire vendor lifecycle from onboarding through renewal',
      'Coordinates handoffs between Procurement, Legal, and Finance teams',
      'Owns relationship management and quarterly performance reviews',
      'Approves vendor offboarding and contract closure',
    ],
  },
  {
    name: 'Procurement Lead',
    responsibilities: [
      'Approves new vendor requests and negotiates commercial terms',
      'Reviews vendor proposals and conducts comparative analysis',
      'Signs off on final pricing, payment terms, and SLAs',
      'Acts as the primary point of contact for vendor escalations',
    ],
  },
  {
    name: 'Compliance Officer',
    responsibilities: [
      'Reviews legal documentation and compliance certifications',
      'Validates insurance coverage and contractual liability clauses',
      'Conducts risk assessments for every incoming vendor',
      'Ensures vendors meet internal policy and industry regulations',
    ],
  },
]

const MOCK_ENTITIES: EntitySpec[] = [
  {
    name: 'Vendor',
    description:
      'The core record for every supplier in the system. Holds identifying information, categorization, status, and onboarding history.',
    fields: [
      { id: 'F001', name: 'Vendor Name', type: 'Text', required: true },
      { id: 'F002', name: 'Vendor Code', type: 'Text', required: true },
      { id: 'F003', name: 'Category', type: 'Dropdown', required: true },
      { id: 'F004', name: 'Status', type: 'Status', required: true },
      { id: 'F005', name: 'Onboarded On', type: 'Date', required: false },
    ],
    permissions: [
      { role: 'Vendor Manager', level: 'manage' },
      { role: 'Procurement Lead', level: 'edit' },
      { role: 'Compliance Officer', level: 'read' },
    ],
  },
  {
    name: 'Contract',
    description:
      'Every signed agreement between your organization and a vendor. Tracks dates, terms, and the commercial value of the relationship.',
    fields: [
      { id: 'F101', name: 'Contract ID', type: 'Text', required: true },
      { id: 'F102', name: 'Vendor', type: 'Reference', required: true },
      { id: 'F103', name: 'Start Date', type: 'Date', required: true },
      { id: 'F104', name: 'End Date', type: 'Date', required: true },
      { id: 'F105', name: 'Value', type: 'Currency', required: true },
    ],
    permissions: [
      { role: 'Vendor Manager', level: 'edit' },
      { role: 'Procurement Lead', level: 'manage' },
      { role: 'Compliance Officer', level: 'edit' },
    ],
  },
  {
    name: 'Document',
    description:
      'Files attached to a vendor or contract — proposals, certifications, invoices, and signed legal copies. Each document has a type and an owner.',
    fields: [
      { id: 'F201', name: 'Document Name', type: 'Text', required: true },
      { id: 'F202', name: 'Type', type: 'Dropdown', required: true },
      { id: 'F203', name: 'Uploaded By', type: 'User', required: true },
      { id: 'F204', name: 'Uploaded On', type: 'Date', required: true },
    ],
    permissions: [
      { role: 'Vendor Manager', level: 'edit' },
      { role: 'Procurement Lead', level: 'read' },
      { role: 'Compliance Officer', level: 'manage' },
    ],
  },
]

// Workflow names + their step sequences — displayed the same way as
// Data entities: name on line 1, comma-separated steps on line 2.
interface WorkflowSpec {
  name: string
  steps: string[]
}

const MOCK_WORKFLOWS: WorkflowSpec[] = [
  {
    name: 'Vendor Onboarding Approval',
    steps: ['Draft', 'Manager Review', 'Legal Sign-off', 'Approved'],
  },
  {
    name: 'Contract Review Cycle',
    steps: ['Draft', 'Legal Review', 'Commercial Review', 'Signed'],
  },
  {
    name: 'Renewal Reminder',
    steps: ['Triggered', 'Notified', 'Action Taken', 'Closed'],
  },
  {
    name: 'Compliance Audit',
    steps: ['Scheduled', 'In Progress', 'Findings Logged', 'Resolved'],
  },
]

const MOCK_PAGES: PageSpec[] = [
  {
    name: 'Vendor Dashboard',
    description:
      'Real-time overview of vendor status, active contracts, and upcoming renewals. Surfaces quick-filter widgets, alerts for expiring agreements, and a snapshot of pending approvals across the team.',
  },
  {
    name: 'Vendor Profile',
    description:
      'Complete profile, history, documents, and contract details for a single vendor. Combines basic information, performance metrics, and the full timeline of interactions and document submissions in one scrollable view.',
  },
  {
    name: 'Onboarding Form',
    description:
      'Multi-step intake form for new vendor registration. Captures company details, banking info, certifications, and supporting documents — then routes the submission through Procurement and Compliance approvals.',
  },
  {
    name: 'Renewal Tracker',
    description:
      'Calendar view of upcoming contract renewals with action items. Highlights agreements approaching expiry, contracts pending review, and renewals needing manager sign-off across the vendor portfolio.',
  },
  {
    name: 'Reports',
    description:
      'Analytics, KPIs, and exportable insights across all vendors. Includes spend trends, performance scorecards, compliance status, and renewal forecasts with custom filters and downloadable exports.',
  },
]

const MOCK_NAV: NavigationSpec[] = [
  {
    title: 'Buyer Navigation',
    sharedWith: ['Vendor Manager', 'Procurement Lead'],
    menu: [
      { label: 'Home', page: 'Vendor Dashboard' },
      {
        label: 'Vendors',
        children: [
          { label: 'All Vendors', page: 'Vendor Profile' },
          { label: 'Add Vendor', page: 'Onboarding Form' },
        ],
      },
      { label: 'Renewals', page: 'Renewal Tracker' },
    ],
  },
  {
    title: 'Compliance Navigation',
    sharedWith: ['Compliance Officer'],
    menu: [
      { label: 'Home', page: 'Vendor Dashboard' },
      {
        label: 'Documents',
        children: [
          { label: 'Pending Review', page: 'Vendor Profile' },
          { label: 'Approved', page: 'Vendor Profile' },
        ],
      },
      { label: 'Reports', page: 'Reports' },
    ],
  },
]

function RightPane({
  currentIdx,
  phaseIdx,
  appName,
  appDescription,
}: {
  currentIdx: number
  phaseIdx: number
  appName: string
  appDescription: string
}) {
  // Post-review flow has five agents: two pre-run scanning agents (already
  // 'done') + App Builder (agent 2, 5 sub-items) + Designer (agent 3, 2
  // sub-items) + Publisher (agent 4, 1 sub-item). Right-pane sections are
  // driven by App Builder's phase progression (Roles + Data entities) and
  // Designer's phase progression (Pages + Navigation).
  const builderState = stateFor(APP_BUILDER_AGENT_IDX, currentIdx)
  const designerState = stateFor(DESIGNER_AGENT_IDX, currentIdx)

  // Effective phase index within an agent — 0 while it's queued, current
  // `phaseIdx` while it's active, or its full phase count once it's done.
  const phaseIn = (idx: number, state: AgentState) =>
    state === 'active'
      ? phaseIdx
      : state === 'done'
        ? AGENTS[idx].phases.length
        : 0

  const builderPhase = phaseIn(APP_BUILDER_AGENT_IDX, builderState)
  const designerPhase = phaseIn(DESIGNER_AGENT_IDX, designerState)

  // App Builder phase index reference:
  //   0 Creating the user roles            → Roles resolve when phase >= 1
  //   1 Allocating stable identifiers
  //   2 Creating the master lists
  //   3 Creating the data entities         → Data entities loader appears
  //   4 Creating fields, views and reports → Entities resolve when phase >= 5
  //   5 Wiring up the workflows            → Workflow loader appears; resolves when phase >= 6
  //
  // Designer phase index reference:
  //   0 Composing the page layouts         → Pages loader appears; resolves when phase >= 1
  //   1 Building the navigation menus      → Nav loader appears; resolves when phase >= 2
  //
  // Sequential reveal: only one section is generating at a time. As each
  // section flips to Generated, the next one appears with its skeleton and
  // starts loading. Previously-completed sections stay visible above.
  const rolesShown = true
  const rolesResolved = builderPhase >= 1
  const entitiesShown = rolesResolved
  const entitiesResolved = builderPhase >= 5
  const workflowsShown = entitiesResolved
  const workflowsResolved = builderPhase >= 6
  const pagesShown = workflowsResolved
  const pagesResolved = designerPhase >= 1
  const navShown = pagesResolved
  const navResolved = designerPhase >= 2

  return (
    <div className="bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_12px_40px_rgba(34,42,59,0.06),0_1px_3px_rgba(34,42,59,0.04)] flex flex-col min-h-0 overflow-hidden">
      {/* Pinned identity header — purple-tinted surface */}
      <div className="p-5 flex-shrink-0">
        <div
          className="rounded-xl p-4"
          style={{
            background:
              'linear-gradient(135deg, var(--purple-100) 0%, var(--magenta-100) 100%)',
            border: '1px solid var(--purple-300)',
          }}
        >
          <AppIdentity name={appName} description={appDescription} />
        </div>
      </div>

      {/* Scrollable agent-generated sections — a gray-200 separator sits
          between every pair via `divide-y`. Each direct child gets 18px
          top/bottom padding so the divider has equal breathing room, and
          the first/last children trim their outside edges so we don't
          add extra padding at the very top / bottom of the scroll area. */}
      <div className="flex-1 overflow-y-auto px-10 py-7 divide-y divide-gray-200 [&>*]:py-[18px] [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
        {/* 1. Roles — first section, shown from the moment the screen mounts. */}
        {rolesShown && (
          <Section
            title="Roles"
            subtitle="Control access and responsibilities across your app"
            count={String(MOCK_ROLES.length)}
            accentColor="var(--magenta-500)"
            icon={Users}
            status={rolesResolved ? 'done' : 'generating'}
          >
            {rolesResolved ? (
              <RoleList items={MOCK_ROLES} />
            ) : (
              <RowListSkeleton count={MOCK_ROLES.length} />
            )}
          </Section>
        )}

        {/* 2. Data entities — appears once Roles resolves. */}
        {entitiesShown && (
          <Section
            title="Data entities"
            subtitle="Schema definitions with field types and per-role permissions"
            count={String(MOCK_ENTITIES.length)}
            accentColor="var(--green-500)"
            icon={Database}
            status={entitiesResolved ? 'done' : 'generating'}
          >
            {entitiesResolved ? (
              <EntityList items={MOCK_ENTITIES} />
            ) : (
              <RowListSkeleton count={MOCK_ENTITIES.length} lines={2} />
            )}
          </Section>
        )}

        {/* 3. Workflows — appears once Data entities resolves. */}
        {workflowsShown && (
          <Section
            title="Workflows"
            subtitle="Approval chains and background flows that move records along"
            count={String(MOCK_WORKFLOWS.length)}
            accentColor="var(--orange-500)"
            icon={Workflow}
            status={workflowsResolved ? 'done' : 'generating'}
          >
            {workflowsResolved ? (
              <WorkflowList items={MOCK_WORKFLOWS} />
            ) : (
              <RowListSkeleton count={MOCK_WORKFLOWS.length} lines={2} />
            )}
          </Section>
        )}

        {/* 4. Pages — appears once Workflows resolves. */}
        {pagesShown && (
          <Section
            title="Pages"
            subtitle="End-user pages composing the app interface"
            count={String(MOCK_PAGES.length)}
            accentColor="var(--blue-500)"
            icon={FileText}
            status={pagesResolved ? 'done' : 'generating'}
          >
            {pagesResolved ? (
              <PageList items={MOCK_PAGES} />
            ) : (
              <RowListSkeleton count={MOCK_PAGES.length} />
            )}
          </Section>
        )}

        {/* 5. Navigation — appears once Pages resolves. */}
        {navShown && (
          <Section
            title="Navigation"
            subtitle="Menus tailored to each role group"
            count={String(MOCK_NAV.length)}
            accentColor="var(--purple-500)"
            icon={Compass}
            status={navResolved ? 'done' : 'generating'}
          >
            {navResolved ? (
              <NavSitemap items={MOCK_NAV} />
            ) : (
              <RowListSkeleton count={MOCK_NAV.length} />
            )}
          </Section>
        )}
      </div>
    </div>
  )
}

// Meaningful default copy for the demo when the upstream description is empty
// or too thin to read as a real "AI summary". Renders as ~2 lines in the spec card.
const FALLBACK_DESCRIPTION =
  'An intelligent application crafted by our AI agents to match your business needs. The blueprint covers roles, data, workflows, pages, and navigation — ready for your team to start using right away.'

function AppIdentity({ name, description }: { name: string; description: string }) {
  const trimmed = description?.trim() ?? ''
  const displayDescription = trimmed.length > 60 ? trimmed : FALLBACK_DESCRIPTION

  return (
    <div className="ai-fade-up">
      {/* Name + description stack — no icon, the container itself carries the AI accent */}
      <h3 className="text-[16px] font-semibold text-gray-900 tracking-tight leading-snug">
        {name}
      </h3>
      <p className="mt-1.5 text-[13px] text-gray-600 leading-relaxed whitespace-pre-line">
        {displayDescription}
      </p>
    </div>
  )
}

// Section header — accent dot + 18px semibold title + count badge + subtitle.
// Per-item icons appear next to each row in the body content.
function Section({
  title,
  subtitle,
  count,
  accentColor,
  icon: Icon,
  children,
  status,
}: {
  title: string
  subtitle?: string
  count?: string
  accentColor: string
  icon?: LucideIcon
  children: React.ReactNode
  status?: 'generating' | 'done'
}) {
  return (
    <div className="ai-fade-up">
      <div className="flex items-center gap-2.5">
        {Icon ? (
          <Icon
            className="w-4 h-4 flex-shrink-0"
            strokeWidth={1.75}
            style={{ color: accentColor }}
            aria-hidden="true"
          />
        ) : (
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: accentColor }}
            aria-hidden="true"
          />
        )}
        <h3 className="text-[16px] font-semibold text-gray-900 tracking-tight leading-snug">
          {title}
        </h3>
        {count !== undefined && <CountBadge>{count}</CountBadge>}
        <div className="flex-1" />
        {status === 'generating' && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white px-2 py-0.5 rounded-full bg-magenta-500">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-white ai-pulse-ping" />
              <span className="relative rounded-full w-1.5 h-1.5 bg-white" />
            </span>
            Generating
          </span>
        )}
        {status === 'done' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white px-2 py-0.5 rounded-full bg-green-500">
            <Check className="w-2.5 h-2.5" strokeWidth={3.5} />
            Generated
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-[12px] text-gray-700 mt-1 mb-4 leading-snug ml-[26px]">
          {subtitle}
        </p>
      )}
      {!subtitle && <div className="mb-4" />}
      <div className="pl-[26px]">{children}</div>
    </div>
  )
}

// Small gray pill showing a count in the section heading.
function CountBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] bg-gray-100 text-gray-700 px-1.5 py-1 rounded-full font-medium leading-none">
      {children}
    </span>
  )
}

// Colored badge for entity field types — color picks up the type's meaning.
const FIELD_TYPE_BADGE: Record<string, string> = {
  Text: 'bg-gray-100 text-gray-700',
  Date: 'bg-blue-50 text-blue-700',
  Currency: 'bg-green-50 text-green-700',
  Reference: 'bg-purple-50 text-purple-700',
  Dropdown: 'bg-cyan-50 text-cyan-700',
  Status: 'bg-magenta-50 text-magenta-700',
  User: 'bg-purple-50 text-purple-700',
}

function FieldTypeBadge({ type }: { type: string }) {
  const cls = FIELD_TYPE_BADGE[type] ?? 'bg-gray-100 text-gray-700'
  return (
    <span
      className={`inline-block text-[11px] ${cls} px-1.5 py-0.5 rounded font-medium leading-none`}
    >
      {type}
    </span>
  )
}

// Single chip showing a role's permission level on a given entity.
const PERMISSION_BADGE: Record<PermissionLevel, { cls: string; label: string }> = {
  read: { cls: 'bg-gray-100 text-gray-700', label: 'Read-only' },
  edit: { cls: 'bg-blue-100 text-blue-700', label: 'Edit' },
  manage: { cls: 'bg-green-100 text-green-700', label: 'Manage' },
}

function PermissionChip({ level }: { level: PermissionLevel }) {
  const { cls, label } = PERMISSION_BADGE[level]
  return (
    <span
      className={`inline-block text-[11px] ${cls} px-2 py-0.5 rounded font-medium leading-none`}
    >
      {label}
    </span>
  )
}

// Roles — checklist of generated role names. Green tick before each name
// signals the role has been generated. Detailed responsibilities are no
// longer surfaced here (see role editor for the full breakdown).
function RoleList({ items }: { items: RoleSpec[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li
          key={item.name}
          className="flex items-center gap-2 ai-fade-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <Check
            className="w-4 h-4 flex-shrink-0"
            strokeWidth={3}
            style={{ color: 'var(--green-500)' }}
          />
          <span className="text-[13px] text-gray-900 leading-snug">
            {item.name}
          </span>
        </li>
      ))}
    </ul>
  )
}

// Pages list — each page as a compact card. FileText icon next to the name,
// 2-3 line description below.
// Workflows — checklist of generated workflow names, each followed by a
// comma-separated list of its step names on a second line (matches the
// EntityList shape). Detailed transitions are hidden here (see the
// workflow editor).
function WorkflowList({ items }: { items: WorkflowSpec[] }) {
  return (
    <ul className="space-y-3">
      {items.map((workflow, i) => (
        <li
          key={workflow.name}
          className="flex items-start gap-2 ai-fade-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <Check
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            strokeWidth={3}
            style={{ color: 'var(--green-500)' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-gray-900 leading-snug">
              {workflow.name}
            </p>
            <p className="text-[13px] text-gray-600 leading-relaxed mt-1">
              <span className="text-gray-500">Steps: </span>
              {workflow.steps.join(', ')}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

// Pages — checklist of generated page names. Descriptions are surfaced in
// the page editor rather than here so this section stays scannable.
function PageList({ items }: { items: PageSpec[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li
          key={item.name}
          className="flex items-center gap-2 ai-fade-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <Check
            className="w-4 h-4 flex-shrink-0"
            strokeWidth={3}
            style={{ color: 'var(--green-500)' }}
          />
          <span className="text-[13px] text-gray-900 leading-snug">
            {item.name}
          </span>
        </li>
      ))}
    </ul>
  )
}

// Data entities — checklist of generated entity names, each followed by a
// short description line and a comma-separated list of its field names.
// Field types + per-role permissions are hidden here (see the entity editor).
function EntityList({ items }: { items: EntitySpec[] }) {
  return (
    <ul className="space-y-3">
      {items.map((entity, i) => (
        <li
          key={entity.name}
          className="flex items-start gap-2 ai-fade-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <Check
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            strokeWidth={3}
            style={{ color: 'var(--green-500)' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-gray-900 leading-snug">
              {entity.name}
            </p>
            <p className="text-[13px] text-gray-600 leading-relaxed mt-1">
              <span className="text-gray-500">Fields: </span>
              {entity.fields.map((f) => f.name).join(', ')}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

// Row-list loader — N flat rows (no card chrome). Each row: a muted circle
// placeholder in the tick slot + one or more shimmering skeleton bars
// standing in for the row's text. Meant to preview how many items the agent
// is about to generate (e.g. 3 rows for 3 roles) so the space doesn't jump
// when the resolved rows swap in.
function RowListSkeleton({
  count,
  lines = 1,
}: {
  count: number
  lines?: number
}) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex items-start gap-2">
          <Circle
            className="w-4 h-4 flex-shrink-0 text-gray-300 mt-0.5"
            strokeWidth={1.75}
          />
          {lines === 1 ? (
            <div className="flex-1 flex items-center py-1">
              <SkeletonBar
                width={`${60 + ((i * 7) % 25)}%`}
                height="10px"
                shimmering
              />
            </div>
          ) : (
            <div className="flex-1 space-y-1.5 py-1">
              <SkeletonBar width="55%" height="10px" shimmering />
              {Array.from({ length: lines - 1 }).map((_, j) => (
                <SkeletonBar
                  key={j}
                  width={j === lines - 2 ? '75%' : '92%'}
                  height="8px"
                  shimmering
                />
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

// Single-item loader — the old SectionSkeleton shape: icon + 1 title bar + N
// description bars. Depicts "one item being created" while the agent works.
// Icon uses the section's brand colour so the user can see which kind of item
// is being generated.
function SingleItemSkeleton({
  icon: Icon,
  color,
  descriptionLines = 3,
}: {
  icon: LucideIcon
  color: string
  descriptionLines?: number
}) {
  const widths = ['100%', '92%', '76%', '60%']
  return (
    <div className="flex gap-3">
      <Icon
        className="w-[18px] h-[18px] flex-shrink-0 mt-0.5"
        strokeWidth={1.75}
        style={{ color }}
      />
      <div className="flex-1 space-y-2.5">
        <SkeletonBar width="48%" height="14px" shimmering />
        {Array.from({ length: descriptionLines }).map((_, i) => (
          <SkeletonBar
            key={i}
            width={widths[i] ?? '60%'}
            height="10px"
            shimmering
          />
        ))}
      </div>
    </div>
  )
}

// Navigation skeleton — a compact tree-shaped placeholder (no icon).
function NavSkeleton() {
  return (
    <div className="space-y-2.5">
      <SkeletonBar width="40%" height="12px" shimmering />
      <div className="pl-5 space-y-2.5">
        <SkeletonBar width="55%" height="10px" shimmering />
        <SkeletonBar width="50%" height="10px" shimmering />
      </div>
      <SkeletonBar width="35%" height="12px" shimmering />
    </div>
  )
}

// Lightweight entity name list shown during Flow agent's success phase, just
// before the Entity agent takes over and replaces this with full tables.
function EntityNameList({ entities }: { entities: EntitySpec[] }) {
  return (
    <ul className="space-y-3">
      {entities.map((entity, i) => (
        <li
          key={entity.name}
          className="flex items-center gap-3 ai-fade-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <Database
            className="w-[18px] h-[18px] flex-shrink-0"
            strokeWidth={1.75}
            style={{ color: 'var(--green-500)' }}
          />
          <p className="text-[14px] font-semibold text-gray-900">
            {entity.name}
          </p>
        </li>
      ))}
    </ul>
  )
}

// Per-entity card — shadcn-style elevated card. Header has Database icon +
// name + inline stats. Body shows description, fields table with type chips
// and dot-required column, then a 2-column permission chip table.
function EntityTable({
  entity,
  rowsLoading,
}: {
  entity: EntitySpec
  rowsLoading: boolean
}) {
  const requiredCount = entity.fields.filter((f) => f.required).length
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-all ai-fade-up">
      {/* Header: icon + name + inline stats */}
      <div className="flex items-start gap-2.5">
        <Database
          className="w-[18px] h-[18px] flex-shrink-0 mt-0.5"
          strokeWidth={1.75}
          style={{ color: 'var(--green-500)' }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-[14px] font-semibold text-gray-900 leading-snug">
              {entity.name}
            </h4>
            <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
              {entity.fields.length} fields · {requiredCount} required
            </span>
          </div>
          <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
            {entity.description}
          </p>
        </div>
      </div>

      {/* Fields table */}
      <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-[12px] leading-snug">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-3 py-2 font-medium text-gray-700 border-b border-gray-200">
                Field Name
              </th>
              <th className="text-left px-3 py-2 font-medium text-gray-700 border-b border-gray-200">
                Type
              </th>
              <th className="text-center px-3 py-2 font-medium text-gray-700 border-b border-gray-200 w-[80px]">
                Required
              </th>
            </tr>
          </thead>
          <tbody>
            {rowsLoading
              ? Array.from({ length: entity.fields.length }).map((_, i) => (
                  <tr
                    key={i}
                    className={
                      i < entity.fields.length - 1
                        ? 'border-b border-gray-100'
                        : ''
                    }
                  >
                    <td className="px-3 py-2">
                      <SkeletonBar width="90px" height="10px" shimmering />
                    </td>
                    <td className="px-3 py-2">
                      <SkeletonBar width="50px" height="10px" shimmering />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="inline-block">
                        <SkeletonBar width="10px" height="10px" shimmering />
                      </div>
                    </td>
                  </tr>
                ))
              : entity.fields.map((field, i) => (
                  <tr
                    key={field.id}
                    className={
                      i < entity.fields.length - 1
                        ? 'border-b border-gray-100'
                        : ''
                    }
                  >
                    <td className="px-3 py-2 text-gray-900">{field.name}</td>
                    <td className="px-3 py-2">
                      <FieldTypeBadge type={field.type} />
                    </td>
                    <td className="px-3 py-2 text-center">
                      {field.required && (
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: 'var(--green-500)' }}
                          aria-label="Required"
                        />
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Permissions */}
      <p className="text-[13px] text-gray-600 mt-5 mb-2 leading-relaxed">
        <span className="font-semibold text-gray-900">Permissions</span>
        {' — '}
        Who can view, edit, or fully manage {entity.name} records.
      </p>
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-[12px] leading-snug">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-3 py-2 font-medium text-gray-700 border-b border-gray-200">
                Role
              </th>
              <th className="text-left px-3 py-2 font-medium text-gray-700 border-b border-gray-200">
                Permission
              </th>
            </tr>
          </thead>
          <tbody>
            {rowsLoading
              ? entity.permissions.map((_, i) => (
                  <tr
                    key={i}
                    className={
                      i < entity.permissions.length - 1
                        ? 'border-b border-gray-100'
                        : ''
                    }
                  >
                    <td className="px-3 py-2">
                      <SkeletonBar width="120px" height="10px" shimmering />
                    </td>
                    <td className="px-3 py-2">
                      <SkeletonBar width="60px" height="10px" shimmering />
                    </td>
                  </tr>
                ))
              : entity.permissions.map((perm, i) => (
                  <tr
                    key={perm.role}
                    className={
                      i < entity.permissions.length - 1
                        ? 'border-b border-gray-100'
                        : ''
                    }
                  >
                    <td className="px-3 py-2 text-gray-900">{perm.role}</td>
                    <td className="px-3 py-2">
                      <PermissionChip level={perm.level} />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Navigation — checklist of generated navigation names. Shared-with roles
// and the menu tree are surfaced in the navigation editor rather than here.
function NavSitemap({ items }: { items: NavigationSpec[] }) {
  return (
    <ul className="space-y-3">
      {items.map((nav, i) => (
        <li
          key={nav.title}
          className="flex items-center gap-2 ai-fade-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <Check
            className="w-4 h-4 flex-shrink-0"
            strokeWidth={3}
            style={{ color: 'var(--green-500)' }}
          />
          <span className="text-[13px] text-gray-900 leading-snug">
            {nav.title}
          </span>
        </li>
      ))}
    </ul>
  )
}

// Single menu item — top-level row with optional sub-menu rows indented
// under a vertical purple connector. Rendered inside a `NavSitemap` card,
// so it carries no card chrome of its own.
function NavMenu({ item }: { item: NavMenuItem }) {
  const hasChildren = !!item.children?.length
  return (
    <div>
      <div className="flex items-center gap-2 text-[13px]">
        <span
          className="w-1 h-1 rounded-full flex-shrink-0"
          style={{ backgroundColor: 'var(--gray-500)' }}
          aria-hidden="true"
        />
        <span className="font-semibold text-gray-900">{item.label}</span>
        {!hasChildren && item.page && (
          <>
            <ArrowRight
              className="w-3 h-3 flex-shrink-0"
              strokeWidth={2}
              style={{ color: 'var(--gray-400)' }}
            />
            <span className="text-gray-600">{item.page}</span>
          </>
        )}
      </div>
      {hasChildren && (
        <div
          className="mt-1.5 pl-3 ml-0.5 space-y-1.5 border-l"
          style={{ borderColor: 'var(--gray-200)' }}
        >
          {item.children!.map((child) => (
            <div
              key={child.label}
              className="flex items-center gap-2 text-[13px]"
            >
              <span
                className="w-1 h-1 rounded-full flex-shrink-0"
                style={{ backgroundColor: 'var(--gray-500)' }}
                aria-hidden="true"
              />
              <span className="font-medium text-gray-900">{child.label}</span>
              {child.page && (
                <>
                  <ArrowRight
                    className="w-3 h-3 flex-shrink-0"
                    strokeWidth={2}
                    style={{ color: 'var(--gray-400)' }}
                  />
                  <span className="text-gray-600">{child.page}</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SkeletonBar({
  width,
  height,
  shimmering,
}: {
  width: string
  height: string
  shimmering: boolean
}) {
  return (
    <div
      className="relative overflow-hidden rounded-full"
      style={{
        width,
        height,
        // Neutral gray skeleton — depth comes from alpha variation in the same hue
        background: shimmering
          ? 'linear-gradient(90deg, rgba(34,42,59,0.05), rgba(34,42,59,0.10), rgba(34,42,59,0.05))'
          : 'rgba(34, 42, 59, 0.05)',
      }}
    >
      {shimmering && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent)',
            animation: 'skeleton-shimmer-i 1.8s infinite',
          }}
        />
      )}
    </div>
  )
}

/* ---------- Inline keyframes (failsafe vs globals.css cache misses) ---------- */

export function InlineKeyframes() {
  return (
    <style>{`
      @keyframes ai-gradient-i { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      @keyframes ai-liquid-i   { 0%,100% { border-radius: 62% 38% 50% 50% / 50% 50% 40% 60%; } 25% { border-radius: 38% 62% 60% 40% / 55% 45% 55% 45%; } 50% { border-radius: 50% 50% 38% 62% / 60% 40% 50% 50%; } 75% { border-radius: 55% 45% 50% 50% / 45% 55% 45% 55%; } }
      @keyframes ai-pulse-ping-i { 75%, 100% { transform: scale(2.2); opacity: 0; } }
      @keyframes ai-fade-up-i  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes ai-cursor-i   { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
      @keyframes skeleton-shimmer-i { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      @keyframes text-shimmer-i { 0% { background-position: 200% 0%; } 100% { background-position: -200% 0%; } }
      @keyframes dot-pulse-i { 0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); } 40% { opacity: 1; transform: scale(1.1); } }
      @keyframes octagon-ripple-i { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(1.85); opacity: 0; } }
      @keyframes octagon-pulse-i { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.92); } }
      @keyframes octagon-rotate-i { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes dot-bounce-i { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-3px); opacity: 1; } }
      @keyframes progress-arc-i { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -100; } }
      @keyframes mat-spin-rotate-i { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes mat-spin-dash-i { 0% { stroke-dasharray: 1 99; stroke-dashoffset: 0; } 50% { stroke-dasharray: 75 25; stroke-dashoffset: -25; } 100% { stroke-dasharray: 1 99; stroke-dashoffset: -99; } }
      @keyframes ios-fade-i { 0% { opacity: 1; } 100% { opacity: 0.15; } }
      @keyframes filling-sweep-i { 0% { stroke-dasharray: 0 100; } 85% { stroke-dasharray: 100 0; } 100% { stroke-dasharray: 100 0; } }
      @keyframes ai-icon-flash-i { 0% { transform: translateX(-150%) skewX(-18deg); } 60%, 100% { transform: translateX(150%) skewX(-18deg); } }
      @keyframes success-check-pop-i { 0% { opacity: 0; transform: scale(0.2) rotate(-8deg); } 60% { opacity: 1; transform: scale(1.2) rotate(4deg); } 80% { transform: scale(0.94) rotate(-2deg); } 100% { transform: scale(1) rotate(0); } }
      @keyframes confetti-burst-i { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0) rotate(0deg); } 7% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0deg); } 40% { opacity: 1; transform: translate(calc(-50% + var(--cx, 0px)), calc(-50% + var(--cy, 0px))) scale(0.75) rotate(var(--cr, 180deg)); } 55% { opacity: 0; transform: translate(calc(-50% + var(--cx, 0px) * 1.1), calc(-50% + var(--cy, 0px) * 1.1)) scale(0.35) rotate(var(--cr, 180deg)); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(0) rotate(0deg); } }

      .ai-gradient    { background-image: linear-gradient(135deg, var(--magenta-300), var(--magenta-500), var(--magenta-700), var(--magenta-500)); background-size: 300% 300%; animation: ai-gradient-i 6s ease-in-out infinite; }
      .ai-liquid      { animation: ai-liquid-i 6s ease-in-out infinite; }
      .ai-pulse-ping  { animation: ai-pulse-ping-i 3.2s cubic-bezier(0, 0, 0.2, 1) infinite; }
      .ai-fade-up     { animation: ai-fade-up-i 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
      .ai-cursor      { animation: ai-cursor-i 0.9s steps(2) infinite; }
      .text-shimmer   { background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: text-shimmer-i 4.5s linear infinite; }
      .dot-pulse      { display: inline-block; animation: dot-pulse-i 1.4s ease-in-out infinite; }
      .octagon-ripple { animation: octagon-ripple-i 3s ease-out infinite; transform-origin: center; }
      .octagon-pulse  { animation: octagon-pulse-i 2.4s ease-in-out infinite; transform-origin: center; }
      .octagon-rotate { animation: octagon-rotate-i 30s linear infinite; transform-origin: center; }
      .dot-bounce     { display: inline-block; animation: dot-bounce-i 1.1s ease-in-out infinite; }
      .progress-arc   { animation: progress-arc-i 1.4s linear infinite; }
      .mat-spin-rotate { animation: mat-spin-rotate-i 2.2s linear infinite; transform-origin: center; transform-box: fill-box; }
      .mat-spin-dash   { animation: mat-spin-dash-i 2.2s ease-in-out infinite; }
      .ios-dot         { animation: ios-fade-i 1.2s linear infinite; }
      .filling-sweep   { animation: filling-sweep-i 2s ease-in-out infinite; }
      .flat-liquid    { background: linear-gradient(135deg, var(--magenta-200) 0%, var(--purple-200) 50%, var(--blue-200) 100%); animation: ai-liquid-i 6s ease-in-out infinite; }
      .ai-icon-flash  { position: absolute; top: 0; left: 0; width: 60%; height: 100%; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.85) 50%, transparent 100%); animation: ai-icon-flash-i 3.6s ease-in-out infinite; }
      .success-check-pop { animation: success-check-pop-i 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) both; transform-origin: center; }
      .confetti-particle { position: absolute; top: 50%; left: 50%; pointer-events: none; z-index: 20; animation: confetti-burst-i 3.6s cubic-bezier(0.16, 1, 0.3, 1) both infinite; }
    `}</style>
  )
}
