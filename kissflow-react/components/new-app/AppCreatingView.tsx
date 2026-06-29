'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Workflow,
  Database,
  FileText,
  Compass,
  Check,
  CheckCheck,
  Circle,
  Handshake,
  Loader2,
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

export interface Agent {
  id: string
  name: string
  sectionTitle: string
  icon: LucideIcon
  // Brand colour family used for the agent's avatar gradient (-400 → -500)
  color: 'magenta' | 'purple' | 'blue' | 'cyan' | 'green'
  // Four rotating verb phrases displayed after the agent name during active
  // state (3s per phrase). The agent name + phrase reads as one sentence.
  phases: [string, string, string, string]
  // Success verb phrase shown alongside the green double-tick when the agent
  // transitions to Done (or during the final 3s of its active window).
  successPhrase: string
}

const AGENTS: Agent[] = [
  {
    id: 'roles',
    name: 'Role creator agent',
    sectionTitle: 'Roles',
    icon: Users,
    color: 'magenta',
    phases: [
      'is creating roles for your team',
      'is drafting descriptions for each role',
      'is mapping permissions to actions',
      'is fine-tuning the role boundaries',
    ],
    successPhrase: 'has completed generating roles',
  },
  {
    id: 'flow',
    name: 'Flow creator agent',
    sectionTitle: 'Flow',
    icon: Workflow,
    color: 'purple',
    phases: [
      'is plotting the approval flow',
      'is mapping step-by-step transitions',
      'is connecting the workflow stages',
      'is finalizing the approval routing',
    ],
    successPhrase: 'has completed generating flow',
  },
  {
    id: 'entity',
    name: 'Entity creator agent',
    sectionTitle: 'Entities',
    icon: Database,
    color: 'blue',
    phases: [
      'is modeling your data structure',
      'is defining fields and their types',
      'is mapping relationships between entities',
      'is setting up validation rules',
    ],
    successPhrase: 'has completed generating entities',
  },
  {
    id: 'page',
    name: 'Page creator agent',
    sectionTitle: 'Pages',
    icon: FileText,
    color: 'cyan',
    phases: [
      'is composing the page layouts',
      'is assembling forms and dashboards',
      'is wiring up the detail views',
      'is polishing the layout and spacing',
    ],
    successPhrase: 'has completed generating pages',
  },
  {
    id: 'navigation',
    name: 'Navigation creator agent',
    sectionTitle: 'Navigation',
    icon: Compass,
    color: 'green',
    phases: [
      'is laying out the menu structure',
      'is wiring routes between every page',
      'is organizing the sidebar items',
      'is configuring the navigation paths',
    ],
    successPhrase: 'has completed generating navigation',
  },
]

