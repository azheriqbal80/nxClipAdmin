import { useMemo, useRef, useState } from 'react'
import { Compass, Globe, TrendingUp } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/stat-card'
import { UserAvatar } from '@/components/user-avatar'
import { DataGrid, type FacetedFilterConfig } from '@/components/data-grid'
import { TonePill } from '@/components/status-pill'
import { useUserNames } from '@/hooks/use-user-names'
import { useRevealOnSelect } from '@/hooks/use-reveal-on-select'
import { useAutoFetchNextPages } from '@/hooks/use-auto-fetch-next-pages'
import { ProjectionInspector } from '../components/projection-inspector'
import { WesScatterChart } from '../components/wes-scatter-chart'
import { engagementAudit } from '../api/analytics'
import { useExplore } from '../api/queries'
import { fmtCompact, projectionTitle, type Projection } from '../api/schemas'

function labelize(value: string) {
  return value
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function buildColumns(resolveUser: (id: string) => string): ColumnDef<Projection>[] {
  return [
  {
    id: 'content',
    header: 'Content',
    // Include the raw id in the search value so id lookups still match.
    accessorFn: (p) => `${projectionTitle(p)} ${resolveUser(p.userId)} ${p.userId}`,
    cell: ({ row }) => {
      const p = row.original
      const name = resolveUser(p.userId)
      return (
        <div className="flex items-center gap-2.5">
          <UserAvatar name={name} size="sm" />
          <div className="min-w-0">
            <div className="truncate font-medium text-foreground">{projectionTitle(p)}</div>
            <div className="truncate text-xs text-muted-foreground">{name}</div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'contentType',
    header: 'Type',
    filterFn: 'arrIncludesSome',
    cell: ({ row }) => <span className="capitalize text-muted-foreground">{row.original.contentType}</span>,
  },
  {
    accessorKey: 'socialRollup',
    header: 'Status',
    filterFn: 'arrIncludesSome',
    cell: ({ row }) => (
      <TonePill tone={row.original.hasLiveExternal ? 'success' : 'neutral'}>
        {labelize(row.original.socialRollup)}
      </TonePill>
    ),
  },
  {
    accessorKey: 'likeCount',
    header: 'Likes',
    cell: ({ row }) => <span className="tabular-nums">{fmtCompact(row.original.likeCount)}</span>,
  },
  {
    accessorKey: 'commentCount',
    header: 'Comments',
    cell: ({ row }) => <span className="tabular-nums">{fmtCompact(row.original.commentCount)}</span>,
  },
  {
    accessorKey: 'wesScore',
    header: 'WES',
    cell: ({ row }) => (
      <span className="font-mono font-semibold tabular-nums text-primary">{row.original.wesScore}</span>
    ),
  },
  ]
}

export function ExplorePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const explore = useExplore('wes')
  useAutoFetchNextPages(explore)

  const users = useUserNames()
  const columns = useMemo(() => buildColumns(users.resolve), [users.resolve])

  const items = useMemo(() => explore.data?.pages.flatMap((p) => p.items) ?? [], [explore.data?.pages])
  const facetedFilters = useMemo<FacetedFilterConfig[]>(() => {
    const contentTypes = Array.from(new Set(items.map((p) => p.contentType))).sort()
    const statuses = Array.from(new Set(items.map((p) => p.socialRollup))).sort()

    return [
      {
        columnId: 'socialRollup',
        title: 'Status',
        options: statuses.map((status) => ({ label: labelize(status), value: status })),
      },
      {
        columnId: 'contentType',
        title: 'Type',
        options: contentTypes.map((type) => ({ label: labelize(type), value: type })),
      },
    ]
  }, [items])
  const selected = items.find((p) => p.contentId === selectedId) ?? null
  const inspectorRef = useRef<HTMLDivElement>(null)
  useRevealOnSelect(inspectorRef, selected?.contentId ?? null)

  const projections = items.length
  const avgWes = projections
    ? Math.round(items.reduce((s, p) => s + p.wesScore, 0) / projections)
    : 0
  const liveExternal = items.filter((p) => p.hasLiveExternal).length
  // Does the ranking actually follow engagement? Nothing showed this before.
  const audit = engagementAudit(items)

  return (
    <div className="space-y-6 px-6 py-8 md:px-8">
      <PageHeader
        eyebrow="Operations"
        title="Explore Audit"
        description="Read-only view of what's ranking in the public feed by WES score and engagement. Sort any column."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {explore.isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
        ) : (
          <>
            <StatCard
              icon={<Compass />}
              label="Projections"
              value={projections}
              delta="Ranked"
              deltaTone="muted"
              insight="Feed audit sample"
              description="Public-feed projections loaded by WES"
            />
            <StatCard
              icon={<TrendingUp />}
              label="Avg WES"
              value={avgWes}
              delta="Mean"
              deltaTone="muted"
              insight="Ranking strength"
              description="Average weighted engagement score"
            />
            <StatCard
              icon={<Globe />}
              label="Live external"
              value={liveExternal}
              delta="Live"
              deltaTone={liveExternal > 0 ? 'success' : 'muted'}
              insight="External reach available"
              description="Items with live public external signals"
            />
          </>
        )}
      </div>

      <WesScatterChart audit={audit} loading={explore.isLoading} error={explore.isError} />

      <div className={selected ? 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_384px] lg:items-start' : ''}>
        <DataGrid
          data={items}
          columns={columns}
          getRowId={(p) => p.contentId}
          searchable
          searchPlaceholder="Search title or creator…"
          facetedFilters={facetedFilters}
          pageSize={10}
          initialSorting={[{ id: 'wesScore', desc: true }]}
          isLoading={explore.isLoading}
          isError={explore.isError}
          emptyMessage="No projections here."
          onRowClick={(p) => setSelectedId(p.contentId)}
          getRowActionLabel={(p) => `Inspect ${projectionTitle(p)}`}
          selectedRowId={selected?.contentId}
        />

        {selected && (
          <div ref={inspectorRef} className="scroll-mt-6 lg:sticky lg:top-6 lg:h-[calc(100vh-9rem)]">
            <ProjectionInspector
              projection={selected}
              userName={users.resolve(selected.userId)}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
