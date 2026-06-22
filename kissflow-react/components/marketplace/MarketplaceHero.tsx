'use client'

/**
 * Hero banner at the top of the Marketplace page. Centered title + subtitle
 * on a soft blue/lavender gradient. Decorative dot pattern on the left and
 * a small abstract figure on the right — both purely visual.
 */
export function MarketplaceHero() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-6 py-10">
      {/* Decorative dot grid — left */}
      <DotGrid className="absolute left-6 top-6 text-blue-200/80" />
      {/* Abstract figure — right */}
      <HeroFigure className="absolute right-6 top-6 text-indigo-200/80" />

      <div className="relative mx-auto max-w-2xl text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          Complete solutions, empowered business
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Find end-to-end applications that cater to your business needs in the
          Kissflow App Store.
        </p>
      </div>
    </section>
  )
}

function DotGrid({ className }: { className?: string }) {
  // 5 rows × 8 cols grid of small dots.
  const dots = []
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 8; c++) {
      dots.push(
        <circle
          key={`${r}-${c}`}
          cx={4 + c * 8}
          cy={4 + r * 8}
          r="1.5"
          fill="currentColor"
        />
      )
    }
  }
  return (
    <svg
      width="68"
      height="44"
      viewBox="0 0 68 44"
      className={className}
      aria-hidden
    >
      {dots}
    </svg>
  )
}

function HeroFigure({ className }: { className?: string }) {
  // Abstract "person + screen" stand-in. Replace with the polished asset later.
  return (
    <svg
      width="80"
      height="56"
      viewBox="0 0 80 56"
      className={className}
      aria-hidden
    >
      <rect x="2" y="8" width="48" height="32" rx="3" fill="currentColor" opacity="0.5" />
      <rect x="6" y="12" width="20" height="3" rx="1.5" fill="white" />
      <rect x="6" y="18" width="40" height="2" rx="1" fill="white" opacity="0.7" />
      <rect x="6" y="22" width="34" height="2" rx="1" fill="white" opacity="0.7" />
      <rect x="6" y="26" width="22" height="2" rx="1" fill="white" opacity="0.7" />
      <rect x="14" y="42" width="24" height="3" rx="1.5" fill="currentColor" opacity="0.6" />
      {/* Person bubble */}
      <circle cx="64" cy="18" r="6" fill="currentColor" opacity="0.7" />
      <path
        d="M52 44c0-6 5-10 12-10s12 4 12 10v4H52v-4z"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  )
}
