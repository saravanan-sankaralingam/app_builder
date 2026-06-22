'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MarketplaceApp } from '@/lib/mock/marketplace'
import { AppThumbnail } from './AppThumbnail'

interface AppCardProps {
  app: MarketplaceApp
}

/**
 * Single tile in the Marketplace grid.
 *
 * Layout (top → bottom):
 *  1. Preview thumbnail (16:9 stylized SVG)
 *  2. Icon tile + app name + publisher
 *  3. Description (2-line clamp)
 *  4. Footer: pricing label · action button (Install for Free, Enquire for Paid)
 */
export function AppCard({ app }: AppCardProps) {
  const Icon = app.icon
  const isFree = app.pricing === 'Free'

  return (
    <article className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3 hover:border-gray-300 hover:shadow-[0_2px_6px_rgba(0,0,0,0.03)] transition-all">
      <AppThumbnail app={app} />

      <div className="flex items-start gap-3">
        <div
          className={cn(
            'h-9 w-9 rounded-md flex items-center justify-center flex-shrink-0',
            app.iconBg
          )}
        >
          <Icon className={cn('h-[18px] w-[18px]', app.iconColor)} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {app.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{app.publisher}</p>
        </div>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 min-h-[2.5rem]">
        {app.description}
      </p>

      <div className="flex items-center justify-between mt-1">
        <span className="text-xs font-medium text-gray-700">{app.pricing}</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            /* TODO: wire Install / Enquire action */
          }}
          className="h-7 px-3 text-xs gap-1.5 border-gray-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          {isFree && <Download className="h-3 w-3" />}
          {isFree ? 'Install' : 'Enquire'}
        </Button>
      </div>
    </article>
  )
}
