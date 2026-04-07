'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface PlaceholderPageProps {
  icon: LucideIcon
  iconBg?: string
  iconColor?: string
  title: string
  description: string
  ctaLabel?: string
  ctaHref?: string
}

export function PlaceholderPage({
  icon: Icon,
  iconBg = '#DBEAFE',
  iconColor = '#2563EB',
  title,
  description,
  ctaLabel,
  ctaHref,
}: PlaceholderPageProps) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Decorative background circles */}
        <div className="relative flex justify-center mb-6">
          <div className="absolute w-32 h-32 rounded-full bg-gray-100/50 -top-2" />
          <div className="absolute w-24 h-24 rounded-full bg-gray-100/80 top-2" />
          <div
            className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: iconBg }}
          >
            <Icon className="h-10 w-10" style={{ color: iconColor }} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {title}
        </h1>

        {/* Description */}
        <p className="text-gray-500 mb-6 leading-relaxed">
          {description}
        </p>

        {/* CTA Button */}
        {ctaLabel && ctaHref && (
          <Link href={ctaHref}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              {ctaLabel}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
