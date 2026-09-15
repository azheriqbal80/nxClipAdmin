import { TrendingDown, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import { Panel, PanelHeader } from '@/components/panel'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartFrame } from '@/components/chart-frame'
import { AXIS_PROPS, CHART_BAR_RADIUS, CURSOR_FILL, GRID_PROPS } from '@/components/chart-theme'
import { ChartTooltip } from '@/components/chart-tooltip'
import { cn } from '@/lib/cn'
import { growthDelta, windowLabel, type SignupSeries } from '../api/analytics'

/**
 * New accounts per period, split by plan.
 *
 * Plan counts share one scale, so this stays a single-axis chart — it shows
 * total growth *and* acquisition mix without a second y-axis. The cumulative
 * base is a caption, not a second series: cumulative and per-period are
 * different scales and would need a dual axis to co-plot.
 */
export function SignupTrendChart({
  series,
  loading,
  error,
}: {
  series: SignupSeries | null
  loading: boolean
  error: boolean
}) {
  const delta = series ? growthDelta(series.buckets) : null
  const half = series ? Math.floor(series.buckets.length / 2) : 0
  const last = series?.buckets[series.buckets.length - 1]

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        eyebrow="Growth"
        title="New accounts"
        action={
          delta ? (
            <span
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium',
                delta.improving ? 'text-success' : 'text-destructive',
              )}
            >
              {delta.improving ? (
                <TrendingUp className="size-3.5" />
              ) : (
                <TrendingDown className="size-3.5" />
              )}
              {delta.current} signups
              <span className="text-faint">
                {delta.changePct === null
                  ? `(none in prior ${windowLabel(series!.granularity, half)})`
                  : `(${delta.changePct > 0 ? '+' : ''}${delta.changePct.toFixed(0)}% vs prior ${windowLabel(series!.granularity, half)})`}
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
          <div className="py-16 text-center text-sm text-destructive">
            Failed to load the account list.
          </div>
        ) : !series ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Not enough accounts yet to chart growth.
          </div>
        ) : (
          <ChartFrame
            // "by plan" would imply the plan they signed up on. `/admin/users`
            // returns each account's CURRENT plan and there is no plan-at-signup
            // field (stated in the 2026-08-29 reference: "Plan counts reflect
            // current users.plan … not historical plan at signup"), so an upgrade
            // retroactively recolours a past bar. Volume is exact; the split is
            // today's plan, and the label says so.
            label={`New accounts per ${series.granularity}, split by each account's current plan, ${series.buckets[0].label} to ${last?.label}`}
            height={220}
            footer={`${series.buckets.length} ${series.granularity}s · ${series.sampled} accounts · ${last?.cumulative} total by ${last?.label} · colour is current plan, not plan at signup`}
          >
            <BarChart
              data={series.buckets}
              margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
              barGap={0}
            >
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="label" {...AXIS_PROPS} interval="preserveStartEnd" minTickGap={16} />
              <YAxis {...AXIS_PROPS} allowDecimals={false} width={40} />
              <Tooltip content={<ChartTooltip total />} cursor={CURSOR_FILL} />
              <Legend
                verticalAlign="top"
                align="left"
                height={28}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: 'var(--muted-foreground)' }}
              />
              {/* Fixed slot order, never cycled — a plan keeps its hue even when
                  another plan has no signups in the window. */}
              <Bar
                dataKey="FREE"
                name="Free"
                stackId="plan"
                fill="var(--chart-2)"
                stroke="var(--card)"
                strokeWidth={2}
                maxBarSize={32}
              />
              <Bar
                dataKey="PRO"
                name="Pro"
                stackId="plan"
                fill="var(--chart-1)"
                stroke="var(--card)"
                strokeWidth={2}
                maxBarSize={32}
              />
              <Bar
                dataKey="STUDIO"
                name="Studio"
                stackId="plan"
                fill="var(--chart-4)"
                stroke="var(--card)"
                strokeWidth={2}
                maxBarSize={32}
                radius={CHART_BAR_RADIUS}
              />
            </BarChart>
          </ChartFrame>
        )}
      </div>
    </Panel>
  )
}
