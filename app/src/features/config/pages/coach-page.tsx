import { useMemo, useState } from 'react'
import { ArrowUpDown, ChevronDown, ChevronUp, ListFilter, Save } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { Panel, PanelHeader } from '@/components/panel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { SearchInput } from '@/components/search-input'
import { TonePill } from '@/components/status-pill'
import { DataTable, type Column } from '@/components/data-table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CategoryEditor } from '../components/category-editor'
import { NewCategoryDialog } from '../components/new-category-dialog'
import { useCoachCategories, useReorderCategories } from '../api/queries'
import {
  ONBOARDING_QUESTIONS,
  categoryReadiness,
  type CoachCategory,
} from '../api/schemas'

type StatusFilter = 'active' | 'inactive'
type ReadinessFilter = 'ready' | 'incomplete' | 'unknown'

interface FilterOption<T extends string> {
  label: string
  value: T
}

const STATUS_OPTIONS: FilterOption<StatusFilter>[] = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const ONBOARDING_OPTIONS: FilterOption<ReadinessFilter>[] = [
  { label: 'Ready', value: 'ready' },
  { label: 'Incomplete', value: 'incomplete' },
  { label: 'Unknown', value: 'unknown' },
]

function CoachFilter<T extends string>({
  title,
  options,
  selected,
  counts,
  onToggle,
  onClear,
  disabled,
}: {
  title: string
  options: FilterOption<T>[]
  selected: T[]
  counts: Map<T, number>
  onToggle: (value: T) => void
  onClear: () => void
  disabled?: boolean
}) {
  const active = new Set(selected)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="toolbar" className="border-dashed" disabled={disabled}>
          <ListFilter />
          {title}
          {active.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge variant="secondary" className="rounded px-1 font-normal">
                {active.size}
              </Badge>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={active.has(option.value)}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={() => onToggle(option.value)}
          >
            <span className="flex-1">{option.label}</span>
            <span className="ml-2 font-mono text-xs text-faint tabular-nums">
              {counts.get(option.value) ?? 0}
            </span>
          </DropdownMenuCheckboxItem>
        ))}
        {active.size > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-xs" onSelect={onClear}>
              Clear filter
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function toggleSelection<T extends string>(selected: T[], value: T) {
  return selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
}

function searchableText(c: CoachCategory) {
  return [
    c.label,
    c.slug,
    c.openingMessage,
    c.progressLabel,
    categoryReadiness(c).state,
    c.isActive ? 'active' : 'inactive',
  ].join(' ')
}

/** Move controls replace the order number while reordering. Buttons rather than
    drag-and-drop: this is a short list, and arrows are keyboard-operable and
    testable without a pointer. */
function orderColumn(
  reordering: boolean,
  rows: CoachCategory[],
  move: (index: number, delta: -1 | 1) => void,
): Column<CoachCategory> {
  if (!reordering) {
    return {
      header: 'Order',
      align: 'right',
      cell: (c) => <span className="font-mono text-xs text-faint">{c.sortOrder}</span>,
    }
  }
  return {
    header: 'Order',
    cell: (c) => {
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

const restColumns: Column<CoachCategory>[] = [
  { header: 'Category', cell: (c) => <span className="font-medium text-foreground">{c.label}</span> },
  { header: 'Slug', cell: (c) => <span className="font-mono text-xs text-muted-foreground">{c.slug}</span> },
  {
    header: 'Questions',
    align: 'right',
    cell: (c) => {
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
        <span className="tabular-nums">
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
    // Onboarding needs Q1–Q5 active. A category missing any of them still looks
    // fine in the list otherwise, so the gap has to be its own column.
    header: 'Onboarding',
    cell: (c) => {
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
    header: 'Status',
    cell: (c) => (
      <TonePill tone={c.isActive ? 'success' : 'neutral'}>{c.isActive ? 'Active' : 'Inactive'}</TonePill>
    ),
  },
]

export function CoachPage() {
  const categories = useCoachCategories()
  const reorder = useReorderCategories()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<CoachCategory[] | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState<StatusFilter[]>([])
  const [readinessFilters, setReadinessFilters] = useState<ReadinessFilter[]>([])
  const server = [...(categories.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)

  // While reordering, the table renders a local draft so arrows respond
  // immediately and the whole order commits in one call.
  const reordering = draft !== null
  const items = draft ?? server
  const filteredItems = useMemo(() => {
    if (reordering) return items

    const q = search.trim().toLowerCase()
    return items.filter((c) => {
      const status = c.isActive ? 'active' : 'inactive'
      const readiness = categoryReadiness(c).state

      if (statusFilters.length > 0 && !statusFilters.includes(status)) return false
      if (readinessFilters.length > 0 && !readinessFilters.includes(readiness)) return false
      if (q && !searchableText(c).toLowerCase().includes(q)) return false

      return true
    })
  }, [items, readinessFilters, reordering, search, statusFilters])
  const current = filteredItems.find((c) => c.id === selectedId) ?? null

  const statusCounts = useMemo(() => {
    const counts = new Map<StatusFilter, number>()
    for (const c of items) {
      const status = c.isActive ? 'active' : 'inactive'
      counts.set(status, (counts.get(status) ?? 0) + 1)
    }
    return counts
  }, [items])

  const readinessCounts = useMemo(() => {
    const counts = new Map<ReadinessFilter, number>()
    for (const c of items) {
      const readiness = categoryReadiness(c).state
      counts.set(readiness, (counts.get(readiness) ?? 0) + 1)
    }
    return counts
  }, [items])

  const move = (index: number, delta: -1 | 1) =>
    setDraft((rows) => {
      const list = [...(rows ?? server)]
      const to = index + delta
      if (to < 0 || to >= list.length) return list
      ;[list[index], list[to]] = [list[to], list[index]]
      return list
    })

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
                  setSearch('')
                  setStatusFilters([])
                  setReadinessFilters([])
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
                : filteredItems.length === items.length
                  ? `${items.length} categories`
                  : `${filteredItems.length} of ${items.length} categories`
            }
          />
          {categories.isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
            </div>
          ) : categories.isError ? (
            <div className="p-10 text-center text-sm text-destructive">Failed to load categories.</div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3">
                <SearchInput
                  placeholder="Search category, slug or coach copy…"
                  className="w-72"
                  value={search}
                  disabled={reordering}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <CoachFilter
                  title="Status"
                  options={STATUS_OPTIONS}
                  selected={statusFilters}
                  counts={statusCounts}
                  disabled={reordering}
                  onToggle={(value) => setStatusFilters((selected) => toggleSelection(selected, value))}
                  onClear={() => setStatusFilters([])}
                />
                <CoachFilter
                  title="Onboarding"
                  options={ONBOARDING_OPTIONS}
                  selected={readinessFilters}
                  counts={readinessCounts}
                  disabled={reordering}
                  onToggle={(value) => setReadinessFilters((selected) => toggleSelection(selected, value))}
                  onClear={() => setReadinessFilters([])}
                />
              </div>
              <DataTable
                columns={[orderColumn(reordering, items, move), ...restColumns]}
                rows={filteredItems}
                rowKey={(c) => c.id}
                selectedKey={current?.id}
                // Row selection is suspended while reordering: a click there means
                // "move this", not "edit this".
                onRowClick={reordering ? undefined : (c) => setSelectedId(c.id)}
                getRowActionLabel={(c) => `Edit ${c.label}`}
                empty={
                  <div className="py-6 text-muted-foreground">
                    {items.length === 0 ? 'No coach categories.' : 'No coach categories match your filters.'}
                  </div>
                }
              />
            </>
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
