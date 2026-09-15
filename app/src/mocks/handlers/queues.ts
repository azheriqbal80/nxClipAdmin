import { http, HttpResponse } from 'msw'
import { paginate } from '@/mocks/paginate'
import type { Job, QueueName } from '@/features/queues/api/schemas'

const JOB_TYPE: Record<QueueName, string> = {
  'image-generation': 'image_generation',
  moderation: 'content_moderation',
  transcription: 'transcription',
  onboarding: 'onboarding_coach',
}

const ERRORS: Record<QueueName, string> = {
  // Mirrors the real production failure — see report §3a.
  'image-generation':
    'Vertex Gemini Image API error (400): {\n  "error": {\n    "code": 400,\n    "message": "Provided image is not valid.",\n    "status": "INVALID_ARGUMENT"\n  }\n}',
  moderation: 'Rate limited by moderation provider (429).',
  transcription: 'Out-of-memory during audio decode.',
  onboarding: 'Prompt template render failed (missing category bank).',
}

/** Real ids from the creator directory — jobs must reference the same users the
    /admin/users mock returns, or names won't resolve and per-creator usage reads
    as zero. */
const USERS = ['usr-001', 'usr-002', 'usr-003', 'usr-004', 'usr-005']

/** Realistic per-queue durations in seconds, so pipeline timing has something
    to compare. Mirrors live shape: moderation is quick, image generation is the
    slow stage. `spread` gives each job a slightly different value plus an
    occasional tail, so p50 and p90 differ. */
const DURATION_SECS: Record<QueueName, number> = {
  'image-generation': 17,
  moderation: 5,
  transcription: 42,
  onboarding: 3,
}
const durationFor = (q: QueueName, i: number) => {
  const base = DURATION_SECS[q]
  const jitter = ((i % 5) - 2) * Math.max(1, Math.round(base * 0.12))
  const tail = i % 9 === 0 ? Math.round(base * 1.8) : 0
  return Math.max(1, base + jitter + tail)
}

const QUEUE_BY_INDEX: QueueName[] = [
  'image-generation',
  'moderation',
  'transcription',
  'onboarding',
]

/** A trailing 14-day window ending today, so the reliability trend stays in
    range and today's plan-limit usage is never empty. */
const DAY_MS = 86_400_000
const NOW = Date.now()
/** index 0 = 13 days ago … index 13 = today */
const DAYS = Array.from({ length: 14 }, (_, i) =>
  new Date(NOW - (13 - i) * DAY_MS).toISOString().slice(0, 10),
)

/** Failure-heavy early, mostly clean later — so the reliability trend shows a
    real improvement instead of flat noise. Index into DAYS. */
const FAILED_ON = [0, 1, 1, 2, 3, 4, 6, 8, 10, 11, 13]
/** Image generation dominates failures, as in production. */
const FAILED_QUEUE: QueueName[] = [
  'image-generation',
  'image-generation',
  'image-generation',
  'moderation',
  'image-generation',
  'transcription',
  'image-generation',
  'moderation',
  'image-generation',
  'onboarding',
  'transcription',
]

let FAILED: Job[] = FAILED_ON.map((dayIdx, i) => {
  const q = FAILED_QUEUE[i]
  const userId = USERS[i % USERS.length]
  return {
    id: `019fb945-c1b1-74${(13 + i).toString(16).padStart(2, '0')}-ad4e-b44779d364f6`,
    jobType: JOB_TYPE[q],
    queueName: q,
    bullJobId: null,
    contentId: q === 'onboarding' ? null : `019f${(i + 20).toString(16)}-${(900 + i).toString(16)}`,
    userId,
    status: 'failed',
    promptVersion: 'v1',
    inputPayload: { prompt: 'sample prompt', style: 'cinematic' },
    resultPayload: null,
    errorMessage: ERRORS[q],
    correlationId: `trace_${(1785519777674 + i).toString(16)}`,
    createdAt: `${DAYS[dayIdx]}T0${i % 9}:05:00.000Z`,
    updatedAt: `${DAYS[dayIdx]}T0${i % 9}:12:00.000Z`,
  }
})

/** Completed jobs — the denominator the failure *rate* needs. Weighted toward
    the recent half so the rate improves over the window. */
