import { LogOut, ShieldCheck } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { PageHeader } from '@/components/page-header'
import { Panel, PanelHeader } from '@/components/panel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Field } from '@/components/field'
import { TonePill } from '@/components/status-pill'
import { UserAvatar } from '@/components/user-avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { API_BASE } from '@/api/client'
import { MOCKS_ON } from '@/lib/env'
import { useMe, useLogout } from '@/features/auth'

export function SettingsPage() {
  const me = useMe()
  const logout = useLogout()
  const navigate = useNavigate()
  const user = me.data

  const onSignOut = () =>
    logout.mutate(undefined, { onSettled: () => navigate({ to: '/login' }) })

  return (
    <div className="space-y-6 px-6 py-8 md:px-8">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Your admin account and the environment this console is connected to."
      />

      <Panel>
        <PanelHeader eyebrow="Account" title="Signed-in admin" />
        {me.isLoading || !user ? (
          <div className="flex items-center gap-3 p-5">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
        ) : (
          <div className="space-y-5 p-5">
            <div className="flex items-center gap-3">
              <UserAvatar name={user.displayName} size="lg" />
              <div className="min-w-0">
                <div className="truncate text-subtitle font-semibold text-foreground">
                  {user.displayName}
                </div>
                <div className="truncate text-xs text-muted-foreground">@{user.username}</div>
              </div>
              <TonePill tone="success" className="ml-auto">
                <ShieldCheck className="size-3.5" /> Admin
              </TonePill>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Email">
                <span className="break-all font-mono text-xs">{user.email}</span>
              </Field>
              <Field label="User ID">
                <span className="font-mono text-xs text-faint">{user.id}</span>
              </Field>
              <Field label="Plan">
                <Badge variant="secondary">{user.plan}</Badge>
              </Field>
              <Field label="Roles">
                <div className="flex flex-wrap gap-1.5">
                  {user.roles.map((r) => (
                    <Badge key={r} variant={r === 'admin' ? 'accent' : 'secondary'} className="capitalize">
                      {r}
                    </Badge>
                  ))}
                </div>
              </Field>
            </div>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader eyebrow="Environment" title="Connection" />
        <div className="grid grid-cols-2 gap-4 p-5">
          <Field label="API gateway">
            <span className="break-all font-mono text-xs">{API_BASE || 'same-origin (dev proxy)'}</span>
          </Field>
          <Field label="Data source">
            <TonePill tone={MOCKS_ON ? 'warning' : 'success'}>
              {MOCKS_ON ? 'Mock (MSW)' : 'Live gateway'}
            </TonePill>
          </Field>
        </div>
      </Panel>

      <Panel>
        <PanelHeader eyebrow="Session" title="Sign out" />
        <div className="flex items-center justify-between gap-4 p-5">
          <p className="text-sm text-muted-foreground">
            End this admin session and return to the login screen.
          </p>
          <Button variant="destructive" onClick={onSignOut} disabled={logout.isPending}>
            <LogOut /> {logout.isPending ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </Panel>
    </div>
  )
}
