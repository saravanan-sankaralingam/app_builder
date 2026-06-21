'use client'

import { createdItems, createdTotalCount } from '@/lib/mock/home'
import { HomeCard, HomeCardHeader } from './HomeCard'
import { StatusBadge } from './StatusBadge'
import { cn } from '@/lib/utils'

export function ItemsCreatedByMe() {
  return (
    <HomeCard>
      <HomeCardHeader title="Items created by me" count={createdTotalCount} />
      <div className="flex flex-col gap-2 h-[400px] overflow-y-auto pr-1">
        {createdItems.map((row) => {
          const Icon = row.icon
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => {
                /* TODO: navigate to record */
              }}
              className="flex flex-col gap-1 p-3 text-left text-sm border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50/70 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={cn('h-4 w-4 flex-shrink-0', row.iconColor)} />
                <span className="text-gray-800 truncate">{row.title}</span>
                <StatusBadge status={row.status} />
              </div>
              <div className="text-xs text-gray-500">{row.createdBy}</div>
            </button>
          )
        })}
      </div>
    </HomeCard>
  )
}
