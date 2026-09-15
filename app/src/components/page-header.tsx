import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}

/** Standard page header: compact title + optional top-right action. */
export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div data-slot="page-header" className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1 text-caption font-medium tracking-[0.12em] text-faint uppercase">
            {eyebrow}
          </div>
        )}
        <h1 className="text-page-title font-semibold leading-snug text-foreground">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  )
}
