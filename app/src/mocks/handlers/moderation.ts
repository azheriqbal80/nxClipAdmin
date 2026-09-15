import { http, HttpResponse } from 'msw'
import { paginate } from '@/mocks/paginate'
import type { ModerationItem } from '@/features/moderation/api/schemas'

/**
 * Must match ids the creators handler actually serves.
 *
 * These were UUID-shaped strings with no corresponding creator, so
 * `useUserNames().resolve()` silently fell back to an 8-character id prefix on
 * every content surface — moderation, stuck publishing, explore and drafts. On
 * live these ids do resolve (that is the whole point of the BE-2 workaround), so
 * the mock was hiding whether name resolution works at all.
 */
const USERS = ['usr-001', 'usr-002', 'usr-003', 'usr-004', 'usr-005', 'usr-006']

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
]

function make(
  i: number,
  over: Partial<ModerationItem> & Pick<ModerationItem, 'status'>,
): ModerationItem {
  const id = `019f${(i + 10).toString(16).padStart(2, '0')}-${(1000 + i * 7)
    .toString(16)
    .padStart(4, '0')}-713f-9073-13108fd641d5`
  const defaultMedia = SAMPLE_IMAGES[i % SAMPLE_IMAGES.length]
  return {
    id,
    userId: USERS[i % USERS.length],
    title: over.title ?? null,
    description: over.description ?? null,
    status: over.status,
    contentType: over.contentType ?? 'image',
    prompt: over.prompt ?? null,
    basePrompt: over.basePrompt ?? over.prompt ?? null,
    refinePrompt: over.refinePrompt ?? null,
    style: over.style ?? null,
    aspectRatio: over.aspectRatio ?? '16:9',
    thumbnailUrl: over.thumbnailUrl ?? defaultMedia,
    cdnUrl: over.cdnUrl ?? defaultMedia,
    storageKey: over.storageKey ?? `content/${id}`,
    jobId: over.jobId ?? `job-${i}`,
    failureReason: over.failureReason ?? null,
    failedAt: over.failedAt ?? null,
    publishedAt: over.publishedAt ?? null,
    createdAt: over.createdAt ?? '2026-08-02T09:00:00.000Z',
    updatedAt: over.updatedAt ?? '2026-08-03T08:12:00.000Z',
  }
}

/** Mock timestamps are relative to run time so the stuck-age bands and the
    publish-latency window stay meaningful whenever the demo is opened. */
const NOW = Date.now()
const minutesAgo = (m: number) => new Date(NOW - m * 60_000).toISOString()
const daysAgo = (d: number) => minutesAgo(d * 24 * 60)

/**
 * Published back-catalogue: ~3 items a day over 14 days, with the
 * create→publish gap shrinking over the window so the latency trend shows a
 * real improvement rather than flat noise. A couple of slow outliers each day
 * keep p90 meaningfully above p50.
 */
function publishedHistory(): ModerationItem[] {
  const out: ModerationItem[] = []
  for (let d = 13; d >= 0; d--) {
    // Median latency falls from ~4h to ~35m across the window.
    const base = 35 + d * 17
    const perDay = 3
    for (let k = 0; k < perDay; k++) {
      // One slow item a day drives the p90 tail.
      const latency = k === perDay - 1 ? base * 3 : base + k * 9
      const createdMinutes = d * 24 * 60 + 60 + k * 90
      out.push(
        make(100 + d * perDay + k, {
          status: 'published',
          title: `Published item ${d}-${k}`,
          prompt: 'Back-catalogue item',
          style: 'cinematic',
          createdAt: minutesAgo(createdMinutes),
          publishedAt: minutesAgo(createdMinutes - latency),
        }),
      )
    }
  }
  return out
}

/**
 * Pre-submission content: `draft` and `processing`.
 *
 * Neither state reaches the Moderation Hub — nobody has submitted them for
 * review — so they were invisible in the admin until the Drafts & Processing
 * page. Live carries 47 drafts and 0 processing, which means the operationally
 * interesting case (generation wedged in `processing`) has no live example. The
 * ages below are deliberately spread across the stuck threshold so that path is
 * testable: three of the five `processing` rows are old enough to flag.
 */
