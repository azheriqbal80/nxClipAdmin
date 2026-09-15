import { Bar, BarChart, LabelList, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import { Panel, PanelHeader } from '@/components/panel'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartFrame } from '@/components/chart-frame'
import { AXIS_PROPS, CHART_HORIZONTAL_BAR_RADIUS, CURSOR_FILL } from '@/components/chart-theme'
import { ChartTooltip } from '@/components/chart-tooltip'
import { fmtSeconds, type PipelineTiming } from '../api/analytics'

/**
 * Median and tail time per queue.
 *
 * Deliberately not a duration histogram: live durations cluster so tightly that
 * 71 of 91 jobs fall in one band, which is a single bar. Per queue the numbers
 * actually differ — moderation seconds, image generation multiples of that — so
 * this shows where pipeline time goes and which stage regressed.
 *
 * Both series are seconds, so one axis. No dual axis.
 */
export function PipelineTimeChart({
  timing,
  loading,
  error,
}: {
  timing: PipelineTiming
  loading: boolean
  error: boolean
}) {
  const { rows, overallP50, overallP90, sampled } = timing

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        eyebrow="Throughput"
        title="Time per queue"
        action={
          overallP50 !== null ? (
            <span className="text-xs text-muted-foreground">
              overall{' '}
              <span className="font-medium text-foreground">{fmtSeconds(overallP50)}</span> median ·{' '}
              <span className="font-medium text-foreground">{fmtSeconds(overallP90 ?? 0)}</span> p90
            </span>
          ) : undefined
        }
      />
      <div className="p-5 pt-4">
        {loading ? (
          <Skeleton className="h-[200px] rounded-lg" />
        ) : error ? (
          <div className="py-14 text-center text-sm text-destructive">Failed to load jobs.</div>
        ) : rows.length === 0 ? (
          <div className="py-14 text-center text-sm text-muted-foreground">
            Not enough completed jobs to time the pipeline.
          </div>
        ) : (
          <ChartFrame
            label={`Median and 90th percentile duration per queue: ${rows
              .map((r) => `${r.label} ${fmtSeconds(r.p50)} median`)
              .join(', ')}`}
            height={Math.max(160, rows.length * 56 + 40)}
            footer={`${sampled} completed jobs · failed jobs excluded (time-to-failure is a different measurement)`}
          >
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 0, right: 56, bottom: 0, left: 0 }}
              barGap={2}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                {...AXIS_PROPS}
                width={130}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              />
              <Tooltip
                content={<ChartTooltip valueFormat={fmtSeconds} />}
                cursor={CURSOR_FILL}
              />
              <Legend
                verticalAlign="top"
                align="left"
                height={26}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: 'var(--muted-foreground)' }}
              />
              <Bar dataKey="p50" name="Median" fill="var(--chart-3)" radius={CHART_HORIZONTAL_BAR_RADIUS} maxBarSize={14}>
                <LabelList
                  dataKey="p50"
                  position="right"
                  formatter={(v: number) => fmtSeconds(v)}
                  className="fill-muted-foreground"
                  style={{ fontSize: 11 }}
                />
              </Bar>
              {/* The tail sits under the median, same scale — a slow p90 with a
                  fast median is the shape of an intermittent stall. */}
              <Bar dataKey="p90" name="90th percentile" fill="var(--chart-4)" radius={CHART_HORIZONTAL_BAR_RADIUS} maxBarSize={14}>
                <LabelList
                  dataKey="p90"
                  position="right"
                  formatter={(v: number) => fmtSeconds(v)}
                  className="fill-faint"
                  style={{ fontSize: 11 }}
                />
              </Bar>
            </BarChart>
          </ChartFrame>
        )}
      </div>
    </Panel>
  )
}
