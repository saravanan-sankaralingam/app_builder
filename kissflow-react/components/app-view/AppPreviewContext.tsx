'use client'

import { createContext, useContext } from 'react'

/**
 * Signals how an app page is being rendered. On the Platform end-user route
 * (`/app/[appId]`) there's no provider, so `inBuilderPlay` defaults to false.
 * The Builder's Play-mode preview (`PlatformAppPreview`) wraps the page in a
 * provider with `inBuilderPlay: true`, letting the app nav header swap its
 * end-user affordances (Manage, More, Pin, share) for a Role switcher.
 */
export interface AppPreviewValue {
  inBuilderPlay: boolean
  /** Slug of the app being previewed (only set inside Builder Play). */
  appId?: string
  /** Role the author is previewing the app as (only set inside Builder Play). */
  selectedRole?: string
  setSelectedRole?: (role: string) => void
}

const AppPreviewContext = createContext<AppPreviewValue>({ inBuilderPlay: false })

export function AppPreviewProvider({
  value,
  children,
}: {
  value: AppPreviewValue
  children: React.ReactNode
}) {
  return <AppPreviewContext.Provider value={value}>{children}</AppPreviewContext.Provider>
}

export function useAppPreview(): AppPreviewValue {
  return useContext(AppPreviewContext)
}
