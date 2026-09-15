import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Panel, PanelHeader } from '@/components/panel'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, type Column } from '@/components/data-table'
import { PlanEditor } from '../components/plan-editor'
import { usePlans } from '../api/queries'
import { PLAN_TONE, fmtLimit, type PlanLimits } from '../api/schemas'

const columns: Column<PlanLimits>[] = [
  { header: 'Plan', cell: (p) => <Badge variant={PLAN_TONE[p.plan]}>{p.plan}</Badge> },
  { header: 'Img/day', align: 'right', cell: (p) => <span className="font-mono tabular-nums">{fmtLimit(p.dailyImageGenerations)}</span> },
  { header: 'Uploads/day', align: 'right', cell: (p) => <span className="font-mono tabular-nums">{fmtLimit(p.dailyUploadLimit)}</span> },
  { header: 'Clip out (s)', align: 'right', cell: (p) => <span className="font-mono tabular-nums">{fmtLimit(p.maxClipOutputSeconds)}</span> },
  { header: 'Upload MB', align: 'right', cell: (p) => <span className="font-mono tabular-nums">{fmtLimit(p.maxUploadSizeMb)}</span> },
  {
    header: 'Analytics',
    cell: (p) => (
      <Badge variant={p.canUseAnalyticsReport ? 'success' : 'neutral'}>
        {p.canUseAnalyticsReport ? 'Yes' : 'No'}
      </Badge>
    ),
  },
]

export function PlansPage() {
  const plans = usePlans()
  const [selected, setSelected] = useState<string | null>(null)
  const items = plans.data ?? []
  const current = items.find((p) => p.plan === selected) ?? null

  return (
    <div className="space-y-6 px-6 py-8 md:px-8">
      <PageHeader
        eyebrow="Configuration"
        title="Plan Limits"
        description="Edit the FREE / PRO / STUDIO entitlement thresholds enforced by content-service. Use -1 for unlimited."
      />

      <div className={current ? 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_384px] lg:items-start' : ''}>
        <Panel className="overflow-hidden">
          <PanelHeader eyebrow="Plans" title={plans.isLoading ? 'Loading…' : `${items.length} plans`} />
          {plans.isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
            </div>
          ) : plans.isError ? (
            <div className="p-10 text-center text-sm text-destructive">Failed to load plans.</div>
          ) : (
            <DataTable
              columns={columns}
              rows={items}
              rowKey={(p) => p.plan}
              selectedKey={current?.plan}
              onRowClick={(p) => setSelected(p.plan)}
              getRowActionLabel={(p) => `Edit ${p.plan} plan`}
              empty={<div className="py-6 text-muted-foreground">No plans configured.</div>}
            />
          )}
        </Panel>

        {current && (
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-9rem)]">
            <PlanEditor plan={current} onClose={() => setSelected(null)} />
          </div>
        )}
      </div>
    </div>
  )
}
