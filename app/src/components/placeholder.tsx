import { Construction } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Panel } from '@/components/panel'

/** Temporary page for modules not yet built (Phase 2+). */
export function Placeholder({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-8">
      <PageHeader eyebrow={eyebrow ?? 'Coming online'} title={title} />
      <Panel className="mt-6 flex flex-col items-center justify-center gap-3 py-20 text-center">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-elevated text-primary">
          <Construction className="size-5" />
        </span>
        <div className="text-sm font-medium text-foreground">{title} is not built yet</div>
        <p className="max-w-sm text-sm text-muted-foreground">
          This module is scheduled after the design system. It'll be assembled from the
          primitives on the Design System page, against the typed admin API contract.
        </p>
      </Panel>
    </div>
  )
}
