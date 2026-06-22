'use client'

import { useState, useMemo } from 'react'
import {
  assignedItems,
  createdItems,
  tabCounts,
} from '@/lib/mock/my-items'
import {
  MyItemsHeader,
  type MyItemsTab,
  type CreatedStatus,
  type WatchlistStatus,
} from '@/components/my-items/MyItemsHeader'
import { MyItemsSidebar } from '@/components/my-items/MyItemsSidebar'
import { AssignedItemCard } from '@/components/my-items/AssignedItemCard'
import { CreatedItemCard } from '@/components/my-items/CreatedItemCard'
import { WatchlistEmpty } from '@/components/my-items/WatchlistEmpty'

export default function MyItemsPage() {
  const [activeTab, setActiveTab] = useState<MyItemsTab>('assigned')
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [createdStatus, setCreatedStatus] =
    useState<CreatedStatus>('in-progress')
  const [watchlistStatus, setWatchlistStatus] =
    useState<WatchlistStatus>('in-progress')

  // Reset selected app when switching tabs (otherwise an app pinned for one
  // tab may not exist or look stale in the other).
  const handleTabChange = (t: MyItemsTab) => {
    setActiveTab(t)
    setSelectedAppId(null)
  }

  const countKey = activeTab === 'created' ? 'createdCount' : 'assignedCount'
  const totalCount =
    activeTab === 'assigned'
      ? tabCounts.assigned
      : activeTab === 'created'
        ? tabCounts.created
        : tabCounts.watchlist

  const filteredAssigned = useMemo(
    () =>
      selectedAppId
        ? assignedItems.filter((i) => i.appId === selectedAppId)
        : assignedItems,
    [selectedAppId]
  )
  const filteredCreated = useMemo(
    () =>
      selectedAppId
        ? createdItems.filter((i) => i.appId === selectedAppId)
        : createdItems,
    [selectedAppId]
  )

  return (
    <div className="h-full bg-gray-50 p-6 flex flex-col">
      <MyItemsHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        createdStatus={createdStatus}
        onCreatedStatusChange={setCreatedStatus}
        watchlistStatus={watchlistStatus}
        onWatchlistStatusChange={setWatchlistStatus}
      />

      {/*
        Grid stretches to fill remaining vertical space so the sidebar and
        the main panel hold a stable full height regardless of how many
        items are currently visible (one item, many items, or the
        watchlist empty state).
      */}
      <div className="grid grid-cols-[260px_1fr] gap-4 flex-1 min-h-0">
        <MyItemsSidebar
          selectedAppId={selectedAppId}
          onSelect={setSelectedAppId}
          countKey={countKey}
          totalCount={totalCount}
        />

        <main className="overflow-y-auto pr-1">
          {activeTab === 'assigned' && (
            <div className="flex flex-col gap-3">
              {filteredAssigned.map((item) => (
                <AssignedItemCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {activeTab === 'created' && (
            <div className="flex flex-col gap-3">
              {filteredCreated.map((item) => (
                <CreatedItemCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {activeTab === 'watchlist' && (
            <div className="h-full flex items-center justify-center">
              <WatchlistEmpty />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
