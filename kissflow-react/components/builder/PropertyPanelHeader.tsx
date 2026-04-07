'use client'

import { Trash2 } from 'lucide-react'

interface PropertyPanelHeaderProps {
  icon?: React.ElementType
  title: string
  onDelete?: () => void
}

export function PropertyPanelHeader({ icon: Icon, title, onDelete }: PropertyPanelHeaderProps) {
  return (
    <div className="px-4 py-2 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-gray-500" />}
          <h2 className="text-[14px] font-medium text-gray-900">{title}</h2>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
