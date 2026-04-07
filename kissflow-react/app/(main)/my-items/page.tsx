'use client'

import { PlaceholderPage } from '@/components/common/PlaceholderPage'
import { Folder } from 'lucide-react'

export default function MyItemsPage() {
  return (
    <PlaceholderPage
      icon={Folder}
      iconBg="#FEF3C7"
      iconColor="#D97706"
      title="My Items"
      description="Your personal items, drafts, and favorites will appear here. This feature is coming soon."
      ctaLabel="Explore Apps"
      ctaHref="/explorer"
    />
  )
}
