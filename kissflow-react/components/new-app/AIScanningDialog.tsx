'use client'

import { useEffect, useState } from 'react'
import {
  X,
  Ban,
  FileText,
  Scale,
  Users,
  Database,
  Shield,
  Workflow,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// AI-at-work popover for the /new/app flow.
//
// Single direction. A gradient-filled hexagon sits centre-stage with:
//   - a "comet" stroke that flows around the perimeter (stroke-dashoffset march)
//   - a drop-shadow halo that morphs through magenta → purple → blue, mimicking
//     the breathing feel of the earlier liquid-blob morph but staying static-shaped
//   - the active agent's lucide glyph fading in/out at the centre
// Cycles through 7 agents over 30s, then fires onComplete.

interface AIScanningDialogProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
  onAbort: () => void
}

const TOTAL_DURATION = 5_000

const AGENTS: { name: string; description: string; icon: LucideIcon }[] = [
  { name: 'Document parser', description: 'Reading your document and pulling its structure', icon: FileText },
  { name: 'Rule extractor', description: 'Identifying business rules and constraints', icon: Scale },
  { name: 'Role identifier', description: 'Discovering user roles and personas', icon: Users },
  { name: 'Data Modeler', description: 'Designing the database schema and entities', icon: Database },
  { name: 'Role Designer', description: 'Mapping permissions across user types', icon: Shield },
  { name: 'Workflow Architect', description: 'Plotting state transitions and approvals', icon: Workflow },
  { name: 'UI Composer', description: 'Arranging views, forms, and navigation', icon: LayoutGrid },
]

const STEP_DURATION = TOTAL_DURATION / AGENTS.length

// Rounded-corner hexagon (point-up). Each vertex becomes a CR-radius arc, so
// the fill *and* stroke read as soft. Perimeter is recomputed so the comet
// stroke completes exactly one lap per animation cycle (no stutter).
const R = 80
const CR = 16
const HEX_PATH = (() => {
  const verts: Array<[number, number]> = []
  for (let i = 0; i < 6; i++) {
    const a = (i * 60 - 90) * (Math.PI / 180)
    verts.push([Math.cos(a) * R, Math.sin(a) * R])
  }
  let d = ''
  for (let i = 0; i < 6; i++) {
    const prev = verts[(i + 5) % 6]
    const curr = verts[i]
    const next = verts[(i + 1) % 6]
    const inLen = Math.hypot(curr[0] - prev[0], curr[1] - prev[1])
    const outLen = Math.hypot(next[0] - curr[0], next[1] - curr[1])
    const inU: [number, number] = [(curr[0] - prev[0]) / inLen, (curr[1] - prev[1]) / inLen]
    const outU: [number, number] = [(next[0] - curr[0]) / outLen, (next[1] - curr[1]) / outLen]
    const Ax = curr[0] - inU[0] * CR
    const Ay = curr[1] - inU[1] * CR
    const Bx = curr[0] + outU[0] * CR
    const By = curr[1] + outU[1] * CR
    d += (i === 0 ? `M ${Ax.toFixed(2)} ${Ay.toFixed(2)} ` : `L ${Ax.toFixed(2)} ${Ay.toFixed(2)} `)
    d += `A ${CR} ${CR} 0 0 1 ${Bx.toFixed(2)} ${By.toFixed(2)} `
  }
  d += 'Z'
  return d
})()
const HEX_PERIMETER = 6 * (R - 2 * CR) + 6 * CR * (Math.PI / 3)

