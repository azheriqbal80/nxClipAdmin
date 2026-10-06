import {
  BadgeCheck,
  Ban,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  ShieldMinus,
  UserCheck,
  UserMinus,
  UserRound,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Panel } from '@/components/panel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Field } from '@/components/field'
import { EmptyState } from '@/components/empty-state'
import { TonePill } from '@/components/status-pill'
import { UserAvatar } from '@/components/user-avatar'
import {
  useSetCreatorActive,
  useResetOnboarding,
  useSetCreatorRole,
  type CreatorRole,
  type CreatorRoleAction,
} from '../api/queries'
import { PLAN_TONE, isCreatorAdmin, type Creator } from '../api/schemas'

const ROLE_CONTROLS: Array<{
  role: CreatorRole
  label: string
  description: string
  grantLabel: string
  revokeLabel: string
  GrantIcon: typeof ShieldCheck
  RevokeIcon: typeof ShieldMinus
}> = [
  {
    role: 'admin',
    label: 'Admin access',
    description: 'Can open this console and use protected admin routes.',
    grantLabel: 'Grant admin',
    revokeLabel: 'Revoke admin',
    GrantIcon: ShieldCheck,
    RevokeIcon: ShieldMinus,
  },
  {
    role: 'creator',
    label: 'Creator role',
    description: 'Keeps this account eligible for creator-facing app access.',
    grantLabel: 'Grant creator',
    revokeLabel: 'Revoke creator',
    GrantIcon: UserCheck,
    RevokeIcon: UserMinus,
  },
]

export function CreatorInspector({
  creator,
  onClose,
}: {
  creator: Creator | null
  onClose?: () => void
}) {
  const setActive = useSetCreatorActive()
  const resetOnboarding = useResetOnboarding()
  const setRole = useSetCreatorRole()

  if (!creator) {
    return (
      <Panel className="h-full">
        <EmptyState
          icon={<UserRound />}
          title="No creator selected"
          description="Select a row to view the creator and manage their account."
          className="h-full"
        />
      </Panel>
    )
  }

  const busy = setActive.isPending || resetOnboarding.isPending || setRole.isPending
  const admin = isCreatorAdmin(creator)
  const hasRole = (role: CreatorRole) => creator.roles.some((r) => r.toLowerCase() === role)

  const onToggleActive = () =>
    setActive.mutate(
      { id: creator.id, isActive: !creator.isActive },
      {
        onSuccess: () =>
          toast.success(creator.isActive ? 'Creator suspended' : 'Creator reactivated', {
            description: creator.displayName,
          }),
        onError: () => toast.error('Update failed'),
      },
    )

  const onReset = () =>
    resetOnboarding.mutate(creator.id, {
      onSuccess: () => toast.success('Onboarding reset', { description: creator.displayName }),
      onError: () => toast.error('Reset failed'),
    })

  const onRoleChange = (role: CreatorRole, action: CreatorRoleAction) =>
    setRole.mutate(
      { creator, role, action },
      {
        onSuccess: () =>
          toast.success(action === 'grant' ? 'Role granted' : 'Role revoked', {
            description: `${creator.displayName} · ${role}`,
          }),
        onError: () => toast.error('Role update failed'),
      },
    )

  return (
    <Panel className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <UserAvatar name={creator.displayName} size="lg" />
        <div className="min-w-0">
          <div className="truncate text-subtitle font-semibold text-foreground">{creator.displayName}</div>
          <div className="truncate text-xs text-muted-foreground">@{creator.username}</div>
        </div>
        <TonePill tone={creator.isActive ? 'success' : 'danger'} className="ml-auto">
          {creator.isActive ? 'Active' : 'Suspended'}
        </TonePill>
        {onClose && (
          <Button variant="ghost" size="icon-sm" aria-label="Close panel" onClick={onClose}>
            <X />
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Plan">
            <Badge variant={PLAN_TONE[creator.plan]}>{creator.plan}</Badge>
          </Field>
          {creator.contentCount !== undefined && (
            <Field label="Content">{creator.contentCount} items</Field>
          )}
          <Field label="Email">
            <span className="break-all font-mono text-xs">{creator.email}</span>
          </Field>
          <Field label="User ID">
            <span className="font-mono text-xs text-faint">{creator.id}</span>
          </Field>
        </div>

        <Field label="Roles">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {creator.roles.map((r) => (
                <Badge key={r} variant={r === 'admin' ? 'accent' : 'secondary'} className="capitalize">
                  {r}
                </Badge>
              ))}
              {!creator.roles.length && <Badge variant="neutral">No roles</Badge>}
            </div>
            <div className="space-y-2">
              {ROLE_CONTROLS.map((item) => {
                const granted = hasRole(item.role)
                const Icon = granted ? item.RevokeIcon : item.GrantIcon
                return (
                  <div
                    key={item.role}
                    className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3"
                  >
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-elevated text-muted-foreground">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                        <Badge variant={granted ? 'success' : 'neutral'} size="sm">
                          {granted ? 'Granted' : 'Missing'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Button
                      variant={granted ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => onRoleChange(item.role, granted ? 'revoke' : 'grant')}
                      disabled={busy}
                    >
                      {granted ? item.revokeLabel : item.grantLabel}
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          {creator.emailVerified !== undefined && (
            <Field label="Email verified">
              {creator.emailVerified ? (
                <span className="flex items-center gap-1.5 text-success">
                  <BadgeCheck className="size-4" /> Verified
                </span>
              ) : (
                <span className="text-muted-foreground">Unverified</span>
              )}
            </Field>
          )}
          <Field label="Onboarding">
            {creator.onboardingCompleted ? (
              <span className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="size-4" /> Complete
              </span>
            ) : (
              <span className="text-warning">Incomplete</span>
            )}
          </Field>
        </div>
      </div>

      <div className="space-y-2 border-t border-border p-4">
        <div className="flex gap-2">
          <Button
            variant={creator.isActive ? 'destructive' : 'default'}
            className="flex-1"
            onClick={onToggleActive}
            disabled={busy}
          >
            {creator.isActive ? <Ban /> : <CheckCircle2 />}
            {creator.isActive ? 'Suspend' : 'Reactivate'}
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onReset} disabled={busy}>
            <RotateCcw /> Reset onboarding
          </Button>
        </div>
        {admin && (
          <div className="text-caption text-muted-foreground">
            Admin role is managed in the Roles section above.
          </div>
        )}
      </div>
    </Panel>
  )
}
