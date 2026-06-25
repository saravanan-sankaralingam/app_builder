'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Users,
  Workflow,
  Database,
  LayoutGrid,
  Compass,
  Check,
  Handshake,
  Sparkles,
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

interface Agent {
  id: string
  name: string
  description: string
  sectionTitle: string
  icon: LucideIcon
  // Brand colour family used for the agent's avatar gradient (-400 → -500)
  color: 'magenta' | 'purple' | 'blue' | 'cyan' | 'green'
}

const AGENTS: Agent[] = [
  {
    id: 'roles',
    name: 'Role creator agent',
    description: 'Defining who can do what across your app',
    sectionTitle: 'Roles',
    icon: Users,
    color: 'magenta',
  },
  {
    id: 'flow',
    name: 'Flow creator agent',
    description: 'Plotting the approval flow and step transitions',
    sectionTitle: 'Flow',
    icon: Workflow,
    color: 'purple',
  },
  {
    id: 'entity',
    name: 'Entity creator agent',
    description: 'Modeling your data, fields, and relationships',
    sectionTitle: 'Entities',
    icon: Database,
    color: 'blue',
  },
  {
    id: 'page',
    name: 'Page creator agent',
    description: 'Composing forms, dashboards, and detail pages',
    sectionTitle: 'Pages',
    icon: LayoutGrid,
    color: 'cyan',
  },
  {
    id: 'navigation',
    name: 'Navigation creator agent',
    description: 'Laying out the menu and routing between pages',
    sectionTitle: 'Navigation',
    icon: Compass,
    color: 'green',
  },
]

const AGENT_DURATION = 6_000
const HOLD_AFTER_LAST = 1_500
const TOTAL_DURATION = AGENT_DURATION * AGENTS.length + HOLD_AFTER_LAST

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
  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    setCurrentIdx(0)
    // HOLD: parked on the first agent (Role creator) while we enhance that step.
    // Re-enable the advancement interval + completion timer (commented below) to
    // resume the sequence and let the screen hand off to the success view.
    //
    // const interval = setInterval(() => {
    //   setCurrentIdx((i) => {
    //     const next = i + 1
    //     if (next >= AGENTS.length) clearInterval(interval)
    //     return next
    //   })
    // }, AGENT_DURATION)
    // const complete = setTimeout(onComplete, TOTAL_DURATION)
    // return () => {
    //   clearInterval(interval)
    //   clearTimeout(complete)
    // }
  }, [onComplete])

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-[#FDF8FC] overflow-hidden flex flex-col">
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
        <LeftPane currentIdx={currentIdx} appName={appName} />
        <RightPane
          currentIdx={currentIdx}
          appName={appName}
          appDescription={appDescription}
        />
      </div>
    </div>
  )
}

/* ---------- Background atmosphere ---------- */

