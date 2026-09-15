import { ArrowUpRight, ChevronRight, Gauge } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { TonePill } from '@/components/status-pill'
import { serviceHealthMeta, titleizeServiceKey } from '@/domain/service-health'
import { DataPlaceholder } from './dashboard-sections'
import type { DataState } from '../api/presentation'

export function OverviewHealth({ services, overallStatus, state, onRetry }: {
  services?: { key: string; ok: boolean; statusCode: number }[]
  overallStatus?: string
  state: DataState
  onRetry: () => void
}) {
  const up = services?.filter(service => service.ok).length ?? 0
  const total = services?.length ?? 0
  const down = total - up
  const summaryTone = state !== 'ready' || !total ? 'neutral' : down ? 'danger' : 'success'
  const summaryLabel = state === 'loading'
    ? 'Loading'
    : state === 'unavailable' || !total
      ? 'Unknown'
      : down
        ? `${down} down`
        : overallStatus === 'ok'
          ? 'Operational'
          : 'Needs attention'
  return <section className="example-panel overview-health-summary" aria-label="System health summary">
    <div><Gauge size={17} /><h2>System health</h2><TonePill tone={summaryTone}>{summaryLabel}</TonePill></div>
    {state !== 'ready' ? <DataPlaceholder state={state} emptyText="No service data" onRetry={onRetry} /> : <>
      <p>{total ? `${up} of ${total} services are operating normally.` : 'No services reported in this snapshot.'}</p>
      {!!total && <details><summary>View service status<ChevronRight size={14} /></summary>
        <div className="example-service-list">{services?.map(service => {
          const meta = serviceHealthMeta(service)
          const isDown = meta.tone === 'danger'
          return <div key={service.key}>
            <span className={`example-service-dot ${isDown ? 'is-down' : ''}`} />
            <strong>{titleizeServiceKey(service.key)}</strong>
            <span className={`example-service-state ${isDown ? 'is-down' : ''}`}>{meta.label}</span>
          </div>
        })}</div>
      </details>}
    </>}
    <Button asChild variant="link" size="xs" className="example-text-button h-auto p-0"><Link to="/health">Open system health <ArrowUpRight size={13} /></Link></Button>
  </section>
}
