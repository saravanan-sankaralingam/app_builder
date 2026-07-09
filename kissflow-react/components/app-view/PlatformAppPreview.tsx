'use client'

import { useState } from 'react'
import RetailOnePage from '@/app/(main)/app/retail-one/page'
import InventoryManagementPage from '@/app/(main)/app/inventory-management/page'
import ExpenseManagementPage from '@/app/(main)/app/expense-management/page'
import VendorOnboardingPage from '@/app/(main)/app/vendor-onboarding-and-management/page'
import { AppPreviewProvider } from './AppPreviewContext'
import { resolveAppRoles } from './app-roles'

/**
 * Maps a static-app slug to the same Platform page component that renders at
 * `/app/<slug>`. The Builder's Play mode uses this so the runtime preview
 * shows the app's actual nav + page content, not a generic empty state.
 *
 * To add a new static app: register it in `lib/static-apps.ts` AND add an
 * entry here. Apps not present in this map fall back to `AppRuntimePreview`
 * (the empty / copilot-driven shell).
 */
const PLATFORM_APP_PAGES: Record<string, React.ComponentType> = {
  'retail-one': RetailOnePage,
  'inventory-management': InventoryManagementPage,
  'expense-management': ExpenseManagementPage,
  'vendor-onboarding-and-management': VendorOnboardingPage,
}

export function hasPlatformAppPage(appId: string): boolean {
  return appId in PLATFORM_APP_PAGES
}

export function PlatformAppPreview({ appId }: { appId: string }) {
  const PageComponent = PLATFORM_APP_PAGES[appId]
  const [selectedRole, setSelectedRole] = useState(() => resolveAppRoles(appId)[0])
  if (!PageComponent) return null
  // Inside the Builder, strip the Platform-side chrome that only makes sense
  // when the page renders at the full viewport:
  //   • Level 1 (Platform root): kill `bg-gray-100` and `min-h-[calc(100vh-50px)]`
  //     so the Builder's own chrome shows through and the height is content-driven.
  //   • Level 2 (sticky-header wrapper + `p-6` content wrapper): kill the outer
  //     gutter padding so the sticky header card and the content cards sit flush
  //     against the Builder's preview edges.
  // The white sticky header card's own inner padding (`px-5 py-3` on the h-[86px]
  // card at Level 3) is untouched — its typography and spacing stay identical.
  return (
    <div className="flex-1 overflow-auto [&>div]:!bg-transparent [&>div]:!min-h-0 [&>div>div]:!p-0 [&>div>div+div]:!pt-3 [&>div>div+div]:!px-2">
      <AppPreviewProvider value={{ inBuilderPlay: true, appId, selectedRole, setSelectedRole }}>
        <PageComponent />
      </AppPreviewProvider>
    </div>
  )
}
