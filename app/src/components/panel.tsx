import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Base surface container — rounded, hairline-bordered dark card. */
export function Panel({ className, as: Comp = 'div', title, description, action, children, ...props }: Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  as?: 'div' | 'section'
  title?: ReactNode
  description?: string
  action?: ReactNode
}) {
  return <Comp data-slot="panel" className={cn('min-w-0 rounded-xl border border-border bg-card', title && 'overflow-hidden', className)} {...props}>
    {title && <PanelHeader title={title} description={description} action={action} divider={false} />}
    {children}
  </Comp>
}

interface PanelHeaderProps {
  title: ReactNode
  /** Small uppercase eyebrow above the title (e.g. "MODERATION"). */
  eyebrow?: string
  action?: ReactNode
  description?: string
  divider?: boolean
  className?: string
}

export function PanelHeader({ title, eyebrow, description, action, divider = true, className }: PanelHeaderProps) {
  return (
    <div data-slot="panel-header" className={cn('flex flex-wrap items-center justify-between gap-3 px-5 py-4', divider && 'border-b border-border', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-0.5 text-caption font-medium tracking-[0.12em] text-faint uppercase">
            {eyebrow}
          </div>
        )}
        <h2 className="text-subtitle font-medium text-foreground">{title}</h2>
        {description && <p className="mt-1 text-caption text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}
