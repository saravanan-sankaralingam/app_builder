'use client'

import { Search, HelpCircle, Bell, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'

export function TopBar() {
  return (
    <header className="h-full border-b border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between pl-3 pr-4">
        {/* Logo - Left */}
        <div className="flex items-center min-w-[180px]">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-opacity duration-150 hover:opacity-80"
          >
            {/* Simplified modern logo */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg
                viewBox="0 0 24 24"
                className="w-4.5 h-4.5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-[15px] tracking-tight hidden sm:inline-block">
              Kissflow
            </span>
          </Link>
        </div>

        {/* Global Search - Center */}
        <div className="flex-1 flex justify-center max-w-2xl mx-4">
          <button
            className="relative w-full max-w-md group"
            onClick={() => {/* TODO: Open command palette */}}
          >
            <div className="flex items-center w-full h-9 px-3 bg-white hover:border-gray-500 border border-gray-400 rounded-lg transition-all duration-150 cursor-pointer">
              <Search className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="ml-2 text-sm text-gray-500 truncate">
                Search anything...
              </span>
              <kbd className="ml-auto hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 font-mono text-[10px] font-medium text-gray-500 shadow-sm">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 min-w-[180px] justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150"
          >
            <HelpCircle className="h-[18px] w-[18px]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150"
          >
            <Settings className="h-[18px] w-[18px]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150 relative"
          >
            <Bell className="h-[18px] w-[18px]" />
            {/* Notification indicator */}
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full ring-2 ring-white"></span>
          </Button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-2"></div>

          {/* Avatar with hover effect */}
          <button className="relative group">
            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-gray-200 transition-all duration-150">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-medium">
                SS
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>
    </header>
  )
}
