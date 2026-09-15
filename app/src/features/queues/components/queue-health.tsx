import { cn } from '@/lib/cn'
import { Panel, PanelHeader } from '@/components/panel'
import { Skeleton } from '@/components/ui/skeleton'
import { Metric } from '@/components/metric'
import { queueLabel, type QueueCount } from '../api/schemas'

function QueueCard({ q }: { q: QueueCount }) {
  const backed = q.waiting + q.active
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{queueLabel(q.name)}</span>
        <span
          className={cn(
            'size-1.5 rounded-full',
            q.failed > 0 ? 'bg-destructive shadow-[0_0_6px_currentColor]' : 'bg-success',
          )}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <Metric
          label="Waiting"
          value={q.waiting}
          tone={backed > 10 ? 'warning' : 'default'}
          align="center"
        />
        <Metric label="Active" value={q.active} align="center" />
        <Metric
          label="Failed"
          value={q.failed}
          tone={q.failed > 0 ? 'danger' : 'default'}
          align="center"
        />
      </div>
    </div>
  )
}

export function QueueHealth({ queues, loading }: { queues: QueueCount[]; loading: boolean }) {
  return (
    <Panel>
      <PanelHeader eyebrow="Pipeline" title="Queue health" />
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          : queues.map((q) => <QueueCard key={q.name} q={q} />)}
      </div>
    </Panel>
  )
}
