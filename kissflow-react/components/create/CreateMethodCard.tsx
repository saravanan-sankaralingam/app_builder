'use client'

import { LucideIcon } from 'lucide-react'

interface CreateMethodCardProps {
  icon: LucideIcon
  iconColor: string
  gradientFrom: string
  gradientTo: string
  hoverGradientFrom: string
  hoverGradientTo: string
  title: string
  description: string
  onClick?: () => void
}

export function CreateMethodCard({
  icon: Icon,
  iconColor,
  gradientFrom,
  gradientTo,
  hoverGradientFrom,
  hoverGradientTo,
  title,
  description,
  onClick,
}: CreateMethodCardProps) {
  return (
    <div
      className="group relative p-[2px] rounded-xl transition-all duration-200 ease-out cursor-pointer hover:shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${hoverGradientFrom}, ${hoverGradientTo})`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
      }}
      onClick={onClick}
    >
      <button
        type="button"
        className="w-full flex flex-col items-start text-left p-5 min-h-[140px] rounded-[10px] bg-white transition-all duration-200 ease-out"
      >
        {/* Icon - filled */}
        <Icon
          className="h-7 w-7 mb-3"
          style={{ color: iconColor }}
          fill={iconColor}
        />

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          {title}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-gray-500 leading-relaxed">
          {description}
        </p>
      </button>
    </div>
  )
}
