import { Compass, Globe, Heart, MessageCircle, X } from 'lucide-react'
import { Panel } from '@/components/panel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { TonePill } from '@/components/status-pill'
import { UserAvatar } from '@/components/user-avatar'
import { Metric } from '@/components/metric'
import { fmtCompact, projectionTitle, type Projection } from '../api/schemas'

export function ProjectionInspector({
  projection: p,
  userName,
  onClose,
}: {
  projection: Projection | null
  userName?: string
  onClose?: () => void
}) {
  if (!p) {
    return (
      <Panel className="h-full">
        <EmptyState
          icon={<Compass />}
          title="No item selected"
          description="Select a row to inspect its ranking and engagement. This view is read-only."
          className="h-full"
        />
      </Panel>
    )
  }

  const creatorName = userName ?? p.userId.slice(0, 8)

  return (
    <Panel className="flex h-full flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <div className="truncate text-subtitle font-semibold text-foreground">{projectionTitle(p)}</div>
          <div className="mt-0.5 font-mono text-caption text-faint">{p.contentId}</div>
        </div>
        <Metric label="WES" value={p.wesScore} align="center" className="shrink-0" />
        {onClose && (
          <Button variant="ghost" size="icon-sm" aria-label="Close panel" onClick={onClose}>
            <X />
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <div className="flex items-center gap-2.5">
          <UserAvatar name={creatorName} size="sm" />
          <div className="min-w-0">
            <div className="truncate text-xs text-muted-foreground">Creator</div>
            <div className="truncate text-sm font-medium text-foreground">{creatorName}</div>
            <div className="truncate font-mono text-caption text-faint">{p.userId}</div>
          </div>
          <Badge variant="secondary" className="ml-auto capitalize">{p.contentType}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Metric icon={<Heart />} label="Likes" value={fmtCompact(p.likeCount)} boxed />
          <Metric icon={<MessageCircle />} label="Comments" value={fmtCompact(p.commentCount)} boxed />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Social rollup">
            <Badge variant="secondary" className="capitalize">{p.socialRollup}</Badge>
          </Field>
          <Field label="Live externally">
            <span className="flex items-center gap-2">
              <Globe className="size-4 text-faint" />
              <TonePill tone={p.hasLiveExternal ? 'success' : 'neutral'}>
                {p.hasLiveExternal ? 'Yes' : 'No'}
              </TonePill>
            </span>
          </Field>
        </div>

        {p.publishedAt && (
          <Field label="Published">
            <span className="font-mono text-xs">{new Date(p.publishedAt).toLocaleString()}</span>
          </Field>
        )}
      </div>
    </Panel>
  )
}
