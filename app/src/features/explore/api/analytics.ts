import type { Projection } from './schemas'

/**
 * Does the ranking reward real engagement?
 *
 * WES drives Explore ordering, but nothing in the admin has ever shown whether
 * it tracks what audiences actually do. This pairs each projection's WES against
 * its raw engagement and reports the **rank** correlation — Spearman rather than
 * Pearson, because the question is monotonic ("does more engagement mean higher
 * WES?") and rank is robust to the long tail engagement always has.
 *
 * A correlation is evidence about *this* sample, not proof about the algorithm:
 * the readout names the sample size, and nothing is reported below a floor.
 */

export interface ScatterPoint {
  contentId: string
  title: string
  contentType: string
  wes: number
  engagement: number
  likes: number
  comments: number
}

export interface EngagementAudit {
  points: ScatterPoint[]
  /** Spearman's rho, −1…1. `null` when the sample is too small to report. */
  rho: number | null
  n: number
}

/** Below this a correlation is noise dressed as a finding. */
const MIN_POINTS = 6

/** Ranks with ties averaged — required for Spearman to be correct. */
function rank(values: number[]): number[] {
  const order = values
    .map((v, i) => ({ v, i }))
    .sort((a, b) => a.v - b.v)
  const ranks = new Array<number>(values.length)
  let i = 0
  while (i < order.length) {
    let j = i
    while (j + 1 < order.length && order[j + 1].v === order[i].v) j++
    const shared = (i + j) / 2 + 1
    for (let k = i; k <= j; k++) ranks[order[k].i] = shared
    i = j + 1
  }
  return ranks
}

/** Pearson correlation — applied to ranks, this is Spearman's rho. */
function pearson(a: number[], b: number[]): number | null {
  const n = a.length
  if (n < 2) return null
  const ma = a.reduce((s, v) => s + v, 0) / n
  const mb = b.reduce((s, v) => s + v, 0) / n
  let num = 0
  let va = 0
  let vb = 0
  for (let i = 0; i < n; i++) {
    const da = a[i] - ma
    const db = b[i] - mb
    num += da * db
    va += da * da
    vb += db * db
  }
  // Zero variance (every value identical) → correlation is undefined, not 0.
  if (va === 0 || vb === 0) return null
  return num / Math.sqrt(va * vb)
}

export function engagementAudit(items: Projection[]): EngagementAudit {
  const points: ScatterPoint[] = items.map((p) => ({
    contentId: p.contentId,
    title: p.title?.trim() || p.contentId.slice(0, 8),
    contentType: p.contentType,
    wes: p.wesScore,
    engagement: p.likeCount + p.commentCount,
    likes: p.likeCount,
    comments: p.commentCount,
  }))

  const rho =
    points.length >= MIN_POINTS
      ? pearson(
          rank(points.map((p) => p.engagement)),
          rank(points.map((p) => p.wes)),
        )
      : null

  return { points, rho, n: points.length }
}

/** Plain-language reading of a rank correlation — the number alone invites over-reading. */
export function describeRho(rho: number): { label: string; tone: 'success' | 'warning' | 'danger' } {
  const r = Math.abs(rho)
  if (rho < 0) return { label: 'inverted — ranking opposes engagement', tone: 'danger' }
  if (r >= 0.7) return { label: 'tracks engagement closely', tone: 'success' }
  if (r >= 0.4) return { label: 'loosely tracks engagement', tone: 'warning' }
  return { label: 'barely related to engagement', tone: 'danger' }
}
