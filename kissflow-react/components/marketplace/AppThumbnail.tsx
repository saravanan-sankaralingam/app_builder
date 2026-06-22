'use client'

import type { MarketplaceApp, ThumbnailKind } from '@/lib/mock/marketplace'

/**
 * Renders the per-card preview thumbnail as a stylized SVG "dashboard
 * mockup". Four `kind`s exist — table, pie-bars, rings, bars-dashboard —
 * each themed with the app's accent color. None of these represent the
 * real app UI; they're decorative placeholders that give the grid the
 * "looks like a real app store" feel without needing screenshots.
 */
export function AppThumbnail({ app }: { app: MarketplaceApp }) {
  return (
    <div className="aspect-[16/9] w-full overflow-hidden rounded-md bg-gray-50 border border-gray-100">
      <ThumbnailSVG kind={app.thumbnail} accent={app.thumbnailAccent} />
    </div>
  )
}

/** Tailwind color name → hex map. Keeps the SVGs self-contained. */
const ACCENTS: Record<MarketplaceApp['thumbnailAccent'], { strong: string; soft: string }> = {
  red: { strong: '#EF4444', soft: '#FEE2E2' },
  blue: { strong: '#3B82F6', soft: '#DBEAFE' },
  purple: { strong: '#A855F7', soft: '#EDE9FE' },
  emerald: { strong: '#10B981', soft: '#D1FAE5' },
  amber: { strong: '#F59E0B', soft: '#FEF3C7' },
  pink: { strong: '#EC4899', soft: '#FCE7F3' },
  orange: { strong: '#F97316', soft: '#FFEDD5' },
  cyan: { strong: '#06B6D4', soft: '#CFFAFE' },
  indigo: { strong: '#6366F1', soft: '#E0E7FF' },
}

function ThumbnailSVG({
  kind,
  accent,
}: {
  kind: ThumbnailKind
  accent: MarketplaceApp['thumbnailAccent']
}) {
  const { strong, soft } = ACCENTS[accent]

  switch (kind) {
    case 'table':
      return <TableThumb strong={strong} soft={soft} />
    case 'pie-bars':
      return <PieBarsThumb strong={strong} soft={soft} />
    case 'rings':
      return <RingsThumb strong={strong} soft={soft} />
    case 'bars-dashboard':
      return <BarsDashboardThumb strong={strong} soft={soft} />
  }
}

// Each thumbnail is rendered at viewBox="0 0 160 90" so the 16:9 aspect
// maps cleanly to whatever pixel size the parent gives it.

function TableThumb({ strong, soft }: { strong: string; soft: string }) {
  const rows = [0, 1, 2, 3, 4]
  return (
    <svg
      viewBox="0 0 160 90"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full"
      role="img"
      aria-hidden
    >
      <rect width="160" height="90" fill="white" />
      {/* Header bar */}
      <rect x="6" y="6" width="60" height="6" rx="2" fill="#E5E7EB" />
      <rect x="120" y="6" width="34" height="6" rx="2" fill={soft} />
      {/* Column headers */}
      <rect x="6" y="20" width="148" height="8" rx="2" fill="#F3F4F6" />
      {rows.map((i) => {
        const y = 32 + i * 11
        return (
          <g key={i}>
            <rect x="6" y={y} width="148" height="9" rx="2" fill="white" stroke="#F3F4F6" />
            <rect x="10" y={y + 2} width="5" height="5" rx="1.5" fill={strong} />
            <rect x="20" y={y + 3} width="50" height="3" rx="1.5" fill="#D1D5DB" />
            <rect x="76" y={y + 3} width="22" height="3" rx="1.5" fill="#E5E7EB" />
            <rect x="104" y={y + 2} width="18" height="5" rx="2.5" fill={soft} />
            <rect x="128" y={y + 3} width="24" height="3" rx="1.5" fill="#E5E7EB" />
          </g>
        )
      })}
    </svg>
  )
}

