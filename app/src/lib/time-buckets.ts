/**
 * Calendar bucketing for derived time series.
 *
 * The backend exposes no aggregation endpoint, so trend charts bucket list rows
 * by their timestamps on the client. Every bucket is identified by its
 * **start-of-period date key** (`YYYY-MM-DD`), which sorts lexicographically and
 * steps forward without date arithmetic at the call site.
 *
 * All arithmetic is local-time on purpose: an admin reading "Aug 25" means their
 * own calendar day, not UTC's.
 */

export type Granularity = 'day' | 'week' | 'month'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function keyOf(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function parseKey(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Start of the period containing `iso`, or null when the date is unparseable. */
export function bucketKey(iso: string, g: Granularity): string | null {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  if (g === 'month') return keyOf(new Date(d.getFullYear(), d.getMonth(), 1))
  if (g === 'week') {
    // Week starts Monday: shift Sunday (0) back six days, others back day-1.
    const offset = (d.getDay() + 6) % 7
    return keyOf(new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset))
  }
  return keyOf(d)
}

export function nextBucket(key: string, g: Granularity): string {
  const d = parseKey(key)
  if (g === 'month') return keyOf(new Date(d.getFullYear(), d.getMonth() + 1, 1))
  if (g === 'week') return keyOf(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7))
  return keyOf(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))
}

/** Short axis label: "Aug 25" for day/week, "Aug" for month. */
export function bucketLabel(key: string, g: Granularity): string {
  const d = parseKey(key)
  if (g === 'month') return d.toLocaleDateString(undefined, { month: 'short' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** Full label for tooltips, where there's room to be unambiguous. */
export function bucketLabelLong(key: string, g: Granularity): string {
  const d = parseKey(key)
  if (g === 'month') return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  if (g === 'week') return `Week of ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function daysBetween(aKey: string, bKey: string) {
  const ms = parseKey(bKey).getTime() - parseKey(aKey).getTime()
  return Math.round(ms / 86_400_000)
}

/**
 * Granularity that keeps a series readable: daily bars turn to mush past a few
 * weeks, and monthly buckets hide detail in a short window.
 */
export function pickGranularity(spanDays: number): Granularity {
  if (spanDays <= 21) return 'day'
  if (spanDays <= 120) return 'week'
  return 'month'
}

/** Hard cap on rendered buckets — an outlier date must not stretch the axis. */
const MAX_BUCKETS = 40

/**
 * Ordered, **gap-filled** bucket keys spanning the given keys. Empty periods are
 * included so the axis is evenly spaced — omitting them visually compresses
 * quiet stretches and overstates the trend.
 */
export function fillBuckets(keys: string[], g: Granularity): string[] {
  if (keys.length === 0) return []
  const sorted = [...keys].sort()
  const end = sorted[sorted.length - 1]

  // Walk forward from the earliest key, then keep only the trailing window.
  const all: string[] = []
  for (let k = sorted[0]; ; k = nextBucket(k, g)) {
    all.push(k)
    if (k >= end || all.length > 500) break
  }
  return all.length > MAX_BUCKETS ? all.slice(-MAX_BUCKETS) : all
}

/** Span of the given ISO timestamps in days (0 when fewer than two parse). */
export function spanInDays(isoDates: string[]): number {
  const times = isoDates.map((s) => new Date(s).getTime()).filter((t) => !Number.isNaN(t))
  if (times.length < 2) return 0
  return Math.round((Math.max(...times) - Math.min(...times)) / 86_400_000)
}
