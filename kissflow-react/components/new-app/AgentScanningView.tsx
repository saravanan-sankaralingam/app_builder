'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  ClipboardCheck,
  Database,
  FileText,
  Layers,
  Users,
  Wand2,
} from 'lucide-react'
import {
  type Agent,
  LeftPane,
  BackgroundAtmosphere,
  InlineKeyframes,
  PHASES_PER_AGENT,
} from './AppCreatingView'

// AI-at-work screen for the /new/app flow. Replaces the previous hex-centric
// `AIScanningDialog`. Shows the same agent-timeline UI as `AppCreatingView`'s
// left pane but centred on the screen with no right-pane spec card.
//
// Six agents work through their phases — Requirement Validator, Blueprint,
// App role, Field architect, Page designer, Entity enricher — to analyse the
// user's prompt before suggesting an app name and description in the review
// dialog. Compressed phase timing (1.2s/phase) so all 6 agents finish in ~29s.

interface AgentScanningViewProps {
  onComplete: () => void
  onAbort: () => void
}

const SCANNING_PHASE_DURATION_MS = 1_200

// Pre-review analysis agents. Different roster from the post-review
// `AGENTS` (which actually generates the app). These six interrogate the
// prompt and confirm a draft blueprint before the user reviews + approves.
const SCANNING_AGENTS: Agent[] = [
  {
    id: 'validator',
    name: 'Requirement Validator agent',
    sectionTitle: 'Requirements',
    icon: ClipboardCheck,
    color: 'magenta',
    phases: [
      'is reading through your prompt',
      'is identifying the core use case',
      'is validating the scope',
      'is checking for missing details',
    ],
    successPhrase: 'has validated the requirements',
  },
  {
    id: 'blueprint',
    name: 'Blueprint drafter agent',
    sectionTitle: 'Blueprint',
    icon: Layers,
    color: 'purple',
    phases: [
      'is sketching the high-level architecture',
      'is identifying the building blocks',
      'is outlining the workflow stages',
      'is finalising the app blueprint',
    ],
    successPhrase: 'has outlined the app architecture',
  },
  {
    id: 'app-role',
    name: 'App role definer agent',
    sectionTitle: 'Roles',
    icon: Users,
    color: 'blue',
    phases: [
      'is identifying who needs access',
      'is defining user permissions',
      'is mapping the role hierarchy',
      'is finalising role definitions',
    ],
    successPhrase: 'has defined the user roles',
  },
  {
    id: 'field-architect',
    name: 'Field architect agent',
    sectionTitle: 'Fields',
    icon: Database,
    color: 'cyan',
    phases: [
      'is identifying required data fields',
      'is defining field types and constraints',
      'is mapping field relationships',
      'is validating field structure',
    ],
    successPhrase: 'has architected the data fields',
  },
  {
    id: 'page-designer',
    name: 'Page designer agent',
    sectionTitle: 'Pages',
    icon: FileText,
    color: 'green',
    phases: [
      'is sketching the page layouts',
      'is composing the user flows',
      'is designing dashboards and forms',
      'is finalising the page structure',
    ],
    successPhrase: 'has designed the page layouts',
  },
  {
    id: 'entity-enricher',
    name: 'Entity enricher agent',
    sectionTitle: 'Entities',
    icon: Wand2,
    color: 'magenta',
    phases: [
      'is enriching entity definitions',
      'is connecting related entities',
      'is adding context and metadata',
      'is finalising the data model',
    ],
    successPhrase: 'has enriched the entities',
  },
]

const SCANNING_TOTAL_TICKS = SCANNING_AGENTS.length * PHASES_PER_AGENT
// Pop the review dialog open almost immediately after the last agent flips
// to done — just enough of a beat (200ms) for the double-tick to render on
// screen so the user registers it before the popup opens on top.
const SCANNING_TOTAL_DURATION_MS =
  SCANNING_TOTAL_TICKS * SCANNING_PHASE_DURATION_MS + 200

export function AgentScanningView({
  onComplete,
  onAbort,
}: AgentScanningViewProps) {
  const [tickCount, setTickCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTickCount((t) => {
        const next = t + 1
        // Freeze at the post-completion tick so all 6 agents read as 'done'.
        if (next > SCANNING_TOTAL_TICKS) {
          clearInterval(interval)
          return t
        }
        return next
      })
    }, SCANNING_PHASE_DURATION_MS)

    // Trigger review-dialog open shortly after the last agent transitions
    // to done so the user sees the completion check tick first.
    const complete = setTimeout(onComplete, SCANNING_TOTAL_DURATION_MS)

    return () => {
      clearInterval(interval)
      clearTimeout(complete)
    }
  }, [onComplete])

  const currentIdx = Math.min(
    Math.floor(tickCount / PHASES_PER_AGENT),
    SCANNING_AGENTS.length,
  )
  const phaseIdx = tickCount % PHASES_PER_AGENT

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
          description="Six agents are reading your prompt and translating it into the roles, fields, pages, and entities for your app."
        />
      </div>
    </div>
  )
}
