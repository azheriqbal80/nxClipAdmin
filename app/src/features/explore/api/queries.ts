import { useInfiniteQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { exploreListSchema, type ExploreList, type ExploreSort } from './schemas'

export const exploreKeys = {
  all: ['explore'] as const,
  list: (sort: ExploreSort) => [...exploreKeys.all, 'list', sort] as const,
}

const EXPLORE_PAGE_SIZE = 100

export function useExplore(sort: ExploreSort) {
  return useInfiniteQuery({
    // sort is applied client-side (the live endpoint 400s on a `sort` param);
    // keep it in the key so the memoized list re-derives when it changes.
    queryKey: exploreKeys.list(sort),
    queryFn: ({ pageParam }) =>
      api.get<ExploreList>('/admin/explore', {
        // Sort is client-side; pull the gateway's largest practical page first.
        params: { cursor: pageParam, limit: EXPLORE_PAGE_SIZE },
        schema: exploreListSchema,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
  })
}
