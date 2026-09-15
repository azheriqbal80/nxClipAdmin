import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { Panel, PanelHeader } from '@/components/panel'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartFrame } from '@/components/chart-frame'
import { AXIS_PROPS, CURSOR_STROKE, GRID_PROPS } from '@/components/chart-theme'
import { ChartTooltipSurface } from '@/components/chart-tooltip'
import { cn } from '@/lib/cn'
import { describeRho, type EngagementAudit, type ScatterPoint } from '../api/analytics'
import { fmtCompact } from '../api/schemas'

const TONE = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
} as const

/** Per-point readout — a scatter is unreadable without one. */
function PointTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: ScatterPoint }[]
}) {
  const p = payload?.[0]?.payload
  if (!active || !p) return null
  return (
    <ChartTooltipSurface title={p.title} className="max-w-xs">
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">WES</span>
          <span className="font-mono tabular-nums text-foreground">{p.wes}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Likes</span>
          <span className="font-mono tabular-nums text-foreground">{fmtCompact(p.likes)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Comments</span>
          <span className="font-mono tabular-nums text-foreground">{fmtCompact(p.comments)}</span>
        </div>
      </div>
    </ChartTooltipSurface>
  )
}

/**
 * WES against raw engagement, one dot per projection.
 *
 * The only view that audits the ranking itself: points on a rising diagonal mean
 * WES follows what audiences do. A dot high-left is ranked far above its
 * engagement; low-right is loved content the algorithm is burying. Both axes are
 * counts/scores on their own scale — no dual axis, and no trendline drawn over
 * a sample this small.
 */
export function WesScatterChart({
  audit,
  loading,
  error,
}: {
  audit: EngagementAudit
  loading: boolean
  error: boolean
}) {
  const { points, rho, n } = audit
  const reading = rho === null ? null : describeRho(rho)

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        eyebrow="Ranking audit"
        title="WES vs engagement"
        action={
          reading && rho !== null ? (
            <span className={cn('text-xs font-medium', TONE[reading.tone])}>
              ρ {rho.toFixed(2)}
              <span className="ml-1.5 text-faint">— {reading.label}</span>
            </span>
          ) : (
            <span className="text-xs text-faint">Too few projections to correlate</span>
          )
        }
      />
      <div className="p-5 pt-4">
        {loading ? (
          <Skeleton className="h-[260px] rounded-lg" />
        ) : error ? (
          <div className="py-16 text-center text-sm text-destructive">
            Failed to load projections.
          </div>
        ) : points.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Nothing in the public feed yet.
          </div>
        ) : (
          <ChartFrame
            label={`Weighted engagement score against likes plus comments, ${n} projections${
              rho === null ? '' : `, rank correlation ${rho.toFixed(2)}`
            }`}
            height={260}
            footer={`${n} projections · Spearman rank correlation · engagement = likes + comments`}
          >
            <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
              <CartesianGrid {...GRID_PROPS} vertical />
              <XAxis
                type="number"
                dataKey="engagement"
                name="Engagement"
                {...AXIS_PROPS}
                tickFormatter={(v: number) => fmtCompact(v)}
                label={{
                  value: 'Engagement →',
                  position: 'insideBottomRight',
                  offset: -2,
                  fill: 'var(--faint)',
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="wes"
                name="WES"
                {...AXIS_PROPS}
                width={44}
                label={{
                  value: 'WES →',
                  angle: -90,
                  position: 'insideLeft',
                  fill: 'var(--faint)',
                  fontSize: 11,
                }}
              />
              {/* Fixed mark size — area would encode a third variable we don't have. */}
              <ZAxis range={[64, 64]} />
              <Tooltip content={<PointTooltip />} cursor={CURSOR_STROKE} />
              <Scatter
                data={points}
                fill="var(--chart-1)"
                fillOpacity={0.85}
                stroke="var(--card)"
                strokeWidth={2}
              />
            </ScatterChart>
          </ChartFrame>
        )}
      </div>
    </Panel>
  )
}
