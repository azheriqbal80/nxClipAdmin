import { bucketKey } from '@/lib/time-buckets'
import type { PlanCap, UsageJob } from './queries'
import type { Creator } from './schemas'

/**
 * Plan-limit headroom: today's image-generation usage against each creator's
 * daily cap.
 *
 * This is arithmetic on observed usage, not a forecast — no extrapolation, no
 * trendline. It answers "who is about to be blocked today", which is directly
 * actionable (raise the cap or upsell), unlike a projection built from a handful
 * of data points.
 *
 * Caps come from `/admin/plans` (`dailyImageGenerations`, `-1` = unlimited) and
 * usage from `/admin/jobs`. Only the `image-generation` queue counts: that is the
 * queue the cap actually governs, so counting moderation or transcription jobs
 * would overstate consumption.
 */

/** The queue the daily image cap governs. */
const CAPPED_QUEUE = 'image-generation'

export interface HeadroomRow {
  userId: string
  name: string
  plan: string
  used: number
  /** `null` when the plan is unlimited (`-1`). */
  cap: number | null
  /** Fraction of the cap consumed, 0–1+. `null` when unlimited. */
  ratio: number | null
  atLimit: boolean
}

export interface Headroom {
  rows: HeadroomRow[]
  /** Creators over their cap right now. */
  blocked: number
  /** Image-generation jobs counted today. */
  countedToday: number
  /** True when the job window was full, so today's count may be incomplete. */
  windowCapped: boolean
}

/**
 * Ranked headroom, worst first. Unlimited plans sort last — they can't run out,
 * so they are context rather than a call to action.
 */
export function planHeadroom(
  creators: Creator[],
  caps: PlanCap[],
  jobs: UsageJob[],
  windowCapped = false,
): Headroom {
  const today = bucketKey(new Date().toISOString(), 'day')
  const capByPlan = new Map(caps.map((c) => [c.plan, c.dailyImageGenerations]))

  const usedByUser = new Map<string, number>()
  let countedToday = 0
  for (const j of jobs) {
    if (j.queueName !== CAPPED_QUEUE) continue
    if (bucketKey(j.createdAt, 'day') !== today) continue
    if (!j.userId) continue
    usedByUser.set(j.userId, (usedByUser.get(j.userId) ?? 0) + 1)
    countedToday += 1
  }

  const rows: HeadroomRow[] = [...usedByUser.entries()].map(([userId, used]) => {
    const creator = creators.find((c) => c.id === userId)
    const rawCap = capByPlan.get(creator?.plan ?? '') ?? null
    const cap = rawCap === null || rawCap < 0 ? null : rawCap
    return {
      userId,
      name: creator?.displayName ?? userId.slice(0, 8),
      plan: creator?.plan ?? 'unknown',
      used,
      cap,
      ratio: cap === null || cap === 0 ? null : used / cap,
      atLimit: cap !== null && used >= cap,
    }
  })

  rows.sort((a, b) => {
    // Unlimited last, then by how close to the cap, then by raw usage.
    if ((a.ratio === null) !== (b.ratio === null)) return a.ratio === null ? 1 : -1
    if (a.ratio !== null && b.ratio !== null && a.ratio !== b.ratio) return b.ratio - a.ratio
    return b.used - a.used
  })

  return {
    rows,
    blocked: rows.filter((r) => r.atLimit).length,
    countedToday,
    windowCapped,
  }
}
