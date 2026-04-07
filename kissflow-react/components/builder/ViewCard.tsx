'use client'

import { Table, Image, Sheet, MoreHorizontal } from 'lucide-react'
import { View, ViewType } from '@/lib/api/views'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ViewCardProps {
  view: View
  onClick: (view: View) => void
  onRename?: (view: View) => void
  onShare?: (view: View) => void
  onDelete?: (view: View) => void
}

const viewTypeConfig: Record<ViewType, { icon: React.ElementType; color: string; bgColor: string }> = {
  datatable: {
    icon: Table,
    color: '#3B82F6',
    bgColor: '#DBEAFE',
  },
  gallery: {
    icon: Image,
    color: '#EC4899',
    bgColor: '#FCE7F3',
  },
  sheet: {
    icon: Sheet,
    color: '#22C55E',
    bgColor: '#DCFCE7',
  },
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
}

export function ViewCard({ view, onClick, onRename, onShare, onDelete }: ViewCardProps) {
  const config = viewTypeConfig[view.type]
  const Icon = config.icon

  return (
    <div
      onClick={() => onClick(view)}
      className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-300 hover:border-gray-400 hover:shadow-sm transition-all text-left cursor-pointer"
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: config.bgColor }}
      >
        <Icon className="h-5 w-5" style={{ color: config.color }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{view.name}</p>
        <p className="text-xs text-gray-500">
          Last modified {formatRelativeTime(view.updatedAt)}
        </p>
      </div>

      {/* More button with dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 p-1.5 rounded-md hover:bg-gray-200 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4 text-gray-600" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" alignOffset={-8} className="w-40 p-1.5 rounded-xl border-0">
          <DropdownMenuItem
            className="text-[13px] py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation()
              onRename?.(view)
            }}
          >
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-[13px] py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation()
              onShare?.(view)
            }}
          >
            Share
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-[13px] py-2 px-3 rounded-lg cursor-pointer text-red-500 focus:text-red-500 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(view)
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
