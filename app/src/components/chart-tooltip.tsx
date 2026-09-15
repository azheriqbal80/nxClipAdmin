import type { ReactNode } from 'react'
import type { TooltipProps } from 'recharts'

export function ChartTooltipSurface({
  title,
  children,
  className = '',
}: {
  title?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-none ${className}`}>
      {title != null && (
        <div className="mb-1.5 font-medium text-foreground">{title}</div>
      )}
      {children}
    </div>
  )
}

/**
 * DS-styled Recharts tooltip.
 *
 * A web chart is interactive by default — line/area/bar all get a hover
 * readout, because reading a trend means reading values at a point. Text wears
 * text tokens; the colour swatch beside each row carries series identity, so
 * identity is never colour-on-text.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  valueSuffix = '',
  valueFormat,
  total,
}: TooltipProps<number, string> & {
  valueSuffix?: string
  /** Format raw values for display — e.g. minutes as "3h 15m". */
  valueFormat?: (v: number) => string
  /** Show a total row — useful for stacked marks. */
  total?: boolean
}) {
  if (!active || !payload?.length) return null

  const sum = payload.reduce((s, p) => s + (typeof p.value === 'number' ? p.value : 0), 0)
  const show = (v: unknown) =>
    typeof v === 'number' && valueFormat ? valueFormat(v) : `${v}${valueSuffix}`

  return (
    <ChartTooltipSurface title={label == null ? undefined : String(label)}>
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={String(p.dataKey)} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ background: p.color }}
            />
            <span className="text-muted-foreground">{p.name}</span>
            <span className="ml-auto font-mono tabular-nums text-foreground">{show(p.value)}</span>
          </div>
        ))}
        {total && payload.length > 1 && (
          <div className="flex items-center gap-2 border-t border-border pt-1">
            <span className="size-2 shrink-0" aria-hidden />
            <span className="text-muted-foreground">Total</span>
            <span className="ml-auto font-mono tabular-nums text-foreground">{show(sum)}</span>
          </div>
        )}
      </div>
    </ChartTooltipSurface>
  )
}
