import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/api/client'
import {
  costSummarySchema,
  jobListSchema,
  queueDepth,
  queueLabel,
  queuesResponseSchema,
  type CostSummary,
  type Job,
  type JobList,
  type QueuesResponse,
} from './schemas'

export const queueKeys = {
  all: ['queues'] as const,
  overview: () => [...queueKeys.all, 'overview'] as const,
  jobs: (status: string) => [...queueKeys.all, 'jobs', status] as const,
  window: (limit: number) => [...queueKeys.all, 'window', limit] as const,
  costs: () => [...queueKeys.all, 'costs'] as const,
}

/** How many recent jobs the trend charts derive from. Bounded on purpose: one
    page, so the window is knowable and we never imply we aggregated the whole
    table. Server-side aggregation is the fix once volume grows. */
export const TREND_WINDOW = 100

/**
 * Recent jobs across **all** statuses — the denominator a failure *rate* needs.
 * `useFailedJobs` alone can only show volume, and volume falls when usage falls,
 * which would read as an improvement that didn't happen.
 */
export function useJobWindow() {
  return useQuery({
    queryKey: queueKeys.window(TREND_WINDOW),
    queryFn: () =>
      api.get<JobList>('/admin/jobs', {
        params: { limit: TREND_WINDOW },
        schema: jobListSchema,
      }),
    staleTime: 60_000,
  })
}

export function useQueues() {
  return useQuery({
    queryKey: queueKeys.overview(),
    queryFn: () => api.get<QueuesResponse>('/admin/queues', { schema: queuesResponseSchema }),
    refetchInterval: 15_000, // ops dashboards poll (no admin WS)
  })
}

/** Queue depth total (waiting + active + delayed) for the left nav badge. */
export function useQueuesCount() {
  return useQuery({
    queryKey: queueKeys.overview(),
    queryFn: () => api.get<QueuesResponse>('/admin/queues', { schema: queuesResponseSchema }),
    select: (data) => queueDepth(data.queues),
    refetchInterval: 15_000,
  })
}

export function useFailedJobs() {
  return useInfiniteQuery({
    queryKey: queueKeys.jobs('failed'),
    queryFn: ({ pageParam }) =>
      api.get<JobList>('/admin/jobs', {
        params: { status: 'failed', cursor: pageParam, limit: 50 },
        schema: jobListSchema,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
  })
}

export function useCostSummary() {
  return useQuery({
    queryKey: queueKeys.costs(),
    queryFn: () => api.get<CostSummary>('/admin/costs/summary', { schema: costSummarySchema }),
  })
}

/**
 * Toasts live here rather than in the caller's `mutate()` options: a retried job
 * leaves `status=failed`, so the invalidation unmounts the inspector that fired
 * it, and React Query drops an unmounted caller's per-call callbacks. The retry
 * worked but the operator saw no confirmation.
 */
export function useRetryJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (job: Job) => api.post<void>(`/admin/jobs/${job.id}/retry`),
    onSuccess: (_data, job) => {
      toast.success('Job re-queued', { description: queueLabel(job.queueName) })
      qc.invalidateQueries({ queryKey: queueKeys.all })
    },
    onError: () => toast.error('Retry failed'),
  })
}
