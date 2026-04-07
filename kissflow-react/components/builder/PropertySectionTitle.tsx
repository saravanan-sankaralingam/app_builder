'use client'

interface PropertySectionTitleProps {
  children: React.ReactNode
  className?: string
}

export function PropertySectionTitle({ children, className }: PropertySectionTitleProps) {
  return (
    <h3 className={`text-[11px] font-semibold text-gray-900 uppercase tracking-wider ${className || ''}`}>
      {children}
    </h3>
  )
}
