'use client'

import {
  Search,
  HelpCircle,
  Bell,
  MessageSquare,
  UserRoundCog,
  Palette,
  Plug,
  Server,
  ShieldCheck,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { NotificationCallout } from '@/components/notifications/NotificationCallout'
import Link from 'next/link'

export function TopBar() {
  return (
    <header className="h-full border-b border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="flex h-[50px] items-center justify-between pl-3 pr-4">
        {/* Logo - Left */}
        <div className="flex items-center min-w-[180px]">
          <Link
            href="/"
            className="flex items-center group transition-opacity duration-150 hover:opacity-80"
          >
            <img
              src="/Logo.svg"
              alt="Logosimply"
              className="h-7"
            />
          </Link>
        </div>

        {/* Global Search - Center */}
        <div className="flex-1 flex justify-center max-w-2xl mx-4">
          <button
            className="relative w-full max-w-md group"
            onClick={() => {/* TODO: Open command palette */}}
          >
            <div className="flex items-center w-full h-8 px-3 bg-white hover:border-gray-500 border border-gray-400 rounded-lg transition-all duration-150 cursor-pointer">
              <Search className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="ml-2 text-sm text-gray-500 truncate">
                What are you looking for today?
              </span>
              <kbd className="ml-auto hidden sm:inline-flex select-none font-mono text-[11px] text-gray-700">
                Cmd+E/Ctrl+E
              </kbd>
            </div>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 min-w-[180px] justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-150"
          >
            <HelpCircle className="h-[18px] w-[18px]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-150"
          >
            <MessageSquare className="h-[18px] w-[18px]" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                className="h-9 w-9 rounded-full text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-150 relative focus-visible:ring-0"
              >
                <Bell className="h-[18px] w-[18px]" />
                {/* Notification indicator */}
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="p-0 w-auto"
            >
              <NotificationCallout />
            </PopoverContent>
          </Popover>

          {/* Profile Avatar with dropdown — see docs/PLATFORM_SHELL.md */}
          {/* TODO(designer): finalize icon picks for each menu item */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative group ml-2 focus:outline-none focus-visible:outline-none">
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-gray-200 transition-all duration-150">
                  <AvatarFallback className="bg-blue-600 text-white text-xs font-medium">
                    SS
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="min-w-[220px] p-2"
            >
              <DropdownMenuItem className="gap-3 py-2.5 px-2.5 cursor-pointer">
                <UserRoundCog className="h-[18px] w-[18px] text-gray-600" />
                <span className="text-sm">My settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 py-2.5 px-2.5 cursor-pointer">
                <Palette className="h-[18px] w-[18px] text-gray-600" />
                <span className="text-sm">Themes</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 py-2.5 px-2.5 cursor-pointer">
                <Plug className="h-[18px] w-[18px] text-gray-600" />
                <span className="text-sm">Connector builder</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem className="gap-3 py-2.5 px-2.5 cursor-pointer">
                <Server className="h-[18px] w-[18px] text-gray-600" />
                <span className="text-sm">Environments</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 py-2.5 px-2.5 cursor-pointer">
                <UserRoundCog className="h-[18px] w-[18px] text-gray-600" />
                <span className="text-sm">Account administration</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 py-2.5 px-2.5 cursor-pointer">
                <ShieldCheck className="h-[18px] w-[18px] text-gray-600" />
                <span className="text-sm">Account governance</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem
                variant="destructive"
                className="gap-3 py-2.5 px-2.5 cursor-pointer"
              >
                <LogOut className="h-[18px] w-[18px]" />
                <span className="text-sm">Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
