import { http, HttpResponse } from 'msw'
import type { CoachCategory, CoachQuestion, PlanLimits } from '@/features/config/api/schemas'

let PLANS: PlanLimits[] = [
  { plan: 'FREE', dailyImageGenerations: 5, dailyUploadLimit: 20, maxReferenceImages: 2, maxClipOutputSeconds: 60, maxClipSourceSeconds: 600, maxUploadSizeMb: 500, canUseAnalyticsReport: false, updatedAt: '2026-08-06T14:41:29.049Z' },
  { plan: 'PRO', dailyImageGenerations: 100, dailyUploadLimit: 200, maxReferenceImages: 5, maxClipOutputSeconds: 180, maxClipSourceSeconds: 1800, maxUploadSizeMb: 2000, canUseAnalyticsReport: true, updatedAt: '2026-08-06T14:41:29.049Z' },
  { plan: 'STUDIO', dailyImageGenerations: -1, dailyUploadLimit: -1, maxReferenceImages: 10, maxClipOutputSeconds: 600, maxClipSourceSeconds: 3600, maxUploadSizeMb: 5000, canUseAnalyticsReport: true, updatedAt: '2026-08-06T14:41:29.049Z' },
]

const catId = (i: number) => `a1000000-0000-4000-8000-00000000000${i}`

const mkCat = (i: number, slug: string, label: string): CoachCategory => ({
  id: catId(i),
  slug,
  label,
  openingMessage: `Welcome to NxClip! I am your ${label} Creator Coach. Let me set up your account in about 90 seconds — just answer 5 quick questions.`,
  progressLabel: `${label.toLowerCase()} niche`,
  sortOrder: i,
  isActive: i !== 4,
  // Counts and readiness are derived from QUESTIONS below, never hardcoded — a
  // category previously claimed `questionCount: 5` while holding three rows.
  questionCount: 0,
  createdAt: '2026-07-14T16:47:10.482Z',
  updatedAt: '2026-07-14T16:47:10.482Z',
})

let CATEGORIES: CoachCategory[] = [
  mkCat(1, 'Gaming', 'Gaming'),
  mkCat(2, 'Fitness', 'Fitness'),
  mkCat(3, 'Cooking', 'Cooking'),
  mkCat(4, 'Travel', 'Travel'),
]

const TS = '2026-07-14T16:47:10.482Z'
const mkQ = (
  cat: number,
  n: number,
  message: string,
  chips: string[],
  over: Partial<CoachQuestion> = {},
): CoachQuestion => ({
  id: `q${cat}-${n}`,
  categoryId: catId(cat),
  questionNumber: n,
  message,
  chips,
  multiSelect: over.multiSelect ?? chips.length > 3,
  isActive: over.isActive ?? true,
  createdAt: TS,
  updatedAt: TS,
})

/**
 * Question banks.
 *
 * Cooking is deliberately **incomplete** — Q3 inactive and Q5 absent, so
 * `isReady: false` with `missingQuestionNumbers: [3, 5]`. Every one of the 18
 * live categories is currently ready, so this is the only place the incomplete
 * path can be exercised at all.
 */
