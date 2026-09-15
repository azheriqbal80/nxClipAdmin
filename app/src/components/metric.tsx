import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * A small labelled figure — the recurring "micro-label + number" atom.
 *
 * Promoted to the DS because it had been hand-rolled in three features with two
 * different orders and two different names, both called `Stat`. Label sits
 * **above** the figure, matching `StatCard`: you read what it is, then the value.
 *
 * Not a card — it carries no surface of its own unless `boxed`, so it composes
 * inside `Panel` / `StatCard` without stacking borders.
 */
const TONE = {
  default: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
} as const

export type MetricTone = keyof typeof TONE

export function Metric({
  label,
  value,
  icon,
  tone = 'default',
  align = 'left',
  boxed = false,
  className,
}: {
  label: string
  value: ReactNode
  /** Optional glyph beside the label, never beside the value. */
  icon?: ReactNode
  tone?: MetricTone
  align?: 'left' | 'center'
  /** Render on the inset surface with a hairline border (nested tile). */
  boxed?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        boxed && 'rounded-lg border border-border bg-surface-2 p-3',
        align === 'center' && 'text-center',
        className,
      )}
    >
      <div
        className={cn(
          'mb-1 flex items-center gap-1.5 text-faint [&_svg]:size-3.5',
          align === 'center' && 'justify-center',
        )}
      >
        {icon}
        <span className="text-micro font-medium tracking-wide uppercase">{label}</span>
      </div>
      <div className={cn('text-lg font-semibold tabular-nums', TONE[tone])}>{value}</div>
    </div>
  )
}
