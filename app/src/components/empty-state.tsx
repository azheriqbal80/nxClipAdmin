import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Centered empty/placeholder state — icon chip + title + hint.
    Used by inspectors ("nothing selected") and any empty surface. */
export function EmptyState({
  icon,
  title,
  description,
  className,
}: {
  icon: ReactNode
  title: string
  description?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-8 text-center',
        className,
      )}
    >
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-elevated text-faint [&_svg]:size-5">
        {icon}
      </span>
      <div className="text-sm font-medium text-foreground">{title}</div>
      {description && <p className="max-w-xs text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}