function preSubmission(): ModerationItem[] {
  // `dispatched` mirrors live, where 6 of 10 sampled drafts had `jobId: null`
  // and 4 had one — a draft that was generated and then kept as a draft still
  // carries its job. All-null would have made the "not dispatched" path look
  // like the only one.
  const drafts = [
    ['Rooftop portrait series', 'Golden-hour rooftop portrait, 35mm', 'realistic', 12, false],
    ['Retro arcade loop', 'Looping retro arcade cabinet, CRT glow', 'pixel_art', 40, true],
    ['Cafe morning b-roll', 'Slow pan across a morning cafe counter', 'cinematic', 90, false],
    ['Trail run cutdown', 'Mountain trail run, handheld', 'realistic', 5 * 60, true],
    ['Album art concept', 'Abstract album art, risograph texture', 'meme', 26 * 60, false],
    ['Studio setup tour', 'Creator studio walkthrough', 'realistic', 3 * 24 * 60, true],
    ['Winter market shots', 'Night market in snow, warm lanterns', 'cinematic', 9 * 24 * 60, false],
  ] as const
  const processing = [
    ['Ocean drone pass', 'Drone pass over breaking surf', 'cinematic', 4],
    ['Neon alley walk', 'First-person walk down a neon alley', 'cinematic', 22],
    // Past the 45-minute threshold: generation has almost certainly wedged.
    ['Festival crowd cut', 'Festival crowd, golden hour', 'realistic', 3 * 60],
    ['Product spin loop', 'Seamless product spin on white', 'realistic', 11 * 60],
    ['Cabin fireplace loop', 'Crackling fireplace in a timber cabin', 'cinematic', 2 * 24 * 60],
  ] as const

  return [
    ...drafts.map(([title, prompt, style, mins, dispatched], k) => ({
      // `make` defaults jobId with `??`, which cannot express an explicit null,
      // so override after building rather than widening the shared helper.
      ...make(300 + k, {
        status: 'draft',
        title,
        prompt,
        style,
        contentType: k % 3 === 0 ? 'clip' : 'image',
        createdAt: minutesAgo(mins),
        updatedAt: minutesAgo(Math.max(1, Math.round(mins / 2))),
      }),
      jobId: dispatched ? `job-${300 + k}` : null,
    })),
    ...processing.map(([title, prompt, style, mins], k) =>
      make(400 + k, {
        status: 'processing',
        title,
        prompt,
        style,
        contentType: k % 2 === 0 ? 'clip' : 'image',
        createdAt: minutesAgo(mins),
        updatedAt: minutesAgo(mins),
      }),
    ),
  ]
}

/** In-memory queue — approve/takedown mutate it so the UI reacts on refetch. */
let QUEUE: ModerationItem[] = [
  // Stuck items are spread across the age bands so the distribution has shape.
  make(0, { status: 'publishing', title: 'Neon skyline remix', prompt: 'A neon cyberpunk skyline at night, rain reflections', style: 'cinematic', createdAt: minutesAgo(25) }),
  make(1, { status: 'moderation_rejected', title: 'Boss fight clutch', contentType: 'clip', prompt: 'Intense boss fight clutch moment', failureReason: 'Contains graphic violence not suitable for the community.' }),
  make(2, { status: 'generation_failed', title: 'Golden-hour rooftop', prompt: 'Portrait on a Moroccan rooftop at golden hour', style: 'realistic', failureReason: 'Provider timeout after 3 retries (image-generation queue).' }),
  make(3, { status: 'publishing', title: 'Patch notes meme', contentType: 'image', prompt: 'Funny patch-notes reaction meme', style: 'meme', createdAt: minutesAgo(3 * 60) }),
  make(4, { status: 'publishing', title: 'Speedrun highlight', contentType: 'clip', prompt: 'Speedrun world record highlight', createdAt: minutesAgo(9 * 60) }),
  make(5, { status: 'moderation_rejected', title: 'Tournament poster', prompt: 'Esports tournament poster, bold typography', style: 'cinematic', failureReason: 'Possible copyrighted logo detected in the composition.' }),
  make(6, { status: 'publishing', title: 'Desert dunes edit', prompt: 'Lone traveler crossing desert dunes at dawn', style: 'cinematic', createdAt: minutesAgo(30 * 60) }),
  make(7, { status: 'generation_failed', title: 'Pixel city loop', prompt: 'Animated pixel-art city, retro palette', style: 'pixel_art', failureReason: 'Out-of-memory during upscaling step.' }),
  make(8, { status: 'publishing', title: 'Cooking short', contentType: 'clip', prompt: 'Quick pasta recipe short', createdAt: daysAgo(4) }),
  make(9, { status: 'moderation_rejected', title: 'Caption remix', prompt: 'Motivational caption over gym photo', style: 'realistic', failureReason: 'Caption could be read as targeting a specific group.' }),
  make(10, { status: 'publishing', title: 'Aurora timelapse', prompt: 'Aurora borealis timelapse over fjords', style: 'cinematic', createdAt: daysAgo(6) }),
  make(11, { status: 'published', title: 'Launch announcement', prompt: 'Product launch key visual', style: 'cinematic', createdAt: daysAgo(9), publishedAt: minutesAgo(9 * 24 * 60 - 95) }),
  make(12, { status: 'deleted', title: 'Taken-down clip', contentType: 'clip', prompt: 'Removed clip', failureReason: 'Removed by admin — graphic content.' }),
  make(13, { status: 'deleted', title: 'Removed promo image', prompt: 'Discount promo banner', style: 'cinematic', failureReason: 'Removed by admin — repeated spam.' }),
  ...publishedHistory(),
  ...preSubmission(),
]

export const moderationHandlers = [
  http.get('*/admin/content', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const items = !status ? QUEUE : QUEUE.filter((i) => i.status === status)
    return HttpResponse.json(paginate(items, url, 10))
  }),

  /** Authoritative single-item read used by the inspector. */
  http.get('*/admin/content/:id', ({ params }) => {
    const item = QUEUE.find((i) => i.id === params.id)
    if (!item) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(item)
  }),

  http.post('*/admin/content/:id/approve', ({ params }) => {
    QUEUE = QUEUE.map((i) => (i.id === params.id ? { ...i, status: 'published' } : i))
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('*/admin/content/:id/takedown', ({ params }) => {
    QUEUE = QUEUE.map((i) => (i.id === params.id ? { ...i, status: 'deleted' } : i))
    return new HttpResponse(null, { status: 204 })
  }),
]
