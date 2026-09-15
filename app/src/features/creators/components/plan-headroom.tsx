import { Gauge } from 'lucide-react'
import { Panel, PanelHeader } from '@/components/panel'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/user-avatar'
import { cn } from '@/lib/cn'
import { PLAN_TONE, type Plan } from '../api/schemas'
import type { Headroom } from '../api/analytics'

/** Bar fill by pressure — the label carries the meaning, colour only reinforces. */
function fillFor(ratio: number | null) {
  if (ratio === null) return 'bg-chart-3'
  if (ratio >= 1) return 'bg-destructive'
  if (ratio >= 0.8) return 'bg-warning'
  return 'bg-chart-1'
}

/**
 * Who is close to their daily generation cap.
 *
 * Deliberately not a forecast: it reports today's observed usage against the
 * plan's cap. The action is immediate — raise the limit or upsell — and the
 * number is arithmetic, not extrapolation.
 */
export function PlanHeadroom({
  headroom,
  loading,
  error,
}: {
  headroom: Headroom
  loading: boolean
  error: boolean
}) {
  const { rows, blocked, countedToday, windowCapped } = headroom

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        eyebrow="Entitlements"
        title="Daily generation headroom"
        action={
          rows.length > 0 ? (
            <span
              className={cn(
                'text-xs font-medium',
                blocked > 0 ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {blocked > 0
                ? `${blocked} at or over cap`
                : `${rows.length} active today`}
            </span>
          ) : undefined
        }
      />
      <div className="p-5 pt-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9" />)}
          </div>
        ) : error ? (
          <div className="py-10 text-center text-sm text-destructive">
            Couldn&apos;t load plans or job usage.
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Gauge className="size-4 text-faint" />
            <span className="text-sm text-muted-foreground">
              No image generations today — nothing is near a cap.
            </span>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.userId} className="flex items-center gap-3">
                <UserAvatar name={r.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-sm font-medium text-foreground">{r.name}</span>
                    <Badge
                      variant={PLAN_TONE[r.plan as Plan] ?? 'neutral'}
                      size="sm"
                      className="shrink-0"
                    >
                      {r.plan}
                    </Badge>
                    <span
                      className={cn(
                        'ml-auto shrink-0 font-mono text-xs tabular-nums',
                        r.atLimit ? 'font-medium text-destructive' : 'text-muted-foreground',
                      )}
                    >
                      {r.used}
                      {r.cap === null ? ' / ∞' : ` / ${r.cap}`}
                    </span>
                  </div>
                  {/* Unlimited plans show a full, quiet bar — they can't run out. */}
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={cn('h-full rounded-full', fillFor(r.ratio))}
                      style={{
                        width:
                          r.ratio === null
                            ? '100%'
                            : `${Math.min(100, Math.round(r.ratio * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {rows.length > 0 && (
          <p className="mt-4 text-caption text-faint">
            Today&apos;s image-generation jobs vs each plan&apos;s daily cap · {countedToday} counted
            {windowCapped && ' · from the most recent 100 jobs, so a very busy day may be undercounted'}
          </p>
        )}
      </div>
    </Panel>
  )
}
