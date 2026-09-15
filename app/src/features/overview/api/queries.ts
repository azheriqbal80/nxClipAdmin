import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { api } from '@/api/client'
import { loadModerationSnapshot } from './presentation'

/** Overview aggregates read-only snapshots from several admin endpoints.
    It stays self-contained (own thin schemas) rather than importing other
    features, so the dependency rule holds. */

const queuesSchema = z.object({
  mode: z.string(),
  queues: z.array(
    z.object({
      waiting: z.number(),
      active: z.number(),
      failed: z.number(),
      delayed: z.number(),
    }),
  ),
})

const costSchema = z.object({
  spend30dUsd: z.number(),
  deltaPct: z.number(),
  daily: z.array(z.number()),
})

const recentSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      title: z.string().nullable(),
      prompt: z.string().nullable(),
      status: z.string(),
      contentType: z.string().optional(),
      createdAt: z.string().nullish(),
      failureReason: z.string().nullish(),
    }),
  ),
  nextCursor: z.string().nullish(),
})

/** GET /admin/users/stats — user signup + plan-mix aggregates (identity). */
const planCountsSchema = z.object({ FREE: z.number(), PRO: z.number(), STUDIO: z.number() })
const userStatsSchema = z.object({
  totalUsers: z.number(),
  activeUsers: z.number(),
  byPlan: planCountsSchema,
  signups: z.object({
    last7d: z.number(),
    last30d: z.number(),
    byPlanLast7d: planCountsSchema,
    byPlanLast30d: planCountsSchema,
    /** Present only when the request carried `from`+`to`. */
    inRange: z.number().optional(),
    byPlanInRange: planCountsSchema.optional(),
  }),
})

type QueuesData = z.infer<typeof queuesSchema>
type Cost = z.infer<typeof costSchema>
type Recent = z.infer<typeof recentSchema>
export type OverviewRecent = Recent['items'][number]
export type UserStats = z.infer<typeof userStatsSchema>

export const overviewKeys = {
  all: ['overview'] as const,
  queues: () => [...overviewKeys.all, 'queues'] as const,
  costs: () => [...overviewKeys.all, 'costs'] as const,
  userStats: () => [...overviewKeys.all, 'user-stats'] as const,
  directory: (limit: number) => [...overviewKeys.all, 'directory', limit] as const,
}

/** Slim projection of the user list — only what the signup series needs. */
const directoryUserSchema = z.object({
  id: z.string(),
  plan: z.string(),
  isActive: z.boolean().optional(),
  createdAt: z.string(),
  displayName: z.string().nullish(),
  username: z.string().nullish(),
})
const directorySchema = z.object({
  items: z.array(directoryUserSchema),
  nextCursor: z.string().nullish(),
})
export type DirectoryUser = z.infer<typeof directoryUserSchema>
type Directory = z.infer<typeof directorySchema>

/** How many accounts the growth series derives from — one bounded page.
    Capped at the gateway maximum (`limit` > 100 → 400 on content/jobs; kept
    consistent here so the same ceiling applies everywhere). */
export const DIRECTORY_WINDOW = 100

/**
 * The user list, for deriving signup trends.
 *
 * `users/stats` reduces history to two scalars (7d / 30d), which cannot draw a
 * curve. The list carries `createdAt` + `plan` per row, so the actual shape of
 * growth is derivable here until a server-side timeseries exists.
 */
export function useUserDirectory() {
  return useQuery({
    queryKey: overviewKeys.directory(DIRECTORY_WINDOW),
    queryFn: () =>
      api.get<Directory>('/admin/users', {
        params: { limit: DIRECTORY_WINDOW },
        schema: directorySchema,
      }),
    staleTime: 5 * 60_000,
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: overviewKeys.userStats(),
    queryFn: () => api.get<UserStats>('/admin/users/stats', { schema: userStatsSchema }),
  })
}

/**
 * Signups in the *previous* 7- and 30-day windows.
 *
 * `users/stats` already reports the current windows, but with nothing to compare
 * them to a tile can only say "3 signups" — not whether that is good. The
 * endpoint accepts `from`+`to` and answers with `signups.inRange`, which is a
 * server-side count: authoritative and unbounded, unlike deriving it from the
 * capped user list.
 *
 * Two extra requests, run in parallel. `Promise.all` rather than
 * `allSettled` — if a window fails we want no comparison at all rather than a
 * delta against a silently-missing half.
 */
