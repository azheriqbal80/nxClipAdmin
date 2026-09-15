import type { ReactElement, ReactNode } from 'react'
import { ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/cn'

/**
 * Sized, accessible wrapper for a Recharts figure.
 *
 * Recharts needs a bounded parent to measure, so height is explicit. The
 * `label` becomes the figure's accessible name — a chart must never rely on
 * colour alone to be understood, and screen readers get the summary.
 */
export function ChartFrame({
  label,
  height = 220,
  className,
  children,
  footer,
}: {
  /** Accessible description of what the chart shows. */
  label: string
  height?: number
  className?: string
  /** A single Recharts chart element. */
  children: ReactElement
  /** Optional caption — e.g. the window the data covers. */
  footer?: ReactNode
}) {
  return (
    <figure className={cn('m-0', className)}>
      <div role="img" aria-label={label} style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
      {footer && (
        <figcaption className="mt-2 text-caption text-faint">{footer}</figcaption>
      )}
    </figure>
  )
}
