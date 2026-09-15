import { useEffect, useState } from 'react'
import { Save, SlidersHorizontal, X } from 'lucide-react'
import { toast } from 'sonner'
import { Panel } from '@/components/panel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { EmptyState } from '@/components/empty-state'
import { useUpdatePlan, type PlanUpdate } from '../api/queries'
import {
  PLAN_FIELDS,
  PLAN_TONE,
  fmtPlanValue,
  planFieldLabel,
  type PlanLimits,
} from '../api/schemas'

function toForm(p: PlanLimits): PlanUpdate {
  return {
    dailyImageGenerations: p.dailyImageGenerations,
    dailyUploadLimit: p.dailyUploadLimit,
    maxReferenceImages: p.maxReferenceImages,
    maxClipOutputSeconds: p.maxClipOutputSeconds,
    maxClipSourceSeconds: p.maxClipSourceSeconds,
    maxUploadSizeMb: p.maxUploadSizeMb,
    canUseAnalyticsReport: p.canUseAnalyticsReport,
  }
}

export function PlanEditor({ plan, onClose }: { plan: PlanLimits | null; onClose?: () => void }) {
  const update = useUpdatePlan()
  const [form, setForm] = useState<PlanUpdate | null>(null)

  // Reset the form whenever a different plan is selected.
  useEffect(() => {
    setForm(plan ? toForm(plan) : null)
  }, [plan])

  if (!plan || !form) {
    return (
      <Panel className="h-full">
        <EmptyState
          icon={<SlidersHorizontal />}
          title="No plan selected"
          description="Select a plan to edit its entitlement thresholds. Use -1 for unlimited."
          className="h-full"
        />
      </Panel>
    )
  }

  const setNum = (key: keyof PlanUpdate, raw: string) => {
    const n = raw === '' || raw === '-' ? 0 : Number(raw)
    if (!Number.isNaN(n)) setForm((f) => (f ? { ...f, [key]: n } : f))
  }

  const onSave = () =>
    update.mutate(
      { plan: plan.plan, body: form },
      {
        // The read-back is authoritative: show what the server actually stored,
        // and say so plainly when it differs from what was submitted.
        onSuccess: ({ saved, adjusted }) => {
          setForm(toForm(saved))
          if (adjusted.length > 0) {
            toast.warning(`Saved — ${plan.plan} adjusted by the server`, {
              description: adjusted
                .map(
                  (a) =>
                    `${planFieldLabel(a.key)}: ${fmtPlanValue(a.sent)} → ${fmtPlanValue(a.stored)}`,
                )
                .join(' · '),
            })
          } else {
            toast.success('Plan limits saved', { description: plan.plan })
          }
        },
        onError: () => toast.error('Save failed'),
      },
    )

  return (
    <Panel className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Badge variant={PLAN_TONE[plan.plan]}>{plan.plan}</Badge>
        <span className="text-sm font-medium text-foreground">Entitlement limits</span>
        {onClose && (
          <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label="Close panel" onClick={onClose}>
            <X />
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {PLAN_FIELDS.map((f) => (
          <label key={f.key} className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">{f.label}</span>
            <Input
              type="number"
              className="h-9 w-28 text-right font-mono tabular-nums"
              value={String(form[f.key] as number)}
              onChange={(e) => setNum(f.key, e.target.value)}
            />
          </label>
        ))}

        <label className="flex items-center justify-between gap-4 border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">Analytics report</span>
          <Switch
            checked={form.canUseAnalyticsReport}
            onCheckedChange={(v) => setForm((f) => (f ? { ...f, canUseAnalyticsReport: v } : f))}
          />
        </label>

        <p className="text-xs text-faint">
          Use <span className="font-mono">-1</span> for unlimited. DB values win at runtime over code
          defaults.
        </p>
      </div>

      <div className="border-t border-border p-4">
        <Button className="w-full" onClick={onSave} disabled={update.isPending}>
          <Save /> {update.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </Panel>
  )
}
