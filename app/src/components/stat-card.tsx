import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Panel } from '@/components/panel'
import { cn } from '@/lib/cn'

interface StatCardProps {
  icon?: ReactNode
  label: string
  value: ReactNode
  /** Short comparison shown as the top-right pill, e.g. "+12.5%". */
  delta?: string
  deltaTone?: 'success' | 'danger' | 'muted'
  /** Primary readout below the figure, e.g. "Trending up this month". */
  insight?: ReactNode
  /** Supporting context below the insight. */
  description?: ReactNode
  className?: string
}

const DELTA_TONE = {
  success: {
    className: 'border-success/25 bg-success/10 text-foreground',
    icon: ArrowUpRight,
  },
  danger: {
    className: 'border-destructive/25 bg-destructive/10 text-foreground',
    icon: ArrowDownRight,
  },
  muted: {
    className: 'border-border bg-surface-2 text-muted-foreground',
    icon: ArrowRight,
  },
}

/** KPI tile: label, comparison pill, large figure, insight, and support copy.
 *
 * Built on the shared `Panel`, so theme changes also update KPI surfaces. */
export function StatCard({
  icon,
  label,
  value,
  delta,
  deltaTone = 'success',
  insight,
  description,
  className,
}: StatCardProps) {
  const deltaMeta = DELTA_TONE[deltaTone]
  const DeltaIcon = deltaMeta.icon

  return (
    <Panel className={cn('min-h-40 overflow-hidden p-5', className)}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon && (
            <span className="inline-flex shrink-0 text-faint [&_svg]:size-4">
              {icon}
            </span>
          )}
          <span className="truncate">{label}</span>
        </span>
        {delta && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-caption font-semibold leading-none',
              deltaMeta.className,
            )}
          >
            <DeltaIcon className="size-3" />
            {delta}
          </span>
        )}
      </div>

      <div className="text-kpi font-semibold leading-tight text-foreground tabular-nums">{value}</div>

      {(insight || description) && (
        <div className="mt-6 space-y-1">
          {insight && (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <span className="min-w-0">{insight}</span>
              {delta && <DeltaIcon className="size-3.5 shrink-0 text-muted-foreground" />}
            </div>
          )}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
    </Panel>
  )
}
