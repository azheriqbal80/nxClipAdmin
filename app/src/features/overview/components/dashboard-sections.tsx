import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Compass, Info, LoaderCircle, RefreshCw, ShieldCheck, TriangleAlert, Users, Workflow } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { growthDelta, paidByCohort, paidSharePct, periodDelta, signupSeries, windowLabel } from '@/features/overview/api/analytics'
import { Link } from '@tanstack/react-router'
import { Panel } from '@/components/panel'
import { AXIS_PROPS, CHART_BAR_RADIUS, CURSOR_FILL, GRID_PROPS, REFERENCE_LINE_PROPS } from '@/components/chart-theme'
import { ChartTooltipSurface } from '@/components/chart-tooltip'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { DirectoryUser, UserStats } from '../api/queries'
import { PLAN_COLORS, chartUsers, dateTime, number, type ChartWindow, type DataState } from '../api/presentation'



export { Panel } from '@/components/panel'

export function DataPlaceholder({ state, emptyText, onRetry }: { state: DataState; emptyText: string; onRetry: () => void }) {
  return <div className="overview-data-placeholder" role={state === 'unavailable' ? 'alert' : 'status'}>
    {state === 'loading' ? <><LoaderCircle className="overview-loading-icon" size={20} /><strong>Loading snapshot…</strong><span>Bringing your overview together.</span></>
      : state === 'unavailable' ? <><TriangleAlert size={20} /><strong>Data unavailable</strong><span>We couldn’t load this part of your overview.</span><Button type="button" variant="link" size="sm" className="example-text-button h-auto p-0" onClick={onRetry}><RefreshCw size={14} />Try again</Button></>
        : <><CheckCircle2 size={20} /><strong>{emptyText}</strong><span>New activity will appear here when it’s available.</span></>}
  </div>
}

export function OperationalMetric({ label, value, icon, badge, detail, action, tone = 'neutral', state, onRetry }: {
  label: string; value: string; icon: ReactNode; badge: string; detail: ReactNode; action: () => void;
  tone?: 'neutral' | 'warning' | 'danger' | 'success'; state: DataState; onRetry: () => void
}) {
  return <Panel as="section" className={`example-metric overview-operation-metric overview-metric-${tone}`}>
    <div className="example-metric-label"><h2>{label}</h2>{icon}</div>
    <div className="overview-metric-main"><strong>{state === 'ready' ? value : '—'}</strong><span className={`overview-metric-badge ${state === 'ready' ? tone : 'neutral'}`}>{state === 'loading' ? 'Loading' : state === 'unavailable' ? 'Unavailable' : badge}</span></div>
    <div className="overview-metric-detail">{state === 'loading' ? <span className="overview-skeleton-line" /> : state === 'unavailable' ? <Button type="button" variant="link" size="sm" className="example-text-button h-auto p-0" onClick={onRetry}>Retry snapshot <RefreshCw size={12} /></Button> : detail}</div>
    <Button type="button" variant="ghost" className="overview-metric-link h-auto justify-between p-0 hover:bg-transparent" onClick={action} aria-label={`View ${label.toLowerCase()}`} disabled={state !== 'ready'}>{label === 'Spend (30d)' ? 'View cost summary' : 'View details'}<ArrowUpRight size={13} /></Button>
  </Panel>
}

function SignupDelta({ current, previous, window }: { current: number; previous: number | null | undefined; window: string }) {
  const change = periodDelta(current, previous, window)
  return <span className={`overview-signup-delta ${change.tone === 'success' ? 'example-positive' : change.tone === 'danger' ? 'example-negative' : ''}`}>
    {change.tone === 'success' ? <ArrowUpRight size={13} /> : change.tone === 'danger' ? <ArrowDownRight size={13} /> : null}{change.label}
  </span>
}

