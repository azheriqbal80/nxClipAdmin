import { Bar, BarChart, Cell, LabelList, Tooltip, XAxis, YAxis } from 'recharts'
import { Panel, PanelHeader } from '@/components/panel'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartFrame } from '@/components/chart-frame'
import { AXIS_PROPS, CHART_HORIZONTAL_BAR_RADIUS, CURSOR_FILL } from '@/components/chart-theme'
import { ChartTooltip } from '@/components/chart-tooltip'
import { errorTaxonomy, fmtPct } from '../api/analytics'
import type { Job } from '../api/schemas'

/** Keep the y-axis readable — the full message is in the tooltip. */
function truncate(s: string, max = 44) {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`
}

export function ErrorTaxonomyChart({
  jobs,
  loading,
  error,
}: {
  jobs: Job[]
  loading: boolean
  error: boolean
}) {
  const groups = errorTaxonomy(jobs)
  const total = groups.reduce((s, g) => s + g.count, 0)
  const dominant = groups[0]

  const data = groups.map((g) => ({ ...g, short: truncate(g.message) }))

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        eyebrow="Triage"
        title="Failures by error"
        action={
          dominant && total > 0 ? (
            <span className="text-xs text-muted-foreground">
              top error is{' '}
              <span className="font-medium text-foreground">{fmtPct(dominant.share)}</span> of{' '}
              {total}
            </span>
          ) : undefined
        }
      />
      <div className="p-5 pt-4">
        {loading ? (
          <Skeleton className="h-[220px] rounded-lg" />
        ) : error ? (
          <div className="py-16 text-center text-sm text-destructive">Failed to load jobs.</div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No failures in range. 🎉
          </div>
        ) : (
          <ChartFrame
            label={`Failed jobs grouped by error message, ${data.length} kinds across ${total} failures`}
            height={Math.max(140, data.length * 34 + 24)}
            footer={`${total} failed jobs · grouped by first line of the error`}
          >
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 44, bottom: 0, left: 0 }}
            >
              {/* One measure, one axis. No grid — the bars are the comparison. */}
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="short"
                {...AXIS_PROPS}
                width={260}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              />
              <Tooltip content={<ChartTooltip />} cursor={CURSOR_FILL} />
              <Bar dataKey="count" name="Failures" radius={CHART_HORIZONTAL_BAR_RADIUS} maxBarSize={18}>
                {/* Rank is not identity: the dominant error is highlighted, the
                    rest share one recessive step. Never a hue per rank. */}
                {data.map((d) => (
                  <Cell
                    key={d.message}
                    fill={d === data[0] ? 'var(--chart-5)' : 'var(--chart-2)'}
                  />
                ))}
                <LabelList
                  dataKey="count"
                  position="right"
                  className="fill-muted-foreground"
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
