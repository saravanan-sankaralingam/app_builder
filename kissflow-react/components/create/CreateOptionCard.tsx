'use client'

import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface CreateOptionCardProps {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  title: string
  description: string
  onClick?: () => void
}

export function CreateOptionCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  onClick,
}: CreateOptionCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-gray-300 py-0"
      onClick={onClick}
    >
      <CardContent className="p-4 px-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: iconBg }}
          >
            <Icon className="h-5 w-5" style={{ color: iconColor }} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 mb-0.5">
              {title}
            </h3>
            <p className="text-sm text-gray-600 leading-snug">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
