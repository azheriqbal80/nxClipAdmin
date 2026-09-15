import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/api/client'
import {
  contentDetailSchema,
  contentTitle,
  moderationListSchema,
  type ContentDetail,
  type ModerationItem,
  type ModerationList,
} from './schemas'

/** Query-key factory — keeps cache keys collision-free and centralised. */
export const moderationKeys = {
  all: ['moderation'] as const,
  list: (status: string) => [...moderationKeys.all, 'list', status] as const,
  count: () => [...moderationKeys.all, 'count'] as const,
  detail: (id: string) => [...moderationKeys.all, 'detail', id] as const,
}

export type QueueStatusFilter =
  | 'publishing'
  | 'moderation_rejected'
  | 'generation_failed'
  | 'published'
  | 'deleted'
  | 'all'

export function useModerationQueue(status: QueueStatusFilter) {
  return useInfiniteQuery({
    queryKey: moderationKeys.list(status),
    queryFn: ({ pageParam }) =>
      api.get<ModerationList>('/admin/content', {
        // 'all' is a UI concept — the gateway wants the status param omitted.
        params: { status: status === 'all' ? undefined : status, cursor: pageParam, limit: 50 },
        schema: moderationListSchema,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
  })
}

/** Statuses that mean "needs an admin eye" — summed for the nav badge. */
const REVIEW_STATUSES = ['publishing', 'moderation_rejected', 'generation_failed'] as const

/** No `/admin/content/queue-count` route exists (it collides with `/content/:id`),
    and the list has no `total` — so derive the badge count client-side by summing
    the review-needed statuses. Resilient: a failing status contributes 0. */
export function useModerationQueueCount() {
  return useQuery({
    queryKey: moderationKeys.count(),
    queryFn: async () => {
      const results = await Promise.allSettled(
        REVIEW_STATUSES.map((status) =>
          api.get<ModerationList>('/admin/content', {
            params: { status, limit: 50 },
            schema: moderationListSchema,
          }),
        ),
      )
      return results.reduce(
        (sum, r) => (r.status === 'fulfilled' ? sum + r.value.items.length : sum),
        0,
      )
    },
  })
}

/** Authoritative single-item read for the inspector. Keeps the open panel fresh
    after approve/takedown without refetching the whole list, and covers fields
    the list may omit. Failure is silent — the row already renders. */
export function useContentDetail(id: string | null) {
  return useQuery({
    queryKey: moderationKeys.detail(id ?? ''),
    enabled: !!id,
    queryFn: () =>
      api.get<ContentDetail>(`/admin/content/${id}`, { schema: contentDetailSchema }),
    staleTime: 15_000,
    retry: false,
  })
}

/**
 * Toasts belong on the mutation, not on the caller's `mutate()` options.
 *
 * Both actions move the item out of the queue that is currently displayed, so
 * the invalidation below unmounts the inspector that fired them — and React
 * Query discards the per-call `onSuccess`/`onError` of an unmounted caller. The
 * action still succeeded, but the operator got no confirmation and just watched
 * the row disappear. Callbacks declared here always run.
 */
export function useApproveContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (item: ModerationItem) =>
      api.post<void>(`/admin/content/${item.id}/approve`),
    onSuccess: (_data, item) => {
      toast.success('Content approved', { description: contentTitle(item) })
      qc.invalidateQueries({ queryKey: moderationKeys.all })
    },
    onError: () => toast.error('Approve failed'),
  })
}

export function useTakedownContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ item, reason }: { item: ModerationItem; reason?: string }) =>
      api.post<void>(`/admin/content/${item.id}/takedown`, { body: { reason } }),
    onSuccess: (_data, { item }) => {
      toast.success('Content taken down', { description: contentTitle(item) })
      qc.invalidateQueries({ queryKey: moderationKeys.all })
    },
    onError: () => toast.error('Take-down failed'),
  })
}

/** Gateway maximum — `limit` > 100 is rejected with a 400. */
export const VOLUME_WINDOW = 100

/**
 * Recent content across **all** statuses, for the production/outcome chart.
 *
 * `useModerationQueue` fetches one status at a time to drive the tabs; the chart
 * needs the whole mix in one pass so the bands are comparable within a period.
 */
export function useContentVolume() {
  return useQuery({
    queryKey: [...moderationKeys.all, 'volume', VOLUME_WINDOW] as const,
    queryFn: () =>
      api.get<ModerationList>('/admin/content', {
        params: { limit: VOLUME_WINDOW },
        schema: moderationListSchema,
      }),
    staleTime: 60_000,
  })
}
