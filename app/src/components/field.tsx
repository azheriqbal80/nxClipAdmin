import type { ReactNode } from 'react'

/** Labelled detail row — uppercase micro-label above a value.
    The canonical way to present a field in inspectors and detail panels. */
export function Field({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <div className="mb-1 text-caption font-medium tracking-[0.1em] text-faint uppercase">
        {label}
      </div>
      <div className="text-sm text-foreground/90">{children}</div>
    </div>
  )
}