export function AIScanningDialog({ open, onClose, onComplete, onAbort }: AIScanningDialogProps) {
  const [agentIdx, setAgentIdx] = useState(0)

  useEffect(() => {
    if (!open) return
    setAgentIdx(0)
    const stepTimer = setInterval(
      () => setAgentIdx((i) => Math.min(i + 1, AGENTS.length - 1)),
      STEP_DURATION,
    )
    const completeTimer = setTimeout(onComplete, TOTAL_DURATION)
    return () => {
      clearInterval(stepTimer)
      clearTimeout(completeTimer)
    }
  }, [open, onComplete])

  if (!open) return null

  const current = AGENTS[agentIdx]
  const AgentIcon = current.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative flex flex-col bg-white rounded-xl shadow-xl w-[600px] h-[560px] p-7 overflow-hidden">
        <InlineKeyframes />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Title */}
        <h2
          className="text-2xl font-semibold bg-clip-text text-transparent"
          style={{
            backgroundImage: 'linear-gradient(265deg, var(--magenta-500), var(--purple-500))',
          }}
        >
          AI at work
        </h2>

        {/* Centre stage */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {/* Hexagon centrepiece */}
          <div className="relative w-44 h-44 mb-10 flex items-center justify-center">
            <svg
              viewBox="-100 -100 200 200"
              className="w-full h-full hex-halo"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="hex-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--magenta-500)" />
                  <stop offset="50%" stopColor="var(--purple-500)" />
                  <stop offset="100%" stopColor="var(--blue-500)" />
                </linearGradient>
                <linearGradient id="hex-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--magenta-300)" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="var(--blue-300)" />
                </linearGradient>
              </defs>

              {/* Static gradient fill */}
              <path d={HEX_PATH} fill="url(#hex-fill)" />

              {/* Animated comet stroke — one bright segment travelling the perimeter */}
              <path
                d={HEX_PATH}
                fill="none"
                stroke="url(#hex-stroke)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`80 ${HEX_PERIMETER - 80}`}
                className="hex-stroke-flow"
              />
            </svg>

            {/* Agent icon centred over the hex — re-keys on change for fade-in */}
            <AgentIcon
              key={`icon-${agentIdx}`}
              className="ai-fade-up absolute w-12 h-12 text-white"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
            />
          </div>

          {/* Agent name */}
          <h3
            key={`name-${agentIdx}`}
            className="ai-fade-up text-lg font-semibold text-gray-900"
          >
            {current.name} working
            <span className="ai-cursor inline-block ml-0.5">…</span>
          </h3>

          {/* Description */}
          <p
            key={`desc-${agentIdx}`}
            className="ai-fade-up mt-2 text-sm text-gray-600 max-w-[400px]"
            style={{ animationDelay: '0.12s' }}
          >
            {current.description}
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={onAbort}
          className="self-center text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Ban className="w-4 h-4 mr-2" />
          Abort
        </Button>
      </div>
    </div>
  )
}

/* ---------- Inline keyframes (failsafe vs globals.css cache misses) ---------- */

function InlineKeyframes() {
  return (
    <style>{`
      /* Comet stroke around the rounded-hexagon perimeter (interpolated, so the loop is seamless) */
      @keyframes hex-stroke-i { to { stroke-dashoffset: ${(-HEX_PERIMETER).toFixed(2)}; } }
      .hex-stroke-flow { animation: hex-stroke-i 3s linear infinite; }

      /* Morphing colour halo — drop-shadow cycles magenta → purple → blue */
      @keyframes hex-halo-i {
        0%, 100% {
          filter:
            drop-shadow(0 0 22px rgba(222, 31, 142, 0.55))
            drop-shadow(0 0 8px rgba(222, 31, 142, 0.40));
        }
        33% {
          filter:
            drop-shadow(0 0 32px rgba(109, 43, 240, 0.55))
            drop-shadow(0 0 12px rgba(109, 43, 240, 0.40));
        }
        66% {
          filter:
            drop-shadow(0 0 28px rgba(5, 101, 255, 0.50))
            drop-shadow(0 0 10px rgba(5, 101, 255, 0.35));
        }
      }
      .hex-halo { animation: hex-halo-i 4.5s ease-in-out infinite; }

      /* Text/icon fade-in on agent rotation */
      @keyframes ai-fade-up-i { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .ai-fade-up { animation: ai-fade-up-i 0.45s ease-out both; }

      /* Blinking trailing ellipsis on "working…" */
      @keyframes ai-cursor-i { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
      .ai-cursor { animation: ai-cursor-i 0.9s steps(2) infinite; }
    `}</style>
  )
}
