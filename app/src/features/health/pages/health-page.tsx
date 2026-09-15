import { Activity, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Panel } from '@/components/panel'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TonePill } from '@/components/status-pill'
import { serviceHealthMeta, titleizeServiceKey } from '@/domain/service-health'
import { cn } from '@/lib/cn'
import { useHealth } from '../api/queries'
import type { ServiceHealthDto } from '../api/schemas'

function ServiceCard({ s }: { s: ServiceHealthDto }) {
  const meta = serviceHealthMeta(s)
  const up = meta.tone === 'success'
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <span
            className={cn(
              'size-2 rounded-full',
              up ? 'bg-success shadow-[0_0_6px_currentColor]' : 'bg-destructive',
            )}
          />
          {titleizeServiceKey(s.key)}
        </span>
        <TonePill tone={meta.tone}>{meta.label}</TonePill>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-micro tracking-wide text-faint uppercase">Response</div>
          <div className={cn('font-mono', up ? 'text-foreground' : 'text-destructive')}>
            HTTP {s.statusCode}
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-micro tracking-wide text-faint uppercase">Probe</div>
          <div className="truncate font-mono text-faint">{s.url}</div>
        </div>
      </div>
    </div>
  )
}

export function HealthPage() {
  const { data, isLoading, isError, isFetching, refetch } = useHealth()
  const services = data?.services ?? []
  const down = services.filter((s) => !s.ok).length
  // If the check itself failed — or came back empty — service state is *unknown*,
  // not healthy. Reporting "All systems operational" off an errored request is
  // the one thing this page must never do (DESIGN.md § The Honest Health Rule).
  const unknown = !isLoading && (isError || services.length === 0)

  return (
    <div className="space-y-6 px-6 py-8 md:px-8">
      <PageHeader
        eyebrow="System"
        title="System Health"
        description="Live status of the nxClip services behind the gateway."
        action={
          <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? 'animate-spin' : undefined} /> Refresh
          </Button>
        }
      />

      <Panel className="flex items-center gap-3 p-5">
        <span className="inline-flex size-8 items-center justify-center rounded-md bg-elevated text-primary">
          <Activity className="size-4" />
        </span>
        <div>
          <div className="text-sm font-medium text-foreground">
            {isLoading
              ? 'Checking…'
              : unknown
                ? 'Service state unknown'
                : down === 0
                  ? 'All systems operational'
                  : `${down} service${down === 1 ? '' : 's'} down`}
          </div>
          {unknown ? (
            <div className="text-xs text-destructive">
              The gateway health check did not answer — this is not a clean bill of health.
            </div>
          ) : (
            data && (
              <div className="text-xs text-muted-foreground">
                Gateway reports: <span className="font-mono">{data.status}</span>
              </div>
            )
          )}
        </div>
        <TonePill
          tone={unknown ? 'danger' : down === 0 ? 'success' : 'warning'}
          className="ml-auto"
        >
          {isLoading ? '—' : unknown ? 'Unknown' : down === 0 ? 'Operational' : 'Degraded'}
        </TonePill>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)
        ) : unknown ? (
          <Panel className="col-span-full p-10 text-center text-sm text-destructive">
            Couldn&apos;t reach <span className="font-mono">/admin/health</span>. Service status is
            unknown — treat nothing here as green.
          </Panel>
        ) : (
          services.map((s) => <ServiceCard key={s.key} s={s} />)
        )}
      </div>
    </div>
  )
}
