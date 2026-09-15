import {
  bucketKey,
  bucketLabel,
  fillBuckets,
  pickGranularity,
  spanInDays,
  type Granularity,
} from '@/lib/time-buckets'
import type { ModerationItem } from './schemas'

/**
 * Content production and its outcomes over time.
 *
 * Answers what the status tabs can't: how much is arriving, and what happens to
 * it. A rising `Failed` band or a growing `Draft` pile are both visible here long
 * before anyone thinks to click a tab.
 *
 * The seven raw statuses collapse into five outcome bands — showing all seven
 * would mean two or three permanently-empty series on live data, where only
 * `draft`, `publishing` and `published` currently occur.
 */

export const OUTCOME_BANDS = ['Draft', 'In review', 'Published', 'Failed', 'Deleted'] as const
export type OutcomeBand = (typeof OUTCOME_BANDS)[number]

/** Raw status → band. Unknown statuses fall to Draft rather than vanishing. */
function bandFor(status: string): OutcomeBand {
  switch (status) {
    case 'published':
      return 'Published'
    case 'publishing':
    case 'processing':
      return 'In review'
    case 'generation_failed':
    case 'moderation_rejected':
      return 'Failed'
    case 'deleted':
      return 'Deleted'
    default:
      return 'Draft'
  }
}

export interface VolumeBucket {
  key: string
  label: string
  Draft: number
  'In review': number
  Published: number
  Failed: number
  Deleted: number
  total: number
}

export interface ContentVolume {
  buckets: VolumeBucket[]
  granularity: Granularity
  sampled: number
  /** Bands that actually occur — empty series are dropped from the legend. */
  activeBands: OutcomeBand[]
}

const MIN_ITEMS = 5
const MIN_BUCKETS = 2

/**
 * Content bucketed by creation period and outcome band, gap-filled.
 *
 * Granularity adapts to the span, so a 40-day window reads as weeks rather than
 * 40 near-empty daily bars.
 */
export function contentVolume(items: ModerationItem[]): ContentVolume | null {
  const dated = items.filter((i) => !Number.isNaN(new Date(i.createdAt).getTime()))
  if (dated.length < MIN_ITEMS) return null

  const granularity = pickGranularity(spanInDays(dated.map((i) => i.createdAt)))
  const perBucket = new Map<string, Record<OutcomeBand, number>>()
  const seen = new Set<OutcomeBand>()

  for (const item of dated) {
    const key = bucketKey(item.createdAt, granularity)
    if (!key) continue
    const slot =
      perBucket.get(key) ??
      ({ Draft: 0, 'In review': 0, Published: 0, Failed: 0, Deleted: 0 } as Record<
        OutcomeBand,
        number
      >)
    const band = bandFor(item.status)
    slot[band] += 1
    seen.add(band)
    perBucket.set(key, slot)
  }

  const keys = fillBuckets([...perBucket.keys()], granularity)
  if (keys.length < MIN_BUCKETS) return null

  const buckets = keys.map((key) => {
    const slot =
      perBucket.get(key) ??
      ({ Draft: 0, 'In review': 0, Published: 0, Failed: 0, Deleted: 0 } as Record<
        OutcomeBand,
        number
      >)
    return {
      key,
      label: bucketLabel(key, granularity),
      ...slot,
      total: OUTCOME_BANDS.reduce((s, b) => s + slot[b], 0),
    }
  })

  return {
    buckets,
    granularity,
    sampled: dated.length,
    // Keep canonical order so a band never changes colour between renders.
    activeBands: OUTCOME_BANDS.filter((b) => seen.has(b)),
  }
}
