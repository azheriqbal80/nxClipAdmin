import { AlertTriangle, Cpu, Hourglass, Rss, ShieldCheck, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Panel } from '@/components/panel'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/field'
import { EmptyState } from '@/components/empty-state'
import { TonePill } from '@/components/status-pill'
import type { Tone } from '@/domain/content'
import { UserAvatar } from '@/components/user-avatar'
import { useRedispatch, useContentJobs } from '../api/queries'
import {
  fmtLag,
  jobLabel,
  stuckMinutes,
  stuckTitle,
  type StuckItem,
} from '../api/schemas'

function Step({
  icon,
  label,
  tone,
  state,
}: {
  icon: ReactNode
  label: string
  tone: Tone
  state: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex size-8 items-center justify-center rounded-md bg-elevated text-muted-foreground [&_svg]:size-4">
        {icon}
      </span>
      <span className="flex-1 truncate text-sm text-foreground">{label}</span>
      <TonePill tone={tone}>{state}</TonePill>
    </div>
  )
}

function jobTone(status: string): Tone {
  if (status === 'completed') return 'success'
  if (status === 'failed') return 'danger'
  return 'warning'
}

export function PublishingInspector({
  item,
  userName,
  onClose,
}: {
  item: StuckItem | null
  userName?: string
  onClose?: () => void
}) {
  const redispatch = useRedispatch()
  const jobs = useContentJobs(item?.id ?? null)

  if (!item) {
    return (
      <Panel className="h-full">
        <EmptyState
          icon={<Hourglass />}
          title="No item selected"
          description="Select a stuck item to see where in the publish pipeline it stalled."
          className="h-full"
        />
      </Panel>
    )
  }

  const minutes = stuckMinutes(item)
  const creatorName = userName ?? item.userId.slice(0, 8)
  const jobList = [...(jobs.data?.items ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const jobFailed = jobList.some((j) => j.status === 'failed')
  const jobError = jobList.find((j) => j.errorMessage)?.errorMessage ?? null
  const hasError = jobFailed || !!item.failureReason
  // Every AI job finished but the item is still `publishing` → stalled at the feed step.
  const feedTone: Tone = hasError ? 'danger' : 'warning'
  const feedState = hasError ? 'Blocked' : 'Awaiting'

  // No per-call callbacks: success removes the item from the publishing queue,
  // which unmounts this panel, and React Query drops an unmounted caller's
  // `mutate()` callbacks. The toasts live on `useRedispatch` so they always run.
  const onRedispatch = () => redispatch.mutate(item)

  return (
    <Panel className="flex h-full flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <div className="truncate text-subtitle font-semibold text-foreground">{stuckTitle(item)}</div>
          <div className="mt-0.5 font-mono text-caption text-faint">{item.id}</div>
        </div>
        <TonePill tone={minutes > 120 ? 'danger' : 'warning'}>stuck {fmtLag(minutes)}</TonePill>
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

        <div>
          <div className="mb-2.5 text-caption font-medium tracking-[0.1em] text-faint uppercase">
            Publish pipeline
          </div>
          <div className="space-y-2.5">
            {jobs.isLoading ? (
              <Step icon={<Cpu />} label="Loading jobs…" tone="neutral" state="…" />
            ) : jobList.length > 0 ? (
              jobList.map((j) => (
                <Step
                  key={j.id}
                  icon={<Cpu />}
                  label={jobLabel(j)}
                  tone={jobTone(j.status)}
                  state={j.status}
                />
              ))
            ) : (
              // No AI jobs returned → item is past moderation by virtue of being in `publishing`.
              <Step icon={<ShieldCheck />} label="Moderation" tone="success" state="Approved" />
            )}
            <Step icon={<Rss />} label="Feed projection" tone={feedTone} state={feedState} />
          </div>
        </div>

        {(jobError || item.failureReason) && (
          <div className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="max-h-40 overflow-y-auto text-xs whitespace-pre-wrap text-foreground/90">
              {item.failureReason ?? jobError}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Job ID">
            <span className="font-mono text-xs text-faint">{item.jobId ?? '—'}</span>
          </Field>
          <Field label="Created">
            <span className="font-mono text-xs">{new Date(item.createdAt).toLocaleString()}</span>
          </Field>
        </div>
      </div>

      <div className="border-t border-border p-4">
        <Button className="w-full" onClick={onRedispatch} disabled={redispatch.isPending}>
          <ShieldCheck /> Force approve &amp; publish
        </Button>
      </div>
    </Panel>
  )
}
