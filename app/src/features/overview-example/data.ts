import type { ContentStatus } from '@/domain/content'
import type { DirectoryUser, UserStats } from '@/features/overview/api/queries'

export interface ExampleContent {
  id: string
  title: string
  creator: string
  handle: string
  type: 'image' | 'clip'
  status: ContentStatus
  time: string
  prompt: string
}

export const content: ExampleContent[] = [
  { id: 'DEMO-001', title: 'A different kind of golden hour', creator: 'Maya Chen', handle: 'mayacreates', type: 'image', status: 'publishing', time: 'Sep 10, 10:42', prompt: 'A warm, cinematic landscape at sunset with soft natural light and a quiet mountain lake.' },
  { id: 'DEMO-002', title: 'The city, after everyone leaves', creator: 'Alex Morgan', handle: 'alexmorgan', type: 'clip', status: 'publishing', time: 'Sep 10, 10:38', prompt: 'An atmospheric short clip exploring empty streets and reflections after a rainstorm.' },
  { id: 'DEMO-003', title: 'Small moments, big adventures', creator: 'Sara Ahmed', handle: 'sara.studio', type: 'image', status: 'publishing', time: 'Sep 10, 10:31', prompt: 'An editorial travel image with an open road, distant hills, and warm afternoon colors.' },
  { id: 'DEMO-004', title: 'Weekend in motion', creator: 'James Wilson', handle: 'james.w', type: 'clip', status: 'generation_failed', time: 'Sep 10, 10:24', prompt: 'A short travel montage. This sample illustrates a failed generation awaiting an operator review.' },
  { id: 'DEMO-005', title: 'A little outside the ordinary', creator: 'Emma Davis', handle: 'emmadavis', type: 'image', status: 'moderation_rejected', time: 'Sep 10, 10:16', prompt: 'A conceptual portrait. This illustrative record demonstrates the moderation rejected state.' },
]

export const services = [
  { name: 'API Gateway', status: 'Operational', latency: '82 ms' },
  { name: 'Identity', status: 'Operational', latency: '64 ms' },
  { name: 'Content', status: 'Operational', latency: '118 ms' },
  { name: 'AI service', status: 'Degraded', latency: '1,240 ms' },
  { name: 'Feed', status: 'Operational', latency: '96 ms' },
  { name: 'Notifications', status: 'Operational', latency: '71 ms' },
]

export const PLAN_COLORS = {
  FREE: 'var(--chart-muted)',
  PRO: 'var(--brand-violet)',
  STUDIO: 'var(--chart-teal)',
}

/** Same aggregate shape as GET /admin/users/stats. Current plan, not plan at signup. */
export const userStats: UserStats = {
  totalUsers: 1260,
  activeUsers: 1218,
  byPlan: { FREE: 945, PRO: 252, STUDIO: 63 },
  signups: {
    last7d: 84, last30d: 278,
    byPlanLast7d: { FREE: 57, PRO: 21, STUDIO: 6 },
    byPlanLast30d: { FREE: 196, PRO: 66, STUDIO: 16 },
  },
}

// A deterministic 100-row directory response. Sep 1 is a thin cohort; Sep 2 is empty.
// The last seven days sum to the same 84 signups shown by the aggregate fixture.
const signupDays = [
  { day: 1, FREE: 2, PRO: 1, STUDIO: 0 },
  { day: 3, FREE: 10, PRO: 2, STUDIO: 1 },
  { day: 4, FREE: 6, PRO: 2, STUDIO: 0 },
  { day: 5, FREE: 8, PRO: 2, STUDIO: 1 },
  { day: 6, FREE: 7, PRO: 2, STUDIO: 1 },
  { day: 7, FREE: 9, PRO: 3, STUDIO: 1 },
  { day: 8, FREE: 8, PRO: 3, STUDIO: 1 },
  { day: 9, FREE: 9, PRO: 4, STUDIO: 1 },
  { day: 10, FREE: 10, PRO: 5, STUDIO: 1 },
]

const directory: DirectoryUser[] = signupDays.flatMap(day =>
  (['FREE', 'PRO', 'STUDIO'] as const).flatMap(plan =>
    Array.from({ length: day[plan] }, (_, index) => ({
      id: `sample-user-${day.day}-${plan}-${index}`,
      plan,
      isActive: true,
      createdAt: `2026-09-${String(day.day).padStart(2, '0')}T10:00:00`,
    })),
  ),
)

/** View model assembled from the existing Overview's response shapes. */
export const overviewSnapshot = {
  moderation: { publishing: 26, moderation_rejected: 7, generation_failed: 5 },
  queues: { waiting: 9, active: 3, delayed: 2 },
  failedJobs: { count: 12, capped: false },
  cost: { spend30dUsd: 1128.4, deltaPct: -9.5 },
  userStats,
  priorSignups: { prior7d: 63, prior30d: 221 },
  directory: { items: directory, nextCursor: 'sample-earlier-users' as string | null },
  recent: content,
  services,
  stuckPublishing: 6,
}

export type OverviewSnapshot = typeof overviewSnapshot
export type PreviewScenario = 'populated' | 'loading' | 'empty' | 'unavailable'

/** An asynchronous dummy API boundary, deliberately making no network requests. */
export async function fetchOverviewPreview(scenario: PreviewScenario): Promise<OverviewSnapshot> {
  await new Promise(resolve => setTimeout(resolve, 250))
  if (scenario === 'unavailable') throw new Error('Sample API response is unavailable')
  if (scenario === 'empty') return {
    moderation: { publishing: 0, moderation_rejected: 0, generation_failed: 0 },
    queues: { waiting: 0, active: 0, delayed: 0 },
    failedJobs: { count: 0, capped: false },
    cost: { spend30dUsd: 0, deltaPct: 0 },
    userStats: {
      totalUsers: 0, activeUsers: 0, byPlan: { FREE: 0, PRO: 0, STUDIO: 0 },
      signups: { last7d: 0, last30d: 0, byPlanLast7d: { FREE: 0, PRO: 0, STUDIO: 0 }, byPlanLast30d: { FREE: 0, PRO: 0, STUDIO: 0 } },
    },
    priorSignups: { prior7d: 0, prior30d: 0 },
    directory: { items: [], nextCursor: null }, recent: [], services: [], stuckPublishing: 0,
  }
  return overviewSnapshot
}

