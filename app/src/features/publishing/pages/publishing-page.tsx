import { useMemo, useRef, useState } from 'react'
import { AlertTriangle, Hourglass, Timer } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/stat-card'
import { TonePill } from '@/components/status-pill'
import { UserAvatar } from '@/components/user-avatar'
import { DataGrid, type FacetedFilterConfig } from '@/components/data-grid'
import { useUserNames } from '@/hooks/use-user-names'
import { useRevealOnSelect } from '@/hooks/use-reveal-on-select'
import { formatTableDate } from '@/lib/date-format'
import { PublishingInspector } from '../components/publishing-inspector'
import { PublishLatencyChart } from '../components/publish-latency-chart'
import { StuckAgeChart } from '../components/stuck-age-chart'
import { latencySeries } from '../api/analytics'
import { useStuckPublishing, usePublishedContent } from '../api/queries'
import { fmtLag, stuckMinutes, stuckTitle, type StuckItem } from '../api/schemas'

const CONTENT_TYPE_FILTERS = [
  { label: 'Image', value: 'image' },
  { label: 'Meme', value: 'meme' },
  { label: 'Clip', value: 'clip' },
]

const facetedFilters: FacetedFilterConfig[] = [
  {
    columnId: 'pipeline',
    title: 'Status',
    options: [
      { label: 'Awaiting feed', value: 'awaiting feed' },
      { label: 'Error', value: 'error' },
    ],
  },
  { columnId: 'contentType', title: 'Type', options: CONTENT_TYPE_FILTERS },
]

function buildColumns(resolveUser: (id: string) => string): ColumnDef<StuckItem>[] {
  return [
  {
    id: 'content',
    header: 'Content',
    // Include the raw id in the search value so id lookups still match.
    accessorFn: (i) => `${stuckTitle(i)} ${resolveUser(i.userId)} ${i.userId}`,
    cell: ({ row }) => {
      const i = row.original
      const name = resolveUser(i.userId)
      return (
        <div className="flex items-center gap-2.5">
          <UserAvatar name={name} size="sm" />
          <div className="min-w-0">
            <div className="truncate font-medium text-foreground">{stuckTitle(i)}</div>
            <div className="truncate text-xs text-muted-foreground">{name}</div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <span className="font-mono text-xs text-faint">{row.original.id}</span>,
  },
  {
    id: 'pipeline',
    header: 'Pipeline',
    accessorFn: (i) => (i.failureReason ? 'error' : 'awaiting feed'),
    filterFn: 'arrIncludesSome',
    cell: ({ row }) => (
      <TonePill tone={row.original.failureReason ? 'danger' : 'warning'}>
        {row.original.failureReason ? 'error' : 'awaiting feed'}
      </TonePill>
    ),
  },
  {
    accessorKey: 'contentType',
    header: 'Type',
    filterFn: 'arrIncludesSome',
    cell: ({ row }) => <span className="capitalize text-muted-foreground">{row.original.contentType}</span>,
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
  {
    id: 'stuckFor',
    header: 'Stuck for',
    accessorFn: (i) => stuckMinutes(i),
    cell: ({ row }) => {
      const m = stuckMinutes(row.original)
      return <span className={m > 120 ? 'font-medium text-destructive' : 'text-foreground'}>{fmtLag(m)}</span>
    },
  },
  ]
}

export function PublishingPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data, isLoading, isError } = useStuckPublishing()
  // Items that made it through — the stuck list has no publishedAt by definition.
  const published = usePublishedContent()
  const latency = latencySeries(published.data?.items ?? [])

  const users = useUserNames()
  const columns = useMemo(() => buildColumns(users.resolve), [users.resolve])

  const all = data?.pages.flatMap((p) => p.items) ?? []
  const selected = all.find((i) => i.id === selectedId) ?? null
  const inspectorRef = useRef<HTMLDivElement>(null)
  useRevealOnSelect(inspectorRef, selected?.id ?? null)

  // KPIs derived client-side — the content DTO has no outbox/totals block.
  const withErrors = all.filter((i) => i.failureReason).length
  const oldestLag = all.reduce((max, i) => Math.max(max, stuckMinutes(i)), 0)

  return (
    <div className="space-y-6 px-6 py-8 md:px-8">
      <PageHeader
        eyebrow="Operations"
        title="Stuck Publishing"
        description="Content approved by moderation but not yet live (status: publishing). Inspect and force it back onto the publish path."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
        ) : (
          <>
            <StatCard
              icon={<Hourglass />}
              label="Stuck in publishing"
              value={all.length}
              delta="Open"
              deltaTone="muted"
              insight="Approved but not live"
              description="Publishing items waiting for feed completion"
            />
            <StatCard
              icon={<AlertTriangle />}
              label="With errors"
              value={withErrors}
              delta={withErrors > 0 ? 'Open' : 'Clear'}
              deltaTone={withErrors > 0 ? 'danger' : 'success'}
              insight={withErrors > 0 ? 'Needs operator attention' : 'No publishing errors'}
              description="Items blocked by an explicit pipeline error"
            />
            <StatCard
              icon={<Timer />}
              label="Oldest lag"
              value={fmtLag(oldestLag)}
              delta="Max"
              deltaTone={oldestLag > 120 ? 'danger' : 'muted'}
              insight={oldestLag > 120 ? 'Stale item in queue' : 'Backlog age is contained'}
              description="Longest item age in the publishing queue"
            />
          </>
        )}
      </div>

      {/* Is the pipeline getting faster, and is the backlog fresh or rotting? */}
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <PublishLatencyChart
          series={latency}
          loading={published.isLoading}
          error={published.isError}
        />
        <StuckAgeChart items={all} loading={isLoading} error={isError} />
      </div>

      <div className={selected ? 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_384px] lg:items-start' : ''}>
        <DataGrid
          data={all}
          columns={columns}
          getRowId={(i) => i.id}
          searchable
          searchPlaceholder="Search title, creator or ID…"
          facetedFilters={facetedFilters}
          pageSize={10}
          initialSorting={[{ id: 'stuckFor', desc: true }]}
          isLoading={isLoading}
          isError={isError}
          emptyMessage="Nothing stuck in publishing."
          onRowClick={(i) => setSelectedId(i.id)}
          getRowActionLabel={(i) => `Inspect ${stuckTitle(i)}`}
          selectedRowId={selected?.id}
        />

        {selected && (
          <div ref={inspectorRef} className="scroll-mt-6 lg:sticky lg:top-6 lg:h-[calc(100vh-9rem)]">
            <PublishingInspector
              item={selected}
              userName={users.resolve(selected.userId)}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
