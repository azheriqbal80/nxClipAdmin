import { z } from 'zod'

/** Admin content-moderation contract — matches the live `GET /admin/content`
    DTO (verified against the gateway 2026-08-07). Creator identity is only
    `userId` today; `displayName`, `priority`, and `flags` are pending backend
    (BE-2 / BE-3) — see nxclip-admin-api-reconciliation.md. */

export const contentStatusSchema = z.enum([
  'draft',
  'processing',
  'generation_failed',
  'publishing',
  'moderation_rejected',
  'published',
  'deleted',
])
export type ContentStatus = z.infer<typeof contentStatusSchema>

export const moderationItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  status: contentStatusSchema,
  // Live data carries more than image/clip (e.g. "meme"); keep this permissive.
  contentType: z.string(),
  prompt: z.string().nullable(),
  basePrompt: z.string().nullable(),
  refinePrompt: z.string().nullable(),
  style: z.string().nullable(),
  // Live aspect ratios vary (1:1, 16:9, 9:16, 3:1, …) — accept any.
  aspectRatio: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  cdnUrl: z.string().nullable(),
  storageKey: z.string().nullable(),
  jobId: z.string().nullable(),
  failureReason: z.string().nullable(),
  failedAt: z.string().nullable(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const moderationListSchema = z.object({
  items: z.array(moderationItemSchema),
  nextCursor: z.string().nullish(),
})

/** `GET /admin/content/:id`. Detail DTO is unpublished (BE-5) — all fields
    optional so any shape validates and only what's returned is merged over the
    list row. Gives the inspector fresh `failureReason` / `failedAt` / media
    fields without waiting for a list refetch. */
export const contentDetailSchema = moderationItemSchema.partial()

export type ModerationItem = z.infer<typeof moderationItemSchema>
export type ModerationList = z.infer<typeof moderationListSchema>
export type ContentDetail = z.infer<typeof contentDetailSchema>

/** Display fallbacks for fields the live DTO leaves null / doesn't provide. */
export function contentTitle(i: Pick<ModerationItem, 'title' | 'prompt'>) {
  return i.title?.trim() || i.prompt?.trim() || 'Untitled content'
}

/** Short creator handle until BE-2 adds displayName to the content DTO. */
export function creatorLabel(i: Pick<ModerationItem, 'userId'>) {
  return i.userId.slice(0, 8)
}
