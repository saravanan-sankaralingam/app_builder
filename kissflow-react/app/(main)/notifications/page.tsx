'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { NotificationCard } from '@/components/notifications/NotificationCard'
import { mockNotifications, type Notification } from '@/lib/mock/notifications'
import { cn } from '@/lib/utils'

type TabKey = 'all' | 'unread' | 'mentions'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'mentions', label: 'Mentions' },
]

export default function NotificationsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>('all')
  const [notifications] = useState<Notification[]>(mockNotifications)

  const filtered = notifications.filter((n) => {
    if (tab === 'unread') return !n.isRead
    if (tab === 'mentions') return n.isMention
    return true
  })

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 pt-5 pb-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 focus:outline-none focus-visible:outline-none"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Notification</h1>
        </div>

        {/* Tabs */}
        <div className="max-w-3xl mx-auto px-6 flex gap-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'py-3 text-sm border-b-2 -mb-px transition-colors focus:outline-none',
                tab === t.key
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-16">
            No notifications
          </div>
        ) : (
          filtered.map((n) => <NotificationCard key={n.id} notification={n} />)
        )}
      </div>
    </div>
  )
}
