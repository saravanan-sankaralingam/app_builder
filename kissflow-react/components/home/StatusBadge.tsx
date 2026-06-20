import { cn } from '@/lib/utils'

/**
 * Color mapping for queue / item statuses across the Home widgets.
 * Keep the keys aligned with QueueStatus / CreatedItemStatus in lib/mock/home.ts.
 */
const STATUS_STYLES: Record<string, string> = {
  New: 'bg-blue-50 text-blue-700',
  'In progress': 'bg-amber-50 text-amber-700',
  Research: 'bg-purple-50 text-purple-700',
  Backlog: 'bg-gray-100 text-gray-700',
  Design: 'bg-pink-50 text-pink-700',
  'Default State': 'bg-emerald-50 text-emerald-700',
  'Delivered Handoff': 'bg-emerald-50 text-emerald-700',
}

export function StatusBadge({ status }: { status: string }) {
  const styles = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        styles
      )}
    >
      {status}
    </span>
  )
}
