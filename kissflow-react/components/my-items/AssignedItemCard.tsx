'use client'

import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apps, type AssignedItem } from '@/lib/mock/my-items'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function AssignedItemCard({ item }: { item: AssignedItem }) {
  const app = apps.find((a) => a.id === item.appId)
  const Icon = app?.icon
  return (
    <button
      type="button"
      onClick={() => {
        /* TODO: navigate to record */
      }}
      className="w-full text-left bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      {/* Title row */}
      <div className="flex items-center gap-2 mb-3">
        {Icon && (
          <Icon className={cn('h-4 w-4 flex-shrink-0', app!.iconColor)} />
        )}
        <span className="text-sm font-semibold text-gray-900">
          {item.title}
        </span>
      </div>

      {/* 4-column meta row */}
      <div className="grid grid-cols-4 gap-4">
        <Field label="App">
          <span className="inline-flex items-center gap-1 text-gray-800">
            {app?.name}
            <ExternalLink className="h-3 w-3 text-gray-400" />
          </span>
        </Field>
        <Field label="Step">
          <span className="text-gray-800">{item.step}</span>
        </Field>
        <Field label="Initiated by">
          <span className="inline-flex items-center gap-1.5">
            <Avatar className="h-4 w-4">
              <AvatarFallback
                className={cn(
                  'text-[9px] font-medium text-white',
                  item.initiatedBy.color
                )}
              >
                {item.initiatedBy.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-800">{item.initiatedBy.name}</span>
          </span>
        </Field>
        <Field label="Due date">
          <span className="text-gray-800">{item.dueDate ?? '—'}</span>
        </Field>
      </div>
    </button>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="text-sm truncate">{children}</div>
    </div>
  )
}
