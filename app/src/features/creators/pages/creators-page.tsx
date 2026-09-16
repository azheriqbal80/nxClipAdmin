import { useRef, useState } from 'react'
import { Ban } from 'lucide-react'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TonePill } from '@/components/status-pill'
import { UserAvatar } from '@/components/user-avatar'
import { DataGrid, type FacetedFilterConfig } from '@/components/data-grid'
import { useRevealOnSelect } from '@/hooks/use-reveal-on-select'
import { useAutoFetchNextPages } from '@/hooks/use-auto-fetch-next-pages'
import { mergeDefined } from '@/lib/merge-defined'
import { formatTableDate } from '@/lib/date-format'
import { CreatorInspector } from '../components/creator-inspector'
import { PlanHeadroom } from '../components/plan-headroom'
import { planHeadroom } from '../api/analytics'
import {
  useCreators,
  useCreatorDetail,
  useSetCreatorActive,
  usePlanCaps,
  useUsageJobs,
  USAGE_WINDOW,
} from '../api/queries'
import { PLAN_TONE, type Creator } from '../api/schemas'

const columns: ColumnDef<Creator>[] = [
  {
    id: 'creator',
    header: 'Creator',
    accessorFn: (c) => `${c.displayName} ${c.username}`,
    cell: ({ row }) => {
      const c = row.original
      return (
        <div className="flex items-center gap-2.5">
          <UserAvatar name={c.displayName} size="sm" />
          <div className="min-w-0">
            <div className="font-medium text-foreground">{c.displayName}</div>
            <div className="text-xs text-muted-foreground">@{c.username}</div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <span className="font-mono text-xs text-faint">{row.original.email}</span>,
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
    filterFn: 'arrIncludesSome',
    cell: ({ row }) => <Badge variant={PLAN_TONE[row.original.plan]}>{row.original.plan}</Badge>,
  },
  {
    id: 'contentCount',
    header: 'Content',
    accessorFn: (c) => c.contentCount ?? 0,
    cell: ({ row }) => <span className="tabular-nums">{row.original.contentCount ?? '—'}</span>,
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
    id: 'status',
    header: 'Status',
    accessorFn: (c) => (c.isActive ? 'active' : 'suspended'),
    filterFn: 'arrIncludesSome',
    cell: ({ row }) => (
      <TonePill tone={row.original.isActive ? 'success' : 'danger'}>
        {row.original.isActive ? 'Active' : 'Suspended'}
      </TonePill>
    ),
  },
]

const facetedFilters: FacetedFilterConfig[] = [
  {
    columnId: 'plan',
    title: 'Plan',
    options: [
      { label: 'Free', value: 'FREE' },
      { label: 'Pro', value: 'PRO' },
      { label: 'Studio', value: 'STUDIO' },
    ],
  },
  {
    columnId: 'status',
    title: 'Status',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Suspended', value: 'suspended' },
    ],
  },
]

export function CreatorsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const creators = useCreators('', 'all')
  const setActive = useSetCreatorActive()
  useAutoFetchNextPages(creators)

  // Entitlement pressure: today's generations vs each plan's daily cap.
  const caps = usePlanCaps()
  const usage = useUsageJobs()

  const items = creators.data?.pages.flatMap((p) => p.items) ?? []
  const row = items.find((c) => c.id === selectedId) ?? null
  const inspectorRef = useRef<HTMLDivElement>(null)
  useRevealOnSelect(inspectorRef, row?.id ?? null)

  // Progressive enrichment: render the row now, merge GET /admin/users/:id when
  // it lands (adds contentCount / emailVerified, which the list DTO omits).
  const detail = useCreatorDetail(row?.id ?? null)
  const selected = row ? mergeDefined(row, detail.data) : null

  const bulkSuspend = (rows: Creator[]) => {
    const active = rows.filter((c) => c.isActive)
    if (active.length === 0) {
      toast.info('No active creators in selection')
      return
    }
    active.forEach((c) => setActive.mutate({ id: c.id, isActive: false }))
    toast.success(`Suspending ${active.length} creator${active.length === 1 ? '' : 's'}`)
  }

  return (
    <div className="space-y-6 px-6 py-8 md:px-8">
      <PageHeader
        eyebrow="Operations"
        title="Creator Directory"
        description="Search creators, filter by plan and status, and manage accounts. Select rows for bulk actions."
      />

      <PlanHeadroom
        headroom={planHeadroom(
          items,
          caps.data ?? [],
          usage.data?.items ?? [],
          (usage.data?.items.length ?? 0) >= USAGE_WINDOW,
        )}
        loading={caps.isLoading || usage.isLoading || creators.isLoading}
        error={caps.isError || usage.isError}
      />

      <div className={selected ? 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_384px] lg:items-start' : ''}>
        <DataGrid
          data={items}
          columns={columns}
          getRowId={(c) => c.id}
          enableSelection
          searchable
          searchPlaceholder="Search name, @handle or email…"
          facetedFilters={facetedFilters}
          pageSize={10}
          isLoading={creators.isLoading}
          isError={creators.isError}
          emptyMessage="No creators match your filters."
          onRowClick={(c) => setSelectedId(c.id)}
          getRowActionLabel={(c) => `Inspect ${c.displayName}`}
          selectedRowId={selected?.id}
          renderBulkActions={(rows) => (
            <Button variant="destructive" size="sm" onClick={() => bulkSuspend(rows)}>
              <Ban /> Suspend
            </Button>
          )}
        />

        {selected && (
          <div ref={inspectorRef} className="scroll-mt-6 lg:sticky lg:top-6 lg:h-[calc(100vh-9rem)]">
            <CreatorInspector creator={selected} onClose={() => setSelectedId(null)} />
          </div>
        )}
      </div>
    </div>
  )
}
