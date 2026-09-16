import { useMemo, useRef, useState } from 'react'
import { Coins, Cpu, ListTree, TriangleAlert } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/stat-card'
import { UserAvatar } from '@/components/user-avatar'
import { DataGrid, type FacetedFilterConfig } from '@/components/data-grid'
import { useUserNames } from '@/hooks/use-user-names'
import { useRevealOnSelect } from '@/hooks/use-reveal-on-select'
import { useAutoFetchNextPages } from '@/hooks/use-auto-fetch-next-pages'
import { formatTableDate } from '@/lib/date-format'
import { QueueHealth } from '../components/queue-health'
import { CostSummaryPanel } from '../components/cost-summary'
import { JobInspector } from '../components/job-inspector'
import { JobTrendChart } from '../components/job-trend-chart'
import { ErrorTaxonomyChart } from '../components/error-taxonomy-chart'
import { PipelineTimeChart } from '../components/pipeline-time-chart'
import { pipelineTiming } from '../api/analytics'
import { useQueues, useFailedJobs, useCostSummary, useJobWindow } from '../api/queries'
import { QUEUE_NAMES, fmtUsd, queueLabel, queueDepth, type Job } from '../api/schemas'

function buildColumns(resolveUser: (id: string) => string): ColumnDef<Job>[] {
  return [
    {
      id: 'queue',
      header: 'Queue',
      accessorFn: (j) => queueLabel(j.queueName),
      filterFn: 'arrIncludesSome',
      cell: ({ row }) => <span className="text-foreground">{queueLabel(row.original.queueName)}</span>,
    },
    {
      accessorKey: 'jobType',
      header: 'Type',
      filterFn: 'arrIncludesSome',
      cell: ({ row }) => <Badge variant="secondary">{row.original.jobType}</Badge>,
    },
    {
      id: 'user',
      header: 'User',
      accessorFn: (j) => resolveUser(j.userId),
      cell: ({ row }) => {
        const name = resolveUser(row.original.userId)
        return (
          <div className="flex items-center gap-2">
            <UserAvatar name={name} size="sm" />
            <span className="text-foreground/90">{name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'id',
      header: 'Job ID',
      cell: ({ row }) => <span className="font-mono text-xs text-faint">{row.original.id}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => {
        const date = formatTableDate(row.original.createdAt)
        return (
          <time
            dateTime={row.original.createdAt}
            title={date.full}
            className="whitespace-nowrap text-muted-foreground tabular-nums"
          >
            {date.short}
          </time>
        )
      },
    },
  ]
}

export function QueuesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const queues = useQueues()
  const costs = useCostSummary()
  const jobs = useFailedJobs()
  useAutoFetchNextPages(jobs)
  // All statuses — the failure *rate* needs a denominator, not just failures.
  const jobWindow = useJobWindow()

  const users = useUserNames()
  const columns = useMemo(() => buildColumns(users.resolve), [users.resolve])

  const queueList = queues.data?.queues ?? []
  const items = useMemo(() => jobs.data?.pages.flatMap((p) => p.items) ?? [], [jobs.data?.pages])
  const facetedFilters = useMemo<FacetedFilterConfig[]>(() => {
    const jobTypes = Array.from(new Set(items.map((j) => j.jobType))).sort()

    return [
      {
        columnId: 'queue',
        title: 'Queue',
        options: QUEUE_NAMES.map((name) => ({ label: queueLabel(name), value: queueLabel(name) })),
      },
      {
        columnId: 'jobType',
        title: 'Type',
        options: jobTypes.map((type) => ({ label: type, value: type })),
      },
    ]
  }, [items])
  const selected = items.find((j) => j.id === selectedId) ?? null
  const inspectorRef = useRef<HTMLDivElement>(null)
  useRevealOnSelect(inspectorRef, selected?.id ?? null)
  const spendDelta = costs.data?.deltaPct

  // Triage helper: the most common failure across the loaded failed jobs.
  const topError = (() => {
    if (items.length === 0) return null
    const counts = new Map<string, number>()
    for (const j of items) {
      const key = (j.errorMessage ?? 'Unknown error').split('\n')[0].trim()
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    let top = { message: '', count: 0 }
    for (const [message, count] of counts) if (count > top.count) top = { message, count }
    return top
  })()

  return (
    <div className="space-y-6 px-6 py-8 md:px-8">
      <PageHeader
        eyebrow="Operations"
        title="AI Queues & Cost"
        description="Monitor the AI job pipeline, retry failed jobs, and track spend across providers."
      />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {queues.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
        ) : (
          <>
            <StatCard
              icon={<Cpu />}
              label="Processing mode"
              value={queues.data?.mode ?? '—'}
              delta={queues.data?.mode === 'inline' ? 'Inline' : 'Worker'}
              deltaTone="muted"
              insight={queues.data?.mode === 'inline' ? 'No BullMQ worker active' : 'Worker-backed processing'}
              description="Current queue execution mode"
            />
            <StatCard
              icon={<ListTree />}
              label="Queue depth"
              value={queueDepth(queueList)}
              delta="Snapshot"
              deltaTone="muted"
              insight="Waiting, active, and delayed"
              description="Combined backlog across AI queues"
            />
            <StatCard
              icon={<TriangleAlert />}
              label="Failed jobs"
              value={jobs.isLoading ? '—' : items.length}
              delta="Open"
              deltaTone="danger"
              insight="Needs operator attention"
              description="Failed jobs loaded for retry or inspection"
            />
            <StatCard
              icon={<Coins />}
              label="Spend (30d)"
              value={costs.data ? fmtUsd(costs.data.spend30dUsd) : '—'}
              delta={costs.data ? `${spendDelta && spendDelta > 0 ? '+' : ''}${spendDelta}%` : 'N/A'}
              deltaTone={spendDelta === undefined ? 'muted' : spendDelta > 0 ? 'danger' : spendDelta < 0 ? 'success' : 'muted'}
              insight={spendDelta === undefined ? 'Cost summary unavailable' : spendDelta > 0 ? 'Spend increased this period' : spendDelta < 0 ? 'Spend down this period' : 'Spend held flat'}
              description="Provider cost compared with the previous 30 days"
            />
          </>
        )}
      </div>

      {/* Queue health + cost */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_384px] lg:items-start">
        <QueueHealth queues={queueList} loading={queues.isLoading} />
        <CostSummaryPanel cost={costs.data} loading={costs.isLoading} />
      </div>

      <PipelineTimeChart
        timing={pipelineTiming(jobWindow.data?.items ?? [])}
        loading={jobWindow.isLoading}
        error={jobWindow.isError}
      />

      {/* Reliability trend + failure triage */}
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <JobTrendChart
          jobs={jobWindow.data?.items ?? []}
          loading={jobWindow.isLoading}
          error={jobWindow.isError}
        />
        <ErrorTaxonomyChart
          jobs={jobWindow.data?.items ?? []}
          loading={jobWindow.isLoading}
          error={jobWindow.isError}
        />
      </div>

      {/* Failed jobs 70/30 */}
      {!jobs.isLoading && topError && topError.count > 1 && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="min-w-0 text-sm text-foreground/90">
            <span className="font-medium">{items.length} failed job{items.length === 1 ? '' : 's'}</span>
            {' — '}
            {topError.count} share the same error:{' '}
            <span className="font-mono text-xs text-muted-foreground">{topError.message}</span>
          </div>
        </div>
      )}
      <div className={selected ? 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_384px] lg:items-start' : ''}>
        <DataGrid
          data={items}
          columns={columns}
          getRowId={(j) => j.id}
          searchable
          searchPlaceholder="Search queue, type, user or ID…"
          facetedFilters={facetedFilters}
          pageSize={10}
          isLoading={jobs.isLoading}
          isError={jobs.isError}
          emptyMessage="No failed jobs. 🎉"
          onRowClick={(j) => setSelectedId(j.id)}
          getRowActionLabel={(j) => `Inspect job ${j.id}`}
          selectedRowId={selected?.id}
        />

        {selected && (
          <div ref={inspectorRef} className="scroll-mt-6 lg:sticky lg:top-6 lg:h-[calc(100vh-9rem)]">
            <JobInspector
              job={selected}
              userName={users.resolve(selected.userId)}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
