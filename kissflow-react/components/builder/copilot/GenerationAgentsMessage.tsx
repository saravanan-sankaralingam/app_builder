'use client'

import { Bot } from 'lucide-react'
import { useGeneration } from '@/context/GenerationContext'
import { AGENTS } from '@/lib/generation-spec'
import {
  AgentRow,
  InlineKeyframes,
} from '@/components/new-app/AppCreatingView'

// Chat-style "AI is working" card rendered inside the Copilot chat area
// while `useGeneration().isGenerating` is true. Reuses the exact same
// `AgentRow` the AI Create LeftPane renders — same rotating gradient
// avatar, same font sizes, same "is working on it •••" line, same
// bg-gray-50 phase-checklist container with pulse dot + shimmer text —
// so the two surfaces speak with one visual voice. The card unmounts as
// soon as the final tick flips `isGenerating` off.
export function GenerationAgentsMessage() {
  const { isGenerating, currentIdx, phaseIdx, appName } = useGeneration()

  if (!isGenerating) return null

  return (
    <div>
      {/* InlineKeyframes carries the `ai-pulse-ping`, `dot-pulse-i`,
          `ai-fade-up-i` and gradient rotation animations AgentRow relies
          on. Mounting it here means we don't depend on AppCreatingView
          being in the tree. */}
      <InlineKeyframes />

      {/* Header — same purple Bot avatar the seed success message uses,
          so the transition from "AI working" → "app generated" reads as
          one continuous voice from the same Copilot. Title beneath uses
          the AI Create page's magenta → purple gradient. */}
      <div className="mb-3 space-y-2">
        <div className="w-6 h-6 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center">
          <Bot className="w-3 h-3 text-purple-600 fill-purple-600" />
        </div>
        <p className="text-[13px] font-medium text-gray-900 leading-snug">
          Building your {appName ? `${appName} app` : 'app'}
        </p>
      </div>

      {/* Agent timeline — reuses the shared AgentRow from the AI Create
          page so every past/active/done treatment (fonts, checklist
          container, animations) stays in lockstep with `/new/app`.
          `compact` lets long sub-item text wrap inside the 320px rail.
          Wrapped in the same gradient-ringed container the AI Create
          LeftPane uses so the two surfaces frame the timeline identically. */}
      <div
        className="rounded-[9px] p-[1.5px] w-full"
        style={{
          background:
            'linear-gradient(246.77deg, var(--purple-200) 0%, var(--magenta-200) 100%)',
        }}
      >
        <div
          className="rounded-[7.5px] p-3"
          style={{ background: 'color-mix(in srgb, var(--white) 90%, transparent)' }}
        >
          <ol className="space-y-2">
            {AGENTS.map((agent, i) => {
              const isPast = i < currentIdx
              const isCurrent = i === currentIdx
              // Hide upcoming rows — the card grows top-down as agents
              // activate, matching the AppCreatingView LeftPane.
              if (!isPast && !isCurrent) return null
              const state: 'active' | 'done' = isCurrent ? 'active' : 'done'
              return (
                <AgentRow
                  key={agent.id}
                  agent={agent}
                  state={state}
                  phaseIdx={isCurrent ? phaseIdx : 0}
                  compact
                />
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}
