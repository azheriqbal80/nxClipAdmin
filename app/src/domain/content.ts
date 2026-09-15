/** DS pill tones — mirrors the `tone-*` variants on the shadcn Badge. */
export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral'

/** Content lifecycle statuses (from the backend content state machine). */
export type ContentStatus =
  | 'draft'
  | 'processing'
  | 'generation_failed'
  | 'publishing'
  | 'moderation_rejected'
  | 'published'
  | 'deleted'

/** Matches the working api-reference ContentType. (Memes are stored as images.) */
export type ContentType = 'image' | 'clip'

/** Maps each content status to a pill tone + human label for admin surfaces. */
export const CONTENT_STATUS_META: Record<
  ContentStatus,
  { label: string; tone: Tone }
> = {
  draft: { label: 'Draft', tone: 'neutral' },
  processing: { label: 'Processing', tone: 'warning' },
  generation_failed: { label: 'Generation failed', tone: 'danger' },
  publishing: { label: 'Publishing', tone: 'warning' },
  moderation_rejected: { label: 'Rejected', tone: 'danger' },
  published: { label: 'Published', tone: 'success' },
  deleted: { label: 'Deleted', tone: 'neutral' },
}

/** Moderation-review priority (derived by the admin queue, not a raw backend field). */
export type Priority = 'high' | 'medium' | 'low'

export const PRIORITY_META: Record<Priority, { label: string; tone: Tone }> = {
  high: { label: 'High', tone: 'danger' },
  medium: { label: 'Medium', tone: 'warning' },
  low: { label: 'Low', tone: 'success' },
}
