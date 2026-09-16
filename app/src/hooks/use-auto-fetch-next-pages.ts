import { useEffect } from 'react'

interface AutoFetchNextPagesOptions {
  hasNextPage?: boolean
  isFetching?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage: () => unknown
}

/** Walk a cursor-backed table to completion after its first page loads. */
export function useAutoFetchNextPages({
  fetchNextPage,
  hasNextPage,
  isFetching,
  isFetchingNextPage,
}: AutoFetchNextPagesOptions) {
  useEffect(() => {
    if (!hasNextPage || isFetching || isFetchingNextPage) return
    void fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage])
}
