import { http, HttpResponse } from 'msw'
import { paginate } from '@/mocks/paginate'
import type { Creator } from '@/features/creators/api/schemas'

const seed: Array<Partial<Creator> & Pick<Creator, 'username' | 'displayName' | 'plan'>> = [
  { username: 'sarah_k', displayName: 'Sarah Khan', plan: 'PRO', contentCount: 42, roles: ['admin', 'creator'] },
  { username: 'jmiller', displayName: 'John Miller', plan: 'FREE', contentCount: 8 },
  { username: 'emcarter', displayName: 'Emily Carter', plan: 'STUDIO', contentCount: 130 },
  { username: 'dlee', displayName: 'David Lee', plan: 'FREE', contentCount: 3, isActive: false },
  { username: 'obrown', displayName: 'Olivia Brown', plan: 'PRO', contentCount: 57 },
  { username: 'ewilson', displayName: 'Ethan Wilson', plan: 'FREE', contentCount: 0, onboardingCompleted: false },
  { username: 'amorgan', displayName: 'Alex Morgan', plan: 'PRO', contentCount: 21 },
  { username: 'sophiam', displayName: 'Sophia Martinez', plan: 'STUDIO', contentCount: 88 },
  { username: 'liam_a', displayName: 'Liam Anderson', plan: 'FREE', contentCount: 12, isActive: false },
  { username: 'ava_j', displayName: 'Ava Johnson', plan: 'PRO', contentCount: 34 },
  { username: 'noah_w', displayName: 'Noah Williams', plan: 'FREE', contentCount: 5, emailVerified: false },
  { username: 'mia_d', displayName: 'Mia Davis', plan: 'STUDIO', contentCount: 64 },
  { username: 'guy_h', displayName: 'Guy Hawkins', plan: 'FREE', contentCount: 1, onboardingCompleted: false },
  { username: 'albert_f', displayName: 'Albert Flores', plan: 'PRO', contentCount: 29 },

  // One deliberately well-populated signup month, so the cohort-conversion chart
  // has at least one cohort at or above MIN_COHORT. Without it every cohort here
  // holds one or two accounts, the chart correctly refuses to draw, and the
  // solid-vs-muted distinction is never exercised. Placed ~150 days back: far
  // outside the 7d and 30d prior-comparison windows, so the signup-delta
  // fixtures are untouched.
  { username: 'nina_v', displayName: 'Nina Vega', plan: 'PRO', contentCount: 18 },
  { username: 'omar_s', displayName: 'Omar Saleh', plan: 'FREE', contentCount: 4 },
  { username: 'priya_r', displayName: 'Priya Rao', plan: 'STUDIO', contentCount: 71 },
  { username: 'tom_b', displayName: 'Tom Bennett', plan: 'FREE', contentCount: 2 },
  { username: 'lena_k', displayName: 'Lena Kowal', plan: 'FREE', contentCount: 9 },
]

/** Signup ages in days, aligned to `seed` order and shaped as a growth curve:
    FREE accounts are the oldest, paid plans arrive later, so the overview charts
    show rising volume *and* a rising paid share. Relative to run time — fixed
    dates would drift out of the 7d/30d windows and silently read as zero. */
const SIGNUP_DAYS_AGO: Record<string, number> = {
  jmiller: 198,
  dlee: 167,
  ewilson: 145,
  liam_a: 130,
  noah_w: 112,
  guy_h: 96,
  sarah_k: 82,
  obrown: 67,
  emcarter: 49,
  amorgan: 42,
  albert_f: 29,
  sophiam: 24,
  ava_j: 16,
  mia_d: 8,

  // The populated cohort: five accounts inside one calendar month, two of them
  // paid, so that bar shows a readable ~40–50% against the thin ones.
  nina_v: 152,
  omar_s: 154,
  priya_r: 156,
  tom_b: 158,
  lena_k: 160,
}

const DAY_MS = 86_400_000
const NOW = Date.now()
const daysAgoIso = (d: number) => new Date(NOW - d * DAY_MS).toISOString()

