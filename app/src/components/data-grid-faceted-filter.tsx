import { ListFilter } from 'lucide-react'
import type { Column } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface FacetOption {
  label: string
  value: string
}

/** Multi-select column filter — sets an array filter value; the column's
    filterFn must be `arrIncludesSome` (DataGrid wires this automatically). */
export function DataGridFacetedFilter<TData>({
  column,
  title,
  options,
}: {
  column?: Column<TData, unknown>
  title: string
  options: FacetOption[]
}) {
  if (!column) return null
  const selected = new Set((column.getFilterValue() as string[]) ?? [])
  const facets = column.getFacetedUniqueValues()

  const toggle = (value: string) => {
    const next = new Set(selected)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    const arr = Array.from(next)
    column.setFilterValue(arr.length ? arr : undefined)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="toolbar" className="border-dashed">
          <ListFilter />
          {title}
          {selected.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge variant="secondary" className="rounded px-1 font-normal">
                {selected.size}
              </Badge>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => {
          const count = facets.get(opt.value)
          return (
            <DropdownMenuCheckboxItem
              key={opt.value}
              checked={selected.has(opt.value)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => toggle(opt.value)}
            >
              <span className="flex-1">{opt.label}</span>
              {count !== undefined && (
                <span className="ml-2 font-mono text-xs text-faint tabular-nums">{count}</span>
              )}
            </DropdownMenuCheckboxItem>
          )
        })}
        {selected.size > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-xs"
              onSelect={() => column.setFilterValue(undefined)}
            >
              Clear filter
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