const QUESTIONS: Record<string, CoachQuestion[]> = {
  [catId(1)]: [
    mkQ(1, 1, 'Which games do you mainly create content for?', ['Valorant', 'Fortnite', 'CS2', 'Apex Legends', 'FIFA', 'Minecraft', 'Other']),
    mkQ(1, 2, 'What kind of clips perform best for you?', ['Highlights', 'Funny moments', 'Tutorials', 'Rage clips']),
    mkQ(1, 3, 'How often do you post?', ['Daily', 'A few times a week', 'Weekly'], { multiSelect: false }),
    mkQ(1, 4, 'Who is your audience?', ['18–24', '25–34', '35+'], { multiSelect: false }),
    mkQ(1, 5, 'Which platform matters most?', ['TikTok', 'YouTube', 'Instagram', 'Twitch']),
  ],
  [catId(2)]: [
    mkQ(2, 1, 'Which training styles do you cover?', ['Strength', 'Hypertrophy', 'Running', 'Mobility', 'HIIT']),
    mkQ(2, 2, 'What format do you post most?', ['Form checks', 'Programmes', 'Day in the life']),
    mkQ(2, 3, 'How experienced is your audience?', ['Beginner', 'Intermediate', 'Advanced'], { multiSelect: false }),
    mkQ(2, 4, 'Do you sell coaching?', ['Yes', 'Not yet'], { multiSelect: false }),
    mkQ(2, 5, 'Which platform matters most?', ['Instagram', 'YouTube', 'TikTok']),
  ],
  [catId(3)]: [
    mkQ(3, 1, 'Which cuisines do you focus on?', ['Italian', 'Japanese', 'Mexican', 'Baking']),
    mkQ(3, 2, 'How long are your recipes?', ['Under 15 min', '30 min', 'Slow cook'], { multiSelect: false }),
    // Inactive → Q3 counts as missing even though a row exists.
    mkQ(3, 3, 'Do you shoot in a studio or home kitchen?', ['Studio', 'Home'], { multiSelect: false, isActive: false }),
    mkQ(3, 4, 'Who are you cooking for?', ['Families', 'Solo', 'Meal prep']),
    // No Q5 at all.
  ],
  [catId(4)]: [
    mkQ(4, 1, 'Which destinations do you cover?', ['Europe', 'Asia', 'Americas', 'Africa']),
    mkQ(4, 2, 'What is your travel style?', ['Budget', 'Luxury', 'Backpacking']),
    mkQ(4, 3, 'Do you travel solo?', ['Solo', 'Partner', 'Family'], { multiSelect: false }),
    mkQ(4, 4, 'How long are your trips?', ['Weekend', '1–2 weeks', 'Long haul'], { multiSelect: false }),
    mkQ(4, 5, 'Which platform matters most?', ['Instagram', 'YouTube', 'TikTok']),
  ],
}

/** Mirrors the readiness the gateway computes, so the UI is never reading
    numbers the mock invented independently of its own question rows. */
function withReadiness(c: CoachCategory): CoachCategory {
  const list = QUESTIONS[c.id] ?? []
  const activeNumbers = new Set(list.filter((q) => q.isActive).map((q) => q.questionNumber))
  const missing: number[] = []
  for (let n = 1; n <= 5; n++) if (!activeNumbers.has(n)) missing.push(n)
  return {
    ...c,
    questionCount: list.length,
    requiredQuestionCount: 5,
    activeQuestionCount: activeNumbers.size,
    isReady: missing.length === 0,
    missingQuestionNumbers: missing,
  }
}

/** Mock-only: simulate the server-side clamping that makes the post-save
    read-back (`GET /admin/plans/:plan`) worth doing. Real ceilings are backend
    policy — this just proves the FE reports an adjustment truthfully. */
const CLAMP_MAX: Partial<Record<keyof PlanLimits, number>> = {
  dailyImageGenerations: 1000,
  dailyUploadLimit: 1000,
  maxReferenceImages: 10,
  maxUploadSizeMb: 5000,
}

function clampPlan(body: Partial<PlanLimits>): Partial<PlanLimits> {
  const out = { ...body } as Record<string, unknown>
  for (const [key, max] of Object.entries(CLAMP_MAX)) {
    const v = out[key]
    if (typeof v !== 'number') continue
    if (v > max) out[key] = max
    else if (v < -1) out[key] = -1 // -1 = unlimited; anything lower is invalid
  }
  return out as Partial<PlanLimits>
}