function BackgroundAtmosphere() {
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

function LeftPane({ currentIdx, appName }: { currentIdx: number; appName: string }) {
  return (
    <div className="flex flex-col items-center justify-start py-10 px-8 overflow-y-auto">
      <div className="w-full max-w-[480px]">
        {/* Title block — pinned to the top of the pane */}
        <div className="flex flex-col items-center text-center mb-8">
          <h1
            className="text-[24px] leading-[1.15] font-semibold bg-clip-text text-transparent tracking-tight"
            style={{
              backgroundImage:
                'linear-gradient(265deg, var(--magenta-500), var(--purple-500))',
            }}
          >
            Your app is being crafted, layer by layer
          </h1>

          {/* Description — gray-900, app name highlighted in semibold */}
          <p className="mt-3 text-[13px] text-gray-900 max-w-[440px] leading-relaxed">
            Our AI agents are collaborating in real time to bring your{' '}
            <span className="font-semibold">{appName}</span> app to life —
            defining roles, modeling data, and composing pages along the way.
          </p>
        </div>

        {/* AI hero icon — Sparkles glyph in purple-500 */}
        <div className="flex justify-center mb-8">
          <Sparkles
            className="w-20 h-20"
            strokeWidth={1.25}
            style={{ color: 'var(--purple-500)' }}
          />
        </div>

        {/* Agent timeline — AI-gradient border ring around a flat white-50 surface */}
        <div
          className="rounded-xl p-[1.5px] w-full max-w-[400px] mx-auto"
          style={{
            background:
              'linear-gradient(246.77deg, var(--purple-200) 0%, var(--magenta-200) 100%)',
          }}
        >
          <div
            className="rounded-[10.5px] p-9"
            style={{ background: 'color-mix(in srgb, var(--white) 75%, transparent)' }}
          >
            <ol className="relative space-y-4">
              {/* Vertical connector line */}
              <div
                className="absolute left-[16px] top-3 bottom-3 w-px"
                style={{
                  background:
                    'linear-gradient(to bottom, transparent, var(--gray-300), transparent)',
                }}
              />
              {AGENTS.map((agent, i) => (
                <AgentRow key={agent.id} agent={agent} state={stateFor(i, currentIdx)} />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentRow({ agent, state }: { agent: Agent; state: AgentState }) {
  return (
    <li
      className={cn(
        'relative flex items-start gap-3 py-1.5 transition-opacity duration-300',
        state === 'done' && 'opacity-90',
      )}
    >
      <div className="relative z-10 mt-0.5 flex-shrink-0">
        <AgentStatus state={state} color={agent.color} icon={agent.icon} />
      </div>
      <div className="flex-1 min-w-0 pt-px">
        {state === 'queued' ? (
          <div className="space-y-2.5 pt-1">
            <SkeletonBar width="60%" height="14px" shimmering />
            <SkeletonBar width="85%" height="10px" shimmering />
          </div>
        ) : (
          <>
            <p
              className={cn(
                'text-[14px] tracking-tight text-gray-900 transition-colors',
                state === 'active' ? 'font-semibold' : 'font-medium',
              )}
            >
              {agent.name}
            </p>
            {state === 'active' ? (
              <div className="mt-0.5 text-[12px] leading-snug">
                <span
                  className="text-shimmer"
                  style={{
                    backgroundImage: `linear-gradient(90deg, var(--gray-600) 0%, var(--gray-600) 35%, var(--${agent.color}-500) 50%, var(--gray-600) 65%, var(--gray-600) 100%)`,
                  }}
                >
                  {agent.description}
                </span>
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
                        background: `var(--${agent.color}-500)`,
                        animationDelay: `${i * 200}ms`,
                      }}
                    />
                  ))}
                </span>
              </div>
            ) : (
              <p className="text-[12px] mt-0.5 leading-snug text-gray-600">
                {agent.description}
              </p>
            )}
          </>
        )}
      </div>
    </li>
  )
}

// Rounded-corner octagon (iOS-app-icon-style "squircle-octagon") imported from
// /Downloads/shape_octogan.svg. Path stays in its native 198×198 coordinate
// space; the SVG `viewBox` lets it scale to whatever container we put it in.
const AVATAR_PATH_D =
  'M92.5588 1.21792C96.4792 -0.405981 100.884 -0.405984 104.805 1.21792L163.269 25.4348' +
  'C167.19 27.0587 170.305 30.1735 171.929 34.094L196.146 92.5588' +
  'C197.769 96.4792 197.769 100.884 196.146 104.805L171.929 163.269' +
  'C170.305 167.19 167.19 170.305 163.269 171.929L104.805 196.146' +
  'C100.884 197.769 96.4792 197.769 92.5588 196.146L34.094 171.929' +
  'C30.1735 170.305 27.0587 167.19 25.4348 163.269L1.21793 104.805' +
  'C-0.405973 100.884 -0.405976 96.4792 1.21793 92.5588L25.4348 34.094' +
  'C27.0587 30.1735 30.1735 27.0587 34.094 25.4348L92.5588 1.21792Z'

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
  if (state === 'queued') {
    return (
      <div style={{ opacity: 0.35 }}>
        <StaticBoldAvatar color={color} Icon={Icon} />
      </div>
    )
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
        viewBox="0 0 198 198"
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
        viewBox="0 0 198 198"
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

function RightPane({
  currentIdx,
  appName,
  appDescription,
}: {
  currentIdx: number
  appName: string
  appDescription: string
}) {
  return (
    <div className="bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_12px_40px_rgba(34,42,59,0.06),0_1px_3px_rgba(34,42,59,0.04)] flex flex-col min-h-0 overflow-hidden">
      {/* Pinned identity header — neutral gray surface (first-draft baseline) */}
      <div className="px-9 py-7 flex-shrink-0">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <AppIdentity name={appName} description={appDescription} />
        </div>
      </div>

      {/* Scrollable agent-generated sections */}
      <div className="flex-1 overflow-y-auto px-9 py-7 space-y-7">
        {AGENTS.map((agent, i) => {
          const state = stateFor(i, currentIdx)
          if (state === 'queued') return null
          return (
            <SpecSection
              key={agent.id}
              icon={agent.icon}
              title={agent.sectionTitle}
              status={state === 'active' ? 'generating' : 'done'}
            >
              <SectionSkeleton shimmering={state === 'active'} />
            </SpecSection>
          )
        })}
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

function SpecSection({
  icon: Icon,
  title,
  children,
  status,
}: {
  icon: LucideIcon
  title: string
  children: React.ReactNode
  status?: 'generating' | 'done'
}) {
  return (
    <div className="ai-fade-up">
      <div className="flex items-center gap-3 mb-3.5">
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
          style={{ backgroundColor: 'var(--magenta-100)' }}
        >
          <Icon className="w-[15px] h-[15px] text-magenta-600" strokeWidth={2.25} />
        </span>
        <h3 className="text-[13px] font-semibold text-gray-900 flex-1 tracking-tight">
          {title}
        </h3>
        {status === 'generating' && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-magenta-700 px-2 py-0.5 rounded-full bg-magenta-50 border border-magenta-100">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-magenta-500 ai-pulse-ping" />
              <span className="relative rounded-full w-1.5 h-1.5 bg-magenta-500" />
            </span>
            Generating
          </span>
        )}
        {status === 'done' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 px-2 py-0.5 rounded-full bg-green-50 border border-green-100">
            <Check className="w-2.5 h-2.5" strokeWidth={3.5} />
            Generated
          </span>
        )}
      </div>
      <div className="pl-[44px]">{children}</div>
    </div>
  )
}

function SectionSkeleton({ shimmering = false }: { shimmering?: boolean }) {
  return (
    <div className="space-y-2.5">
      <SkeletonBar width="48%" height="14px" shimmering={shimmering} />
      <SkeletonBar width="100%" height="10px" shimmering={shimmering} />
      <SkeletonBar width="92%" height="10px" shimmering={shimmering} />
      <SkeletonBar width="76%" height="10px" shimmering={shimmering} />
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

function InlineKeyframes() {
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

      .ai-gradient    { background-image: linear-gradient(135deg, var(--magenta-300), var(--magenta-500), var(--magenta-700), var(--magenta-500)); background-size: 300% 300%; animation: ai-gradient-i 6s ease-in-out infinite; }
      .ai-liquid      { animation: ai-liquid-i 6s ease-in-out infinite; }
      .ai-pulse-ping  { animation: ai-pulse-ping-i 3.2s cubic-bezier(0, 0, 0.2, 1) infinite; }
      .ai-fade-up     { animation: ai-fade-up-i 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
      .ai-cursor      { animation: ai-cursor-i 0.9s steps(2) infinite; }
      .text-shimmer   { background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: text-shimmer-i 4.5s linear infinite; }
      .dot-pulse      { display: inline-block; animation: dot-pulse-i 1.4s ease-in-out infinite; }
    `}</style>
  )
}
