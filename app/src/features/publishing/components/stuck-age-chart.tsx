import { Bar, BarChart, Cell, LabelList, Tooltip, XAxis, YAxis } from 'recharts'
import { Panel, PanelHeader } from '@/components/panel'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartFrame } from '@/components/chart-frame'
import { AXIS_PROPS, CHART_BAR_RADIUS, CURSOR_FILL } from '@/components/chart-theme'
import { ChartTooltip } from '@/components/chart-tooltip'
import { stuckAgeBands } from '../api/analytics'
import type { StuckItem } from '../api/schemas'

/**
 * How long the backlog has been stuck.
 *
 * The "stuck in publishing" count can't tell a fresh blip from a rotting
 * backlog — ten items stuck five minutes and ten stuck three days are the same
 * number. The distribution separates them at a glance.
 */
export function StuckAgeChart({
  items,
  loading,
  error,
}: {
  items: StuckItem[]
  loading: boolean
  error: boolean
}) {
  const bands = stuckAgeBands(items)
  const total = bands.reduce((s, b) => s + b.count, 0)
  const overdue = bands.filter((b) => b.overdue).reduce((s, b) => s + b.count, 0)

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        eyebrow="Backlog"
        title="How long items have been stuck"
        action={
          total > 0 ? (
            <span className="text-xs text-muted-foreground">
              <span
                className={overdue > 0 ? 'font-medium text-destructive' : 'font-medium text-foreground'}
              >
                {overdue}
              </span>{' '}
              over a day old
            </span>
          ) : undefined
        }
      />
      <div className="p-5 pt-4">
        {loading ? (
          <Skeleton className="h-[220px] rounded-lg" />
        ) : error ? (
          <div className="py-16 text-center text-sm text-destructive">
            Failed to load the backlog.
          </div>
        ) : total === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Nothing stuck in publishing. 🎉
          </div>
        ) : (
          <ChartFrame
            label={`Stuck items by age band: ${bands.map((b) => `${b.label} ${b.count}`).join(', ')}`}
            height={220}
            footer={`${total} item${total === 1 ? '' : 's'} in publishing · age since creation`}
          >
            <BarChart data={bands} margin={{ top: 16, right: 8, bottom: 0, left: -16 }}>
              {/* One measure across ordered bands — no grid, no legend; the
                  title names the single series and the bands are the x-axis. */}
              <XAxis dataKey="label" {...AXIS_PROPS} />
              <YAxis {...AXIS_PROPS} allowDecimals={false} width={40} />
              <Tooltip content={<ChartTooltip />} cursor={CURSOR_FILL} />
              <Bar dataKey="count" name="Items" radius={CHART_BAR_RADIUS} maxBarSize={56}>
                {/* Age is ordered, not categorical: one hue, with the overdue
                    bands stepped up so severity reads without a second colour
                    scale. The band label carries the meaning either way. */}
                {bands.map((b) => (
                  <Cell
                    key={b.label}
                    fill="var(--chart-1)"
                    fillOpacity={b.overdue ? 1 : 0.55}
                  />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
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
