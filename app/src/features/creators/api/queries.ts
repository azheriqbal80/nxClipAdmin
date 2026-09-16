import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { api } from '@/api/client'
import {
  creatorDetailSchema,
  creatorListSchema,
  type Creator,
  type CreatorDetail,
  type CreatorList,
} from './schemas'

export type CreatorStatusFilter = 'all' | 'active' | 'suspended'

export const creatorKeys = {
  all: ['creators'] as const,
  list: (q: string, status: CreatorStatusFilter) =>
    [...creatorKeys.all, 'list', q, status] as const,
  detail: (id: string) => [...creatorKeys.all, 'detail', id] as const,
}

/** Keep cursor-backed directory tables complete while staying within gateway caps. */
const DIRECTORY_PAGE_SIZE = 100

export function useCreators(q: string, status: CreatorStatusFilter) {
  return useInfiniteQuery({
    queryKey: creatorKeys.list(q, status),
    queryFn: ({ pageParam }) =>
      api.get<CreatorList>('/admin/users', {
        // Larger page — the DataGrid does search / filter / pagination client-side.
        params: { q: q || undefined, status, cursor: pageParam, limit: DIRECTORY_PAGE_SIZE },
        schema: creatorListSchema,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
  })
}

/** Enriches the selected row with fields the list DTO omits (`contentCount`,
    `emailVerified`). Fetched only while a row is selected; failure is silent —
    the list row already renders, so this can only add. */
export function useCreatorDetail(id: string | null) {
  return useQuery({
    queryKey: creatorKeys.detail(id ?? ''),
    enabled: !!id,
    queryFn: () =>
      api.get<CreatorDetail>(`/admin/users/${id}`, { schema: creatorDetailSchema }),
    staleTime: 30_000,
    retry: false,
  })
}

export function useSetCreatorActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch<void>(`/admin/users/${id}/active`, { body: { isActive } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: creatorKeys.all }),
  })
}

export function useResetOnboarding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/admin/users/${id}/reset-onboarding`),
    onSuccess: () => qc.invalidateQueries({ queryKey: creatorKeys.all }),
  })
}

export function usePromoteToAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (creator: Creator) =>
      api.post<void>(`/admin/users/${creator.id}/roles`, {
        body: { role: 'admin', action: 'grant' },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: creatorKeys.all }),
  })
}

/* ---- Plan-limit headroom ------------------------------------------------- */

/** Daily entitlement caps per plan. `-1` means unlimited. */
const planCapSchema = z.object({
  plan: z.string(),
  dailyImageGenerations: z.number(),
})
const planCapListSchema = z.array(planCapSchema)
export type PlanCap = z.infer<typeof planCapSchema>

/** Slim job rows for per-creator usage: who ran what, when. */
const usageJobSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  queueName: z.string(),
  createdAt: z.string(),
})
const usageJobsSchema = z.object({
  items: z.array(usageJobSchema),
  nextCursor: z.string().nullish(),
})
export type UsageJob = z.infer<typeof usageJobSchema>
type UsageJobs = z.infer<typeof usageJobsSchema>

/** Gateway maximum — `limit` > 100 is rejected with a 400. */
export const USAGE_WINDOW = 100

export function usePlanCaps() {
  return useQuery({
    queryKey: [...creatorKeys.all, 'plan-caps'] as const,
    queryFn: () => api.get<PlanCap[]>('/admin/plans', { schema: planCapListSchema }),
    staleTime: 10 * 60_000,
  })
}

/**
 * Recent jobs, for measuring today's usage against each creator's daily cap.
 *
 * Bounded to one page: this is the most recent 100 jobs, not an aggregate, so a
 * very busy day could fall outside the window — the panel says so rather than
 * implying it counted everything. Server-side aggregation is the real fix.
 */
export function useUsageJobs() {
  return useQuery({
    queryKey: [...creatorKeys.all, 'usage-jobs', USAGE_WINDOW] as const,
    queryFn: () =>
      api.get<UsageJobs>('/admin/jobs', {
        params: { limit: USAGE_WINDOW },
        schema: usageJobsSchema,
      }),
    staleTime: 60_000,
  })
}