function PieBarsThumb({ strong, soft }: { strong: string; soft: string }) {
  return (
    <svg
      viewBox="0 0 160 90"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full"
      role="img"
      aria-hidden
    >
      <rect width="160" height="90" fill="white" />
      {/* Title */}
      <rect x="8" y="8" width="40" height="4" rx="2" fill="#E5E7EB" />
      <rect x="8" y="16" width="24" height="3" rx="1.5" fill="#F3F4F6" />
      {/* Donut */}
      <circle cx="40" cy="55" r="20" fill="none" stroke="#F3F4F6" strokeWidth="8" />
      <circle
        cx="40"
        cy="55"
        r="20"
        fill="none"
        stroke={strong}
        strokeWidth="8"
        strokeDasharray="60 200"
        transform="rotate(-90 40 55)"
      />
      <circle
        cx="40"
        cy="55"
        r="20"
        fill="none"
        stroke={soft}
        strokeWidth="8"
        strokeDasharray="30 200"
        strokeDashoffset="-60"
        transform="rotate(-90 40 55)"
      />
      {/* Bars */}
      {[0, 1, 2, 3, 4].map((i) => {
        const heights = [22, 32, 14, 28, 38]
        const x = 80 + i * 14
        const h = heights[i]
        return (
          <g key={i}>
            <rect x={x} y={78 - h} width="8" height={h} rx="1.5" fill={i % 2 ? soft : strong} />
          </g>
        )
      })}
      {/* x-axis */}
      <rect x="78" y="80" width="76" height="1" fill="#E5E7EB" />
    </svg>
  )
}

function RingsThumb({ strong, soft }: { strong: string; soft: string }) {
  const ring = (cx: number, dash: number, color: string) => (
    <>
      <circle cx={cx} cy="48" r="16" fill="none" stroke="#F3F4F6" strokeWidth="5" />
      <circle
        cx={cx}
        cy="48"
        r="16"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${dash} 200`}
        transform={`rotate(-90 ${cx} 48)`}
      />
    </>
  )
  return (
    <svg
      viewBox="0 0 160 90"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full"
      role="img"
      aria-hidden
    >
      <rect width="160" height="90" fill="white" />
      <rect x="8" y="8" width="50" height="4" rx="2" fill="#E5E7EB" />
      {ring(36, 60, strong)}
      {ring(80, 38, soft)}
      {ring(124, 78, strong)}
      {/* Labels under each */}
      <rect x="28" y="72" width="16" height="3" rx="1.5" fill="#E5E7EB" />
      <rect x="72" y="72" width="16" height="3" rx="1.5" fill="#E5E7EB" />
      <rect x="116" y="72" width="16" height="3" rx="1.5" fill="#E5E7EB" />
    </svg>
  )
}

function BarsDashboardThumb({ strong, soft }: { strong: string; soft: string }) {
  return (
    <svg
      viewBox="0 0 160 90"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full"
      role="img"
      aria-hidden
    >
      <rect width="160" height="90" fill="white" />
      {/* Top tile row: 3 KPI tiles */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={8 + i * 50}
            y="8"
            width="44"
            height="20"
            rx="3"
            fill="white"
            stroke="#F3F4F6"
          />
          <rect x={12 + i * 50} y="12" width="20" height="3" rx="1.5" fill="#E5E7EB" />
          <rect
            x={12 + i * 50}
            y="19"
            width="14"
            height="5"
            rx="1.5"
            fill={i === 1 ? strong : soft}
          />
        </g>
      ))}
      {/* Bar chart */}
      <rect x="8" y="34" width="144" height="48" rx="3" fill="white" stroke="#F3F4F6" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const heights = [28, 18, 34, 22, 30, 14, 38, 24]
        const x = 16 + i * 16
        const h = heights[i]
        return (
          <g key={i}>
            <rect
              x={x}
              y={76 - h}
              width="9"
              height={h}
              rx="1.5"
              fill={i % 2 ? soft : strong}
            />
          </g>
        )
      })}
      <rect x="14" y="78" width="140" height="1" fill="#E5E7EB" />
    </svg>
  )
}
