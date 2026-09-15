import { z } from 'zod'

/** Explore/WES audit contract — matches the live `GET /admin/explore` DTO
    (verified against the gateway 2026-08-07). The live payload is a flat
    `{ items }` (no totals, no cursor); engagement is flat like/comment counts
    (no views/shares), creator is only `userId`, and there is no `isGhost`
    flag — see nxclip-admin-api-reconciliation.md. */

export const projectionSchema = z.object({
  contentId: z.string(),
  userId: z.string(),
  title: z.string().nullable(),
  contentType: z.string(),
  /** Weighted Engagement Score — drives Explore ranking. */
  wesScore: z.number(),
  /** Social distribution state, e.g. "idle" / "live". */
  socialRollup: z.string(),
  hasLiveExternal: z.boolean(),
  likeCount: z.number(),
  commentCount: z.number(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
})

export const exploreListSchema = z.object({
  items: z.array(projectionSchema),
  nextCursor: z.string().nullish(),
})

export type Projection = z.infer<typeof projectionSchema>
export type ExploreList = z.infer<typeof exploreListSchema>

export type ExploreSort = 'wes' | 'recent'

export function projectionTitle(p: Pick<Projection, 'title' | 'contentId'>) {
  return p.title?.trim() || p.contentId.slice(0, 8)
}

export function fmtCompact(n: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}
