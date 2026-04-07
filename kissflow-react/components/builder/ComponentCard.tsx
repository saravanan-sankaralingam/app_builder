'use client'

import { FileText, Form, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ComponentData {
  id: string
  name: string
  description?: string
  type: 'page' | 'form'
  method: 'scratch' | 'ai'
  prompt?: string
  status: 'draft' | 'published'
  createdAt: Date
}

interface ComponentCardProps {
  component: ComponentData
  onClick?: (component: ComponentData) => void
  onDuplicate?: (component: ComponentData) => void
}

export function ComponentCard({ component, onClick, onDuplicate }: ComponentCardProps) {
  const Icon = component.type === 'page' ? FileText : Form

  return (
    <div
      onClick={() => onClick?.(component)}
      className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer group"
    >
      {/* Header - Icon and Actions */}
      <div className="flex items-start justify-between mb-5">
        {/* Type Icon */}
        <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
          <Icon className="h-7 w-7 text-blue-600" fill="rgba(37, 99, 235, 0.2)" />
        </div>

        {/* Duplicate Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate?.(component)
          }}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          title="Duplicate"
        >
          <Copy className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Name */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {component.name}
      </h3>

      {/* Description */}
      {component.description && (
        <p className="text-sm text-gray-500 mb-5 line-clamp-2 leading-relaxed">
          {component.description}
        </p>
      )}

      {/* Status Badge */}
      <div className="mt-auto">
        <span
          className={cn(
            'inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold',
            component.status === 'published'
              ? 'bg-green-50 text-green-700'
              : 'bg-gray-100 text-gray-600'
          )}
        >
          {component.status === 'published' ? 'Published' : 'Draft'}
        </span>
      </div>
    </div>
  )
}
