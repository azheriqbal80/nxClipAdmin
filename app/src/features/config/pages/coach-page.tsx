import { useCallback, useMemo, useState } from 'react'
import { ArrowUpDown, ChevronDown, ChevronUp, Save } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { Panel, PanelHeader } from '@/components/panel'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TonePill } from '@/components/status-pill'
import { DataGrid, type FacetedFilterConfig } from '@/components/data-grid'
import { CategoryEditor } from '../components/category-editor'
import { NewCategoryDialog } from '../components/new-category-dialog'
import { useCoachCategories, useCoachCategory, useReorderCategories } from '../api/queries'
import {
  ONBOARDING_QUESTIONS,
  categoryReadiness,
  type CoachCategory,
} from '../api/schemas'

type StatusFilter = 'active' | 'inactive'
type ReadinessFilter = 'ready' | 'incomplete' | 'unknown'

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const ONBOARDING_OPTIONS: { label: string; value: ReadinessFilter }[] = [
  { label: 'Ready', value: 'ready' },
  { label: 'Incomplete', value: 'incomplete' },
  { label: 'Unknown', value: 'unknown' },
]

const facetedFilters: FacetedFilterConfig[] = [
  { columnId: 'status', title: 'Status', options: STATUS_OPTIONS },
  { columnId: 'onboarding', title: 'Onboarding', options: ONBOARDING_OPTIONS },
]

/** Move controls replace the order number while reordering. Buttons rather than
    drag-and-drop: this is a short list, and arrows are keyboard-operable and
    testable without a pointer. */
function orderColumn(
  reordering: boolean,
  rows: CoachCategory[],
  move: (index: number, delta: -1 | 1) => void,
): ColumnDef<CoachCategory> {
  if (!reordering) {
    return {
      id: 'order',
      header: 'Order',
      accessorFn: (c) => c.sortOrder,
      cell: ({ row }) => (
        <span className="block text-right font-mono text-xs text-faint">
          {row.original.sortOrder}
        </span>
      ),
    }
  }
  return {
    id: 'order',
    header: 'Order',
    enableSorting: false,
    enableGlobalFilter: false,
    enableHiding: false,
    cell: ({ row }) => {
      const c = row.original
      const i = rows.findIndex((r) => r.id === c.id)
      return (
        <span className="flex items-center gap-1">
          <span className="w-4 font-mono text-xs text-faint tabular-nums">{i + 1}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Move ${c.label} up`}
            disabled={i === 0}
            onClick={() => move(i, -1)}
          >
            <ChevronUp />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Move ${c.label} down`}
            disabled={i === rows.length - 1}
            onClick={() => move(i, 1)}
          >
            <ChevronDown />
          </Button>
        </span>
      )
    },
  }
}

const restColumns: ColumnDef<CoachCategory>[] = [
  {
    id: 'category',
    header: 'Category',
    accessorFn: (c) => [c.label, c.openingMessage, c.progressLabel].join(' '),
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.label}</span>,
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.original.slug}</span>
    ),
  },
  {
    id: 'questions',
    header: 'Questions',
    accessorFn: (c) => c.activeQuestionCount ?? c.questionCount,
    cell: ({ row }) => {
      const c = row.original
      const active = c.activeQuestionCount ?? c.questionCount
      /**
       * `questionCount` counts inactive rows, `activeQuestionCount` does not, so
       * a difference means a question exists but is switched off. That distinction
       * decides the repair: a switched-off row is a toggle, a number that was
       * never written is a new question. Without it the column reads the same for
       * both and the operator has to open the editor to tell them apart.
       */
      const off = c.activeQuestionCount !== undefined ? c.questionCount - c.activeQuestionCount : 0
      return (
        <span className="block text-right tabular-nums">
          {active}
          <span className="text-faint">/{c.requiredQuestionCount ?? ONBOARDING_QUESTIONS}</span>
          {off > 0 && (
            <span className="ml-1.5 text-caption text-muted-foreground" title={`${off} question row${off === 1 ? '' : 's'} exist but ${off === 1 ? 'is' : 'are'} inactive`}>
              +{off} off
            </span>
          )}
        </span>
      )
    },
  },
  {
    id: 'onboarding',
    // Onboarding needs Q1–Q5 active. A category missing any of them still looks
    // fine in the list otherwise, so the gap has to be its own column.
    header: 'Onboarding',
    accessorFn: (c) => categoryReadiness(c).state,
    filterFn: 'arrIncludesSome',
    cell: ({ row }) => {
      const c = row.original
      const r = categoryReadiness(c)
      if (r.state === 'ready') return <TonePill tone="success">Ready</TonePill>
      if (r.state === 'unknown') return <span className="text-caption text-faint">—</span>
      return (
        <span className="flex items-center gap-2">
          <TonePill tone="warning">Incomplete</TonePill>
          {r.missing.length > 0 && (
            <span className="font-mono text-caption text-muted-foreground">
              missing Q{r.missing.join(', Q')}
            </span>
          )}
        </span>
      )
    },
  },
  {
    id: 'status',
    header: 'Status',
    accessorFn: (c) => (c.isActive ? 'active' : 'inactive'),
    filterFn: 'arrIncludesSome',
    cell: ({ row }) => {
      const c = row.original
      return (
      <TonePill tone={c.isActive ? 'success' : 'neutral'}>{c.isActive ? 'Active' : 'Inactive'}</TonePill>
      )
    },
  },
]

