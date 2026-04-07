'use client'

import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { AppData } from '@/types/app'
import { cn } from '@/lib/utils'

interface AppCardProps {
  app: AppData
  viewMode?: 'grid' | 'list'
}

export function AppCard({ app, viewMode = 'grid' }: AppCardProps) {
  const Icon = app.icon

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Open builder in new tab
    window.open(`/builder/${app.id}`, '_blank')
  }

  if (viewMode === 'list') {
    return (
      <Link href={`/app/${app.id}`}>
        <div className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 cursor-pointer">
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
      <div className="group relative bg-white rounded-xl border border-gray-100 p-5 cursor-pointer transition-all duration-200 hover:border-gray-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5">
        {/* Edit Button - Top Right */}
        <button
          onClick={handleEditClick}
          className="absolute top-3 right-3 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-150 z-10"
          title="Edit app"
        >
          <Pencil className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: app.iconBg }}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>

        {/* Content */}
        <div className="space-y-1.5 mb-4">
          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-150 line-clamp-1">
            {app.name}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {app.description}
          </p>
        </div>

        {/* Footer - subtle separator */}
        <div className="pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-[10px] font-medium text-gray-600">
                {app.createdBy.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <span className="text-xs text-gray-500 truncate">{app.createdBy}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
