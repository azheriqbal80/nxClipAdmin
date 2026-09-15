import type { OverviewSnapshot } from './data'

export const number = (value: number) => value.toLocaleString('en-US')
export const currency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export function exportOverview(data: OverviewSnapshot, rows: OverviewSnapshot['recent'], includeSummary: boolean) {
  const moderation = Object.values(data.moderation).reduce((sum, value) => sum + value, 0)
  const depth = Object.values(data.queues).reduce((sum, value) => sum + value, 0)
  const stats = data.userStats
  const summary = includeSummary ? [
    ['Metric', 'Value'], ['In moderation', String(moderation)], ['Queue depth', String(depth)], ['Failed jobs', String(data.failedJobs.count)], ['Spend 30d (USD)', String(data.cost.spend30dUsd)],
    ['Total users', String(stats.totalUsers)], ['Active users', String(stats.activeUsers)], ['Suspended accounts', String(stats.totalUsers - stats.activeUsers)],
    ['New users 7d', String(stats.signups.last7d)], ['Prior 7d', String(data.priorSignups.prior7d)], ['New users 30d', String(stats.signups.last30d)], ['Prior 30d', String(data.priorSignups.prior30d)],
    ...(['FREE', 'PRO', 'STUDIO'] as const).map(plan => [plan, String(stats.byPlan[plan]), `New / 30d: ${stats.signups.byPlanLast30d[plan]}`]), [],
  ] : []
  const csv = [['Illustrative overview snapshot', 'Sep 10, 2026'], ...summary, ['ID', 'Content', 'Creator', 'Status', 'Created'], ...rows.map(row => [row.id, row.title, row.creator, row.status, row.time])].map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = includeSummary ? 'nxclip-overview-complete-report.csv' : 'nxclip-overview-moderation.csv'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

