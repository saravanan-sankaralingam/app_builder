'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NotificationCard } from './NotificationCard'
import { mockNotifications, type Notification } from '@/lib/mock/notifications'

export function NotificationCallout() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  return (
    <div className="w-[380px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Notification</h3>
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

      {/* Notification list (scrolls — fixed height so cards stay inside) */}
      <ScrollArea className="h-[360px]">
        <div className="flex flex-col gap-2 p-2">
          {notifications.map((n) => (
            <NotificationCard key={n.id} notification={n} />
          ))}
        </div>
      </ScrollArea>

      {/* Show all */}
      <div className="px-4 py-3 border-t border-gray-100">
        <Link
          href="/notifications"
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          Show all
        </Link>
      </div>
    </div>
  )
}
