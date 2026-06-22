'use client'

import { Edit3 } from 'lucide-react'

export function WatchlistEmpty() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6">
      {/* Illustration placeholder — clipboard-with-pen, replace with the polished asset later */}
      <div className="relative mb-6">
        <div className="h-28 w-28 rounded-full bg-gray-100/70 flex items-center justify-center">
          {/* Clipboard with green clip */}
          <div className="relative">
            <div className="h-16 w-12 bg-white border border-gray-200 rounded-md">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-2.5 w-5 bg-emerald-500 rounded-sm" />
            </div>
            {/* Pen badge */}
            <div className="absolute -left-3 top-4 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <Edit3 className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-base font-semibold text-gray-900 mb-1">
        Your watchlist is empty
      </h2>
      <p className="text-sm text-gray-500">
        Watch items you want to follow and keep track of their progress.
      </p>
    </div>
  )
}