export function UsersAndPlans({ data, state, onRetry, updatedAt, priorState = 'ready', onRetryPrior = onRetry }: {
  data?: { userStats: UserStats; priorSignups?: { prior7d: number | null; prior30d: number | null } }
  state: DataState; onRetry: () => void; updatedAt?: number; priorState?: DataState; onRetryPrior?: () => void
}) {
  const stats = data?.userStats
  const total = stats?.totalUsers ?? 0
  const suspended = total - (stats?.activeUsers ?? 0)
  const planItems = (['FREE', 'PRO', 'STUDIO'] as const).map(plan => ({ name: plan, value: stats?.byPlan[plan] ?? 0, color: PLAN_COLORS[plan] }))
  const paid = state !== 'ready' ? null : paidSharePct(stats?.byPlan ?? { FREE: 0, PRO: 0, STUDIO: 0 }, total)
  return <section id="overview-users" className="overview-user-section" aria-labelledby="overview-users-heading">
    <div className="overview-section-heading"><div><h2 id="overview-users-heading">Users & subscriptions</h2><p>Your community, account activity, and plan mix.</p></div><Link to="/creators" className="example-text-button">Manage creators <ArrowUpRight size={14} /></Link></div>
    <div className="overview-user-grid">
      <section className="example-panel overview-user-summary" aria-label="User statistics">
        {state !== 'ready' || !data ? <DataPlaceholder state={state} emptyText="No users yet" onRetry={onRetry} /> : <>
          <div className="overview-user-stats">
            <div><span>Total users</span><strong>{number(total)}</strong><p><i className="overview-live-dot" />{number(stats!.activeUsers)} active accounts</p></div>
            <div><span>New users (7d)</span><strong>{number(stats!.signups.last7d)}</strong><SignupDelta current={stats!.signups.last7d} previous={data.priorSignups?.prior7d} window="7d" /></div>
            <div><span>New users (30d)</span><strong>{number(stats!.signups.last30d)}</strong><SignupDelta current={stats!.signups.last30d} previous={data.priorSignups?.prior30d} window="30d" /></div>
            <div><span>Suspended accounts</span><strong>{number(suspended)}</strong><p>{total ? `${(suspended / total * 100).toFixed(1)}% of registered accounts` : 'No suspended accounts'}</p></div>
          </div>
          <div className="overview-account-footer"><span><Users size={14} />{total ? `${(stats!.activeUsers / total * 100).toFixed(1)}% of accounts are active` : 'No registered users yet'}</span><span>{priorState === 'unavailable' ? <Button type="button" variant="link" size="sm" className="example-text-button h-auto p-0" onClick={onRetryPrior}>Retry signup comparisons</Button> : priorState === 'loading' ? 'Loading signup comparisons…' : updatedAt ? `Updated ${dateTime(updatedAt)}` : 'Account snapshot'}</span></div>
        </>}
      </section>
      <Panel title="Plan distribution" action={<span className="overview-plan-paid">{paid === null ? '—' : `${paid}%`}<span>paid overall</span></span>} className="overview-plan-panel">
        {state !== 'ready' || !total ? <DataPlaceholder state={state} emptyText="No subscriptions yet" onRetry={onRetry} /> : <>
          <div className="overview-plan-content"><div className="overview-plan-donut" role="img" aria-label={`${number(total)} users: ${planItems.map(plan => `${plan.name} ${plan.value}`).join(', ')}.`}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}><PieChart><Pie data={planItems} dataKey="value" innerRadius="70%" outerRadius="96%" startAngle={90} endAngle={-270} paddingAngle={3} stroke="none" isAnimationActive={false}>{planItems.map(plan => <Cell key={plan.name} fill={plan.color} />)}</Pie></PieChart></ResponsiveContainer>
            <div className="example-donut-label"><strong>{number(total)}</strong><span>users</span></div>
          </div><div className="overview-plan-breakdown"><div className="overview-plan-labels"><span>Plan</span><span>Total</span><span>New / 30d</span></div>{planItems.map(plan => <div key={plan.name}><span><i style={{ background: plan.color }} />{plan.name.charAt(0) + plan.name.slice(1).toLowerCase()}</span><strong>{number(plan.value)}</strong><small>+{stats!.signups.byPlanLast30d[plan.name]}</small></div>)}</div></div>
          <div className="overview-plan-footnote">Plan counts reflect each user’s current plan.</div>
        </>}
      </Panel>
    </div>
  </section>
}