export const configHandlers = [
  http.get('*/admin/plans', () => HttpResponse.json(PLANS)),
  /** Single-plan read — used as the authoritative post-save read-back. */
  http.get('*/admin/plans/:plan', ({ params }) => {
    const found = PLANS.find((p) => p.plan === params.plan)
    return found ? HttpResponse.json(found) : new HttpResponse(null, { status: 404 })
  }),
  http.put('*/admin/plans/:plan', async ({ params, request }) => {
    const body = (await request.json()) as Partial<PlanLimits>
    PLANS = PLANS.map((p) =>
      p.plan === params.plan
        ? { ...p, ...clampPlan(body), updatedAt: '2026-08-25T00:00:00.000Z' }
        : p,
    )
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('*/admin/coach/categories', ({ request }) => {
    const activeOnly = new URL(request.url).searchParams.get('activeOnly') === 'true'
    const list = activeOnly ? CATEGORIES.filter((c) => c.isActive) : CATEGORIES
    return HttpResponse.json(list.map(withReadiness))
  }),
  http.post('*/admin/coach/categories', async ({ request }) => {
    const body = (await request.json()) as Partial<CoachCategory>
    // Mirror the gateway's validation, re-verified live 2026-09-09. Without
    // this the mock accepted anything and hid a real 400.
    //
    // The slug rule was relaxed server-side after 2026-08-26: mixed case and
    // snake_case are now valid, so "Gaming" and "UPPER_SNAKE" pass and only a
    // separator violation (e.g. a space) fails. Kept in step with the live
    // message so the suite cannot drift back.
    const errors: string[] = []
    const slug = body.slug ?? ''
    if (!/^[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*$/.test(slug)) {
      errors.push('slug must be alphanumeric (kebab-case, snake_case, or PascalCase)')
    }
    if (slug.length < 2) errors.push('slug must be longer than or equal to 2 characters')
    if (slug.length > 64) errors.push('slug must be shorter than or equal to 64 characters')
    if (!body.label?.trim()) errors.push('label must be longer than or equal to 1 characters')
    if (!body.progressLabel?.trim())
      errors.push('progressLabel must be longer than or equal to 1 characters')
    if (!body.openingMessage?.trim())
      errors.push('openingMessage must be longer than or equal to 1 characters')
    if (errors.length > 0) {
      return HttpResponse.json(
        { message: errors, error: 'Bad Request', statusCode: 400 },
        { status: 400 },
      )
    }
    const id = `a1000000-0000-4000-8000-9000000000${(CATEGORIES.length + 1).toString().padStart(2, '0')}`
    CATEGORIES = [
      ...CATEGORIES,
      {
        id,
        slug: body.slug ?? 'new',
        label: body.label ?? 'New',
        openingMessage: body.openingMessage ?? '',
        progressLabel: body.progressLabel ?? '',
        sortOrder: body.sortOrder ?? CATEGORIES.length + 1,
        isActive: body.isActive ?? true,
        questionCount: 0,
        createdAt: '2026-08-07T00:00:00.000Z',
        updatedAt: '2026-08-07T00:00:00.000Z',
      },
    ]
    return HttpResponse.json({ id }, { status: 201 })
  }),
  /** Bulk picker order. Registered before `/categories/:id` so `reorder` is not
      swallowed as an id — the same ordering the gateway relies on. */
  http.patch('*/admin/coach/categories/reorder', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as {
      items?: { id: string; sortOrder: number }[]
    } | null
    const items = body?.items
    if (!Array.isArray(items) || items.length === 0) {
      return HttpResponse.json(
        { message: ['items must contain at least 1 elements'], error: 'Bad Request', statusCode: 400 },
        { status: 400 },
      )
    }
    const next = new Map(items.map((i) => [i.id, i.sortOrder]))
    CATEGORIES = CATEGORIES.map((c) => (next.has(c.id) ? { ...c, sortOrder: next.get(c.id)! } : c))
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('*/admin/coach/categories/:id', ({ params }) => {
    const found = CATEGORIES.find((c) => c.id === params.id)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      ...withReadiness(found),
      questions: QUESTIONS[found.id] ?? [],
    })
  }),

  http.patch('*/admin/coach/categories/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<CoachCategory>
    CATEGORIES = CATEGORIES.map((c) => (c.id === params.id ? { ...c, ...body } : c))
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('*/admin/coach/categories/:id/questions', ({ params, request }) => {
    const list = QUESTIONS[params.id as string] ?? []
    const includeInactive = new URL(request.url).searchParams.get('includeInactive') === 'true'
    return HttpResponse.json(includeInactive ? list : list.filter((q) => q.isActive))
  }),

  /**
   * Bulk upsert — the only route that can change a question's text.
   *
   * Mirrors the live validation (`questions` must be an array of 1–20) and the
   * `deactivateMissing` semantics, because that flag is the dangerous part: with
   * `true`, any question absent from the payload is switched off. The mock has
   * to behave the same way or the FE's safeguard is never actually tested.
   */
  http.put('*/admin/coach/categories/:id/questions', async ({ params, request }) => {
    const id = params.id as string
    const body = (await request.json().catch(() => null)) as {
      deactivateMissing?: boolean
      questions?: Partial<CoachQuestion>[]
    } | null
    const incoming = body?.questions

    const errors: string[] = []
    if (!Array.isArray(incoming)) errors.push('questions must be an array')
    else {
      if (incoming.length < 1) errors.push('questions must contain at least 1 elements')
      if (incoming.length > 20) errors.push('questions must contain no more than 20 elements')
      const seen = new Set<number>()
      for (const q of incoming) {
        if (typeof q.questionNumber !== 'number' || q.questionNumber < 1) {
          errors.push('questionNumber must not be less than 1')
        } else if (seen.has(q.questionNumber)) {
          // Live answers 409 on a duplicate within a category.
          return HttpResponse.json(
            { message: `duplicate questionNumber ${q.questionNumber}`, statusCode: 409 },
            { status: 409 },
          )
        } else {
          seen.add(q.questionNumber)
        }
        if (!q.message?.trim()) errors.push('message must be longer than or equal to 1 characters')
      }
    }
    if (errors.length > 0) {
      return HttpResponse.json({ message: errors, error: 'Bad Request', statusCode: 400 }, { status: 400 })
    }

    const list = QUESTIONS[id] ?? (QUESTIONS[id] = [])
    for (const q of incoming!) {
      const existing = list.find((x) => x.questionNumber === q.questionNumber)
      if (existing) {
        existing.message = q.message ?? existing.message
        existing.chips = q.chips ?? existing.chips
        existing.multiSelect = q.multiSelect ?? existing.multiSelect
        existing.isActive = q.isActive ?? existing.isActive
        existing.updatedAt = new Date().toISOString()
      } else {
        list.push({
          id: `q${id.slice(-4)}-n${q.questionNumber}`,
          categoryId: id,
          questionNumber: q.questionNumber!,
          message: q.message ?? '',
          chips: q.chips ?? [],
          multiSelect: q.multiSelect ?? false,
          isActive: q.isActive ?? true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    }
    if (body?.deactivateMissing) {
      const sent = new Set(incoming!.map((q) => q.questionNumber))
      for (const q of list) if (!sent.has(q.questionNumber)) q.isActive = false
    }
    list.sort((a, b) => a.questionNumber - b.questionNumber)
    return new HttpResponse(null, { status: 204 })
  }),
  http.post('*/admin/coach/categories/:id/questions', async ({ params, request }) => {
    const id = params.id as string
    const body = (await request.json()) as Partial<CoachQuestion>
    const list = QUESTIONS[id] ?? (QUESTIONS[id] = [])
    list.push({
      id: `q${id.slice(-4)}-${list.length + 1}`,
      categoryId: id,
      questionNumber: body.questionNumber ?? list.length + 1,
      message: body.message ?? '',
      chips: body.chips ?? [],
      multiSelect: body.multiSelect ?? false,
      isActive: body.isActive ?? true,
      createdAt: '2026-08-07T00:00:00.000Z',
      updatedAt: '2026-08-07T00:00:00.000Z',
    })
    // questionCount is derived by `withReadiness` on read, so nothing to sync here.
    return HttpResponse.json({ ok: true }, { status: 201 })
  }),
  http.patch('*/admin/coach/questions/:id', async ({ params, request }) => {
    const body = (await request.json()) as { isActive?: boolean }
    for (const list of Object.values(QUESTIONS)) {
      const q = list.find((x) => x.id === params.id)
      if (q && body.isActive !== undefined) q.isActive = body.isActive
    }
    return new HttpResponse(null, { status: 204 })
  }),
]
