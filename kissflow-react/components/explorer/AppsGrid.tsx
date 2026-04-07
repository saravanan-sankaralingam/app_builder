'use client'

import { AppData } from '@/types/app'
import { AppCard } from './AppCard'
import { Folder } from 'lucide-react'

interface AppsGridProps {
  apps: AppData[]
  viewMode: 'grid' | 'list'
}

export function AppsGrid({ apps, viewMode }: AppsGridProps) {
  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-100">
        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
          <Folder className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm font-medium">No apps found</p>
        <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5'
          : 'flex flex-col gap-3'
      }
    >
      {apps.map((app) => (
        <AppCard key={app.id} app={app} viewMode={viewMode} />
      ))}
    </div>
  )
}