// Timing: each agent gets 4 ticks of 4s = 16s total — all rotating phases.
// There is no dedicated success tick: the moment the 4th phase ends, the
// previous agent transitions to 'done' (showing the success line + check) and
// the next agent simultaneously starts at phase 0.
export const PHASE_DURATION = 4_000
export const PHASES_PER_AGENT = 4

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
  // Single counter — `tickCount` advances every PHASE_DURATION (3s). Both the
  // current agent and the current phase within that agent derive from it.
  const [tickCount, setTickCount] = useState(0)

  useEffect(() => {
    setTickCount(0)
    const interval = setInterval(() => {
      setTickCount((t) => {
        const next = t + 1
        // Allow one extra tick after the last agent's last rotating phase so
        // the last agent can transition to 'done' (success line + check).
        // Freeze beyond that.
        if (next > AGENTS.length * PHASES_PER_AGENT) {
          clearInterval(interval)
          return t
        }
        return next
      })
    }, PHASE_DURATION)
    return () => clearInterval(interval)
  }, [onComplete])

  const currentIdx = Math.min(
    Math.floor(tickCount / PHASES_PER_AGENT),
    AGENTS.length,
  )
  const phaseIdx = tickCount % PHASES_PER_AGENT
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
          completedAction={
            allAgentsDone ? (
              <>
                <div className="flex items-center gap-2 text-[15px] font-medium text-gray-900">
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'var(--green-500)' }}
                  >
                    <CheckCheck
                      className="w-3.5 h-3.5 text-white"
                      strokeWidth={3}
                    />
                  </span>
                  App generated successfully
                </div>
                <button
                  type="button"
                  onClick={onComplete}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg border bg-white text-[13px] font-medium hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                  style={{
                    borderColor: 'var(--purple-300)',
                    color: 'var(--purple-600)',
                  }}
                >
                  Open app
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </>
            ) : undefined
          }
        />
        <RightPane
          currentIdx={currentIdx}
          phaseIdx={phaseIdx}
          appName={appName}
          appDescription={appDescription}
        />
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

        {/* AI hero — same lucide `Sparkles` icon used in the Start Building
            button (big 4-pointed sparkle + 2 small "+" sparkles). Coloured
            purple-500 to match the AI-feature accent. */}
        <div className="flex justify-center mb-8">
          <Sparkles
            className="w-12 h-12"
            strokeWidth={1.5}
            style={{ color: 'var(--purple-500)' }}
          />
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
          <div className="space-y-2.5 pt-1">
            <SkeletonBar width="60%" height="14px" shimmering />
            <SkeletonBar width="85%" height="10px" shimmering />
          </div>
        ) : state === 'done' ? (
          <p className="text-[13px] leading-snug text-gray-600">
            <span className="font-semibold text-gray-900">{agent.name}</span>{' '}
            {agent.successPhrase}
            <CheckCheck
              className="inline-block ml-1.5 w-3.5 h-3.5 align-middle"
              strokeWidth={2.5}
              style={{ color: 'var(--green-500)' }}
            />
          </p>
        ) : (
          <>
            {/* Title line */}
            <p className="text-[13px] leading-snug">
              <span className="font-semibold text-gray-900">{agent.name}</span>{' '}
              <span className="text-gray-600">working on it</span>
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
                        'leading-snug',
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
  const roleState = stateFor(0, currentIdx)
  const flowState = stateFor(1, currentIdx)
  const entityState = stateFor(2, currentIdx)
  const pageState = stateFor(3, currentIdx)
  const navState = stateFor(4, currentIdx)

  // Each section reveals its resolved spec content the moment the driving
  // agent transitions to 'done'.
  const rolesResolved = roleState === 'done'
  const entitiesResolved = entityState === 'done'
  const pagesResolved = pageState === 'done'
  const navResolved = navState === 'done'

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

      {/* Scrollable agent-generated sections */}
      <div className="flex-1 overflow-y-auto px-10 py-7 space-y-9">
        {/* 1. Roles */}
        {roleState !== 'queued' && (
          <Section
            title="Roles"
            subtitle="Control access and responsibilities across your app"
            count={String(MOCK_ROLES.length)}
            accentColor="var(--magenta-500)"
            status={rolesResolved ? 'done' : 'generating'}
          >
            {rolesResolved ? (
              <RoleList items={MOCK_ROLES} />
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <SingleItemSkeleton
                  icon={Users}
                  color="var(--magenta-500)"
                  descriptionLines={4}
                />
              </div>
            )}
          </Section>
        )}

        {/* 2. Data entities — driven by Flow + Entity agents */}
        {flowState !== 'queued' && (
          <Section
            title="Data entities"
            subtitle="Schema definitions with field types and per-role permissions"
            count={`${MOCK_ENTITIES.length} entities · ${MOCK_ENTITIES.reduce(
              (acc, e) => acc + e.fields.length,
              0,
            )} fields`}
            accentColor="var(--green-500)"
            status={entitiesResolved ? 'done' : 'generating'}
          >
            {flowState === 'active' ? (
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <SingleItemSkeleton
                  icon={Database}
                  color="var(--green-500)"
                  descriptionLines={2}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {MOCK_ENTITIES.map((entity) => (
                  <EntityTable
                    key={entity.name}
                    entity={entity}
                    rowsLoading={entityState === 'active'}
                  />
                ))}
              </div>
            )}
          </Section>
        )}

        {/* 3. Pages */}
        {pageState !== 'queued' && (
          <Section
            title="Pages"
            subtitle="End-user pages composing the app interface"
            count={String(MOCK_PAGES.length)}
            accentColor="var(--blue-500)"
            status={pagesResolved ? 'done' : 'generating'}
          >
            {pagesResolved ? (
              <PageList items={MOCK_PAGES} />
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <SingleItemSkeleton
                  icon={FileText}
                  color="var(--blue-500)"
                  descriptionLines={2}
                />
              </div>
            )}
          </Section>
        )}

        {/* 4. Navigation */}
        {navState !== 'queued' && (
          <Section
            title="Navigation"
            subtitle="Menus tailored to each role group"
            count={String(MOCK_NAV.length)}
            accentColor="var(--purple-500)"
            status={navResolved ? 'done' : 'generating'}
          >
            {navResolved ? (
              <NavSitemap items={MOCK_NAV} />
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <SingleItemSkeleton
                  icon={Compass}
                  color="var(--purple-500)"
                  descriptionLines={3}
                />
              </div>
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
  children,
  status,
}: {
  title: string
  subtitle?: string
  count?: string
  accentColor: string
  children: React.ReactNode
  status?: 'generating' | 'done'
}) {
  return (
    <div className="ai-fade-up">
      <div className="flex items-center gap-2.5">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: accentColor }}
          aria-hidden="true"
        />
        <h3 className="text-[18px] font-semibold text-gray-900 tracking-tight leading-snug">
          {title}
        </h3>
        {count !== undefined && <CountBadge>{count}</CountBadge>}
        <div className="flex-1" />
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
      {subtitle && (
        <p className="text-[12px] text-gray-500 mt-1 mb-4 leading-snug ml-[18px]">
          {subtitle}
        </p>
      )}
      {!subtitle && <div className="mb-4" />}
      <div>{children}</div>
    </div>
  )
}

// Small gray pill showing a count in the section heading.
function CountBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full font-medium leading-none">
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

// Roles list — each role as a shadcn-style card with subtle border + shadow,
// hover lift. Users icon next to the role name, bulleted responsibilities below.
function RoleList({ items }: { items: RoleSpec[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li
          key={item.name}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-all ai-fade-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <Users
              className="w-[18px] h-[18px] flex-shrink-0"
              strokeWidth={1.75}
              style={{ color: 'var(--magenta-500)' }}
            />
            <span className="text-[14px] font-semibold text-gray-900 leading-snug">
              {item.name}
            </span>
          </div>
          <ul className="space-y-1.5">
            {item.responsibilities.map((r, j) => (
              <li
                key={j}
                className="text-[13px] text-gray-600 leading-relaxed flex gap-2"
              >
                <span className="text-gray-400 mt-0.5 select-none leading-snug">
                  •
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}

// Pages list — each page as a compact card. FileText icon next to the name,
// 2-3 line description below.
function PageList({ items }: { items: PageSpec[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li
          key={item.name}
          className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-all ai-fade-up flex gap-3"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <FileText
            className="w-[18px] h-[18px] flex-shrink-0 mt-0.5"
            strokeWidth={1.75}
            style={{ color: 'var(--blue-500)' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-gray-900 leading-snug">
              {item.name}
            </p>
            <p className="text-[13px] text-gray-600 leading-relaxed mt-1">
              {item.description}
            </p>
          </div>
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

// Sitemap — one card per navigation, laid out like the Roles/Pages cards:
// Compass icon top-left, title + "Shared with: …" + menu tree in a single
// indented content column to the right.
function NavSitemap({ items }: { items: NavigationSpec[] }) {
  return (
    <ul className="space-y-3">
      {items.map((nav, i) => (
        <li
          key={nav.title}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-all ai-fade-up flex gap-3"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <Compass
            className="w-[18px] h-[18px] flex-shrink-0 mt-0.5"
            strokeWidth={1.75}
            style={{ color: 'var(--purple-500)' }}
          />
          <div className="flex-1 min-w-0">
            {/* Title */}
            <p className="text-[14px] font-semibold text-gray-900 leading-snug">
              {nav.title}
            </p>

            {/* Shared with — plain comma-separated text */}
            <p className="mt-1 text-[13px] text-gray-600 leading-relaxed">
              <span className="text-gray-500">Shared with: </span>
              {nav.sharedWith.join(', ')}
            </p>

            {/* Menu tree */}
            <div className="mt-3 space-y-2">
              {nav.menu.map((item) => (
                <NavMenu key={item.label} item={item} />
              ))}
            </div>
          </div>
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
    `}</style>
  )
}
