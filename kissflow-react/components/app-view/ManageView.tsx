'use client'

import { Pencil, Settings, Cable, Share2, FileText, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ManageCard {
  key: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  baseBg?: string
  hoverBg: string
  hoverBorder: string
  title: string
  description: string
}

const cards: ManageCard[] = [
  {
    key: 'edit',
    icon: Pencil,
    iconColor: 'text-magenta-600',
    iconBg: 'bg-magenta-200',
    baseBg: 'bg-magenta-100',
    hoverBg: 'hover:bg-magenta-100',
    hoverBorder: 'hover:border-magenta-300',
    title: 'Edit app',
    description: "Customize and run your app's forms, workflows, integrations, and much more.",
  },
  {
    key: 'settings',
    icon: Settings,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-200',
    hoverBg: 'hover:bg-blue-100',
    hoverBorder: 'hover:border-blue-200',
    title: 'Settings',
    description: 'Configure the various settings of your app.',
  },
  {
    key: 'integrations',
    icon: Cable,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-200',
    hoverBg: 'hover:bg-purple-100',
    hoverBorder: 'hover:border-purple-200',
    title: 'Integrations',
    description: 'View the list of integrations that are used in your app.',
  },
  {
    key: 'share',
    icon: Share2,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-200',
    hoverBg: 'hover:bg-red-100',
    hoverBorder: 'hover:border-red-200',
    title: 'Share',
    description: 'Share your app with other users and groups.',
  },
  {
    key: 'audit',
    icon: FileText,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-200',
    hoverBg: 'hover:bg-orange-100',
    hoverBorder: 'hover:border-orange-200',
    title: 'Audit log',
    description: 'View all the app-level and item-level activities of your app.',
  },
  {
    key: 'roles',
    icon: Users,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-200',
    hoverBg: 'hover:bg-yellow-100',
    hoverBorder: 'hover:border-yellow-200',
    title: 'Roles',
    description: 'Add, or manage in-app and linked roles.',
  },
]

function CardButton({ card, onClick }: { card: ManageCard; onClick?: () => void }) {
  const Icon = card.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex items-start gap-3 text-left p-4 rounded-lg border border-transparent transition-colors',
        card.baseBg,
        card.hoverBg,
        card.hoverBorder
      )}
    >
      <div className={cn('shrink-0 h-14 w-14 rounded-lg flex items-center justify-center', card.iconBg)}>
        <Icon className={cn('h-6 w-6', card.iconColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-base font-semibold text-gray-800 mb-1">{card.title}</div>
        <div className="text-xs font-normal text-gray-700 leading-relaxed">{card.description}</div>
      </div>
    </button>
  )
}

interface ManageViewProps {
  /**
   * Fires when the user clicks the "Edit app" tile. Pages typically pass a
   * `window.open('/builder/<slug>', '_blank')` handler. When omitted the
   * tile is rendered as a no-op (default for prototype apps without a
   * builder destination).
   */
  onEditApp?: () => void
}

export function ManageView({ onEditApp }: ManageViewProps = {}) {
  const [editApp, ...rest] = cards
  return (
    <div className="bg-white rounded-lg p-6 space-y-5">
      {/* Row 1 — Edit app alone. auto-fill (not auto-fit) keeps empty tracks visible
          so Edit app sizes to one column instead of stretching to fill the row. */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-8 gap-y-5">
        <CardButton card={editApp} onClick={onEditApp} />
      </div>
      {/* Row 2 — the rest */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-x-8 gap-y-5">
        {rest.map((card) => (
          <CardButton key={card.key} card={card} />
        ))}
      </div>
    </div>
  )
}
