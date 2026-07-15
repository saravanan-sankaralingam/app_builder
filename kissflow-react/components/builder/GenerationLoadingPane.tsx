'use client'

import { useGeneration } from '@/context/GenerationContext'
import { AGENTS } from '@/lib/generation-spec'
import {
  BackgroundAtmosphere,
  InlineKeyframes,
  LeftPane,
} from '@/components/new-app/AppCreatingView'

// Replaces the CopilotPanel in the Builder while the app is still being
// generated. Uses the same LeftPane the AI-Create flow renders on /new/app,
// in `compact` mode so it fits the 320px chat rail. Reads phase progression
// from the root-level GenerationContext so the timeline is continuous with
// what the user just saw on /new/app — no restart from tick 0.
//
// Container framing mirrors CopilotPanel:
//   w-[320px] ml-2 mr-2 rounded-t-[8px] p-[1px]  ← gradient border ring
//     bg-white rounded-t-[7px]                    ← inner surface
// so the swap between the two is visually seamless.
export function GenerationLoadingPane() {
  const { appName, currentIdx, phaseIdx } = useGeneration()

  return (
    <div
      className="w-[320px] ml-2 mr-2 rounded-t-[8px] p-[1px] overflow-hidden flex-shrink-0"
      style={{ background: 'var(--ai-gradient-300)' }}
    >
      <div className="relative flex flex-col overflow-hidden h-full bg-[#FDF8FC] rounded-t-[7px]">
        {/* Same pink-purple wash + atmospheric orbs the /new/app screens use,
            clipped by the pane's overflow-hidden. Orbs are far larger than
            the pane so only a portion shows — reads as a soft gradient wash
            behind the LeftPane content. */}
        <BackgroundAtmosphere />
        {/* Sub-item animations (`ai-fade-up`, dot pulse, etc.) live on
            InlineKeyframes — mount it here so the timeline animates even
            though AppCreatingView isn't in the tree. */}
        <InlineKeyframes />
        <div className="relative z-10 flex flex-col h-full min-h-0">
        <LeftPane
          compact
          agents={AGENTS}
          currentIdx={currentIdx}
          phaseIdx={phaseIdx}
          title="Building your app"
          description={
            appName ? (
              <>
                AI is bringing your{' '}
                <span className="font-semibold">{appName}</span> app to life —
                roles, data, pages, and more.
              </>
            ) : (
              'AI is bringing your app to life — roles, data, pages, and more.'
            )
          }
          hero={
            // Same animated app-mock loader the AI Create screen shows, just
            // scaled down for the 320px chat rail. SMIL animation is inside
            // the SVG, so no wiring needed.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/app-builder-loader.svg"
              alt=""
              width={124}
              height={100}
              className="w-[124px] h-[100px]"
              aria-hidden="true"
            />
          }
        />
        </div>
      </div>
    </div>
  )
}
