import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from 'recharts'
import { Panel, PanelHeader } from '@/components/panel'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartFrame } from '@/components/chart-frame'
import { CHART_BAR_RADIUS, CURSOR_FILL, AXIS_PROPS, GRID_PROPS } from '@/components/chart-theme'
import { ChartTooltip } from '@/components/chart-tooltip'
import { MIN_COHORT, paidByCohort, type SignupSeries } from '../api/analytics'

/**
 * Share of each signup cohort on a paid plan today.
 *
 * Replaces a cumulative plan-mix-over-time area chart. That chart applied
 * today's plans to whoever existed by each date, so its slope was an artifact:
 * older accounts have had longest to upgrade, which diluted the curve downward
 * as newer cohorts arrived — it could fall while conversion was improving. Only
 * its final point was a measurement, and that number is the paid share already
 * shown on the By-plan tiles.
 *
 * Per-cohort asks what the available data can actually answer: of the accounts
 * that joined in this period, how many pay us now. Each bar is an independent
 * group, so the maturity bias is confined to the newest bars instead of bending
 * the whole line.
 *
 * Four honesty gates, all visible rather than buried:
 *   - empty periods draw no bar (0 of 0 is undefined, not 0%)
 *   - cohorts under `MIN_COHORT` are muted and counted in the footer
 *   - if *every* cohort is thin, no chart is drawn at all — bar height is the
 *     message, and muting a full-height 100% bar off one account does not
 *     retract the claim it makes
 *   - the newest cohort is marked as still converting, since it has had least
 *     time and its bar is a floor rather than a verdict
 */
export function CohortPaidChart({
  series,
  overallPaidPct,
  loading,
  error,
}: {
  series: SignupSeries | null
  /**
   * Overall paid share from `users/stats`, not derived here.
   *
   * The cohort bars come from the user list, which is capped at one 100-row
   * page, so a headline computed from the same rows would silently understate
   * once the base exceeds the cap. The server counts every account.
   */
  overallPaidPct: number | null
  loading: boolean
  error: boolean
}) {
  const cohorts = paidByCohort(series)
  const overall = overallPaidPct
  // Only periods that actually had signups form a cohort.
  const data = cohorts.filter((c) => c.paidPct !== null)
  const newest = data[data.length - 1]
  const thinCount = data.filter((c) => c.thin).length
  /**
   * If every cohort is thin there is nothing to compare, and drawing it is worse
   * than drawing nothing: a one-account cohort renders a full-height 100% bar
   * that reads as a strong signal, and muting the fill does not undo that — bar
   * height is the message. Caught by looking at the rendered figure on mock data
   * (14 accounts over 8 months, so every cohort had one or two people and three
   * bars sat at 100%). Same principle as the MIN_USERS / MIN_BUCKETS guards:
   * say so rather than draw noise.
   */
  const allThin = data.length > 0 && thinCount === data.length

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        eyebrow="Conversion"
        title="Paid share by signup cohort"
        action={
          overall !== null ? (
            <span className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{overall}%</span> paid overall
            </span>
          ) : undefined
        }
      />
      <div className="p-5 pt-4">
        {loading ? (
          <Skeleton className="h-[220px] rounded-lg" />
        ) : error ? (
          <div className="py-16 text-center text-sm text-destructive">
            Failed to load the account list.
          </div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Not enough accounts yet to compare cohorts.
          </div>
        ) : allThin ? (
          <div className="space-y-1.5 py-14 text-center">
            <p className="text-sm text-foreground">Cohorts are too small to compare</p>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Every signup {series?.granularity ?? 'period'} has fewer than {MIN_COHORT} accounts, so
              a percentage would swing between 0% and 100% on a single upgrade.{' '}
              {overall !== null && (
                <>
                  {/* Server-counted across every account, so it is not paired
                      with the sampled row count the bars come from. */}
                  Overall, <span className="text-foreground">{overall}% of all accounts</span> are on
                  a paid plan.
                </>
              )}
            </p>
          </div>
        ) : (
          <ChartFrame
            label={
              `Share of each signup cohort on a paid plan today, ${data[0].label} to ${newest?.label}. ` +
              `${overall} percent of all accounts are paid, counted server-side. Recent cohorts have had less time to ` +
              `convert, so their bars are floors rather than final figures.`
            }
            height={220}
            footer={
              `${data.length} cohorts · ${series?.sampled ?? 0} accounts · paid = PRO or STUDIO today` +
              (thinCount > 0
                ? ` · ${thinCount} of ${data.length} under ${MIN_COHORT} accounts, muted`
                : '')
            }
          >
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="label" {...AXIS_PROPS} interval="preserveStartEnd" minTickGap={16} />
              <YAxis
                {...AXIS_PROPS}
                width={46}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                content={
                  <ChartTooltip
                    valueFormat={(v) => `${v}% paid`}
                  />
                }
                cursor={CURSOR_FILL}
              />
              <Bar dataKey="paidPct" radius={CHART_BAR_RADIUS} maxBarSize={44}>
                {data.map((c) => (
                  <Cell
                    key={c.label}
                    // Muted for a cohort too small to read a percentage from —
                    // the bar still exists, it just stops claiming precision.
                    fill={c.thin ? 'var(--chart-2)' : 'var(--chart-1)'}
                    fillOpacity={c.thin ? 0.35 : 0.9}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartFrame>
        )}

        {data.length > 0 && !allThin && (
          <p className="mt-3 text-caption text-muted-foreground">
            Each bar is the accounts that signed up in that period, and the share of them on PRO or
            STUDIO <span className="text-foreground">today</span>.{' '}
            {newest && (
              <>
                <span className="text-foreground">{newest.label}</span> is still converting, so treat
                it as a floor.{' '}
              </>
            )}
            There is no plan-at-signup field, so conversion timing is unknown — see BE-13.
          </p>
        )}
      </div>
    </Panel>
  )
}
