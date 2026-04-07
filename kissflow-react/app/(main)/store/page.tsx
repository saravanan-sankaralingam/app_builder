'use client'

import { PlaceholderPage } from '@/components/common/PlaceholderPage'
import { Store } from 'lucide-react'

export default function MarketplacePage() {
  return (
    <PlaceholderPage
      icon={Store}
      iconBg="#FCE7F3"
      iconColor="#DB2777"
      title="Marketplace"
      description="Discover pre-built apps, templates, and integrations. The marketplace is coming soon."
      ctaLabel="Explore Apps"
      ctaHref="/explorer"
    />
  )
}
