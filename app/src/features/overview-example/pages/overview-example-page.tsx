import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronRight, Clapperboard, Clock3, Download, FileImage, Gauge, RefreshCw, Search, ShieldCheck, TriangleAlert, Wallet, X, Zap } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AppShell } from '@/layout/app-shell'
import { SearchInput } from '@/components/search-input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusPill, TonePill } from '@/components/status-pill'
import { UserAvatar } from '@/components/user-avatar'
import { serviceHealthMeta } from '@/domain/service-health'
import { fetchOverviewPreview, type ExampleContent, type PreviewScenario } from '../data'
import { DataPlaceholder, GrowthCharts, OperationalMetric, Panel, QuickLinks, UsersAndPlans, type DataState } from '../components/overview-sections'
import { currency, exportOverview, number } from '../utils'
import '../../overview/design/base.css'
import '../../overview/design/layout.css'
import '../../overview/design/live.css'

/**
 * THESIS: Every current Overview item, with operational work before growth analysis.
 * OWN-WORLD: The approved charcoal/navy and violet example, larger reading text, flat 12px panels.
 * STORY: Scan moderation, queues, failures and spend; act on recent content; understand users and growth.
 * FIRST VIEWPORT: Four operational KPIs above moderation records and module shortcuts.
 * FORM: Existing user-approved dashboard, expanded for complete Overview coverage; no new identity.
 * DATA: Async dummy responses use the real Overview's aggregate and directory shapes.
 */