const SUCCEEDED: Job[] = DAYS.flatMap((day, dayIdx) => {
  const count = dayIdx < 7 ? 1 + (dayIdx % 2) : 3 + (dayIdx % 3)
  return Array.from({ length: count }, (_, k) => {
    const q = QUEUE_BY_INDEX[(dayIdx + k) % 4]
    return {
      id: `019fc${dayIdx.toString(16)}${k}-ok00-4000-8000-${(500000 + dayIdx * 10 + k).toString(16)}`,
      jobType: JOB_TYPE[q],
      queueName: q,
      bullJobId: null,
      contentId: `019fd${dayIdx.toString(16)}${k}-${(700 + k).toString(16)}`,
      userId: USERS[(dayIdx + k) % USERS.length],
      status: 'completed',
      promptVersion: 'v1',
      inputPayload: { prompt: 'sample prompt', style: 'cinematic' },
      resultPayload: { storageKey: `gs://mock/${dayIdx}-${k}.png` },
      errorMessage: null,
      correlationId: `trace_ok_${dayIdx}_${k}`,
      createdAt: `${day}T1${k % 9}:20:00.000Z`,
      updatedAt: new Date(
        new Date(`${day}T1${k % 9}:20:00.000Z`).getTime() + durationFor(q, dayIdx + k) * 1000,
      ).toISOString(),
    } satisfies Job
  })
})

/** Today's image-generation load per creator, shaped so the plan-headroom
    panel shows every state it can render. Caps come from /admin/plans:
    FREE 5/day, PRO 100/day, STUDIO unlimited.
      usr-002 FREE   → 6  over cap
      usr-004 FREE   → 4  near cap
      usr-001 PRO    → 12 comfortable
      usr-003 STUDIO → 3  unlimited */
const TODAY = DAYS[DAYS.length - 1]
const TODAY_GENERATIONS: Job[] = (
  [
    ['usr-002', 6],
    ['usr-004', 4],
    ['usr-001', 12],
    ['usr-003', 3],
  ] as [string, number][]
).flatMap(([userId, n]) =>
  Array.from({ length: n }, (_, k) => ({
    id: `019fe-gen-${userId}-${k}`,
    jobType: JOB_TYPE['image-generation'],
    queueName: 'image-generation' as QueueName,
    bullJobId: null,
    contentId: `019fe-c-${userId}-${k}`,
    userId,
    status: 'completed',
    promptVersion: 'v1',
    inputPayload: { prompt: 'sample prompt', style: 'cinematic' },
    resultPayload: { storageKey: `gs://mock/today-${userId}-${k}.png` },
    errorMessage: null,
    correlationId: `trace_today_${userId}_${k}`,
    createdAt: `${TODAY}T${String(6 + (k % 12)).padStart(2, '0')}:30:00.000Z`,
    updatedAt: new Date(
      new Date(`${TODAY}T${String(6 + (k % 12)).padStart(2, '0')}:30:00.000Z`).getTime() +
        durationFor('image-generation', k) * 1000,
    ).toISOString(),
  })) satisfies Job[],
)

/** Newest first, like the gateway. */
const allJobs = () =>
  [...FAILED, ...SUCCEEDED, ...TODAY_GENERATIONS].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

const spark = (base: number, n = 14) =>
  Array.from({ length: n }, (_, i) => Math.max(0, Math.round(base + Math.sin(i) * base * 0.35)))

export const queuesHandlers = [
  http.get('*/admin/queues', () => {
    return HttpResponse.json({
      mode: 'worker',
      queues: [
        { name: 'image-generation', waiting: 14, active: 3, failed: 3, delayed: 2 },
        { name: 'moderation', waiting: 2, active: 1, failed: 3, delayed: 0 },
        { name: 'transcription', waiting: 6, active: 2, failed: 3, delayed: 1 },
        { name: 'onboarding', waiting: 0, active: 0, failed: 2, delayed: 0 },
      ],
    })
  }),

  http.get('*/admin/jobs', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const contentId = url.searchParams.get('contentId')
    let items = allJobs()
    if (status) items = items.filter((j) => j.status === status)
    if (contentId) items = items.filter((j) => j.contentId === contentId)
    return HttpResponse.json(paginate(items, url, 8))
  }),

  http.post('*/admin/jobs/:id/retry', ({ params }) => {
    FAILED = FAILED.filter((j) => j.id !== params.id)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('*/admin/costs/summary', () => {
    return HttpResponse.json({
      spendTodayUsd: 18.4,
      spend30dUsd: 438.12,
      deltaPct: -8,
      daily: spark(15),
      topUsers: [
        { userId: 'u3', displayName: 'Emily Carter', costUsd: 92.4, jobCount: 512, unitCount: 1840 },
        { userId: 'u8', displayName: 'Sophia Martinez', costUsd: 61.0, jobCount: 331, unitCount: 1190 },
        { userId: 'u1', displayName: 'Sarah Khan', costUsd: 48.75, jobCount: 288, unitCount: 910 },
        { userId: 'u5', displayName: 'Olivia Brown', costUsd: 33.2, jobCount: 190, unitCount: 620 },
        { userId: 'u2', displayName: 'John Miller', costUsd: 21.1, jobCount: 121, unitCount: 405 },
      ],
    })
  }),
]
