'use client'

import { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-screen grid grid-rows-[3.5rem_1fr] grid-cols-[3.5rem_1fr] bg-gray-50">
      {/* TopBar spans full width */}
      <header className="col-span-2">
        <TopBar />
      </header>

      {/* Sidebar in left column */}
      <aside>
        <Sidebar />
      </aside>

      {/* Main content scrolls independently */}
      <main className="overflow-auto">
        {children}
      </main>
    </div>
  )
}
