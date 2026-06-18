'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Settings } from 'lucide-react'
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
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const filtered = notifications.filter((n) => {
    if (tab === 'unread') return !n.isRead
    if (tab === 'mentions') return n.isMention
    return true
  })

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Header — left aligned, white bg, fixed at top */}
      <div className="border-b border-gray-100 bg-white flex-shrink-0">
        <div className="px-6 pt-5 pb-5 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 focus:outline-none focus-visible:outline-none"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Notification</h1>
        </div>
      </div>

      {/* Body — takes remaining height; only the white section scrolls */}
      <div className="flex-1 overflow-hidden px-6 py-6">
        <div className="max-w-4xl mx-auto h-full bg-white rounded-lg border border-gray-100 flex flex-col overflow-hidden">
          {/* Section top row: tabs on left, mark-all-as-read + settings on right */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 flex-shrink-0">
            <div className="flex gap-6">
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline focus:outline-none"
              >
                Mark all as read
              </button>
              <button
                onClick={() => {
                  /* TODO: open notification settings */
                }}
                aria-label="Notification settings"
                className="h-7 w-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 focus:outline-none focus-visible:outline-none"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Scrollable notification list */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 flex flex-col gap-3">
              {filtered.length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-16">
                  No notifications
                </div>
              ) : (
                filtered.map((n) => <NotificationCard key={n.id} notification={n} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