export function CoachPage() {
  const categories = useCoachCategories()
  const reorder = useReorderCategories()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<CoachCategory[] | null>(null)
  const server = [...(categories.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)

  // While reordering, the table renders a local draft so arrows respond
  // immediately and the whole order commits in one call.
  const reordering = draft !== null
  const items = draft ?? server
  const move = useCallback((index: number, delta: -1 | 1) =>
    setDraft((rows) => {
      const list = [...(rows ?? server)]
      const to = index + delta
      if (to < 0 || to >= list.length) return list
      ;[list[index], list[to]] = [list[to], list[index]]
      return list
    }), [server])
  const columns = useMemo(
    () => [orderColumn(reordering, items, move), ...restColumns],
    [items, move, reordering],
  )
  const selectedFromList = items.find((c) => c.id === selectedId) ?? null
  const categoryDetail = useCoachCategory(selectedFromList?.id ?? null)
  const current = categoryDetail.data ?? selectedFromList

  const orderDirty =
    reordering && draft.some((c, i) => c.id !== server[i]?.id)

  const onSaveOrder = () => {
    if (!draft) return
    // sortOrder is 1-based and contiguous, so the picker order is unambiguous
    // however the previous numbers were spaced.
    reorder.mutate(
      draft.map((c, i) => ({ id: c.id, sortOrder: i + 1 })),
      {
        onSuccess: () => {
          toast.success('Picker order saved')
          setDraft(null)
        },
        onError: () => toast.error('Reorder failed — order unchanged'),
      },
    )
  }
  // Only categories the server actually reports as incomplete. An absent
  // `isReady` is "unknown" and must not be counted as broken.
  const notReady = items.filter((c) => categoryReadiness(c).state === 'incomplete')

  return (
    <div className="space-y-6 px-6 py-8 md:px-8">
      <PageHeader
        eyebrow="Configuration"
        title="AI Coach"
        description="Manage onboarding coach niche categories and their question banks."
        action={
          reordering ? (
            <>
              <Button
                size="lg"
                onClick={onSaveOrder}
                disabled={reorder.isPending || !orderDirty}
              >
                <Save /> {reorder.isPending ? 'Saving…' : 'Save order'}
              </Button>
              <Button size="lg" variant="ghost" onClick={() => setDraft(null)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              {/* An explicit mode, so clicking rows to edit can never nudge the
                  order a creator sees. */}
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setDraft(server)
                  setSelectedId(null)
                }}
                disabled={server.length < 2}
              >
                <ArrowUpDown /> Reorder
              </Button>
              <NewCategoryDialog nextSortOrder={items.length + 1} />
            </>
          )
        }
      />

      {notReady.length > 0 && (
        <div className="rounded-lg border border-warning/25 bg-warning/10 px-4 py-3">
          <span className="text-sm text-foreground">
            <span className="font-semibold tabular-nums">{notReady.length}</span> of{' '}
            <span className="tabular-nums">{items.length}</span> categories{' '}
            {notReady.length === 1 ? 'is' : 'are'} missing active questions
          </span>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Onboarding asks Q1–Q{ONBOARDING_QUESTIONS} and cannot complete without all of them, so a
            creator picking{' '}
            {notReady.map((c, i) => (
              <span key={c.id}>
                {i > 0 && ', '}
                <span className="font-medium text-foreground">{c.label}</span>
              </span>
            ))}{' '}
            hits a gap.
          </p>
        </div>
      )}

      <div className={current ? 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_384px] lg:items-start' : ''}>
        <Panel className="overflow-hidden">
          <PanelHeader
            eyebrow="Coach bank"
            title={
              categories.isLoading
                ? 'Loading…'
                : `${items.length} categories`
            }
          />
          {categories.isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
            </div>
          ) : categories.isError ? (
            <div className="p-10 text-center text-sm text-destructive">Failed to load categories.</div>
          ) : (
            <div className="border-t border-border p-5">
              <DataGrid
                data={items}
                columns={columns}
                getRowId={(c) => c.id}
                searchable={!reordering}
                searchPlaceholder="Search category, slug or coach copy…"
                facetedFilters={reordering ? [] : facetedFilters}
                pageSize={100}
                isLoading={categories.isLoading}
                isError={categories.isError}
                emptyMessage="No coach categories match your filters."
                selectedRowId={current?.id}
                // Row selection is suspended while reordering: a click there means
                // "move this", not "edit this".
                onRowClick={reordering ? undefined : (c) => setSelectedId(c.id)}
                getRowActionLabel={(c) => `Edit ${c.label}`}
              />
            </div>
          )}
        </Panel>

        {current && (
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-9rem)]">
            <CategoryEditor category={current} onClose={() => setSelectedId(null)} />
          </div>
        )}
      </div>
    </div>
  )
}
