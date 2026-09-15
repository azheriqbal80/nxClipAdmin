import { CalendarDays, UserPlus, UserX, Users } from 'lucide-react'
import { Panel } from '@/components/panel'
import { StatCard } from '@/components/stat-card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Tone } from '@/domain/content'
import { periodDelta, type PeriodDelta } from '../api/analytics'
import type { UserStats } from '../api/queries'

const PLAN_TONE: Record<'FREE' | 'PRO' | 'STUDIO', Tone> = {
  FREE: 'neutral',
  PRO: 'accent',
  STUDIO: 'info',
}

function compactDelta(delta: PeriodDelta | null) {
  if (!delta) return undefined
  const match = delta.label.match(/[+-]\d+%/)
  if (match) return match[0]
  if (delta.label.startsWith('first signups')) return 'New'
  if (delta.label.startsWith('none')) return '0'
  return 'N/A'
}

/** Users & subscriptions KPIs.
 *
 * Renders on the page grid (not inside a Panel) using the same StatCard and the
 * same `gap-4 sm:grid-cols-2 lg:grid-cols-4` as the KPI row above, so the two
 * bands share one set of column edges. */
export function UserStatsCard({
  stats,
  loading,
  error,
  prior,
}: {
  stats?: UserStats
  loading: boolean
  error: boolean
  /** Server-counted signups in the *previous* 7d / 30d windows. */
  prior?: { prior7d: number | null; prior30d: number | null }
}) {
  const suspended = stats ? stats.totalUsers - stats.activeUsers : 0
  // Real period-over-period: current window vs the one before it, both counted
  // server-side via users/stats?from=&to= rather than derived from a capped list.
  const d7 = stats ? periodDelta(stats.signups.last7d, prior?.prior7d, '7d') : null
  const d30 = stats ? periodDelta(stats.signups.last30d, prior?.prior30d, '30d') : null

  return (
    <section className="space-y-4">
      <div className="text-caption font-medium tracking-[0.12em] text-faint uppercase">
        Users &amp; subscriptions
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : error || !stats ? (
        <Panel className="p-10 text-center text-sm text-muted-foreground">
          User &amp; plan stats unavailable.
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Users />}
              label="Total users"
              value={stats.totalUsers.toLocaleString()}
              delta="Base"
              deltaTone="muted"
              insight={`${stats.activeUsers.toLocaleString()} active accounts`}
              description="Registered user base across all plans"
            />
            <StatCard
              icon={<UserPlus />}
              label="New (7d)"
              value={stats.signups.last7d.toLocaleString()}
              delta={compactDelta(d7)}
              deltaTone={d7?.tone}
              insight={d7?.label ?? 'No prior 7d comparison'}
              description="Signups compared with the previous 7 days"
            />
            <StatCard
              icon={<CalendarDays />}
              label="New (30d)"
              value={stats.signups.last30d.toLocaleString()}
              delta={compactDelta(d30)}
              deltaTone={d30?.tone}
              insight={d30?.label ?? 'No prior 30d comparison'}
              description="Signups compared with the previous 30 days"
            />
            <StatCard
              icon={<UserX />}
              label="Suspended"
              value={suspended.toLocaleString()}
              delta={suspended > 0 ? 'Open' : 'Clear'}
              deltaTone={suspended > 0 ? 'danger' : 'muted'}
              insight={suspended > 0 ? 'Inactive accounts present' : 'No suspended accounts'}
              description="Total users minus active accounts"
            />
          </div>

          <div>
            <div className="mb-2 text-caption font-medium tracking-[0.12em] text-faint uppercase">
              By plan
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {(['FREE', 'PRO', 'STUDIO'] as const).map((plan) => (
                <Panel key={plan} className="flex items-center justify-between gap-2 p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={PLAN_TONE[plan]}>{plan}</Badge>
                    <span className="text-xs text-faint">
                      +{stats.signups.byPlanLast30d[plan]} / 30d
                    </span>
                  </div>
                  <span className="text-lg font-semibold tabular-nums text-foreground">
                    {stats.byPlan[plan].toLocaleString()}
                  </span>
                </Panel>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
