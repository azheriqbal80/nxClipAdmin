import { z } from 'zod'

/** Stuck-publishing diagnostics — sourced from the live `GET /admin/content?status=publishing`
    DTO (there is no dedicated `/admin/publishing` route). Content that moderation approved but
    that hasn't gone live yet sits in `publishing`. The content_outbox internals aren't exposed
    by the gateway, so outbox state/attempts are not shown (see BE-7). Verified 2026-08-07. */

export const stuckItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().nullable(),
  status: z.string(),
  contentType: z.string(),
  jobId: z.string().nullable(),
  failureReason: z.string().nullable(),
  failedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const stuckListSchema = z.object({
  items: z.array(stuckItemSchema),
  nextCursor: z.string().nullish(),
})

export type StuckItem = z.infer<typeof stuckItemSchema>
export type StuckList = z.infer<typeof stuckListSchema>

/** Slim projection of `status=published` content — only what the publish-latency
    series needs (`publishedAt − createdAt`). */
export const publishedItemSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  publishedAt: z.string().nullable(),
})
export const publishedListSchema = z.object({
  items: z.array(publishedItemSchema),
  nextCursor: z.string().nullish(),
})
export type PublishedItem = z.infer<typeof publishedItemSchema>
export type PublishedList = z.infer<typeof publishedListSchema>

export function stuckTitle(i: Pick<StuckItem, 'title' | 'id'>) {
  return i.title?.trim() || i.id.slice(0, 8)
}
/** Short creator handle until BE-2 adds displayName to the content DTO. */
export function creatorLabel(i: Pick<StuckItem, 'userId'>) {
  return i.userId.slice(0, 8)
}
/** Minutes since the item entered the pipeline (derived — the DTO has no lag field). */
export function stuckMinutes(i: Pick<StuckItem, 'createdAt'>) {
  return Math.max(0, Math.round((Date.now() - new Date(i.createdAt).getTime()) / 60_000))
}

export function fmtLag(min: number) {
  if (min < 60) return `${min}m`
  if (min < 60 * 48) return `${Math.floor(min / 60)}h ${min % 60}m`
  return `${Math.floor(min / 1440)}d`
}

/** Per-content AI job — read from GET /admin/jobs?contentId= to show how far the
    pipeline got before the item stuck in `publishing`. Thin subset (Zod strips
    the rest). */
export const contentJobSchema = z.object({
  id: z.string(),
  jobType: z.string(),
  queueName: z.string(),
  status: z.string(),
  errorMessage: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export const contentJobListSchema = z.object({
  items: z.array(contentJobSchema),
  nextCursor: z.string().nullish(),
})
export type ContentJob = z.infer<typeof contentJobSchema>
export type ContentJobList = z.infer<typeof contentJobListSchema>

const QUEUE_LABELS: Record<string, string> = {
  'image-generation': 'Image generation',
  moderation: 'Moderation',
  transcription: 'Transcription',
  onboarding: 'Onboarding',
}
export function jobLabel(j: Pick<ContentJob, 'queueName' | 'jobType'>) {
  return QUEUE_LABELS[j.queueName] ?? j.jobType
}
