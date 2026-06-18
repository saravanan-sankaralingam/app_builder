'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Notification } from '@/lib/mock/notifications'

interface NotificationCardProps {
  notification: Notification
  className?: string
}

export function NotificationCard({ notification, className }: NotificationCardProps) {
  return (
    <div
      className={cn(
        'flex gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer',
        className
      )}
    >
      <Avatar className="h-9 w-9 flex-shrink-0">
        <AvatarFallback
          className={cn('text-xs font-medium text-white', notification.userColor)}
        >
          {notification.userInitials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-700">{notification.appName}</div>
        <div className="text-sm text-gray-900 mt-0.5 leading-snug">
          {notification.message}
        </div>
        <div className="text-xs text-gray-700 mt-1.5">{notification.time}</div>
      </div>

      {!notification.isRead && (
        <span
          aria-label="unread"
          className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"
        />
      )}
    </div>
  )
}
