'use client'

import { createdItems, createdTotalCount } from '@/lib/mock/home'
import { HomeCard, HomeCardHeader } from './HomeCard'
import { StatusBadge } from './StatusBadge'
import { cn } from '@/lib/utils'

export function ItemsCreatedByMe() {
  return (
    <HomeCard>
      <HomeCardHeader title="Items created by me" count={createdTotalCount} />
      <div className="flex flex-col">
        {createdItems.map((row) => {
          const Icon = row.icon
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => {
                /* TODO: navigate to record */
              }}
              className="flex items-center gap-3 px-2 py-2.5 text-left text-sm border-b border-gray-50 hover:bg-gray-50/70 transition-colors rounded-md last:border-b-0"
            >
              <Icon className={cn('h-4 w-4 flex-shrink-0', row.iconColor)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-gray-800 truncate">{row.title}</span>
                  <StatusBadge status={row.status} />
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{row.createdBy}</div>
              </div>
            </button>
          )
        })}
      </div>
    </HomeCard>
  )
}
