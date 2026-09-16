import { AlertTriangle, Copy, ListTree, RotateCcw, X } from 'lucide-react'
import { toast } from 'sonner'
import { Panel } from '@/components/panel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Field } from '@/components/field'
import { EmptyState } from '@/components/empty-state'
import { TonePill } from '@/components/status-pill'
import { UserAvatar } from '@/components/user-avatar'
import { useRetryJob } from '../api/queries'
import { queueLabel, type Job } from '../api/schemas'

/** Pretty-print a job payload, summarising data URIs and long opaque strings
    instead of dumping them. Keeps the panel readable and — the point for
    triage — makes a zero-length or truncated image input obvious at a glance. */
function formatPayload(value: unknown) {
  const seen = new WeakSet<object>()
  const replacer = (_key: string, v: unknown) => {
    if (typeof v === 'string') {
      const uri = /^data:([^;,]*)[^,]*,(.*)$/s.exec(v)
      if (uri) return `«${uri[1] || 'data'} URI · ${uri[2].length} chars»`
      if (v.length > 180) return `«${v.length} chars · ${v.slice(0, 32)}…»`
      return v
    }
    if (typeof v === 'object' && v !== null) {
      if (seen.has(v)) return '«circular»'
      seen.add(v)
    }
    return v
  }
  try {
    return JSON.stringify(value, replacer, 2)
  } catch {
    return String(value)
  }
}

function PayloadBlock({ label, value }: { label: string; value: unknown }) {
  const text = formatPayload(value)
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-caption font-medium tracking-[0.1em] text-faint uppercase">{label}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-auto"
          aria-label={`Copy ${label.toLowerCase()}`}
          onClick={() => {
            navigator.clipboard
              ?.writeText(typeof value === 'string' ? value : JSON.stringify(value, null, 2))
              .then(() => toast.success(`${label} copied`))
              .catch(() => toast.error('Copy failed'))
          }}
        >
          <Copy />
        </Button>
      </div>
      <pre className="max-h-56 overflow-auto rounded-lg border border-border bg-surface-2 p-3 font-mono text-caption leading-relaxed whitespace-pre-wrap text-foreground/90">
        {text}
      </pre>
    </div>
  )
}

export function JobInspector({
  job,
  userName,
  onClose,
}: {
  job: Job | null
  userName?: string
  onClose?: () => void
}) {
  const retry = useRetryJob()

  if (!job) {
    return (
      <Panel className="h-full">
        <EmptyState
          icon={<ListTree />}
          title="No job selected"
          description="Select a failed job to inspect its error and retry it."
          className="h-full"
        />
      </Panel>
    )
  }

  // No per-call callbacks: a retried job leaves `status=failed`, unmounting
  // this panel before React Query would run them. Toasts live on useRetryJob.
  const onRetry = () => retry.mutate(job)
  const displayUser = userName ?? (job.userId ? job.userId.slice(0, 8) : 'System job')

  return (
    <Panel className="flex h-full flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <div className="truncate text-subtitle font-semibold text-foreground">
            {queueLabel(job.queueName)}
          </div>
          <div className="mt-0.5 font-mono text-caption text-faint">{job.id}</div>
        </div>
        <TonePill tone={job.status === 'failed' ? 'danger' : 'neutral'}>{job.status}</TonePill>
        {onClose && (
          <Button variant="ghost" size="icon-sm" aria-label="Close panel" onClick={onClose}>
            <X />
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Job type">
            <Badge variant="secondary">{job.jobType}</Badge>
          </Field>
          <Field label="Prompt version">{job.promptVersion ?? '—'}</Field>
        </div>

        <Field label="Requested by">
          <div className="flex items-center gap-2">
            <UserAvatar name={displayUser} size="sm" />
            <div className="min-w-0">
              <div className="truncate text-sm text-foreground">{displayUser}</div>
              <div className="truncate font-mono text-caption text-faint">{job.userId ?? 'No user ID'}</div>
            </div>
          </div>
        </Field>

        {job.contentId && (
          <Field label="Content ID">
            <span className="font-mono text-xs text-faint">{job.contentId}</span>
          </Field>
        )}

        <Field label="Updated">
          <span className="font-mono text-xs">{new Date(job.updatedAt).toLocaleString()}</span>
        </Field>

        {job.correlationId && (
          <Field label="Correlation ID">
            <span className="font-mono text-xs text-faint">{job.correlationId}</span>
          </Field>
        )}

        {job.errorMessage && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0 text-destructive" />
              <span className="text-xs font-medium text-destructive">Error</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-auto"
                aria-label="Copy error"
                onClick={() => {
                  navigator.clipboard
                    ?.writeText(job.errorMessage ?? '')
                    .then(() => toast.success('Error copied'))
                    .catch(() => toast.error('Copy failed'))
                }}
              >
                <Copy />
              </Button>
            </div>
            <div className="max-h-40 overflow-y-auto font-mono text-xs whitespace-pre-wrap text-foreground/90">
              {job.errorMessage}
            </div>
          </div>
        )}

        {/* The exact input handed to the AI service — the only way to tell from
            the panel whether a provider rejection came from a bad input. */}
        {job.inputPayload != null && <PayloadBlock label="Input payload" value={job.inputPayload} />}
        {job.resultPayload != null && <PayloadBlock label="Result payload" value={job.resultPayload} />}
      </div>

      <div className="border-t border-border p-4">
        <Button className="w-full" onClick={onRetry} disabled={retry.isPending}>
          <RotateCcw /> Retry job
        </Button>
      </div>
    </Panel>
  )
}
