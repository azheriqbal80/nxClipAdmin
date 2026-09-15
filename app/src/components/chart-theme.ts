/**
 * Shared Recharts axis/grid styling so every chart in the admin reads as one
 * system. Grid and axes are recessive — the data is the only thing with weight.
 *
 * Kept out of `chart-frame.tsx` so that file exports components only (fast
 * refresh). Colours are tokens, never literals.
 */
export const AXIS_PROPS = {
  stroke: 'var(--faint)',
  tickLine: false,
  axisLine: false,
  tick: { fill: 'var(--faint)', fontSize: 11 },
} as const

export const GRID_PROPS = {
  stroke: 'var(--border)',
  strokeDasharray: '3 3',
  vertical: false,
} as const

/** Hover affordance behind a mark — bigger hit target than the mark itself. */
export const CURSOR_FILL = { fill: 'var(--muted)', opacity: 0.35 } as const

/** Hover affordance for line and scatter charts. */
export const CURSOR_STROKE = { stroke: 'var(--line-strong)', strokeWidth: 1 } as const

export const CHART_BAR_RADIUS: [number, number, number, number] = [3, 3, 0, 0]
export const CHART_HORIZONTAL_BAR_RADIUS: [number, number, number, number] = [0, 3, 3, 0]

export const REFERENCE_LINE_PROPS = {
  stroke: 'var(--primary)',
  strokeDasharray: '4 4',
} as const
