import { Coins } from 'lucide-react'
import { Panel, PanelHeader } from '@/components/panel'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkline } from '@/components/sparkline'
import { EmptyState } from '@/components/empty-state'
import { UserAvatar } from '@/components/user-avatar'
import { fmtUsd, type CostSummary } from '../api/schemas'

export function CostSummaryPanel({
  cost,
  loading,
}: {
  cost?: CostSummary
  loading: boolean
}) {
  return (
    <Panel className="flex h-full flex-col">
      <PanelHeader eyebrow="Spend" title="AI cost" />
      {loading ? (
        <div className="space-y-3 p-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-40" />
        </div>
      ) : !cost ? (
        <EmptyState
          icon={<Coins />}
          title="Cost data unavailable"
          description="The AI cost endpoint isn't returning data yet."
          className="flex-1"
        />
      ) : (
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-kpi font-semibold leading-tight text-foreground tabular-nums">
                {fmtUsd(cost.spend30dUsd)}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                last 30 days ·{' '}
                <span className={cost.deltaPct <= 0 ? 'text-success' : 'text-destructive'}>
                  {cost.deltaPct > 0 ? '+' : ''}
                  {cost.deltaPct}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">{fmtUsd(cost.spendTodayUsd)}</div>
              <div className="text-micro tracking-wide text-faint uppercase">Today</div>
            </div>
          </div>

          <Sparkline data={cost.daily} className="h-10 w-full" />

          <div>
            <div className="mb-2 text-caption font-medium tracking-[0.1em] text-faint uppercase">
              Top spenders
            </div>
            <ul className="space-y-1">
              {cost.topUsers.map((u) => (
                <li key={u.userId} className="flex items-center gap-2.5 py-1">
                  <UserAvatar name={u.displayName} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {u.displayName}
                  </span>
                  <span className="text-caption text-faint">
                    {u.unitCount.toLocaleString()} units
                  </span>
                  <span className="w-16 text-right font-mono text-xs text-foreground tabular-nums">
                    {fmtUsd(u.costUsd)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Panel>
  )
}
