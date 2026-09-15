import { useMemo, useRef, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/page-header'
import { StatusPill, TonePill } from '@/components/status-pill'
import { UserAvatar } from '@/components/user-avatar'
import { DataGrid, type FacetedFilterConfig } from '@/components/data-grid'
import { useUserNames } from '@/hooks/use-user-names'
import { useRevealOnSelect } from '@/hooks/use-reveal-on-select'
import { mergeDefined } from '@/lib/merge-defined'
import { formatTableDate } from '@/lib/date-format'
import type { ContentStatus } from '@/domain/content'
import { DraftInspector } from '../components/draft-inspector'
import { useDraftDetail, useDraftQueue, useStuckProcessingCount } from '../api/queries'
import {
  STUCK_AFTER_MINUTES,
  draftTitle,
  formatAge,
  isLikelyStuck,
  type DraftItem,
  type PreSubmissionStatus,
} from '../api/schemas'

const TABS: { value: PreSubmissionStatus; label: string }[] = [
  { value: 'draft', label: 'Drafts' },
  { value: 'processing', label: 'Processing' },
]

const CONTENT_TYPE_FILTERS = [
  { label: 'Image', value: 'image' },
  { label: 'Meme', value: 'meme' },
  { label: 'Clip', value: 'clip' },
]

const facetedFilters: FacetedFilterConfig[] = [
  { columnId: 'status', title: 'Status', options: TABS },
  { columnId: 'contentType', title: 'Type', options: CONTENT_TYPE_FILTERS },
]

function buildColumns(resolveUser: (id: string) => string): ColumnDef<DraftItem>[] {
  return [
    {
      id: 'creator',
      header: 'Creator',
      // Keep the raw id searchable so id lookups still match.
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
      accessorFn: (r) => draftTitle(r),
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-[36ch] text-foreground/90">
          {draftTitle(row.original)}
        </span>
      ),
    },
    {
      accessorKey: 'contentType',
      header: 'Type',
      filterFn: 'arrIncludesSome',
      cell: ({ row }) => (
        <span className="capitalize text-muted-foreground">{row.original.contentType}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      filterFn: 'arrIncludesSome',
      cell: ({ row }) => <StatusPill status={row.original.status as ContentStatus} />,
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
      id: 'age',
      header: 'Age',
      // Sort on real elapsed minutes, not the formatted string — "9m" and "9d"
      // sort identically as text.
      accessorFn: (r) => Date.parse(r.createdAt) || 0,
      sortDescFirst: false,
      cell: ({ row }) => {
        const stuck = isLikelyStuck(row.original)
        return (
          <span className="flex items-center gap-2">
            <span className="tabular-nums text-muted-foreground">
              {formatAge(row.original.createdAt)}
            </span>
            {stuck && <TonePill tone="warning">stalled?</TonePill>}
          </span>
        )
      },
    },
  ]
}

/**
 * Drafts & Processing — the content that never reaches the Moderation Hub.
 *
 * `draft` and `processing` sit before the review pipeline, so the moderation
 * tabs correctly exclude them; the result was that 47 live drafts had no surface
 * in the admin at all. Kept separate from moderation rather than added as extra
 * tabs, because nothing here is awaiting review and nothing here is actionable —
 * mixing them would imply both.
 */
export function DraftsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const drafts = useDraftQueue('draft')
  const processing = useDraftQueue('processing')
  const stuck = useStuckProcessingCount()

  const users = useUserNames()
  const columns = useMemo(() => buildColumns(users.resolve), [users.resolve])

  const items = [
    ...(drafts.data?.pages.flatMap((p) => p.items) ?? []),
    ...(processing.data?.pages.flatMap((p) => p.items) ?? []),
  ]
  const isLoading = drafts.isLoading || processing.isLoading
  const isError = drafts.isError || processing.isError
  const row = items.find((i) => i.id === selectedId) ?? null
  const inspectorRef = useRef<HTMLDivElement>(null)
  useRevealOnSelect(inspectorRef, row?.id ?? null)

  // Progressive enrichment: the row renders now, GET /:id merges over it.
  const detail = useDraftDetail(row?.id ?? null)
  const selected = row ? mergeDefined(row, detail.data) : null

  const stuckCount = stuck.data?.count ?? 0

  return (
    <div className="space-y-6 px-6 py-8 md:px-8">
      <PageHeader
        eyebrow="Operations"
        title="Drafts &amp; Processing"
        description="Content that hasn't entered review — creator drafts, and items still generating. Nothing here is actionable; it's the visibility the moderation queue can't give you."
      />

      {stuckCount > 0 && (
        <div className="rounded-lg border border-warning/25 bg-warning/10 px-4 py-3">
          <span className="text-sm text-foreground">
            <span className="font-semibold tabular-nums">{stuckCount}</span>{' '}
            {stuckCount === 1 ? 'item has' : 'items have'} been generating for over{' '}
            <span className="tabular-nums">{STUCK_AFTER_MINUTES}m</span>
          </span>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Generation is a minutes-scale operation, so these have likely stalled. Scanned the most
            recent {stuck.data?.scanned ?? 0} processing items
            {stuck.data?.capped ? ' (more exist than one page holds)' : ''}.
          </p>
        </div>
      )}

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
          emptyMessage="No drafts or processing items match your filters."
          onRowClick={(r) => setSelectedId(r.id)}
          getRowActionLabel={(r) => `Inspect ${draftTitle(r)}`}
          selectedRowId={selected?.id}
        />

        {selected && (
          <div ref={inspectorRef} className="scroll-mt-6 lg:sticky lg:top-6 lg:h-[calc(100vh-9rem)]">
            <DraftInspector
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
