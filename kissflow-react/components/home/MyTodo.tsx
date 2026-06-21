'use client'

import { todoItems, todoTotalCount } from '@/lib/mock/home'
import { HomeCard, HomeCardHeader } from './HomeCard'
import { Sparkles } from 'lucide-react'

export function MyTodo() {
  if (todoItems.length === 0) {
    return (
      <HomeCard className="flex flex-col">
        <HomeCardHeader title="My to-do" count={todoTotalCount} />
        <div className="h-[434px] flex flex-col items-center justify-center text-center">
          {/* Illustration placeholder — replace with the polished asset when ready. */}
          <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-3">
            <Sparkles className="h-8 w-8 text-amber-500" />
          </div>
          <p className="text-sm text-gray-600">You’re in the clear!</p>
        </div>
      </HomeCard>
    )
  }

  return (
    <HomeCard>
      <HomeCardHeader title="My to-do" count={todoTotalCount} />
      <ul className="flex flex-col gap-2">
        {todoItems.map((t) => (
          <li key={t.id} className="text-sm text-gray-800">
            {t.title}
          </li>
        ))}
      </ul>
    </HomeCard>
  )
}
