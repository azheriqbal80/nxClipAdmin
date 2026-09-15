import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

export interface Column<T> {
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  getRowActionLabel?: (row: T) => string
  /** Highlight the currently-selected row (inspector pattern). */
  selectedKey?: string
  empty?: ReactNode
  className?: string
}

const ALIGN = { left: 'text-left', right: 'text-right', center: 'text-center' }

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement
    && Boolean(target.closest('a, button, input, select, textarea, [role="button"], [role="menuitem"]'))
}

/** Flat, dense data table on shadcn's Table — the primary admin surface.
    Muted header, subtle hover, selectable rows (drives the inspector). */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  getRowActionLabel,
  selectedKey,
  empty = 'No results.',
  className,
}: DataTableProps<T>) {
  const colSpan = columns.length + (onRowClick ? 1 : 0)

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((col, i) => (
            <TableHead
              key={i}
              className={cn('px-4 text-sm font-medium text-muted-foreground', ALIGN[col.align ?? 'left'], col.className)}
            >
              {col.header}
            </TableHead>
          ))}
          {onRowClick && (
            <TableHead className="w-11 px-3 text-right">
              <span className="sr-only">Open row details</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={colSpan} className="py-10 text-center text-muted-foreground">
              {empty}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => {
            const key = rowKey(row)
            const selected = key === selectedKey
            return (
              <TableRow
                key={key}
                data-state={selected ? 'selected' : undefined}
                onClick={onRowClick ? (event) => {
                  if (!isInteractiveTarget(event.target)) onRowClick(row)
                } : undefined}
                className={cn(
                  onRowClick && 'cursor-pointer',
                  selected && 'bg-primary/10 hover:bg-primary/10',
                )}
              >
                {columns.map((col, i) => (
                  <TableCell
                    key={i}
                    className={cn('px-4 py-3 text-foreground/90', ALIGN[col.align ?? 'left'], col.className)}
                  >
                    {col.cell(row)}
                  </TableCell>
                ))}
                {onRowClick && (
                  <TableCell className="px-3 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={getRowActionLabel?.(row) ?? 'Open row details'}
                      onClick={(event) => {
                        event.stopPropagation()
                        onRowClick(row)
                      }}
                    >
                      <ChevronRight />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