export function OverviewExamplePage() {
  const [scenario, setScenario] = useState<PreviewScenario>('populated')
  const snapshot = useQuery({ queryKey: ['overview-example', scenario], queryFn: () => fetchOverviewPreview(scenario), retry: false, staleTime: 60_000 })
  const state: DataState = scenario === 'loading' || snapshot.isPending ? 'loading' : snapshot.isError ? 'unavailable' : 'ready'
  const data = state === 'ready' ? snapshot.data : undefined
  const [chartWindow, setChartWindow] = useState<'all' | '7d' | '30d'>('30d')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [inspected, setInspected] = useState<ExampleContent | null>(null)
  const metricTriggerRef = useRef<HTMLElement | null>(null)
  const [activeSection, setActiveSection] = useState('overview-operations')
  const [metricDetail, setMetricDetail] = useState<'queue' | 'failed' | 'cost' | null>(null)
  const [notice, setNotice] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const inspectTriggerRef = useRef<HTMLButtonElement | null>(null)
  const moderation = data ? Object.values(data.moderation).reduce((sum, count) => sum + count, 0) : 0
  const depth = data ? Object.values(data.queues).reduce((sum, count) => sum + count, 0) : 0
  const recent = data?.recent ?? []
  const rows = recent.filter(item => `${item.title} ${item.creator} ${item.handle}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'all' || item.status === filter))
  const allRowsSelected = rows.length > 0 && rows.every(row => selected.has(row.id))
  const selectAllState = allRowsSelected ? true : rows.some(row => selected.has(row.id)) ? 'indeterminate' : false
  const serviceIssues = data?.services.filter(service => service.status !== 'Operational').length ?? 0

  useEffect(() => {
    const before = document.title
    document.title = 'Complete overview preview · nxClip Admin'
    const shortcuts = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchRef.current?.focus() }
    }
    document.addEventListener('keydown', shortcuts)
    return () => { document.title = before; document.removeEventListener('keydown', shortcuts) }
  }, [])

  useEffect(() => {
    const sections = ['overview-operations', 'overview-users', 'overview-growth']
    const observer = new IntersectionObserver(entries => {
      const visible = entries.find(entry => entry.isIntersecting)
      if (visible) setActiveSection(visible.target.id)
    }, { root: document.getElementById('app-main'), rootMargin: '-10% 0px -55% 0px' })
    sections.forEach(id => { const element = document.getElementById(id); if (element) observer.observe(element) })
    return () => observer.disconnect()
  }, [])

  function openMetric(detail: 'queue' | 'failed' | 'cost') {
    metricTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setMetricDetail(detail)
  }
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  }
  function retry() { if (scenario !== 'populated') setScenario('populated'); else void snapshot.refetch() }
  function showReview() { setFilter('all'); setQuery(''); scrollTo('overview-moderation') }
  function toggleSelection(id: string) { setSelected(old => { const next = new Set(old); if (next.has(id)) next.delete(id); else next.add(id); return next }) }
  function download(summary = false) {
    if (!data) return
    const exported = selected.size ? recent.filter(item => selected.has(item.id)) : rows
    exportOverview(data, exported, summary)
    setNotice(`Exported ${summary ? 'overview metrics and ' : ''}${exported.length} sample moderation records.`)
  }
  function changeScenario(value: PreviewScenario) { setScenario(value); setSelected(new Set()); setInspected(null); setMetricDetail(null); setNotice('') }

  return <AppShell user={{ displayName: "Demo Admin", username: "demo", email: "demo@nxclip.com" }} badges={{ "/moderation": moderation, "/publishing": data?.stuckPublishing ?? 0 }} onLogout={() => { window.location.href = "/login" }}><div className="overview-example complete-overview overview-live"><div className="example-main" id="example-main">
        <div className="example-page-header"><div><div className="example-title-line"><h1>Overview</h1><span className="example-demo-label">Dummy data preview</span></div><p>Keep content moving. See what needs you, then how your community is growing.</p></div><div className="example-header-actions"><Button size="lg" variant="secondary" className="example-button" disabled={snapshot.isFetching || scenario === 'loading'} onClick={() => void snapshot.refetch().then(result => setNotice(result.isError ? 'Snapshot unavailable. Try the Populated preview state.' : 'Sample snapshot refreshed.'))}><RefreshCw size={14} />{snapshot.isFetching ? 'Refreshing…' : 'Refresh'}</Button><Button size="lg" className="example-button" disabled={!data} onClick={() => download(true)}><Download size={15} />Export report</Button></div></div>
        <nav className="example-section-tabs" aria-label="Overview sections">{[{id:'overview-operations',label:'Operations'},{id:'overview-users',label:'Users & plans'},{id:'overview-growth',label:'Growth'}].map(section => <a key={section.id} className={activeSection === section.id ? 'example-section-tab-active' : ''} aria-current={activeSection === section.id ? 'location' : undefined} href={`#${section.id}`} onClick={() => setActiveSection(section.id)}>{section.label}</a>)}<span className="example-snapshot"><CalendarDays size={13} />Sep 10, 2026 · 10:45</span></nav>

        <section id="overview-operations" className="example-kpi-grid" aria-label="Operational metrics">
          <OperationalMetric label="In moderation" value={number(moderation)} icon={<ShieldCheck />} badge={moderation ? 'Needs review' : 'Clear'} detail="Content awaiting an operator decision" action={showReview} tone={moderation ? 'warning' : 'neutral'} state={state} onRetry={retry} />
          <OperationalMetric label="Queue depth" value={number(depth)} icon={<Zap />} badge="Snapshot" detail={<>{data?.queues.waiting ?? 0} waiting <span>·</span> {data?.queues.active ?? 0} active <span>·</span> {data?.queues.delayed ?? 0} delayed</>} action={() => openMetric('queue')} state={state} onRetry={retry} />
          <OperationalMetric label="Failed jobs" value={`${number(data?.failedJobs.count ?? 0)}${data?.failedJobs.capped ? '+' : ''}`} icon={<TriangleAlert />} badge={(data?.failedJobs.count ?? 0) > 0 ? 'Open' : 'Clear'} detail="Failed generation jobs awaiting attention" action={() => openMetric('failed')} tone={(data?.failedJobs.count ?? 0) > 0 ? 'danger' : 'neutral'} state={state} onRetry={retry} />
          <OperationalMetric label="Spend (30d)" value={currency(data?.cost.spend30dUsd ?? 0)} icon={<Wallet />} badge={`${(data?.cost.deltaPct ?? 0) > 0 ? '+' : ''}${data?.cost.deltaPct ?? 0}%`} detail={<>{(data?.cost.deltaPct ?? 0) < 0 ? <ArrowDownRight size={13} /> : (data?.cost.deltaPct ?? 0) > 0 ? <ArrowUpRight size={13} /> : null}vs. the previous 30 days</>} action={() => openMetric('cost')} tone={(data?.cost.deltaPct ?? 0) < 0 ? 'success' : 'neutral'} state={state} onRetry={retry} />
        </section>

        {!!data?.stuckPublishing && <div className="overview-attention-banner"><Clock3 size={18} /><p><strong>{data.stuckPublishing} publishing items need a closer look.</strong><span> A quick review can help clear the backlog.</span></p><Button type="button" variant="link" size="sm" className="example-text-button h-auto p-0" onClick={showReview}>Review queue <ArrowRight size={14} /></Button></div>}

        <div className="overview-working-grid">
          <section id="overview-moderation" className="overview-moderation-section">
            <Panel title="In moderation" description="The latest content needing an operator decision" action={<Button asChild variant="link" size="xs" className="example-text-button h-auto p-0"><a href="/moderation">Open queue <ArrowUpRight size={14} /></a></Button>} className="example-content-panel">
              <SearchInput ref={searchRef} containerClassName="overview-table-search" aria-label="Search moderation items" placeholder="Search content or creators…" value={query} onChange={event => setQuery(event.target.value)} trailing={query ? <Button variant="ghost" size="icon-sm" onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></Button> : <kbd>Ctrl K</kbd>} />
              <div className="example-table-toolbar"><div role="group" aria-label="Moderation status filter">{[{ value: 'all', label: 'All review' }, { value: 'publishing', label: 'Publishing' }, { value: 'moderation_rejected', label: 'Rejected' }, { value: 'generation_failed', label: 'Failed' }].map(tab => <Button key={tab.value} type="button" variant={filter === tab.value ? 'secondary' : 'ghost'} size="xs" aria-pressed={filter === tab.value} className={filter === tab.value ? 'is-active' : ''} onClick={() => setFilter(tab.value)}>{tab.label}</Button>)}</div><span>{data ? `${moderation} in queue` : '—'}</span></div>
              {state !== 'ready' ? <DataPlaceholder state={state} emptyText="Queue is clear" onRetry={retry} /> : !recent.length ? <DataPlaceholder state="ready" emptyText="Queue is clear" onRetry={retry} /> : <Table className="example-table" containerProps={{ className: "example-table-scroll", tabIndex: 0, role: "region", "aria-label": "Scrollable moderation table" }}><caption className="sr-only">Recent moderation items with sample creator details. Open a content title to inspect it.</caption><TableHeader><TableRow><TableHead className="example-select-cell"><Checkbox aria-label="Select all visible content" checked={selectAllState} onCheckedChange={checked => { setSelected(old => { const next = new Set(old); rows.forEach(row => checked ? next.add(row.id) : next.delete(row.id)); return next }) }} /></TableHead><TableHead>Content</TableHead><TableHead>Creator</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead><span className="sr-only">Inspect</span></TableHead></TableRow></TableHeader><TableBody>{rows.map((item, index) => <TableRow key={item.id} data-state={selected.has(item.id) ? 'selected' : undefined}><TableCell className="example-select-cell"><Checkbox aria-label={`Select ${item.title}`} checked={selected.has(item.id)} onCheckedChange={() => toggleSelection(item.id)} /></TableCell><TableCell><Button type="button" variant="ghost" className="example-content-title h-auto justify-start p-0 hover:bg-transparent" onClick={event => { inspectTriggerRef.current = event.currentTarget; setInspected(item) }}><span className={`example-content-thumbnail example-thumbnail-${index % 3}`}>{item.type === 'clip' ? <Clapperboard size={18} /> : <FileImage size={18} />}</span><span><strong>{item.title}</strong><small>{item.type === 'image' ? 'Image' : 'Clip'}<span>·</span>{item.id}</small></span></Button></TableCell><TableCell><div className="example-creator"><UserAvatar name={item.creator} size="sm" /><div><strong>{item.creator}</strong><small>@{item.handle}</small></div></div></TableCell><TableCell><StatusPill status={item.status} size="sm" /></TableCell><TableCell className="example-date-cell">{item.time}</TableCell><TableCell><Button type="button" variant="ghost" size="icon-sm" className="example-icon-button" aria-label={`Inspect ${item.title}`} onClick={event => { inspectTriggerRef.current = event.currentTarget; setInspected(item) }}><ChevronRight size={16} /></Button></TableCell></TableRow>)}{!rows.length && <TableRow><TableCell colSpan={6}><div className="example-empty"><Search size={20} /><strong>No matching moderation items</strong><span>Try another creator, title, or status.</span><Button type="button" variant="link" size="sm" className="example-text-button h-auto p-0" onClick={() => { setQuery(''); setFilter('all') }}>Clear search and filters</Button></div></TableCell></TableRow>}</TableBody></Table>}
              <div className="example-table-footer"><span>{selected.size ? `${selected.size} selected` : data ? `${rows.length} of ${recent.length} recent items · ${moderation} total in queue` : state === 'loading' ? 'Loading recent items…' : 'Sample data unavailable'}</span><Button type="button" variant="link" size="xs" className="example-text-button h-auto p-0" disabled={!data || !recent.length} onClick={() => download()}><Download size={13} />{selected.size ? 'Export selected' : 'Export content'}</Button></div>
            </Panel>
          </section>
          <aside className="overview-working-aside" aria-label="Shortcuts and service status"><QuickLinks /><section className="example-panel overview-health-summary"><div><Gauge size={17} /><h2>System health</h2><TonePill tone={data?.services.length ? serviceIssues ? 'danger' : 'success' : 'neutral'}>{data?.services.length ? serviceIssues ? `${serviceIssues} down` : 'Operational' : 'Unknown'}</TonePill></div><p>{data?.services.length ? `${data.services.length - serviceIssues} of ${data.services.length} services are operating normally.` : 'No service snapshot is available.'}</p>{!!data?.services.length && <details><summary>View service status<ChevronRight size={14} /></summary><div className="example-service-list">{data.services.map(service => { const meta = serviceHealthMeta({ ok: service.status === 'Operational' }); const isDown = meta.tone === 'danger'; return <div key={service.name}><span className={`example-service-dot ${isDown ? 'is-down' : ''}`} /><strong>{service.name}</strong><span className={`example-service-state ${isDown ? 'is-down' : ''}`}>{meta.label}</span><small>{service.latency}</small></div> })}</div></details>}<Button asChild variant="link" size="xs" className="example-text-button h-auto p-0"><a href="/health">Open system health <ArrowUpRight size={13} /></a></Button></section></aside>
        </div>

        <UsersAndPlans data={data} state={state} onRetry={retry} />
        <GrowthCharts now={new Date('2026-09-10T10:45:00').getTime()} data={data} state={state} window={chartWindow} onWindowChange={setChartWindow} onRetry={retry} />

        <footer id="example-about" className="overview-preview-footer"><div><span className="example-preview-dot" /><p><strong>Complete Overview preview</strong><span>All values come from dummy API responses. No production data is changed.</span></p></div><label>Preview state<Select value={scenario} onValueChange={value => changeScenario(value as PreviewScenario)}><SelectTrigger aria-label="Preview data state" size="sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="populated">Populated</SelectItem><SelectItem value="loading">Loading</SelectItem><SelectItem value="empty">Empty</SelectItem><SelectItem value="unavailable">API unavailable</SelectItem></SelectContent></Select></label></footer>
        <div role="status" className="example-announcement">{notice && <><Check size={14} />{notice}<Button type="button" variant="ghost" size="icon-xs" aria-label="Dismiss confirmation" onClick={() => setNotice('')}><X size={14} /></Button></>}</div>
      </div>
    </div>

    <Sheet open={!!inspected} onOpenChange={open => { if (!open) setInspected(null) }}><SheetContent className="overview-example example-inspector" onCloseAutoFocus={event => { event.preventDefault(); inspectTriggerRef.current?.focus() }}><SheetHeader><SheetTitle>Content details</SheetTitle><SheetDescription>Sample record · moderation preview</SheetDescription></SheetHeader>{inspected && <div className="example-inspector-body"><div className="example-inspector-preview">{inspected.type === 'clip' ? <Clapperboard size={48} strokeWidth={1} /> : <FileImage size={48} strokeWidth={1} />}<span>Sample {inspected.type} record</span></div><StatusPill status={inspected.status} /><h2>{inspected.title}</h2><div className="example-creator"><UserAvatar name={inspected.creator} /><div><strong>{inspected.creator}</strong><small>@{inspected.handle}</small></div></div><dl><div><dt>Content ID</dt><dd>{inspected.id}</dd></div><div><dt>Created</dt><dd>{inspected.time}, 2026</dd></div><div><dt>Prompt</dt><dd>{inspected.prompt}</dd></div></dl><p className="example-inspector-note">Review and approve content in the authenticated moderation queue.</p><Button asChild size="lg" className="example-button"><a href="/moderation">Open content moderation <ArrowUpRight size={14} /></a></Button></div>}</SheetContent></Sheet>
    <Sheet open={!!metricDetail} onOpenChange={open => { if (!open) setMetricDetail(null) }}><SheetContent className="overview-example example-inspector" onCloseAutoFocus={event => { event.preventDefault(); metricTriggerRef.current?.focus() }}><SheetHeader><SheetTitle>{metricDetail === 'queue' ? 'Queue depth' : metricDetail === 'failed' ? 'Failed jobs' : '30-day spend'}</SheetTitle><SheetDescription>Details from the sample overview snapshot</SheetDescription></SheetHeader>{data && <div className="example-inspector-body">{metricDetail === 'queue' ? <><h2>{depth} jobs in the pipeline</h2><dl><div><dt>Waiting</dt><dd>{data.queues.waiting}</dd></div><div><dt>Active</dt><dd>{data.queues.active}</dd></div><div><dt>Delayed</dt><dd>{data.queues.delayed}</dd></div></dl><p className="example-inspector-note">Queue depth is waiting + active + delayed. Failed jobs are counted separately.</p></> : metricDetail === 'failed' ? <><h2>{data.failedJobs.count} failed generation jobs</h2><p>These jobs need an operator to inspect their errors before retrying.</p><p className="example-inspector-note">This count comes from the failed-job list, rather than queue counters. A capped list would show a + indicator.</p></> : <><h2>{currency(data.cost.spend30dUsd)}</h2><p>{data.cost.deltaPct === 0 ? 'Spend held flat compared with the previous 30 days.' : `${Math.abs(data.cost.deltaPct)}% ${data.cost.deltaPct < 0 ? 'lower' : 'higher'} than the previous 30 days.`}</p><dl><div><dt>Current period</dt><dd>Aug 12 – Sep 10, 2026</dd></div><div><dt>Comparison</dt><dd>Previous 30-day period</dd></div></dl><p className="example-inspector-note">Sample provider cost in USD. This value is unavailable when the cost API cannot supply it.</p></>}<Button asChild size="lg" className="example-button"><a href="/queues">Open AI queues & cost <ArrowUpRight size={14} /></a></Button></div>}</SheetContent></Sheet>
  </AppShell>
}
