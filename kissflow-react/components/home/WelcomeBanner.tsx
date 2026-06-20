'use client'

import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WelcomeBannerProps {
  userName: string
}

export function WelcomeBanner({ userName }: WelcomeBannerProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="flex items-center gap-2 text-base font-semibold text-gray-900">
        <span aria-hidden>👋</span>
        Welcome, {userName}
      </h1>
      <Button
        size="sm"
        onClick={() => {
          /* TODO: customize is a placeholder for now */
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Customize
      </Button>
    </div>
  )
}
