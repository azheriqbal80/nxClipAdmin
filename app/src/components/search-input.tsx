import type { ComponentProps, ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/cn'

/** Search field: shadcn Input with a leading icon. */
export function SearchInput({
  className,
  containerClassName,
  trailing,
  placeholder = 'Search…',
  ...props
}: ComponentProps<'input'> & { containerClassName?: string; trailing?: ReactNode }) {
  return (
    <div className={cn('relative flex items-center', containerClassName)}>
      <Search className="pointer-events-none absolute left-3 size-4 text-faint" />
      <Input placeholder={placeholder} className={cn('h-9 pl-9', trailing && 'pr-16', className)} {...props} />
      {trailing && <div className="absolute right-2 flex items-center text-caption text-muted-foreground">{trailing}</div>}
    </div>
  )
}
