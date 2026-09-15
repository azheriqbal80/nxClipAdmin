import {
  bucketKey,
  bucketLabel,
  bucketLabelLong,
  fillBuckets,
  pickGranularity,
  spanInDays,
  type Granularity,
} from '@/lib/time-buckets'
import type { DirectoryUser } from './queries'

export const PLANS = ['FREE', 'PRO', 'STUDIO'] as const
export type PlanKey = (typeof PLANS)[number]

export interface SignupBucket {
  key: string
  label: string
  labelLong: string
  FREE: number
  PRO: number
  STUDIO: number
  total: number
  /** Cumulative user base at the end of this period. */
  cumulative: number
}

export interface SignupSeries {
  buckets: SignupBucket[]
  granularity: Granularity
  /** Total users the series was derived from. */
  sampled: number
}

/** Below this there is no trend to speak of — say so rather than draw noise. */
const MIN_USERS = 4
const MIN_BUCKETS = 3

function planOf(u: DirectoryUser): PlanKey {
  return PLANS.includes(u.plan as PlanKey) ? (u.plan as PlanKey) : 'FREE'
}

/**
 * Signups per period, split by plan, plus the cumulative base.
 *
 * Derived from `/admin/users` — the list carries `createdAt` and `plan` per row,
 * which `users/stats` reduces to two scalars. Granularity adapts to the span so
 * the axis stays readable at any age of account base.
 *
 * `cumulative` counts every signup up to and including the period, including
 * users older than the rendered window, so the growth curve never restarts at
 * zero when the window is trimmed.
 */
export function signupSeries(users: DirectoryUser[]): SignupSeries | null {
  const dated = users.filter((u) => !Number.isNaN(new Date(u.createdAt).getTime()))
  if (dated.length < MIN_USERS) return null

  const granularity = pickGranularity(spanInDays(dated.map((u) => u.createdAt)))

  const perBucket = new Map<string, { FREE: number; PRO: number; STUDIO: number }>()
  for (const u of dated) {
    const key = bucketKey(u.createdAt, granularity)
    if (!key) continue
    const slot = perBucket.get(key) ?? { FREE: 0, PRO: 0, STUDIO: 0 }
    slot[planOf(u)] += 1
    perBucket.set(key, slot)
  }

  const keys = fillBuckets([...perBucket.keys()], granularity)
  if (keys.length < MIN_BUCKETS) return null

  // Signups that predate the rendered window still count toward the base.
  const firstKey = keys[0]
  let running = 0
  for (const [key, slot] of perBucket) {
    if (key < firstKey) {
      running += slot.FREE + slot.PRO + slot.STUDIO
    }
  }

  const buckets = keys.map((key) => {
    const slot = perBucket.get(key) ?? { FREE: 0, PRO: 0, STUDIO: 0 }
    const total = slot.FREE + slot.PRO + slot.STUDIO
    running += total
    return {
      key,
      label: bucketLabel(key, granularity),
      labelLong: bucketLabelLong(key, granularity),
      ...slot,
      total,
      cumulative: running,
    }
  })

  return { buckets, granularity, sampled: dated.length }
}

export interface GrowthDelta {
  current: number
  previous: number
  /** Percent change vs the previous equal-length window; null if previous is 0. */
  changePct: number | null
  improving: boolean
}

/**
 * Signups in the recent half of the window vs the earlier half — the
 * "how are we doing vs last time" read. Null when the previous window is empty,
 * because growth from zero is not a percentage.
 */
export function growthDelta(buckets: SignupBucket[]): GrowthDelta | null {
  if (buckets.length < 4) return null
  const mid = Math.floor(buckets.length / 2)
  const previous = buckets.slice(0, mid).reduce((s, b) => s + b.total, 0)
  const current = buckets.slice(mid).reduce((s, b) => s + b.total, 0)
  if (previous === 0 && current === 0) return null
  const changePct = previous === 0 ? null : ((current - previous) / previous) * 100
  return { current, previous, changePct, improving: current >= previous }
}

/** A cohort smaller than this makes a percentage meaningless — one upgrade in a
    two-person cohort reads as 50%. Shown, but marked as thin. */
export const MIN_COHORT = 5

