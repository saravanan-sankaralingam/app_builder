'use client'

import { cn } from '@/lib/utils'
import { ChevronDown, Calendar } from 'lucide-react'
import { tabCounts } from '@/lib/mock/my-items'

export type MyItemsTab = 'assigned' | 'created' | 'watchlist'
export type CreatedStatus = 'in-progress' | 'not-started' | 'completed'
export type WatchlistStatus = 'in-progress' | 'completed'

const TABS: { key: MyItemsTab; label: string }[] = [
  { key: 'assigned', label: 'Assigned to me' },
  { key: 'created', label: 'Created by me' },
  { key: 'watchlist', label: 'Watchlist' },
]

function TabPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors',
        active
          ? 'bg-gray-900 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
      )}
    >
      {children}
    </button>
  )
}

function FilterToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex items-center bg-white border border-gray-200 rounded-full p-0.5">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium transition-colors',
            value === opt.key
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:text-gray-800'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

interface MyItemsHeaderProps {
  activeTab: MyItemsTab
  onTabChange: (t: MyItemsTab) => void
  createdStatus: CreatedStatus
  onCreatedStatusChange: (s: CreatedStatus) => void
  watchlistStatus: WatchlistStatus
  onWatchlistStatusChange: (s: WatchlistStatus) => void
}

export function MyItemsHeader({
  activeTab,
  onTabChange,
  createdStatus,
  onCreatedStatusChange,
  watchlistStatus,
  onWatchlistStatusChange,
}: MyItemsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-4">
      <h1 className="text-lg font-semibold text-gray-900">My items</h1>

      <div className="flex items-center justify-between">
        {/* Tab pills */}
        <div className="flex items-center gap-2">
          {TABS.map((t) => (
            <TabPill
              key={t.key}
              active={activeTab === t.key}
              onClick={() => onTabChange(t.key)}
            >
              {t.label}
              {t.key === 'assigned' && (
                <span className="ml-1.5 opacity-80">({tabCounts.assigned})</span>
              )}
            </TabPill>
          ))}
        </div>

        {/* Right-side filters change per tab */}
        <div className="flex items-center gap-2">
          {activeTab === 'assigned' && (
            <>
              <div className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-sm text-gray-700">
                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                Due by
                <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-sm text-gray-700"
              >
                All
                <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
              </button>
            </>
          )}

          {activeTab === 'created' && (
            <>
              <FilterToggle
                options={[
                  { key: 'in-progress', label: 'In progress' },
                  { key: 'not-started', label: 'Not started' },
                  { key: 'completed', label: 'Completed' },
                ]}
                value={createdStatus}
                onChange={onCreatedStatusChange}
              />
              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-sm text-gray-700"
              >
                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                Created
                <span className="ml-1 text-gray-500">All</span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
              </button>
            </>
          )}

          {activeTab === 'watchlist' && (
            <>
              <FilterToggle
                options={[
                  { key: 'in-progress', label: 'In progress' },
                  { key: 'completed', label: 'Completed' },
                ]}
                value={watchlistStatus}
                onChange={onWatchlistStatusChange}
              />
              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-sm text-gray-700"
              >
                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                Created
                <span className="ml-1 text-gray-500">All</span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
