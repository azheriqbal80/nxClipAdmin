import { useMemo, useRef, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/page-header'
import { StatusPill } from '@/components/status-pill'
import { UserAvatar } from '@/components/user-avatar'
import { DataGrid, type FacetedFilterConfig } from '@/components/data-grid'
import { useUserNames } from '@/hooks/use-user-names'
import { useRevealOnSelect } from '@/hooks/use-reveal-on-select'
import { mergeDefined } from '@/lib/merge-defined'
import { formatTableDate } from '@/lib/date-format'
import { ModerationInspector } from '../components/moderation-inspector'
import { ContentVolumeChart } from '../components/content-volume-chart'
import { contentVolume } from '../api/analytics'
import {
  useContentDetail,
  useContentVolume,
  useModerationQueue,
  type QueueStatusFilter,
} from '../api/queries'
import { contentTitle, type ModerationItem } from '../api/schemas'

const FILTERS: { value: QueueStatusFilter; label: string }[] = [
  { value: 'publishing', label: 'Publishing' },
  { value: 'moderation_rejected', label: 'Rejected' },
  { value: 'generation_failed', label: 'Failed' },
  { value: 'published', label: 'Published' },
  { value: 'deleted', label: 'Deleted' },
]

const CONTENT_TYPE_FILTERS = [
  { label: 'Image', value: 'image' },
  { label: 'Meme', value: 'meme' },
  { label: 'Clip', value: 'clip' },
]

const facetedFilters: FacetedFilterConfig[] = [
  { columnId: 'status', title: 'Status', options: FILTERS },
  { columnId: 'contentType', title: 'Type', options: CONTENT_TYPE_FILTERS },
]

function buildColumns(resolveUser: (id: string) => string): ColumnDef<ModerationItem>[] {
  return [
    {
      id: 'creator',
      header: 'Creator',
      // Include the raw id in the search value so id lookups still match.
      accessorFn: (r) => `${resolveUser(r.userId)} ${r.userId}`,
      cell: ({ row }) => {
        const name = resolveUser(row.original.userId)
        return (
          <div className="flex items-center gap-2.5">
            <UserAvatar name={name} size="sm" />
            <span className="truncate text-foreground/90">{name}</span>
          </div>
        )
      },
    },
    {
      id: 'content',
      header: 'Content',
      accessorFn: (r) => contentTitle(r),
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-[36ch] text-foreground/90">{contentTitle(row.original)}</span>
      ),
    },
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-xs text-faint">{row.original.id}</span>,
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
      accessorKey: 'status',
      header: 'Status',
      filterFn: 'arrIncludesSome',
      cell: ({ row }) => <StatusPill status={row.original.status} />,
    },
  ]
}

export function ModerationPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data, isLoading, isError } = useModerationQueue('all')

  // Whole-mix view: what's arriving and what becomes of it.
  const volumeQuery = useContentVolume()

  const users = useUserNames()
  const columns = useMemo(() => buildColumns(users.resolve), [users.resolve])

  const items = data?.pages.flatMap((p) => p.items) ?? []
  const row = items.find((i) => i.id === selectedId) ?? null
  const inspectorRef = useRef<HTMLDivElement>(null)
  useRevealOnSelect(inspectorRef, row?.id ?? null)

  // Progressive enrichment: the row renders now, GET /admin/content/:id merges
  // over it — keeps the open inspector authoritative after approve/takedown.
  const detail = useContentDetail(row?.id ?? null)
  const selected = row ? mergeDefined(row, detail.data) : null

  return (
    <div className="space-y-6 px-6 py-8 md:px-8">
      <PageHeader
        eyebrow="Operations"
        title="Content Moderation Hub"
        description="Triage content awaiting review, inspect media and prompts, and approve or take down without leaving the queue."
      />

      <ContentVolumeChart
        volume={contentVolume(volumeQuery.data?.items ?? [])}
        loading={volumeQuery.isLoading}
        error={volumeQuery.isError}
      />

      <div className={selected ? 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_384px] lg:items-start' : ''}>
        <DataGrid
          data={items}
          columns={columns}
          getRowId={(r) => r.id}
          searchable
          searchPlaceholder="Search creator, title or ID…"
          facetedFilters={facetedFilters}
          pageSize={10}
          isLoading={isLoading}
          isError={isError}
          emptyMessage="Nothing in this queue."
          onRowClick={(r) => setSelectedId(r.id)}
          getRowActionLabel={(r) => `Inspect ${contentTitle(r)}`}
          selectedRowId={selected?.id}
        />

        {selected && (
          <div ref={inspectorRef} className="scroll-mt-6 lg:sticky lg:top-6 lg:h-[calc(100vh-9rem)]">
            <ModerationInspector
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
