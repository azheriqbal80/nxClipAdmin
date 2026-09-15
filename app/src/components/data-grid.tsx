import { useState, type ReactNode } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type Table as TanTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchInput } from '@/components/search-input'
import { DataGridFacetedFilter, type FacetOption } from '@/components/data-grid-faceted-filter'
import { cn } from '@/lib/cn'

export interface FacetedFilterConfig {
  columnId: string
  title: string
  options: FacetOption[]
}

interface DataGridProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  getRowId: (row: TData) => string
  /** Adds a leading checkbox column + select-all. */
  enableSelection?: boolean
  /** Global fuzzy search across all columns. */
  searchable?: boolean
  searchPlaceholder?: string
  /** Multi-select column filters (columns must set `filterFn: 'arrIncludesSome'`). */
  facetedFilters?: FacetedFilterConfig[]
  pageSize?: number
  initialSorting?: SortingState
  isLoading?: boolean
  isError?: boolean
  emptyMessage?: ReactNode
  onRowClick?: (row: TData) => void
  getRowActionLabel?: (row: TData) => string
  selectedRowId?: string | null
  /** Rendered in the toolbar when ≥1 row is selected. */
  renderBulkActions?: (selected: TData[], table: TanTable<TData>) => ReactNode
}

const SELECT_COLUMN = 'select'
const ROW_ACTION_COLUMN = 'row-action'

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement
    && Boolean(target.closest('a, button, input, select, textarea, [role="button"], [role="menuitem"]'))
}

export function DataGrid<TData>({
  data,
  columns,
  getRowId,
  enableSelection = false,
  searchable = false,
  searchPlaceholder = 'Search…',
  facetedFilters = [],
  pageSize = 10,
  initialSorting = [],
  isLoading = false,
  isError = false,
  emptyMessage = 'No results.',
  onRowClick,
  getRowActionLabel,
  selectedRowId,
  renderBulkActions,
}: DataGridProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const selectableColumns: ColumnDef<TData>[] = enableSelection
    ? [
        {
          id: SELECT_COLUMN,
          enableSorting: false,
          enableGlobalFilter: false,
          size: 36,
          header: ({ table }) => (
            <Checkbox
              aria-label="Select all"
              checked={
                table.getIsAllPageRowsSelected()
                  ? true
                  : table.getIsSomePageRowsSelected()
                    ? 'indeterminate'
                    : false
              }
              onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              aria-label="Select row"
              checked={row.getIsSelected()}
              onCheckedChange={(v) => row.toggleSelected(!!v)}
              onClick={(e) => e.stopPropagation()}
            />
          ),
        },
        ...columns,
      ]
    : columns

  const allColumns: ColumnDef<TData>[] = onRowClick
    ? [
        ...selectableColumns,
        {
          id: ROW_ACTION_COLUMN,
          enableSorting: false,
          enableGlobalFilter: false,
          size: 44,
          header: () => <span className="sr-only">Open row details</span>,
          cell: ({ row }) => (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={getRowActionLabel?.(row.original) ?? 'Open row details'}
              onClick={(event) => {
                event.stopPropagation()
                onRowClick(row.original)
              }}
            >
              <ChevronRight />
            </Button>
          ),
        },
      ]
    : selectableColumns

  const table = useReactTable({
    data,
    columns: allColumns,
    getRowId,
    state: { sorting, columnFilters, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: enableSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: { pagination: { pageSize } },
  })

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original)

  const hasToolbar = searchable || facetedFilters.length > 0
  const showBulkBar = enableSelection && selectedRows.length > 0

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      {hasToolbar && (
        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <SearchInput
              placeholder={searchPlaceholder}
              className="h-9 w-64"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          )}
          {facetedFilters.map((f) => (
            <DataGridFacetedFilter
              key={f.columnId}
              column={table.getColumn(f.columnId)}
              title={f.title}
              options={f.options}
            />
          ))}
        </div>
      )}

      {/* Bulk-selection bar */}
      {showBulkBar && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5">
          <span className="text-sm font-medium text-foreground">
            {selectedRows.length} selected
          </span>
          <div className="ml-auto flex items-center gap-2">
            {renderBulkActions?.(selectedRows, table)}
            <Button variant="ghost" size="sm" onClick={() => table.resetRowSelection()}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort()
                    const sorted = header.column.getIsSorted()
                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: header.getSize() }}
                        aria-sort={canSort ? sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none' : undefined}
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="-ml-1 inline-flex items-center gap-1 rounded px-1 py-0.5 text-left hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {sorted === 'asc' ? (
                              <ArrowUp className="size-3.5" />
                            ) : sorted === 'desc' ? (
                              <ArrowDown className="size-3.5" />
                            ) : (
                              <ChevronsUpDown className="size-3.5 text-faint" />
                            )}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    <TableCell colSpan={allColumns.length}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={allColumns.length} className="py-10 text-center text-sm text-destructive">
                    Failed to load.
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={allColumns.length} className="py-10 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    onClick={onRowClick ? (event) => {
                      if (!isInteractiveTarget(event.target)) onRowClick(row.original)
                    } : undefined}
                    className={cn(
                      onRowClick && 'cursor-pointer',
                      selectedRowId === row.id && 'bg-primary/5',
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="text-xs text-muted-foreground">
          {enableSelection && selectedRows.length > 0 && (
            <span className="mr-2">{selectedRows.length} of </span>
          )}
          {table.getFilteredRowModel().rows.length} row
          {table.getFilteredRowModel().rows.length === 1 ? '' : 's'}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous page"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next page"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
