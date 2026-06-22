import { MarketplaceHero } from '@/components/marketplace/MarketplaceHero'
import { AllAppsGrid } from '@/components/marketplace/AllAppsGrid'

export default function MarketplacePage() {
  return (
    <div className="min-h-full bg-gray-50 p-6">
      <MarketplaceHero />
      <AllAppsGrid />
    </div>
  )
}
