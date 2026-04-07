'use client'

import { PlaceholderPage } from '@/components/common/PlaceholderPage'
import { Home } from 'lucide-react'

export default function HomePage() {
  return (
    <PlaceholderPage
      icon={Home}
      iconBg="#DBEAFE"
      iconColor="#2563EB"
      title="Welcome to Kissflow"
      description="Your personalized dashboard is coming soon. In the meantime, explore your apps in the Explorer."
      ctaLabel="Go to Explorer"
      ctaHref="/explorer"
    />
  )
}
