import type { DirectoryUser, OverviewRecent, UserStats } from './queries'

export type DataState = 'ready' | 'loading' | 'unavailable'
export type ChartWindow = 'all' | '7d' | '30d'
export const REVIEW_STATUSES = ['publishing', 'moderation_rejected', 'generation_failed'] as const
type ModerationPage = { items: OverviewRecent[]; nextCursor?: string | null }

export async function loadModerationSnapshot(request: (status: typeof REVIEW_STATUSES[number]) => Promise<ModerationPage>) {
  // Reject the whole moderation snapshot if any status failed; the other
  // Overview queries stay independent and remain available.
  const results = await Promise.all(REVIEW_STATUSES.map(request))
  const items = [...new Map(results.flatMap(result => result.items).map(item => [item.id, item])).values()]
    .sort((a, b) => (Date.parse(b.createdAt ?? '') || 0) - (Date.parse(a.createdAt ?? '') || 0))
  return {
    items, count: items.length, capped: results.some(result => !!result.nextCursor),
    publishing: results[0].items.length, publishingCapped: !!results[0].nextCursor,
  }
}
export const PLAN_COLORS = {
  FREE: 'var(--chart-muted)', PRO: 'var(--brand-violet)', STUDIO: 'var(--chart-teal)',
}
export const number = (value: number) => value.toLocaleString('en-US')
export const currency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
export const dateTime = (value?: string | number | null) => {
  const date = value == null ? null : new Date(value)
  return date && Number.isFinite(date.getTime())
    ? date.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Unavailable'
}
export function queryState(query: { isPending: boolean; isError: boolean }): DataState {
  return query.isPending ? 'loading' : query.isError ? 'unavailable' : 'ready'
}
export function chartUsers(users: DirectoryUser[], window: ChartWindow, now: number) {
  const from = window === 'all' ? -Infinity : now - (window === '7d' ? 7 : 30) * 86_400_000
  return users.filter(user => { const time = Date.parse(user.createdAt); return time >= from && time <= now })
}
export function recordTitle(item: Pick<OverviewRecent, 'title' | 'prompt'>) {
  return item.title?.trim() || item.prompt?.trim() || 'Untitled content'
}
export function creatorInfo(userId: string, directory: DirectoryUser[]) {
  const user = directory.find(candidate => candidate.id === userId)
  return {
    name: user?.displayName?.trim() || user?.username?.trim() || userId.slice(0, 8),
    handle: user?.username?.trim() ? `@${user.username.trim()}` : `ID · ${userId.slice(0, 8)}`,
  }
}

/** CSV cells can contain untrusted creator/content text. Prevent spreadsheet
 * formulas as well as escaping delimiters, quotes, and newlines. */
export function encodeCsv(rows: string[][]) {
  return '\uFEFF' + rows.map(row => row.map(value => {
    const safe = /^[\s]*[=+@-]|^[\t\r\n]/.test(value) ? `'${value}` : value
    return `"${safe.replaceAll('"', '""')}"`
  }).join(',')).join('\r\n')
}

export interface OverviewReport {
  capturedAt: number
  moderation?: { count: number; capped: boolean }
  queues?: { depth: number; waiting: number; active: number; delayed: number }
  failed?: { count: number; capped: boolean }
  spend?: { spend30dUsd: number; deltaPct: number }
  stats?: UserStats
  prior?: { prior7d: number | null; prior30d: number | null }
  directory?: DirectoryUser[]
}
export function overviewCsv(report: OverviewReport, items: OverviewRecent[], summary: boolean) {
  const count = (value?: { count: number; capped: boolean }) => value ? `${value.count}${value.capped ? '+' : ''}` : 'Unavailable'
  const val = (value?: number | null) => value == null ? 'Unavailable' : String(value)
  const rows = [['Overview export', new Date(report.capturedAt).toISOString()]]
  if (summary) rows.push(
    ['Metric', 'Value'], ['In moderation (loaded statuses)', count(report.moderation)],
    ['Queue depth', val(report.queues?.depth)], ['Waiting', val(report.queues?.waiting)], ['Active', val(report.queues?.active)], ['Delayed', val(report.queues?.delayed)],
    ['Failed jobs', count(report.failed)], ['Spend 30d (USD)', val(report.spend?.spend30dUsd)], ['Spend change (%)', val(report.spend?.deltaPct)],
    ['Total users', val(report.stats?.totalUsers)], ['Active users', val(report.stats?.activeUsers)],
    ['Suspended accounts', val(report.stats ? report.stats.totalUsers - report.stats.activeUsers : undefined)],
    ['New users 7d', val(report.stats?.signups.last7d)], ['Prior 7d', val(report.prior?.prior7d)],
    ['New users 30d', val(report.stats?.signups.last30d)], ['Prior 30d', val(report.prior?.prior30d)],
    ...(['FREE', 'PRO', 'STUDIO'] as const).map(plan => [plan, val(report.stats?.byPlan[plan]), 'New / 30d', val(report.stats?.signups.byPlanLast30d[plan])]),
    ['Scope', 'Moderation is a bounded status sample; unavailable metrics are explicitly marked.'], [],
  )
  rows.push(['ID', 'Content', 'Creator ID', 'Creator', 'Status', 'Created'], ...items.map(item => [
    item.id, recordTitle(item), item.userId, creatorInfo(item.userId, report.directory ?? []).name, item.status, item.createdAt ?? 'Unavailable',
  ]))
  return encodeCsv(rows)
}
export function downloadCsv(csv: string, filename: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
