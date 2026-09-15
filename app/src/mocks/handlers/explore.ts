import { http, HttpResponse } from 'msw'
import type { Projection } from '@/features/explore/api/schemas'

/** Creator-directory ids, so names resolve in the table and inspector. */
const USERS = ['usr-001', 'usr-003', 'usr-005', 'usr-002', 'usr-004']

const TITLES = [
  'Aurora timelapse over fjords',
  'Neon skyline remix',
  'Speedrun world record clutch',
  'Golden-hour rooftop portrait',
  'Desert dunes at dawn',
  'Patch notes reaction',
  'Cooking short — 60s ramen',
  'Tournament grand final edit',
  'Pixel city loop',
  'Studio launch key visual',
  'Boss fight highlight',
  'Travel vlog teaser',
]

const PROJECTIONS: Projection[] = TITLES.map((title, i) => {
  const likeCount = Math.round(4000 / (i + 1) + 40)
  const commentCount = Math.round(likeCount * 0.15)
  const wesScore = Math.round((likeCount * 2 + commentCount * 3) / 10 + (12 - i) * 5)
  return {
    contentId: `019f${(i + 30).toString(16)}-${(700 + i * 9).toString(16)}-7673-90d3-ea4910fdedc7`,
    userId: USERS[i % USERS.length],
    title,
    contentType: i % 3 === 0 ? 'clip' : 'image',
    wesScore,
    socialRollup: i % 4 === 0 ? 'live' : 'idle',
    hasLiveExternal: i % 4 === 0,
    likeCount,
    commentCount,
    publishedAt: `2026-08-0${(i % 4) + 1}T1${i % 9}:00:00.000Z`,
    createdAt: `2026-08-0${(i % 4) + 1}T0${i % 9}:00:00.000Z`,
  }
})

/** Deliberate outliers: WES and raw engagement disagree, which is the whole
    point of auditing the ranking. Without these the mock correlation is ~1.00
    and the scatter looks meaningful while proving nothing. */
const DIVERGENT: Projection[] = [
  {
    contentId: '019fdiv-1-7673-90d3-ea4910fdedc1',
    userId: 'usr-002',
    title: 'Fresh drop — ranked high, barely seen yet',
    contentType: 'image',
    wesScore: 690, // top-tier WES …
    socialRollup: 'live',
    hasLiveExternal: true,
    likeCount: 120, // … on very little engagement
    commentCount: 4,
    publishedAt: '2026-08-25T09:00:00.000Z',
    createdAt: '2026-08-25T08:00:00.000Z',
  },
  {
    contentId: '019fdiv-2-7673-90d3-ea4910fdedc2',
    userId: 'usr-004',
    title: 'Old favourite — loved, ranked low',
    contentType: 'clip',
    wesScore: 95, // low WES …
    socialRollup: 'idle',
    hasLiveExternal: false,
    likeCount: 3800, // … on huge engagement
    commentCount: 610,
    publishedAt: '2026-05-02T09:00:00.000Z',
    createdAt: '2026-05-01T08:00:00.000Z',
  },
  {
    contentId: '019fdiv-3-7673-90d3-ea4910fdedc3',
    userId: 'usr-005',
    title: 'Comment magnet, few likes',
    contentType: 'image',
    wesScore: 340,
    socialRollup: 'idle',
    hasLiveExternal: false,
    likeCount: 260,
    commentCount: 480,
    publishedAt: '2026-07-18T09:00:00.000Z',
    createdAt: '2026-07-17T08:00:00.000Z',
  },
]

/** What the gateway returns: seeded ranking plus the divergent cases. */
const ALL_PROJECTIONS: Projection[] = [...PROJECTIONS, ...DIVERGENT].sort(
  (a, b) => b.wesScore - a.wesScore,
)

export const exploreHandlers = [
  http.get('*/admin/explore', () => {
    // Live payload is a flat { items } with no totals / cursor.
    return HttpResponse.json({ items: ALL_PROJECTIONS })
  }),
]
