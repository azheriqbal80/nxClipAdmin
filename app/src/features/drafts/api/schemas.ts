import { z } from 'zod'

/**
 * Pre-submission content — `draft` and `processing`.
 *
 * Sourced from `GET /admin/content?status=`; there is no dedicated route. Both
 * states sit *before* the review pipeline, so neither appears in the Moderation
 * Hub: nobody has submitted them. Live carries 47 drafts, which were invisible
 * in the admin until this feature existed.
 *
 * Narrow on purpose. Each feature declares only the fields it reads from this
 * shared DTO (the same convention `publishing` follows), so a change to one
 * page's needs can't quietly widen another's contract. Verified live 2026-09-09.
 */
export const draftItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().nullable(),
  status: z.string(),
  contentType: z.string(),
  prompt: z.string().nullable(),
  style: z.string().nullable(),
  aspectRatio: z.string().nullable(),
  /** `null` on drafts — nothing has been dispatched to the AI queues yet. */
  jobId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const draftListSchema = z.object({
  items: z.array(draftItemSchema),
  nextCursor: z.string().nullish(),
})

/** Detail read-back. All-optional: the single-item DTO is a probed snapshot, not
    a published contract (BE-5), so merge whatever arrives over the list row. */
export const draftDetailSchema = draftItemSchema.partial()

export type DraftItem = z.infer<typeof draftItemSchema>
export type DraftList = z.infer<typeof draftListSchema>
export type DraftDetail = z.infer<typeof draftDetailSchema>

/** The two pre-submission states, in pipeline order. */
export type PreSubmissionStatus = 'draft' | 'processing'

/** A `processing` item older than this has almost certainly wedged: generation
    is a minutes-scale operation, and there is no queue/backlog history to prove
    otherwise (BE-4). Deliberately conservative — this flags "worth a look", not
    "broken", and the UI says so. */
export const STUCK_AFTER_MINUTES = 45

export function minutesSince(iso: string): number {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return 0
  return Math.max(0, Math.round((Date.now() - t) / 60_000))
}

/** Only meaningful for `processing`; a draft can sit untouched forever. */
export function isLikelyStuck(item: Pick<DraftItem, 'status' | 'createdAt'>): boolean {
  return item.status === 'processing' && minutesSince(item.createdAt) >= STUCK_AFTER_MINUTES
}

/** Compact age, e.g. "9m", "3h", "2d". */
export function formatAge(iso: string): string {
  const m = minutesSince(iso)
  if (m < 60) return `${m}m`
  if (m < 60 * 24) return `${Math.floor(m / 60)}h`
  return `${Math.floor(m / (60 * 24))}d`
}

/** Falls back through the fields a creator may not have filled in yet. */
export function draftTitle(item: Pick<DraftItem, 'title' | 'prompt'>): string {
  return item.title?.trim() || item.prompt?.trim() || 'Untitled'
}
