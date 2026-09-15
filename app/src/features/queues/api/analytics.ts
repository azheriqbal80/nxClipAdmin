import { bucketKey, bucketLabel, fillBuckets } from '@/lib/time-buckets'
import { percentile } from '@/lib/stats'
import { queueLabel, type Job } from './schemas'

/**
 * Client-side derivation of job trends.
 *
 * The backend exposes no aggregation endpoint, but `/admin/jobs` carries
 * `createdAt` + `status` per row, so daily buckets are derivable here. This is
 * accurate at current volumes and becomes a server-side ask once the job table
 * outgrows one page (see the timeseries ask in the report).
 *
 * Everything below is pure so it can be unit-reasoned about and reused.
 */

export interface DailyJobBucket {
  day: string
  label: string
  failed: number
  succeeded: number
  total: number
}

/**
 * Jobs bucketed per calendar day, **gap-filled** — a day with no jobs renders as
 * zero rather than being skipped, so the x-axis is evenly spaced and the trend
 * isn't visually compressed. Bucketing/gap-filling lives in `@/lib/time-buckets`
 * so the overview growth charts derive their series the same way.
 */
export function dailyJobBuckets(jobs: Job[]): DailyJobBucket[] {
  const counts = new Map<string, { failed: number; succeeded: number }>()
  for (const j of jobs) {
    const key = bucketKey(j.createdAt, 'day')
    if (!key) continue
    const slot = counts.get(key) ?? { failed: 0, succeeded: 0 }
    if (j.status === 'failed') slot.failed += 1
    else slot.succeeded += 1
    counts.set(key, slot)
  }
  if (counts.size === 0) return []

  return fillBuckets([...counts.keys()], 'day').map((key) => {
    const slot = counts.get(key) ?? { failed: 0, succeeded: 0 }
    return {
      day: key,
      label: bucketLabel(key, 'day'),
      failed: slot.failed,
      succeeded: slot.succeeded,
      total: slot.failed + slot.succeeded,
    }
  })
}

export interface ErrorGroup {
  message: string
  count: number
  share: number
}

/** Collapse an error to its first line so stack traces group together. */
function errorKey(message: string | null) {
  return (message ?? 'Unknown error').split('\n')[0].trim() || 'Unknown error'
}

/**
 * Failed jobs grouped by error, ranked. Anything past `top` folds into "Other"
 * rather than being dropped — a truncated ranking must still sum to the total.
 */
export function errorTaxonomy(jobs: Job[], top = 6): ErrorGroup[] {
  const failed = jobs.filter((j) => j.status === 'failed')
  if (failed.length === 0) return []

  const counts = new Map<string, number>()
  for (const j of failed) {
    const key = errorKey(j.errorMessage)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const ranked = [...counts.entries()]
    .map(([message, count]) => ({ message, count, share: count / failed.length }))
    .sort((a, b) => b.count - a.count)

  if (ranked.length <= top) return ranked

  const head = ranked.slice(0, top)
  const restCount = ranked.slice(top).reduce((s, r) => s + r.count, 0)
  return [
    ...head,
    { message: `Other (${ranked.length - top} kinds)`, count: restCount, share: restCount / failed.length },
  ]
}

export interface FailureRateDelta {
  /** Failure rate over the recent half of the window, 0–1. */
  current: number
  previous: number
  /** Percentage-point change; negative = improving. */
  deltaPp: number
  improving: boolean
}

/** Minimum evidence before we show a comparison. Below this it's noise. */
const MIN_JOBS_FOR_DELTA = 10
const MIN_DAYS_FOR_DELTA = 4

/**
 * Failure rate for the recent half of the window vs the earlier half.
 *
 * Returns `null` when there isn't enough history — deliberately: a delta drawn
 * from three jobs is a random number, and showing it would invite planning
 * against noise.
 */
export function failureRateDelta(buckets: DailyJobBucket[]): FailureRateDelta | null {
  const totalJobs = buckets.reduce((s, b) => s + b.total, 0)
  if (buckets.length < MIN_DAYS_FOR_DELTA || totalJobs < MIN_JOBS_FOR_DELTA) return null

  const mid = Math.floor(buckets.length / 2)
  const rate = (slice: DailyJobBucket[]) => {
    const total = slice.reduce((s, b) => s + b.total, 0)
    if (total === 0) return null
    return slice.reduce((s, b) => s + b.failed, 0) / total
  }
  const previous = rate(buckets.slice(0, mid))
  const current = rate(buckets.slice(mid))
  if (previous === null || current === null) return null

  const deltaPp = (current - previous) * 100
  return { current, previous, deltaPp, improving: deltaPp < 0 }
}

export function fmtPct(v: number, digits = 0) {
  return `${(v * 100).toFixed(digits)}%`
}

/* ---- Pipeline time by queue --------------------------------------------- */

/**
 * How long each queue actually takes.
 *
 * A duration *histogram* was the obvious first idea and the wrong one: live
 * durations are tight (p50 16s, p90 20s) so 71 of 91 jobs land in a single band
 * — one bar, no information. Split by queue instead and the difference is real
 * and actionable: moderation ~5s against image-generation ~17s. If one stage
 * degrades, this is where it shows.
 *
 * Completed jobs only. A failed job's elapsed time is time-to-failure, which is
 * a different measurement and would drag the medians toward whatever timeout the
 * provider uses.
 */
export interface QueueTiming {
  queue: string
  label: string
  n: number
  /** Seconds. */
  p50: number
  p90: number
}

export interface PipelineTiming {
  rows: QueueTiming[]
  overallP50: number | null
  overallP90: number | null
  sampled: number
}

/** Below this a median is one or two jobs wearing a statistic's clothes. */
const MIN_PER_QUEUE = 3

export function pipelineTiming(jobs: Job[]): PipelineTiming {
  const byQueue = new Map<string, number[]>()
  const all: number[] = []

  for (const j of jobs) {
    if (j.status !== 'completed') continue
    const started = new Date(j.createdAt).getTime()
    const ended = new Date(j.updatedAt).getTime()
    if (Number.isNaN(started) || Number.isNaN(ended)) continue
    const seconds = (ended - started) / 1000
    // Clock skew / bad rows would otherwise show as impossibly fast jobs.
    if (seconds < 0) continue
    byQueue.set(j.queueName, [...(byQueue.get(j.queueName) ?? []), seconds])
    all.push(seconds)
  }

  const rows = [...byQueue.entries()]
    .filter(([, v]) => v.length >= MIN_PER_QUEUE)
    .map(([queue, v]) => ({
      queue,
      label: queueLabel(queue),
      n: v.length,
      p50: Math.round(percentile(v, 0.5) ?? 0),
      p90: Math.round(percentile(v, 0.9) ?? 0),
    }))
    // Slowest first — that's the one worth looking at.
    .sort((a, b) => b.p50 - a.p50)

  return {
    rows,
    overallP50: all.length ? Math.round(percentile(all, 0.5) ?? 0) : null,
    overallP90: all.length ? Math.round(percentile(all, 0.9) ?? 0) : null,
    sampled: all.length,
  }
}

/** "17s" / "2m 5s" — durations here are seconds, unlike publish latency. */
export function fmtSeconds(s: number) {
  if (s < 60) return `${Math.round(s)}s`
  const m = Math.floor(s / 60)
  const rest = Math.round(s % 60)
  return rest === 0 ? `${m}m` : `${m}m ${rest}s`
}