function SignupTooltip({ active, payload }: { active?: boolean; payload?: { payload: { labelLong: string; total?: number; FREE?: number; PRO?: number; STUDIO?: number; size?: number; paid?: number; paidPct?: number | null; thin?: boolean } }[] }) {
  const row = payload?.[0]?.payload
  if (!active || !row) return null
  return <ChartTooltipSurface title={row.labelLong} className="example-tooltip">{row.size !== undefined ? <><div><span>Paid today</span><b>{row.paid} / {row.size}</b></div><div><span>Paid share</span><b>{row.paidPct === null ? 'No cohort' : `${row.paidPct}%`}</b></div>{row.thin && <p>Small cohort · fewer than 5 users</p>}</> : <>{(['FREE', 'PRO', 'STUDIO'] as const).map(plan => <div key={plan}><span>{plan}</span><b>{row[plan]}</b></div>)}<div><span>Total</span><b>{row.total}</b></div></>}</ChartTooltipSurface>
}

export function GrowthCharts({ data, state, window, onWindowChange, onRetry, now = Date.now(), statsState = 'ready' }: {
  data?: { directory: { items: DirectoryUser[]; nextCursor?: string | null }; userStats?: UserStats }
  state: DataState; window: ChartWindow; onWindowChange: (value: ChartWindow) => void; onRetry: () => void
  now?: number; statsState?: DataState
}) {
  const users = chartUsers(data?.directory.items ?? [], window, now)
  const series = signupSeries(users)
  const cohorts = paidByCohort(series)
  const overall = data?.userStats && statsState === 'ready' ? paidSharePct(data.userStats.byPlan, data.userStats.totalUsers) : null
  const delta = series ? growthDelta(series.buckets) : null
  const thin = cohorts.filter(cohort => cohort.thin).length
  const nonempty = cohorts.filter(cohort => cohort.paidPct !== null)
  const allThin = nonempty.length > 0 && nonempty.every(cohort => cohort.thin)
  return <section id="overview-growth" className="overview-growth-section" aria-labelledby="overview-growth-heading">
    <div className="overview-section-heading"><div><h2 id="overview-growth-heading">Growth & paid adoption</h2><p>Understand who’s joining and which cohorts are on a paid plan today.</p></div><label className="example-small-select"><span className="sr-only">Chart window</span><Select value={window} onValueChange={value => onWindowChange(value as ChartWindow)}><SelectTrigger aria-label="Chart window" size="sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Loaded history</SelectItem><SelectItem value="30d">Last 30 days</SelectItem><SelectItem value="7d">Last 7 days</SelectItem></SelectContent></Select></label></div>
    <div className="overview-growth-grid">
      <Panel title="New accounts" description="Signup volume, split by current plan" action={<div className="overview-chart-total"><strong>{state === 'ready' ? number(users.length) : '—'}</strong><span>in chart sample</span></div>}>
        {state !== 'ready' || !series ? <DataPlaceholder state={state} emptyText="Not enough accounts to chart growth" onRetry={onRetry} /> : <>
          <div className="overview-chart-legend">{Object.entries(PLAN_COLORS).map(([plan, color]) => <span key={plan}><i style={{ background: color }} />{plan.charAt(0) + plan.slice(1).toLowerCase()}</span>)}</div>
          <div className="overview-growth-chart" role="img" aria-label={`New accounts per ${series.granularity}, split by each account\u0027s current plan. ${users.length} sampled signups across ${series.buckets.length} ${series.granularity}s. This is a loaded sample, not the total user base.`}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}><BarChart data={series.buckets} margin={{ top: 8, right: 8, left: -25, bottom: 0 }} accessibilityLayer>
              <CartesianGrid {...GRID_PROPS} /><XAxis {...AXIS_PROPS} dataKey="label" tickMargin={10} interval="preserveStartEnd" minTickGap={18} /><YAxis {...AXIS_PROPS} allowDecimals={false} /><Tooltip content={<SignupTooltip />} cursor={CURSOR_FILL} />
              <Bar dataKey="FREE" stackId="plans" fill={PLAN_COLORS.FREE} maxBarSize={26} isAnimationActive={false} /><Bar dataKey="PRO" stackId="plans" fill={PLAN_COLORS.PRO} maxBarSize={26} isAnimationActive={false} /><Bar dataKey="STUDIO" stackId="plans" fill={PLAN_COLORS.STUDIO} radius={CHART_BAR_RADIUS} maxBarSize={26} isAnimationActive={false} />
            </BarChart></ResponsiveContainer>
          </div>
          <div className="overview-chart-caption"><Info size={14} /><span>{series.buckets.length} {series.granularity}s · {number(users.length)} accounts. Colors show current plans; upgrades can change past bars.{delta && <> {delta.current} signups {delta.changePct === null ? `(none in prior ${windowLabel(series.granularity, Math.floor(series.buckets.length / 2))})` : `(${delta.changePct > 0 ? '+' : ''}${delta.changePct.toFixed(0)}% vs prior ${windowLabel(series.granularity, Math.floor(series.buckets.length / 2))})`}.</>}</span></div>
        </>}
      </Panel>
      <Panel title="Paid share by signup cohort" description="PRO or STUDIO today, grouped by signup date" action={<div className="overview-chart-total"><strong>{overall !== null ? `${overall}%` : '—'}</strong><span>paid across all users</span></div>}>
        {state !== 'ready' || !series || allThin ? <DataPlaceholder state={state} emptyText={allThin ? 'Cohorts are too small to compare' : 'Not enough accounts to compare cohorts'} onRetry={onRetry} /> : <>
          <div className="overview-chart-legend"><span><i style={{ background: 'var(--brand-violet)' }} />Cohort paid share</span>{overall !== null && <span><i className="overview-dashed-key" />Overall paid share</span>}</div>
          <div className="overview-growth-chart" role="img" aria-label={`Share of each signup cohort on a paid plan today. ${overall === null ? 'Overall share unavailable.' : `${overall}% paid overall across all users.`} ${thin} small cohorts are muted. Empty periods have no percentage. Recent cohorts have had less time to convert.`}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}><BarChart data={cohorts} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} accessibilityLayer>
              <CartesianGrid {...GRID_PROPS} /><XAxis {...AXIS_PROPS} dataKey="label" tickMargin={10} interval="preserveStartEnd" minTickGap={18} /><YAxis {...AXIS_PROPS} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={value => `${value}%`} /><Tooltip content={<SignupTooltip />} cursor={CURSOR_FILL} />
              {overall !== null && <ReferenceLine y={overall} {...REFERENCE_LINE_PROPS} />}
              <Bar dataKey="paidPct" radius={CHART_BAR_RADIUS} maxBarSize={26} isAnimationActive={false}>{cohorts.map(cohort => <Cell key={cohort.labelLong} fill={cohort.thin ? 'var(--chart-muted)' : 'var(--brand-violet)'} />)}</Bar>
            </BarChart></ResponsiveContainer>
          </div>
          <div className="overview-chart-caption"><Info size={14} /><span>{nonempty.length} cohorts · {number(users.length)} accounts · paid = PRO or STUDIO today. Newest cohorts are still converting, so treat it as a floor.{thin > 0 && ` ${thin} small ${thin === 1 ? 'cohort is' : 'cohorts are'} muted.`} Empty periods remain gaps.</span></div>
        </>}
      </Panel>
    </div>
    {state === 'ready' && data && data.directory.nextCursor && <p className="overview-sample-note">Charts use a loaded sample of {data.directory.items.length} accounts; more accounts exist. User totals and signup comparisons cover all users.</p>}
  </section>
}

export function QuickLinks() {
  const modules = [
    { label: 'Content moderation', detail: 'Review and act on content', icon: ShieldCheck, href: '/moderation' as const },
    { label: 'Creator directory', detail: 'Find and manage accounts', icon: Users, href: '/creators' as const },
    { label: 'AI queues & cost', detail: 'Inspect jobs, retries, and spend', icon: Workflow, href: '/queues' as const },
    { label: 'Explore audit', detail: 'Check the public feed', icon: Compass, href: '/explore' as const },
  ]
  return <Panel title="Quick access" description="Go straight to your next task" className="overview-quick-links"><div>{modules.map(module => <Link to={module.href} key={module.href}><module.icon size={18} /><span><strong>{module.label}</strong><small>{module.detail}</small></span><ArrowUpRight size={15} /></Link>)}</div><p>Module links open the current admin console.</p></Panel>
}




