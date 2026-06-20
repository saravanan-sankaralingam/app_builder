'use client'

import { queueItems, queueTotalCount } from '@/lib/mock/home'
import { HomeCard, HomeCardHeader } from './HomeCard'
import { StatusBadge } from './StatusBadge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export function ItemsInQueue() {
  return (
    <HomeCard>
      <HomeCardHeader title="Items in your queue" count={queueTotalCount} />

      {/* Column header */}
      <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] gap-3 px-2 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
        <div>Item</div>
        <div>Flow/App</div>
        <div>From</div>
        <div>Step/Status</div>
        <div>Due by</div>
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {queueItems.map((row) => {
          const Icon = row.icon
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => {
                /* TODO: navigate to record */
              }}
              className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] gap-3 px-2 py-2.5 items-center text-left text-sm border-b border-gray-50 hover:bg-gray-50/70 transition-colors rounded-md"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={cn('h-4 w-4 flex-shrink-0', row.iconColor)} />
                <span className="text-gray-800 truncate">{row.title}</span>
              </div>
              <div className="text-gray-700 truncate">{row.flowApp}</div>
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-5 w-5 flex-shrink-0">
                  <AvatarFallback
                    className={cn(
                      'text-[10px] font-medium text-white',
                      row.from.color
                    )}
                  >
                    {row.from.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-700 truncate">{row.from.initials.slice(0, 2)}…</span>
              </div>
              <div>
                <StatusBadge status={row.status} />
              </div>
              <div className="text-gray-500">{row.dueBy ?? '—'}</div>
            </button>
          )
        })}
      </div>
    </HomeCard>
  )
}
