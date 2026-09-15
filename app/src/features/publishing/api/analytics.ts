import {
  bucketKey,
  bucketLabel,
  bucketLabelLong,
  fillBuckets,
  pickGranularity,
  spanInDays,
  type Granularity,
} from '@/lib/time-buckets'
import { percentile } from '@/lib/stats'
import { stuckMinutes, type PublishedItem, type StuckItem } from './schemas'

/**
 * Publish-pipeline analytics, derived from content timestamps.
 *
 * Latency = `publishedAt − createdAt`. There is no server-side aggregate, but
 * both fields are on every content row, so the distribution is derivable here.
 */

/** Percentiles come from @/lib/stats so every module computes them alike. */
const pct = (v: number[], p: number) => percentile(v, p) ?? 0

export interface LatencyBucket {
  key: string
  label: string
  labelLong: string
  /** Minutes from create to publish. `null` for a period with no publishes —
      a percentile over an empty set does not exist, and zero-filling it would
      draw a line through "0 minutes" for a week that simply had no data. */
  p50: number | null
  p90: number | null
  count: number
}

export interface LatencySeries {
  buckets: LatencyBucket[]
  granularity: Granularity
  sampled: number
}

const MIN_ITEMS = 5
const MIN_BUCKETS = 3

/** Minutes from creation to publication, or null when either end is missing. */
export function publishLatency(item: PublishedItem): number | null {
  if (!item.publishedAt) return null
  const created = new Date(item.createdAt).getTime()
  const published = new Date(item.publishedAt).getTime()
  if (Number.isNaN(created) || Number.isNaN(published)) return null
  const minutes = (published - created) / 60_000
  // Guard against clock skew / bad rows producing negative latency.
  return minutes < 0 ? null : minutes
}

/**
 * p50 and p90 publish latency per period.
 *
 * Both series are in minutes, so they share one axis — a median and its tail
 * belong on the same scale. p90 is included because an average hides exactly
 * the regressions ops cares about.
 */
export function latencySeries(items: PublishedItem[]): LatencySeries | null {
  const rows = items
    .map((i) => ({ at: i.publishedAt!, minutes: publishLatency(i) }))
    .filter((r): r is { at: string; minutes: number } => r.minutes !== null)
  if (rows.length < MIN_ITEMS) return null

  const granularity = pickGranularity(spanInDays(rows.map((r) => r.at)))

  const perBucket = new Map<string, number[]>()
  for (const r of rows) {
    const key = bucketKey(r.at, granularity)
    if (!key) continue
    const slot = perBucket.get(key) ?? []
    slot.push(r.minutes)
    perBucket.set(key, slot)
  }

  const keys = fillBuckets([...perBucket.keys()], granularity)
  if (keys.length < MIN_BUCKETS) return null

  const buckets = keys.map((key) => {
    const values = perBucket.get(key) ?? []
    return {
      key,
      label: bucketLabel(key, granularity),
      labelLong: bucketLabelLong(key, granularity),
      // Empty period → no percentile. The line breaks instead of touching zero.
      p50: values.length ? Math.round(pct(values, 0.5)) : null,
      p90: values.length ? Math.round(pct(values, 0.9)) : null,
      count: values.length,
    }
  })

  return { buckets, granularity, sampled: rows.length }
}

export interface LatencyDelta {
  current: number
  previous: number
  /** Percentage-point-free: percent change in p50. Negative = faster. */
  changePct: number | null
  improving: boolean
}

/** Median latency in the recent half of the window vs the earlier half. */
export function latencyDelta(buckets: LatencyBucket[]): LatencyDelta | null {
  const withData = buckets.filter((b) => b.count > 0 && b.p50 !== null)
  if (withData.length < 4) return null
  const mid = Math.floor(withData.length / 2)
  // Weight each period by how many items it holds, so a 1-item week doesn't
  // count as much as a 20-item one.
  const median = (slice: LatencyBucket[]) =>
    pct(
      slice.flatMap((b) => Array<number>(b.count).fill(b.p50 as number)),
      0.5,
    )
  const previous = median(withData.slice(0, mid))
  const current = median(withData.slice(mid))
  if (previous === 0) return null
  const changePct = ((current - previous) / previous) * 100
  return { current, previous, changePct, improving: current <= previous }
}

export interface AgeBand {
  label: string
  count: number
  /** True for bands that need an admin's attention. */
  overdue: boolean
}

/** Fixed bands — chosen so "fresh blip" and "rotting backlog" can't look alike. */
const BANDS: { label: string; maxMinutes: number; overdue: boolean }[] = [
  { label: '< 1h', maxMinutes: 60, overdue: false },
  { label: '1–6h', maxMinutes: 6 * 60, overdue: false },
  { label: '6–24h', maxMinutes: 24 * 60, overdue: false },
  { label: '1–3d', maxMinutes: 3 * 24 * 60, overdue: true },
  { label: '> 3d', maxMinutes: Infinity, overdue: true },
]

/**
 * How long stuck items have been stuck.
 *
 * The count alone can't distinguish ten items stuck five minutes from ten stuck
 * three days — same KPI, completely different urgency.
 */
export function stuckAgeBands(items: StuckItem[]): AgeBand[] {
  const bands = BANDS.map((b) => ({ label: b.label, count: 0, overdue: b.overdue }))
  for (const item of items) {
    const minutes = stuckMinutes(item)
    const index = BANDS.findIndex((b) => minutes < b.maxMinutes)
    bands[index === -1 ? bands.length - 1 : index].count += 1
  }
  return bands
}

/** "2h 5m" / "3d" — precise form, for tooltips and captions. */
export function fmtMinutes(min: number) {
  if (min < 60) return `${Math.round(min)}m`
  if (min < 60 * 48) return `${Math.floor(min / 60)}h ${Math.round(min % 60)}m`
  return `${Math.floor(min / 1440)}d`
}

/** Single-token form for axis ticks — a wrapped "13h 20m" label is unreadable,
    and ticks are approximate by nature (the tooltip carries the exact value). */
export function fmtMinutesAxis(min: number) {
  if (min < 90) return `${Math.round(min)}m`
  if (min < 60 * 48) return `${Math.round(min / 60)}h`
  return `${Math.round(min / 1440)}d`
}
