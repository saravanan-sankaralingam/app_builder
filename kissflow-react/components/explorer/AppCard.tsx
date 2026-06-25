'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Pencil, Pin, MoreVertical } from 'lucide-react'
import { AppData } from '@/types/app'
import { cn } from '@/lib/utils'

interface AppCardProps {
  app: AppData
  viewMode?: 'grid' | 'list'
}

export function AppCard({ app, viewMode = 'grid' }: AppCardProps) {
  const Icon = app.icon
  const [isPinned, setIsPinned] = useState(false)

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Open builder in new tab
    window.open(`/builder/${app.id}`, '_blank')
  }

  const handlePinClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsPinned((p) => !p)
  }

  const handleMoreClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // TODO: open card overflow menu
  }

  if (viewMode === 'list') {
    return (
      <Link href={`/app/${app.id}`}>
        <div className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-300 hover:border-gray-400 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 cursor-pointer">
          {/* Icon */}
          <div
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
            style={{ backgroundColor: app.iconBg }}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-150 truncate">
              {app.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {app.description}
            </p>
          </div>

          {/* Edit Button */}
          <button
            onClick={handleEditClick}
            className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-150"
            title="Edit app"
          >
            <Pencil className="h-4 w-4" />
          </button>

          {/* Creator */}
          <div className="flex-shrink-0 text-right hidden sm:block">
            <p className="text-xs text-gray-400">Created by</p>
            <p className="text-sm text-gray-600 font-medium">{app.createdBy}</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/app/${app.id}`}>
      <div className="group relative flex flex-col bg-white rounded-xl border border-gray-300 p-5 h-[220px] cursor-pointer transition-all duration-200 hover:border-gray-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5">
        {/* Top-right action cluster (Pin + More) — top-aligned with the app icon (p-5) */}
        <div className="absolute top-5 right-5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
          <button
            onClick={handlePinClick}
            title={isPinned ? 'Unpin' : 'Pin'}
            className={cn(
              'flex items-center justify-center h-7 w-7 rounded-full transition-colors duration-150',
              'hover:bg-gray-200 hover:text-yellow-500',
              isPinned ? 'text-yellow-500' : 'text-gray-500'
            )}
          >
            <Pin className={cn('h-4 w-4', isPinned && 'fill-current')} />
          </button>
          <button
            onClick={handleMoreClick}
            title="More options"
            className="flex items-center justify-center h-7 w-7 rounded-full text-gray-700 hover:bg-gray-200 transition-colors duration-150"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom-right Edit button — 28px blue solid circle with white glyph */}
        <button
          onClick={handleEditClick}
          title="Edit app"
          className="absolute bottom-5 right-5 flex items-center justify-center h-7 w-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-150 z-10"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>

        {/* Icon */}
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: app.iconBg }}
        >
          <Icon className="h-4 w-4 text-white" />
        </div>

        {/* App name + description */}
        <div className="flex flex-col gap-1.5">
          <h3
            title={app.name}
            className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug"
          >
            {app.name}
          </h3>
          <p
            title={app.description}
            className="text-xs font-normal text-gray-700 leading-relaxed line-clamp-2 h-10"
          >
            {app.description}
          </p>
        </div>

        {/* Created by — pinned to the bottom, padded right to clear the edit circle */}
        <div className="mt-auto pr-10">
          <p className="text-[11px] font-normal text-gray-700 leading-tight">Created by</p>
          <p className="text-[11px] font-medium text-gray-700 leading-tight truncate mt-1">{app.createdBy}</p>
        </div>
      </div>
    </Link>
  )
}
