'use client'

import { marketplaceApps, totalAppCount } from '@/lib/mock/marketplace'
import { AppCard } from './AppCard'

/**
 * The full "All apps" grid that sits below the hero. 3-column at lg+,
 * collapses to 2 / 1 at smaller widths. The (N) badge reflects the total
 * available app count — currently identical to the rendered array since
 * pagination isn't wired.
 */
export function AllAppsGrid() {
  return (
    <section className="mt-6 mx-auto w-fit">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        All apps
        <span className="ml-1.5 text-gray-500 font-medium">
          ({totalAppCount})
        </span>
      </h2>
      <div className="grid grid-cols-[repeat(3,300px)] gap-4">
        {marketplaceApps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </section>
  )
}