let CREATORS: Creator[] = seed.map((s, i) => ({
  id: `usr-${(i + 1).toString().padStart(3, '0')}`,
  email: `${s.username}@example.com`,
  plan: s.plan,
  username: s.username,
  displayName: s.displayName,
  roles: s.roles ?? ['creator'],
  isActive: s.isActive ?? true,
  emailVerified: s.emailVerified ?? true,
  onboardingCompleted: s.onboardingCompleted ?? true,
  contentCount: s.contentCount ?? 0,
  createdAt: daysAgoIso(SIGNUP_DAYS_AGO[s.username] ?? 200),
}))

/** Signups within the last `days` — counted, not hardcoded, so the tile figure
    and its period-over-period comparison come from one source. */
const signupsWithin = (days: number) =>
  CREATORS.filter((c) => new Date(c.createdAt).getTime() >= NOW - days * DAY_MS)

const countByPlan = (list: Creator[]) => ({
  FREE: list.filter((c) => c.plan === 'FREE').length,
  PRO: list.filter((c) => c.plan === 'PRO').length,
  STUDIO: list.filter((c) => c.plan === 'STUDIO').length,
})

export const creatorsHandlers = [
  http.get('*/admin/users/stats', ({ request }) => {
    const active = CREATORS.filter((c) => c.isActive)
    // Honour from/to like the gateway: signups.inRange is a server-side count,
    // which is what makes period-over-period authoritative rather than derived.
    const url = new URL(request.url)
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    const inWindow =
      from && to
        ? CREATORS.filter((u) => u.createdAt >= from && u.createdAt < to)
        : null
    const ranged =
      inWindow === null
        ? {}
        : { inRange: inWindow.length, byPlanInRange: countByPlan(inWindow) }
    return HttpResponse.json({
      totalUsers: CREATORS.length,
      activeUsers: active.length,
      byPlan: countByPlan(CREATORS),
      signups: {
        last7d: signupsWithin(7).length,
        last30d: signupsWithin(30).length,
        byPlanLast7d: countByPlan(signupsWithin(7)),
        byPlanLast30d: countByPlan(signupsWithin(30)),
        ...ranged,
      },
    })
  }),

  http.get('*/admin/users', ({ request }) => {
    const url = new URL(request.url)
    const q = (url.searchParams.get('q') ?? '').toLowerCase()
    const status = url.searchParams.get('status') ?? 'all'
    let items = CREATORS
    if (q) {
      items = items.filter(
        (c) =>
          c.email.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q) ||
          c.displayName.toLowerCase().includes(q),
      )
    }
    if (status === 'active') items = items.filter((c) => c.isActive)
    if (status === 'suspended') items = items.filter((c) => !c.isActive)
    // Mirror live: the list DTO omits contentCount / emailVerified. They come
    // from GET /admin/users/:id (see creatorDetailSchema).
    const listItems = items.map(({ contentCount: _c, emailVerified: _e, ...rest }) => rest)
    return HttpResponse.json(paginate(listItems, url, 8))
  }),

  /** Detail route — the only source of contentCount / emailVerified. */
  http.get('*/admin/users/:id', ({ params }) => {
    const creator = CREATORS.find((c) => c.id === params.id)
    if (!creator) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(creator)
  }),

  http.patch('*/admin/users/:id/active', async ({ params, request }) => {
    const body = (await request.json().catch(() => ({}))) as { isActive?: boolean }
    CREATORS = CREATORS.map((c) =>
      c.id === params.id ? { ...c, isActive: body.isActive ?? c.isActive } : c,
    )
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('*/admin/users/:id/reset-onboarding', ({ params }) => {
    CREATORS = CREATORS.map((c) =>
      c.id === params.id ? { ...c, onboardingCompleted: false } : c,
    )
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('*/admin/users/:id/roles', ({ params }) => {
    CREATORS = CREATORS.map((c) =>
      c.id === params.id && !c.roles.includes('admin')
        ? { ...c, roles: [...c.roles, 'admin'] }
        : c,
    )
    return new HttpResponse(null, { status: 204 })
  }),
]