export interface PaidCohort {
  label: string
  labelLong: string
  /** Accounts that signed up in this period. */
  size: number
  paid: number
  /** `null` when the cohort is empty: 0 of 0 is undefined, not 0%. */
  paidPct: number | null
  /** Too few accounts for the percentage to mean anything. */
  thin: boolean
}

/**
 * Share of each signup cohort that is on a paid plan **today**.
 *
 * This is the honest question for the data we have. `/admin/users` gives each
 * account's current plan and its signup date, and nothing else — no
 * plan-at-signup, no subscription history (BE-13). Asking "what fraction of the
 * people who joined in month X pay us now" uses exactly those two facts and
 * needs no history.
 *
 * It replaces a cumulative plan-mix-over-time curve, where every point applied
 * today's plans to whoever existed by that date. That curve's slope was an
 * artifact: older accounts have had longest to upgrade, so it diluted downward
 * as newer cohorts arrived and could fall while conversion improved. Per-cohort
 * has the opposite property — the bias is confined to the newest bars and is
 * legible rather than misleading, because each bar is an independent group.
 *
 * Younger cohorts are still converting, so their bars are floors, not verdicts.
 * The chart says so; `thin` marks cohorts too small to read at all.
 */
export function paidByCohort(series: SignupSeries | null): PaidCohort[] {
  if (!series) return []
  return series.buckets.map((b) => {
    const size = b.total
    const paid = b.PRO + b.STUDIO
    return {
      label: b.label,
      labelLong: b.labelLong,
      size,
      paid,
      // Gap-filled periods have no signups. Drawing 0% there would invent a
      // cohort that converted nobody, rather than showing no cohort at all.
      paidPct: size === 0 ? null : Math.round((paid / size) * 100),
      thin: size > 0 && size < MIN_COHORT,
    }
  })
}

/**
 * Overall paid share — **from the server's own counts, never from the list.**
 *
 * `users/stats` returns `byPlan` and `totalUsers` computed across every account;
 * the user list the cohort bars come from is capped at one 100-row page. Deriving
 * this figure from that page agrees only while the base is under the cap and is
 * silently wrong above it. The 2026-08-29 reference names `byPlan` as what the
 * dashboard should read, so read it.
 */
export function paidSharePct(
  byPlan: Record<'FREE' | 'PRO' | 'STUDIO', number>,
  totalUsers: number,
): number | null {
  if (totalUsers <= 0) return null
  return Math.round(((byPlan.PRO + byPlan.STUDIO) / totalUsers) * 100)
}

/** Period label for the delta caption, e.g. "vs previous 7 weeks". */
export function windowLabel(g: Granularity, count: number) {
  const unit = g === 'month' ? 'month' : g === 'week' ? 'week' : 'day'
  return `${count} ${unit}${count === 1 ? '' : 's'}`
}

/* ---- Period-over-period signups ----------------------------------------- */

export interface PeriodDelta {
  /** Text for the tile's delta line. */
  label: string
  tone: 'success' | 'danger' | 'muted'
}

/**
 * Compare a current window against the same-length window before it.
 *
 * Every zero case is spelled out rather than divided through:
 *   • no prior data available  → state the current count only
 *   • both zero                → "none in either period", not "0%"
 *   • prior zero, current > 0  → "first signups", not "+∞%"
 *   • current zero, prior > 0  → a real -100%
 */
export function periodDelta(
  current: number,
  prior: number | null | undefined,
  windowLabel: string,
): PeriodDelta {
  if (prior === null || prior === undefined) {
    return { label: `signups · no prior ${windowLabel} to compare`, tone: 'muted' }
  }
  if (prior === 0 && current === 0) {
    return { label: `none in this or the prior ${windowLabel}`, tone: 'muted' }
  }
  if (prior === 0) {
    return { label: `first signups — none in the prior ${windowLabel}`, tone: 'success' }
  }
  const pct = Math.round(((current - prior) / prior) * 100)
  const sign = pct > 0 ? '+' : ''
  return {
    label: `${sign}${pct}% vs prior ${windowLabel} (${prior})`,
    // Flat is not a win; only real growth reads as success.
    tone: pct > 0 ? 'success' : pct < 0 ? 'danger' : 'muted',
  }
}