export function usePriorSignups() {
  return useQuery({
    queryKey: [...overviewKeys.all, 'prior-signups'] as const,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const day = 86_400_000
      const now = Date.now()
      const window = (fromDaysAgo: number, toDaysAgo: number) => ({
        from: new Date(now - fromDaysAgo * day).toISOString(),
        to: new Date(now - toDaysAgo * day).toISOString(),
      })
      const [prev7, prev30] = await Promise.all([
        api.get<UserStats>('/admin/users/stats', {
          params: window(14, 7),
          schema: userStatsSchema,
        }),
        api.get<UserStats>('/admin/users/stats', {
          params: window(60, 30),
          schema: userStatsSchema,
        }),
      ])
      return {
        prior7d: prev7.signups.inRange ?? null,
        prior30d: prev30.signups.inRange ?? null,
      }
    },
  })
}

/** Count and table share the same bounded status responses. A failed status
 * must fail the snapshot instead of silently becoming a zero/clear queue. */
export function useModerationOverview() {
  return useQuery({
    queryKey: [...overviewKeys.all, 'moderation-snapshot'],
    queryFn: () => loadModerationSnapshot(status =>
      api.get<Recent>('/admin/content', {
            params: { status, limit: 50 },
            schema: recentSchema,
      }),
    ),
  })
}

export function useQueueTotals() {
  return useQuery({
    queryKey: overviewKeys.queues(),
    queryFn: () =>
      api.get<QueuesData>('/admin/queues', { schema: queuesSchema }).then((d) => ({
        depth: d.queues.reduce((s, q) => s + q.waiting + q.active + q.delayed, 0),
        failed: d.queues.reduce((s, q) => s + q.failed, 0),
        waiting: d.queues.reduce((s, q) => s + q.waiting, 0),
        active: d.queues.reduce((s, q) => s + q.active, 0),
        delayed: d.queues.reduce((s, q) => s + q.delayed, 0),
      })),
  })
}

/** Failed jobs — the authoritative source for the "Failed jobs" KPI *and* its
 * sparkline.
 *
 * `/admin/queues` reports `failed: 0` in inline mode: with no BullMQ worker
 * those counters are structurally meaningless, so the tile used to read 0 while
 * 33 jobs had actually failed (BE-9). The job list is the real state, and it is
 * what the AI Queues page already trusts. Queried here rather than imported from
 * the queues feature to keep features independent. */
const trendJobSchema = z.object({
  id: z.string(),
  status: z.string(),
  createdAt: z.string(),
})
const trendJobsSchema = z.object({
  items: z.array(trendJobSchema),
  nextCursor: z.string().nullish(),
})
type TrendJobs = z.infer<typeof trendJobsSchema>

export function useFailedJobs() {
  return useQuery({
    queryKey: [...overviewKeys.all, 'failed-jobs'] as const,
    queryFn: () =>
      api.get<TrendJobs>('/admin/jobs', {
        params: { status: 'failed', limit: 100 },
        schema: trendJobsSchema,
      }),
    staleTime: 60_000,
    // `capped` when more failures exist than one page holds, so the tile can
    // say "100+" instead of quietly under-reporting.
    select: (d) => ({ items: d.items, count: d.items.length, capped: !!d.nextCursor }),
  })
}

export function useSpend() {
  return useQuery({
    queryKey: overviewKeys.costs(),
    queryFn: () => api.get<Cost>('/admin/costs/summary', { schema: costSchema }),
  })
}

const overviewHealthSchema = z.object({
  status: z.string(),
  services: z.array(z.object({ key: z.string(), ok: z.boolean(), statusCode: z.number() })),
})

export function useOverviewHealth() {
  return useQuery({
    queryKey: [...overviewKeys.all, 'health'],
    queryFn: () => api.get<z.infer<typeof overviewHealthSchema>>('/admin/health', { schema: overviewHealthSchema }),
    refetchInterval: 15_000,
  })
}
