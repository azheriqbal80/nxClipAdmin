import { TrendingDown, TrendingUp } from 'lucide-react'
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Panel, PanelHeader } from '@/components/panel'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartFrame } from '@/components/chart-frame'
import { AXIS_PROPS, CURSOR_STROKE, GRID_PROPS } from '@/components/chart-theme'
import { ChartTooltip } from '@/components/chart-tooltip'
import { cn } from '@/lib/cn'
import { fmtMinutes, fmtMinutesAxis, latencyDelta, type LatencySeries } from '../api/analytics'

/**
 * Create → publish latency, median and tail.
 *
 * Both series are minutes, so one axis. p90 sits alongside p50 deliberately: a
 * median that holds while the tail climbs is the shape of a regression that an
 * average would hide entirely.
 */
export function PublishLatencyChart({
  series,
  loading,
  error,
}: {
  series: LatencySeries | null
  loading: boolean
  error: boolean
}) {
  const delta = series ? latencyDelta(series.buckets) : null
  const last = series?.buckets[series.buckets.length - 1]

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        eyebrow="Throughput"
        title="Create → publish latency"
        action={
          delta ? (
            <span
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium',
                delta.improving ? 'text-success' : 'text-destructive',
              )}
            >
              {delta.improving ? (
                <TrendingDown className="size-3.5" />
              ) : (
                <TrendingUp className="size-3.5" />
              )}
              {fmtMinutes(delta.current)} median
              {delta.changePct !== null && (
                <span className="text-faint">
                  ({delta.changePct > 0 ? '+' : ''}
                  {delta.changePct.toFixed(0)}% vs earlier)
                </span>
              )}
            </span>
          ) : (
            <span className="text-xs text-faint">Not enough history for a trend</span>
          )
        }
      />
      <div className="p-5 pt-4">
        {loading ? (
          <Skeleton className="h-[220px] rounded-lg" />
        ) : error ? (
          <div className="py-16 text-center text-sm text-destructive">
            Failed to load published content.
          </div>
        ) : !series ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Not enough published items yet to chart latency.
          </div>
        ) : (
          <ChartFrame
            label={`Median and 90th percentile create-to-publish latency per ${series.granularity}, ${series.buckets[0].label} to ${last?.label}`}
            height={220}
            footer={`${series.buckets.length} ${series.granularity}s · ${series.sampled} published items`}
          >
            <LineChart data={series.buckets} margin={{ top: 4, right: 8, bottom: 0, left: 4 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="label" {...AXIS_PROPS} interval="preserveStartEnd" minTickGap={16} />
              <YAxis
                {...AXIS_PROPS}
                width={56}
                tickFormatter={fmtMinutesAxis}
              />
              <Tooltip
                content={<ChartTooltip valueFormat={fmtMinutes} />}
                cursor={CURSOR_STROKE}
              />
              <Legend
                verticalAlign="top"
                align="left"
                height={28}
                iconType="plainline"
                iconSize={12}
                wrapperStyle={{ fontSize: 11, color: 'var(--muted-foreground)' }}
              />
              {/* connectNulls stays off: a period with no publishes must show a
                  gap, not a line drawn across it. Dots are on so a lone sample
                  is visible as a point rather than an invisible segment. */}
              <Line
                dataKey="p50"
                name="Median"
                stroke="var(--chart-3)"
                strokeWidth={2}
                connectNulls={false}
                dot={{ r: 2, strokeWidth: 0, fill: 'var(--chart-3)' }}
                activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
              />
              {/* Dashed = the tail, so the two lines stay separable without colour. */}
              <Line
                dataKey="p90"
                name="90th percentile"
                stroke="var(--chart-4)"
                strokeWidth={2}
                strokeDasharray="4 3"
                connectNulls={false}
                dot={{ r: 2, strokeWidth: 0, fill: 'var(--chart-4)' }}
                activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
              />
            </LineChart>
          </ChartFrame>
        )}
      </div>
    </Panel>
  )
}
