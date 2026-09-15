import { z } from 'zod'

/** AI pipeline contract — matches the live `GET /admin/queues` and
    `GET /admin/jobs` DTOs (verified against the gateway 2026-08-07).
    Queue depth trends / jobs-today are not provided by the backend (BE-4);
    cost is blocked on the /admin/costs/summary 500 (BE-1). */

export const QUEUE_NAMES = [
  'image-generation',
  'moderation',
  'transcription',
  'onboarding',
] as const
export type QueueName = (typeof QUEUE_NAMES)[number]

export const queueCountSchema = z.object({
  name: z.string(),
  waiting: z.number(),
  active: z.number(),
  failed: z.number(),
  delayed: z.number(),
})

export const queuesResponseSchema = z.object({
  /** 'inline' (Cloud Run, no BullMQ worker) or 'worker'. */
  mode: z.string(),
  queues: z.array(queueCountSchema),
})

export const jobSchema = z.object({
  id: z.string(),
  jobType: z.string(),
  queueName: z.string(),
  bullJobId: z.string().nullable(),
  contentId: z.string().nullable(),
  userId: z.string(),
  status: z.string(),
  promptVersion: z.string().nullable(),
  inputPayload: z.unknown().nullable(),
  resultPayload: z.unknown().nullable(),
  errorMessage: z.string().nullable(),
  correlationId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const jobListSchema = z.object({
  items: z.array(jobSchema),
  nextCursor: z.string().nullish(),
})

export const costSummarySchema = z.object({
  spendTodayUsd: z.number(),
  spend30dUsd: z.number(),
  deltaPct: z.number(),
  daily: z.array(z.number()),
  topUsers: z.array(
    z.object({
      userId: z.string(),
      displayName: z.string(),
      costUsd: z.number(),
      jobCount: z.number(),
      /** ai_costs.unit_count — billable units (images, seconds, tokens). */
      unitCount: z.number(),
    }),
  ),
})

export type QueueCount = z.infer<typeof queueCountSchema>
export type QueuesResponse = z.infer<typeof queuesResponseSchema>
export type Job = z.infer<typeof jobSchema>
export type JobList = z.infer<typeof jobListSchema>
export type CostSummary = z.infer<typeof costSummarySchema>

const QUEUE_LABELS: Record<string, string> = {
  'image-generation': 'Image generation',
  moderation: 'Moderation',
  transcription: 'Transcription',
  onboarding: 'Onboarding',
}
/** Human label for a queue name; falls back to the raw name for unknown queues. */
export function queueLabel(name: string) {
  return QUEUE_LABELS[name] ?? name
}

/** Derived KPI rollup — the live /admin/queues DTO has no `totals` block. */
export function queueDepth(queues: QueueCount[]) {
  return queues.reduce((s, q) => s + q.waiting + q.active + q.delayed, 0)
}
export function queuesFailed(queues: QueueCount[]) {
  return queues.reduce((s, q) => s + q.failed, 0)
}

export function fmtUsd(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n < 100 ? 2 : 0,
  }).format(n)
}
