import { TrendingDown, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import { Panel, PanelHeader } from '@/components/panel'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartFrame } from '@/components/chart-frame'
import { AXIS_PROPS, CHART_BAR_RADIUS, CURSOR_FILL, GRID_PROPS } from '@/components/chart-theme'
import { ChartTooltip } from '@/components/chart-tooltip'
import { cn } from '@/lib/cn'
import {
  dailyJobBuckets,
  failureRateDelta,
  fmtPct,
  type DailyJobBucket,
} from '../api/analytics'
import type { Job } from '../api/schemas'

/** Failed vs succeeded counts share one scale, so this is a single-axis chart —
    it shows volume *and* failure share without a second y-axis. */
function TrendBars({ buckets }: { buckets: DailyJobBucket[] }) {
  return (
    <ChartFrame
      label={`AI jobs per day by outcome, ${buckets[0]?.label} to ${buckets[buckets.length - 1]?.label}`}
      height={220}
      footer={`${buckets.length} days · ${buckets.reduce((s, b) => s + b.total, 0)} jobs`}
    >
      <BarChart data={buckets} margin={{ top: 4, right: 8, bottom: 0, left: -16 }} barGap={0}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="label" {...AXIS_PROPS} interval="preserveStartEnd" minTickGap={16} />
        <YAxis {...AXIS_PROPS} allowDecimals={false} width={40} />
        <Tooltip
          content={<ChartTooltip total />}
          cursor={CURSOR_FILL}
        />
        <Legend
          verticalAlign="top"
          align="left"
          height={28}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: 'var(--muted-foreground)' }}
        />
        {/* 2px surface gap between stacked segments; rounded top on the last one only */}
        <Bar
          dataKey="succeeded"
          name="Succeeded"
          stackId="jobs"
          fill="var(--chart-3)"
          stroke="var(--card)"
          strokeWidth={2}
          maxBarSize={28}
        />
        <Bar
          dataKey="failed"
          name="Failed"
          stackId="jobs"
          fill="var(--chart-5)"
          stroke="var(--card)"
          strokeWidth={2}
          maxBarSize={28}
          radius={CHART_BAR_RADIUS}
        />
      </BarChart>
    </ChartFrame>
  )
}

export function JobTrendChart({
  jobs,
  loading,
  error,
}: {
  jobs: Job[]
  loading: boolean
  error: boolean
}) {
  const buckets = dailyJobBuckets(jobs)
  const delta = failureRateDelta(buckets)

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        eyebrow="Reliability"
        title="Jobs per day by outcome"
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
              {fmtPct(delta.current)} failing
              <span className="text-faint">
                ({delta.deltaPp > 0 ? '+' : ''}
                {delta.deltaPp.toFixed(1)}pp vs earlier)
              </span>
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
          <div className="py-16 text-center text-sm text-destructive">Failed to load jobs.</div>
        ) : buckets.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No jobs in range.</div>
        ) : (
          <TrendBars buckets={buckets} />
        )}
      </div>
    </Panel>
  )
}
