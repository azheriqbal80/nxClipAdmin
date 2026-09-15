import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/api/client'
import {
  contentJobListSchema,
  publishedListSchema,
  stuckListSchema,
  stuckTitle,
  type ContentJobList,
  type PublishedList,
  type StuckItem,
  type StuckList,
} from './schemas'

export type PublishingFilter = 'all' | 'errors'

export const publishingKeys = {
  all: ['publishing'] as const,
  list: () => [...publishingKeys.all, 'list'] as const,
  count: () => [...publishingKeys.all, 'count'] as const,
  jobs: (contentId: string) => [...publishingKeys.all, 'jobs', contentId] as const,
  published: (limit: number) => [...publishingKeys.all, 'published', limit] as const,
}

/** How much back-catalogue the latency trend derives from — one bounded page.
    100 is the gateway's hard maximum: `limit` > 100 is rejected with a 400
    ("limit must not be greater than 100"). */
export const LATENCY_WINDOW = 100

/**
 * Content that reached `published`, for the create→publish latency trend.
 *
 * The stuck view only sees items still in `publishing`, which by definition have
 * no `publishedAt` — so "is the pipeline getting faster?" needs the items that
 * made it through.
 */
export function usePublishedContent() {
  return useQuery({
    queryKey: publishingKeys.published(LATENCY_WINDOW),
    queryFn: () =>
      api.get<PublishedList>('/admin/content', {
        params: { status: 'published', limit: LATENCY_WINDOW },
        schema: publishedListSchema,
      }),
    staleTime: 60_000,
  })
}

/** Count of stuck items (`status=publishing`) for the left nav badge. */
export function useStuckPublishingCount() {
  return useQuery({
    queryKey: publishingKeys.count(),
    queryFn: async () => {
      const res = await api.get<StuckList>('/admin/content', {
        params: { status: 'publishing', limit: 50 },
        schema: stuckListSchema,
      })
      return res.items.length
    },
  })
}

/** AI job history for one content item — shows how far the publish pipeline got. */
export function useContentJobs(contentId: string | null) {
  return useQuery({
    queryKey: publishingKeys.jobs(contentId ?? 'none'),
    enabled: !!contentId,
    queryFn: () =>
      api.get<ContentJobList>('/admin/jobs', {
        params: { contentId: contentId ?? undefined, limit: 10 },
        schema: contentJobListSchema,
      }),
  })
}

/** Stuck items = content in `publishing`. There is no `/admin/publishing` route;
    the stuck-publishing view is the `status=publishing` filter on content. */
export function useStuckPublishing() {
  return useInfiniteQuery({
    queryKey: publishingKeys.list(),
    queryFn: ({ pageParam }) =>
      api.get<StuckList>('/admin/content', {
        params: { status: 'publishing', cursor: pageParam, limit: 50 },
        schema: stuckListSchema,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
    refetchInterval: 15_000, // ops view: keep lag fresh
  })
}

/**
 * Re-drive a stuck item: force-approve re-continues the publish path (there is
 * no dedicated `/redispatch` route — see BE-7).
 *
 * **The toasts live here, not in the caller's `mutate()` options.** Success
 * removes the item from the `publishing` queue, so the invalidation below
 * unmounts the inspector that fired the mutation — and React Query drops the
 * per-call `onSuccess`/`onError` of an unmounted caller. The result was that a
 * force-approve worked, returned 204, and showed no confirmation roughly half
 * the time: the operator saw the row silently vanish. Callbacks defined on the
 * mutation itself always run, so the feedback is guaranteed.
 */
export function useRedispatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (item: StuckItem) => api.post<void>(`/admin/content/${item.id}/approve`),
    onSuccess: (_data, item) => {
      toast.success('Re-approved — publish re-driven', { description: stuckTitle(item) })
      qc.invalidateQueries({ queryKey: publishingKeys.all })
    },
    onError: () => toast.error('Re-dispatch failed'),
  })
}
