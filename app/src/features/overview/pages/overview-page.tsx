import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowDownRight, ArrowUpRight, CalendarDays, Check, Download, RefreshCw, ShieldCheck, TriangleAlert, Wallet, X, Zap } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { useFailedJobs, useModerationOverview, usePriorSignups, useQueueTotals, useSpend, useUserDirectory, useUserStats } from '../api/queries'
import { currency, dateTime, downloadCsv, number, overviewCsv, queryState, type ChartWindow } from '../api/presentation'
import { DataPlaceholder, GrowthCharts, OperationalMetric, UsersAndPlans } from '../components/dashboard-sections'
import '../design/base.css'
import '../design/layout.css'
import '../design/live.css'

/** Approved Overview: operational work first, users and growth second.
 * Every card owns its query state; failed responses never become invented zeroes.
 * The authenticated AppShell owns navigation, scrolling, account and sign-out. */
export function OverviewPage() {
  const moderation = useModerationOverview()
  const queues = useQueueTotals()
  const failed = useFailedJobs()
  const spend = useSpend()
  const stats = useUserStats()
  const prior = usePriorSignups()
  const directory = useUserDirectory()
  const queries = [moderation, queues, failed, spend, stats, prior, directory]
  const refreshing = queries.some(query => query.isFetching)
  const hasErrors = queries.some(query => query.isError)
  const timestamps = queries.map(query => query.dataUpdatedAt).filter(time => time > 0)
  const capturedAt = timestamps.length ? Math.min(...timestamps) : 0
  const [chartWindow, setChartWindow] = useState<ChartWindow>('all')
  const [metric, setMetric] = useState<'queue' | 'failed' | 'cost' | null>(null)
  const [activeSection, setActiveSection] = useState('overview-operations')
  const [notice, setNotice] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const inspectorTrigger = useRef<HTMLElement | null>(null)
  const creators = directory.isError ? [] : directory.data?.items ?? []
  const moderationState = queryState(moderation)
  const countLabel = moderationState === 'ready' && moderation.data ? `${number(moderation.data.count)}${moderation.data.capped ? '+' : ''}` : '—'
  const spendDelta = spend.data?.deltaPct

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Overview · nxClip Admin'
    const observer = new IntersectionObserver(entries => {
      const visible = entries.find(entry => entry.isIntersecting)
      if (visible) setActiveSection(visible.target.id)
    }, { root: rootRef.current?.closest('main'), rootMargin: '-8% 0px -55% 0px' })
    for (const id of ['overview-operations', 'overview-users', 'overview-growth']) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => { document.title = previousTitle; observer.disconnect() }
  }, [])
  function openMetric(value: 'queue' | 'failed' | 'cost') {
    inspectorTrigger.current = document.activeElement as HTMLElement
    setMetric(value)
  }
  function download() {
    const csv = overviewCsv({
      capturedAt: Date.now(),
      moderation: moderation.isError ? undefined : moderation.data,
      queues: queues.isError ? undefined : queues.data,
      failed: failed.isError ? undefined : failed.data,
      spend: spend.isError ? undefined : spend.data,
      stats: stats.isError ? undefined : stats.data,
      prior: prior.isError ? undefined : prior.data,
      directory: creators,
    }, [], true)
    downloadCsv(csv, 'nxclip-overview-report.csv')
    setNotice(`Exported overview metrics${hasErrors ? '. Unavailable metrics are marked in the report' : ''}.`)
  }
  async function refresh() {
    const results = await Promise.all(queries.map(query => query.refetch()))
    setNotice(results.some(result => result.isError) ? 'Some data could not refresh. Retry the unavailable sections.' : 'Overview refreshed.')
  }
  const metricQuery = metric === 'queue' ? queues : metric === 'failed' ? failed : spend

  return <div ref={rootRef} className="overview-example complete-overview overview-live">
    <div className="example-main" id="overview-main" tabIndex={-1}>
      <PageHeader title="Overview" description="Keep content moving. See what needs you, then how your community is growing." action={<div className="example-header-actions">
          <Button size="lg" variant="secondary" className="example-button" disabled={refreshing} onClick={() => void refresh()}><RefreshCw size={14} />{refreshing ? 'Refreshing…' : 'Refresh'}</Button>
          <Button size="lg" className="example-button" disabled={!capturedAt} onClick={download}><Download size={15} />Export report</Button>
        </div>} />
      <nav className="example-section-tabs" aria-label="Overview sections">
        {[{ id: 'overview-operations', label: 'Operations' }, { id: 'overview-users', label: 'Users & plans' }, { id: 'overview-growth', label: 'Growth' }].map(section =>
          <a key={section.id} href={`#${section.id}`} className={activeSection === section.id ? 'example-section-tab-active' : ''} aria-current={activeSection === section.id ? 'location' : undefined} onClick={() => setActiveSection(section.id)}>{section.label}</a>)}
        <span className="example-snapshot"><CalendarDays size={13} />{capturedAt ? `Snapshot ${dateTime(capturedAt)}` : 'Loading snapshot…'}</span>
      </nav>
      {hasErrors && <div className="overview-live-warning" role="alert"><TriangleAlert size={16} /><span>Some overview data is unavailable. Other sections remain available.</span></div>}
      <section id="overview-operations" className="example-kpi-grid" aria-label="Operational metrics">
        <OperationalMetric label="In moderation" value={countLabel} icon={<ShieldCheck />} badge={moderation.data?.capped ? 'At least' : moderation.data?.count ? 'Needs review' : 'Clear'} detail={moderation.data?.capped ? 'More review items exist beyond this snapshot' : 'Content awaiting an operator decision'} action={() => { window.location.href = '/moderation' }} tone={moderation.data?.count ? 'warning' : 'neutral'} state={moderationState} onRetry={() => void moderation.refetch()} />
        <OperationalMetric label="Queue depth" value={number(queues.data?.depth ?? 0)} icon={<Zap />} badge="Snapshot" detail={<>{queues.data?.waiting} waiting · {queues.data?.active} active · {queues.data?.delayed} delayed</>} action={() => openMetric('queue')} state={queryState(queues)} onRetry={() => void queues.refetch()} />
        <OperationalMetric label="Failed jobs" value={`${number(failed.data?.count ?? 0)}${failed.data?.capped ? '+' : ''}`} icon={<TriangleAlert />} badge={failed.data?.count ? 'Open' : 'Clear'} detail="Failed generation jobs awaiting attention" action={() => openMetric('failed')} tone={failed.data?.count ? 'danger' : 'neutral'} state={queryState(failed)} onRetry={() => void failed.refetch()} />
        <OperationalMetric label="Spend (30d)" value={currency(spend.data?.spend30dUsd ?? 0)} icon={<Wallet />} badge={spendDelta == null ? 'Unavailable' : `${spendDelta > 0 ? '+' : ''}${spendDelta}%`} detail={<>{spendDelta && spendDelta < 0 ? <ArrowDownRight size={13} /> : spendDelta && spendDelta > 0 ? <ArrowUpRight size={13} /> : null}vs. the previous 30 days</>} action={() => openMetric('cost')} tone={spendDelta == null || spendDelta === 0 ? 'neutral' : spendDelta < 0 ? 'success' : 'danger'} state={queryState(spend)} onRetry={() => void spend.refetch()} />
      </section>
      <UsersAndPlans data={stats.data && !stats.isError ? { userStats: stats.data, priorSignups: prior.isError ? undefined : prior.data } : undefined} state={queryState(stats)} updatedAt={stats.dataUpdatedAt} priorState={queryState(prior)} onRetry={() => void stats.refetch()} onRetryPrior={() => void prior.refetch()} />
      <GrowthCharts data={{ directory: directory.isError ? { items: [] } : directory.data ?? { items: [] }, userStats: stats.isError ? undefined : stats.data }} state={queryState(directory)} statsState={queryState(stats)} now={directory.dataUpdatedAt || Date.now()} window={chartWindow} onWindowChange={setChartWindow} onRetry={() => void directory.refetch()} />
      <div role="status" className="example-announcement">{notice && <><Check size={14} />{notice}<Button type="button" variant="ghost" size="icon-xs" aria-label="Dismiss confirmation" onClick={() => setNotice('')}><X size={14} /></Button></>}</div>
    </div>
    <Sheet open={!!metric} onOpenChange={open => { if (!open) setMetric(null) }}><SheetContent className="overview-example example-inspector" onCloseAutoFocus={event => { event.preventDefault(); inspectorTrigger.current?.focus() }}>
      <SheetHeader><SheetTitle>{metric === 'queue' ? 'Queue depth' : metric === 'failed' ? 'Failed jobs' : '30-day spend'}</SheetTitle><SheetDescription>Current overview snapshot</SheetDescription></SheetHeader>
      <div className="example-inspector-body">{queryState(metricQuery) !== 'ready' ? <DataPlaceholder state={queryState(metricQuery)} emptyText="No details available" onRetry={() => void metricQuery.refetch()} /> : metric === 'queue' ? <><h2>{number(queues.data?.depth ?? 0)} jobs in the pipeline</h2><dl><div><dt>Waiting</dt><dd>{queues.data?.waiting}</dd></div><div><dt>Active</dt><dd>{queues.data?.active}</dd></div><div><dt>Delayed</dt><dd>{queues.data?.delayed}</dd></div></dl><p className="example-inspector-note">Failed jobs are counted separately.</p></> : metric === 'failed' ? <><h2>{failed.data?.count}{failed.data?.capped ? '+' : ''} failed generation jobs</h2><p>{failed.data?.capped ? 'More failed jobs exist beyond the loaded 100-job window.' : 'Failed jobs in the loaded window.'}</p></> : <><h2>{spend.data ? currency(spend.data.spend30dUsd) : 'Unavailable'}</h2><p>{spendDelta == null ? 'Comparison unavailable' : spendDelta === 0 ? 'Spend held flat compared with the previous 30 days.' : `${Math.abs(spendDelta)}% ${spendDelta < 0 ? 'lower' : 'higher'} than the previous 30 days.`}</p><p className="example-inspector-note">Provider cost in USD over the last 30 days.</p></>}<Button asChild size="lg" className="example-button"><Link to="/queues">Open AI queues & cost <ArrowUpRight size={14} /></Link></Button></div>
    </SheetContent></Sheet>
  </div>
}



