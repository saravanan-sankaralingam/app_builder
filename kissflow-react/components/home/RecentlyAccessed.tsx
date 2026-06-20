'use client'

import { recentApps } from '@/lib/mock/home'
import { HomeCard, HomeCardHeader } from './HomeCard'
import { cn } from '@/lib/utils'

export function RecentlyAccessed() {
  return (
    <HomeCard>
      <HomeCardHeader title="Recently accessed" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {recentApps.map((app) => {
          const Icon = app.icon
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => {
                /* TODO: navigate to app */
              }}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50/70 hover:border-gray-200 transition-colors text-left"
            >
              <div
                className={cn(
                  'h-9 w-9 rounded-md flex items-center justify-center flex-shrink-0',
                  app.iconBg
                )}
              >
                <Icon className={cn('h-5 w-5', app.iconColor)} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {app.name}
                </div>
                {app.meta && (
                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                    {app.meta}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </HomeCard>
  )
}
