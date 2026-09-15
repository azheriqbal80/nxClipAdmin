import { FileText, X } from 'lucide-react'
import { Panel } from '@/components/panel'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/field'
import { EmptyState } from '@/components/empty-state'
import { TonePill } from '@/components/status-pill'
import { UserAvatar } from '@/components/user-avatar'
import {
  STUCK_AFTER_MINUTES,
  draftTitle,
  formatAge,
  isLikelyStuck,
  minutesSince,
  type DraftItem,
} from '../api/schemas'

/**
 * Read-only detail for pre-submission content.
 *
 * Deliberately has no actions. Approve and takedown are moderation decisions on
 * content a creator has submitted; neither is meaningful on a draft nobody has
 * finished, and firing approve here would publish something straight out of a
 * creator's drafts. The Moderation Hub stays the only place content is acted on.
 */
export function DraftInspector({
  item,
  userName,
  onClose,
}: {
  item: DraftItem | null
  userName?: string
  onClose?: () => void
}) {
  if (!item) {
    return (
      <Panel className="h-full">
        <EmptyState
          icon={<FileText />}
          title="No item selected"
          description="Select a draft or in-progress item to see its prompt and how long it has been sitting."
          className="h-full"
        />
      </Panel>
    )
  }

  const creatorName = userName ?? item.userId.slice(0, 8)
  const age = minutesSince(item.createdAt)
  const stuck = isLikelyStuck(item)
  const processing = item.status === 'processing'

  return (
    <Panel className="flex h-full flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <div className="truncate text-subtitle font-semibold text-foreground">
            {draftTitle(item)}
          </div>
          <div className="mt-0.5 font-mono text-caption text-faint">{item.id}</div>
        </div>
        <TonePill tone={stuck ? 'warning' : 'neutral'}>
          {processing ? `processing ${formatAge(item.createdAt)}` : `draft ${formatAge(item.createdAt)}`}
        </TonePill>
        {onClose && (
          <Button variant="ghost" size="icon-sm" aria-label="Close panel" onClick={onClose}>
            <X />
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div className="flex items-center gap-2.5">
          <UserAvatar name={creatorName} size="sm" />
          <div className="min-w-0">
            <div className="truncate text-xs text-muted-foreground">Creator</div>
            <div className="truncate text-sm font-medium text-foreground">{creatorName}</div>
            <div className="truncate font-mono text-caption text-faint">{item.userId}</div>
          </div>
        </div>

        {stuck && (
          <div className="rounded-md border border-warning/25 bg-warning/10 p-3">
            <div className="text-sm font-medium text-foreground">
              Generation may have stalled
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Still <span className="tabular-nums">{formatAge(item.createdAt)}</span> in{' '}
              <code className="font-mono text-caption">processing</code>, past the{' '}
              <span className="tabular-nums">{STUCK_AFTER_MINUTES}m</span> mark. Generation runs in
              minutes, but the gateway exposes no queue history to confirm it — check AI Queues for a
              job on this content.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Status">
            <span className="capitalize">{item.status}</span>
          </Field>
          <Field label="Type">
            <span className="capitalize">{item.contentType}</span>
          </Field>
          <Field label="Age">
            <span className="tabular-nums">{formatAge(item.createdAt)}</span>
          </Field>
          <Field label="Aspect ratio">{item.aspectRatio ?? '—'}</Field>
          <Field label="Style">{item.style ? <span className="capitalize">{item.style.replace(/_/g, ' ')}</span> : '—'}</Field>
          <Field label="Job">
            {item.jobId ? (
              <span className="font-mono text-xs">{item.jobId}</span>
            ) : (
              // Drafts have never been dispatched, so this is expected, not missing.
              <span className="text-faint">not dispatched</span>
            )}
          </Field>
        </div>

        <Field label="Prompt">
          {item.prompt?.trim() ? (
            <p className="whitespace-pre-wrap text-sm text-foreground/90">{item.prompt}</p>
          ) : (
            <span className="text-faint">No prompt yet</span>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Created">
            <span className="font-mono text-xs">{new Date(item.createdAt).toLocaleString()}</span>
          </Field>
          <Field label="Last updated">
            <span className="font-mono text-xs">{new Date(item.updatedAt).toLocaleString()}</span>
          </Field>
        </div>

        {!processing && age > 60 * 24 * 7 && (
          <p className="text-sm text-muted-foreground">
            Untouched for over a week. Drafts have no expiry, so this is informational — creators
            keep them as long as they like.
          </p>
        )}
      </div>
    </Panel>
  )
}
