import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import {
  draftDetailSchema,
  draftListSchema,
  isLikelyStuck,
  type DraftDetail,
  type DraftItem,
  type DraftList,
  type PreSubmissionStatus,
} from './schemas'

export const draftKeys = {
  all: ['drafts'] as const,
  list: (status: PreSubmissionStatus) => [...draftKeys.all, 'list', status] as const,
  detail: (id: string) => [...draftKeys.all, 'detail', id] as const,
  stuck: () => [...draftKeys.all, 'stuck'] as const,
}

/** Gateway maximum — `limit` > 100 is rejected with a 400. */
const PAGE = 100

export function useDraftQueue(status: PreSubmissionStatus) {
  return useInfiniteQuery({
    queryKey: draftKeys.list(status),
    queryFn: ({ pageParam }) =>
      api.get<DraftList>('/admin/content', {
        params: { status, cursor: pageParam, limit: PAGE },
        schema: draftListSchema,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
  })
}

/** Authoritative single-item read, merged over the selected row so the open
    panel stays correct. Failure is silent — the row already renders. */
export function useDraftDetail(id: string | null) {
  return useQuery({
    queryKey: draftKeys.detail(id ?? ''),
    enabled: !!id,
    queryFn: () => api.get<DraftDetail>(`/admin/content/${id}`, { schema: draftDetailSchema }),
    staleTime: 15_000,
    retry: false,
  })
}

/**
 * Count of `processing` items old enough to look wedged — drives the nav badge.
 *
 * Derived client-side from one page because the gateway exposes no queue or
 * backlog history (BE-4) and no `total` on list responses (BE-6). Bounded to
 * `PAGE` rows, so the count is reported as capped rather than as a total the
 * data cannot support.
 */
export function useStuckProcessingCount() {
  return useQuery({
    queryKey: draftKeys.stuck(),
    queryFn: async () => {
      const res = await api.get<DraftList>('/admin/content', {
        params: { status: 'processing', limit: PAGE },
        schema: draftListSchema,
      })
      const stuck = res.items.filter((i) => isLikelyStuck(i))
      return { count: stuck.length, capped: !!res.nextCursor, scanned: res.items.length }
    },
    staleTime: 60_000,
  })
}

export type { DraftItem }
