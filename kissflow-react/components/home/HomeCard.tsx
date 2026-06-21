import { cn } from '@/lib/utils'

/**
 * Shared white card surface used by every Home widget. Keeps the visual
 * treatment (border, radius, padding) consistent in one place.
 */
export function HomeCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'bg-white rounded-xl border border-gray-200 px-5 py-4',
        className
      )}
    >
      {children}
    </section>
  )
}

export function HomeCardHeader({
  title,
  count,
  action,
}: {
  title: string
  count?: number | string
  action?: React.ReactNode
}) {
  return (
    <header className="flex items-center justify-between -mx-5 px-5 pb-4 mb-4 border-b border-gray-200">
      <h2 className="text-sm font-semibold text-gray-900">
        {title}
        {count !== undefined && (
          <span className="ml-1.5 text-gray-500 font-medium">({count})</span>
        )}
      </h2>
      {action}
    </header>
  )
}
