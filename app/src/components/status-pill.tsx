import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/cn'
import {
  CONTENT_STATUS_META,
  PRIORITY_META,
  type ContentStatus,
  type Priority,
  type Tone,
} from '@/domain/content'

/** A tone badge with a leading status dot — the app-wide status marker. */
export function TonePill({
  tone,
  children,
  className,
  size = 'default',
}: {
  tone: Tone
  children: React.ReactNode
  className?: string
  size?: 'default' | 'sm'
}) {
  return (
    <Badge variant={tone} size={size} className={cn('gap-1.5', className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </Badge>
  )
}

/** Content-status pill wired to the backend status → tone/label map. */
export function StatusPill({ status, className, size = 'default' }: { status: ContentStatus; className?: string; size?: 'default' | 'sm' }) {
  const meta = CONTENT_STATUS_META[status]
  return (
    <TonePill tone={meta.tone} className={className} size={size}>
      {meta.label}
    </TonePill>
  )
}

/** Moderation priority pill. */
export function PriorityPill({ priority, className, size = 'default' }: { priority: Priority; className?: string; size?: 'default' | 'sm' }) {
  const meta = PRIORITY_META[priority]
  return (
    <TonePill tone={meta.tone} className={className} size={size}>
      {meta.label}
    </TonePill>
  )
}
