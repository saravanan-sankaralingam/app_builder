'use client'

import { taggedComments } from '@/lib/mock/home'
import { HomeCard, HomeCardHeader } from './HomeCard'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export function TaggedComments() {
  return (
    <HomeCard>
      <HomeCardHeader title="Tagged comments" />
      <ul className="flex flex-col h-[400px] overflow-y-auto pr-1">
        {taggedComments.map((c) => (
          <li
            key={c.id}
            className="flex gap-3 py-3 border-b border-gray-50 last:border-b-0"
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback
                className={cn(
                  'text-xs font-medium text-white',
                  c.author.color
                )}
              >
                {c.author.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {c.author.name}
                </span>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {c.timestamp}
                </span>
              </div>
              <p className="text-xs text-gray-700 mt-0.5 leading-snug">
                {c.message}
              </p>
              {c.linkedItem.code && (
                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                    <span className="font-semibold">{c.linkedItem.code}</span>
                    <span className="text-blue-600">·</span>
                    <span>{c.linkedItem.label}</span>
                  </span>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </HomeCard>
  )
}
