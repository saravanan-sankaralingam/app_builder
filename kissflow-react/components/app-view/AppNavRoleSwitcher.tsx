'use client'

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useAppPreview } from './AppPreviewContext'
import { resolveAppRoles } from './app-roles'

// Soft pastel avatar swatches, cycled by row so each role reads distinctly.
const AVATAR_PALETTE = [
  'bg-blue-100 text-blue-600',
  'bg-pink-100 text-pink-600',
  'bg-purple-100 text-purple-600',
  'bg-green-100 text-green-600',
  'bg-orange-100 text-orange-600',
  'bg-cyan-100 text-cyan-600',
]

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Role switcher shown in the app nav header while previewing an app in the
 * Builder's Play mode (in place of the end-user "Manage" button). Lets the
 * author preview the app as any of its defined roles.
 */
export function AppNavRoleSwitcher() {
  const { appId, selectedRole, setSelectedRole } = useAppPreview()
  const roles = resolveAppRoles(appId)
  const role = selectedRole ?? roles[0]
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 h-8 pl-3 pr-2.5 rounded-lg border border-gray-200 bg-white text-[13px] hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <span className="text-gray-500 font-normal">Viewing as</span>
          <span className="truncate max-w-[160px] font-semibold text-gray-900">{role}</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} className="w-72 p-1.5 max-h-[360px] overflow-y-auto">
        {roles.map((r, i) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setSelectedRole?.(r)
              setOpen(false)
            }}
            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-[11px] font-semibold flex-shrink-0',
                AVATAR_PALETTE[i % AVATAR_PALETTE.length]
              )}
            >
              {initials(r)}
            </span>
            <span className="flex-1 min-w-0 truncate text-[14px] text-gray-900">{r}</span>
            {r === role && (
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" strokeWidth={2} />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
