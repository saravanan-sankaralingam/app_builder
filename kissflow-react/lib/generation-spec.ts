import {
  ClipboardCheck,
  Layers,
  Palette,
  Rocket,
  Wand2,
  type LucideIcon,
} from 'lucide-react'

// Shared spec that drives the post-review "app being generated" tick loop.
// Extracted from AppCreatingView so the same schedule can drive both:
//   1. AppCreatingView (right pane on /new/app)
//   2. GenerationLoadingPane (chat-slot replacement in the Builder)
// via the root-level GenerationContext.

export interface Agent {
  id: string
  name: string
  sectionTitle: string
  icon: LucideIcon
  // Brand colour family used for the agent's avatar gradient (-400 → -500)
  color: 'magenta' | 'purple' | 'blue' | 'cyan' | 'green'
  // Verb phrases surfaced as sub-items in the active-agent checklist box.
  phases: string[]
  // Success verb phrase shown alongside the green double-tick when the agent
  // transitions to Done (or during the final 3s of its active window).
  successPhrase: string
}

// Post-review roster. Requirements Analyst + Solutions Architect already ran
// on the pre-review scanning screen, so they render as 'done' from the moment
// generation starts. App Builder, Interface Designer, and App Publisher are
// the three agents that actually run.
export const AGENTS: Agent[] = [
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
  {
    id: 'app-builder',
    name: 'App Builder',
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
    name: 'Interface Designer',
    sectionTitle: 'Design',
    icon: Palette,
    color: 'cyan',
    // Per-role generation — Interface Designer works through each role one at
    // a time. Phase order matches DESIGNER_ROLE_ORDER below. Sub-item text is
    // intentionally role-agnostic so it reads cleanly as the checklist
    // progresses; the role being worked on is surfaced elsewhere in the UI.
    phases: [
      'Composing pages and navigation',
      'Composing pages and navigation',
      'Composing pages and navigation',
    ],
    successPhrase: 'has designed the interface',
  },
  {
    id: 'publisher',
    name: 'App Publisher',
    sectionTitle: 'Publish',
    icon: Rocket,
    color: 'green',
    phases: ['Publishing the app'],
    successPhrase: 'has published the app',
  },
]

// Indexes of the three post-review agents in AGENTS. The two agents before
// App Builder (Requirements Analyst and Solutions Architect) already ran on
// the pre-review screen, so tick counting starts at the boundary between them
// and App Builder.
export const APP_BUILDER_AGENT_IDX = 2
export const DESIGNER_AGENT_IDX = 3

// Order in which Designer generates each role's interface. Index matches the
// per-role Designer phase; drives right-pane page/nav reveals and the
// "Ready to preview" card sequence.
export const DESIGNER_ROLE_ORDER = [
  'Vendor Manager',
  'Procurement Lead',
  'Compliance Officer',
]

// Per-phase duration (ms) for each agent. Order matches AGENTS; each entry is
// an array with one duration per phase. Only App Builder (5s × 6 = 30s),
// Designer (15s + 45s + 45s = 105s), and Publisher (5s × 1 = 5s) fire — the
// first two entries are populated for shape completeness but never fire since
// those agents are already 'done' when generation starts.
export const AGENT_PHASE_DURATIONS_MS: number[][] = [
  [3_000, 3_000],
  [5_000, 5_000, 5_000, 5_000, 5_000, 5_000, 5_000],
  [5_000, 5_000, 5_000, 5_000, 5_000, 5_000],
  [15_000, 45_000, 45_000],
  [5_000],
]

// Cumulative tick boundaries — agent i owns ticks [cumulativeTicks[i-1],
// cumulativeTicks[i]). Last entry is the total tick count.
export const CUMULATIVE_TICKS: number[] = AGENTS.reduce<number[]>(
  (acc, agent) => {
    const last = acc[acc.length - 1] ?? 0
    acc.push(last + agent.phases.length)
    return acc
  },
  [],
)

// Initial tick count on mount — set past the two pre-run agents' ticks so
// they read as 'done' and App Builder starts at its phase 0.
export const INITIAL_TICK_COUNT = CUMULATIVE_TICKS[APP_BUILDER_AGENT_IDX - 1]

// TICK_SCHEDULE[i] is the wall-clock ms at which `tickCount` advances from
// `INITIAL_TICK_COUNT + i` to `INITIAL_TICK_COUNT + i + 1`. Only App Builder,
// Designer, and Publisher phases contribute.
export const TICK_SCHEDULE: number[] = (() => {
  const schedule: number[] = []
  let cumulativeMs = 0
  for (
    let agentIdx = APP_BUILDER_AGENT_IDX;
    agentIdx < AGENTS.length;
    agentIdx++
  ) {
    const phaseDurations = AGENT_PHASE_DURATIONS_MS[agentIdx]
    for (let p = 0; p < AGENTS[agentIdx].phases.length; p++) {
      cumulativeMs += phaseDurations[p]
      schedule.push(cumulativeMs)
    }
  }
  return schedule
})()

// Derived helpers ------------------------------------------------------------

export function currentIdxFor(tickCount: number): number {
  const activeIdx = CUMULATIVE_TICKS.findIndex((c) => c > tickCount)
  return activeIdx === -1 ? AGENTS.length : activeIdx
}

export function phaseIdxFor(tickCount: number): number {
  const currentIdx = currentIdxFor(tickCount)
  const priorCumulative =
    currentIdx === 0 ? 0 : CUMULATIVE_TICKS[currentIdx - 1]
  return tickCount - priorCumulative
}
