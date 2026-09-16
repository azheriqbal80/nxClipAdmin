import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import { Panel, PanelHeader } from '@/components/panel'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartFrame } from '@/components/chart-frame'
import { AXIS_PROPS, CURSOR_FILL, GRID_PROPS } from '@/components/chart-theme'
import { ChartTooltip } from '@/components/chart-tooltip'
import type { ContentVolume, OutcomeBand } from '../api/analytics'

/**
 * Fixed band → colour, from the validated categorical palette.
 *
 * Deliberately not the status palette: `published` green beside `failed` red is
 * the classic colour-vision trap (ΔE 7.9, below the safe floor), and stacked
 * segments are always adjacent. The categorical ramp separates cleanly and the
 * legend carries the meaning. Order is fixed so a band keeps its colour even
 * when another band is absent.
 */
const BAND_FILL: Record<OutcomeBand, string> = {
  Draft: 'var(--chart-2)',
  'In review': 'var(--chart-4)',
  Published: 'var(--chart-3)',
  Failed: 'var(--chart-5)',
  Deleted: 'var(--chart-1)',
}

/**
 * How much content is arriving, and what becomes of it.
 *
 * Counts share one scale, so a stacked bar shows volume and outcome mix together
 * without a second axis.
 */
export function ContentVolumeChart({
  volume,
  loading,
  error,
}: {
  volume: ContentVolume | null
  loading: boolean
  error: boolean
}) {
  const last = volume?.buckets[volume.buckets.length - 1]

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        eyebrow="Production"
        title="Content created & outcome"
        action={
          volume ? (
            <span className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{volume.sampled}</span> items ·{' '}
              {volume.buckets.length} {volume.granularity}s
            </span>
          ) : undefined
        }
      />
      <div className="p-5 pt-4">
        {loading ? (
          <Skeleton className="h-[220px] rounded-lg" />
        ) : error ? (
          <div className="py-16 text-center text-sm text-destructive">Failed to load content.</div>
        ) : !volume ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Not enough content yet to chart production.
          </div>
        ) : (
          <ChartFrame
            label={`Content created per ${volume.granularity} by outcome, ${volume.buckets[0].label} to ${last?.label}, ${volume.sampled} items`}
            height={220}
            footer={`${volume.sampled} most recent items · grouped by creation ${volume.granularity}`}
          >
            <BarChart
              data={volume.buckets}
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
                wrapperStyle={{
                  boxSizing: 'border-box',
                  color: 'var(--muted-foreground)',
                  fontSize: 11,
                  paddingLeft: 16,
                }}
              />
              {/* Only bands that occur get a series — otherwise the legend
                  advertises outcomes this platform has never produced. */}
              {volume.activeBands.map((band, i) => (
                <Bar
                  key={band}
                  dataKey={band}
                  name={band}
                  stackId="outcome"
                  fill={BAND_FILL[band]}
                  stroke="var(--card)"
                  strokeWidth={2}
                  maxBarSize={40}
                  radius={i === volume.activeBands.length - 1 ? [4, 4, 0, 0] : undefined}
                />
              ))}
            </BarChart>
          </ChartFrame>
        )}
      </div>
    </Panel>
  )
}
