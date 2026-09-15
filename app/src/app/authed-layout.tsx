import { useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from '@tanstack/react-router'
import { Loader2, ShieldOff } from 'lucide-react'
import { AppShell } from '@/layout/app-shell'
import type { ShellUser } from '@/layout/topbar'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import {
  clearSession,
  isAdmin,
  isAuthenticated,
  useLogout,
  useMe,
} from '@/features/auth'
import { useModerationQueueCount } from '@/features/moderation'
import { useStuckPublishingCount } from '@/features/publishing'
import { useStuckProcessingCount } from '@/features/drafts'
import { useQueuesCount } from '@/features/queues'

function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Logo showWordmark={false} size="lg" />
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  )
}

/** Guarded shell: requires a session + admin role, else redirects to /login.
    Composes auth data here (app layer) and injects it into the shared shell. */
export function AuthedLayout() {
  const navigate = useNavigate()
  const logout = useLogout()
  const me = useMe()

  useEffect(() => {
    if (me.isError) clearSession()
  }, [me.isError])

  if (!isAuthenticated()) return <Navigate to="/login" />
  if (me.isLoading) return <Splash />
  if (me.isError || !me.data) return <Navigate to="/login" />

  if (!isAdmin(me.data)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-elevated text-destructive">
          <ShieldOff className="size-5" />
        </span>
        <div className="text-sm font-medium text-foreground">Admin access required</div>
        <p className="max-w-xs text-sm text-muted-foreground">
          Your account doesn't have the admin role for this console.
        </p>
        <Button
          variant="secondary"
          onClick={() => logout.mutate(undefined, { onSettled: () => navigate({ to: '/login' }) })}
        >
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <AuthedShell
      user={me.data}
      onLogout={() => logout.mutate(undefined, { onSettled: () => navigate({ to: '/login' }) })}
    />
  )
}

/**
 * The authorised shell — and the only place the nav-badge queries
 * live.
 *
 * They used to sit at the top of `AuthedLayout`, above its `isAuthenticated()`
 * guard. Hooks can't be conditional, so every unauthenticated visit fired six
 * admin requests with no Authorization header, collected six 401s, and kicked
 * off a pointless refresh attempt before the redirect to /login. Mounting the
 * fetching component only after the guard passes fixes it structurally — there
 * is no query to gate, because the component doesn't exist yet.
 */
function AuthedShell({
  user,
  onLogout,
}: {
  user: ShellUser
  onLogout: () => void
}) {
  const moderationCount = useModerationQueueCount()
  const stuckPublishingCount = useStuckPublishingCount()
  const queuesCount = useQueuesCount()
  const stuckProcessing = useStuckProcessingCount()

  return (
    <AppShell
      user={user}
      onLogout={onLogout}
      badges={{
        '/moderation': moderationCount.data ?? 0,
        '/publishing': stuckPublishingCount.data ?? 0,
        '/queues': queuesCount.data ?? 0,
        // Only the stalled ones. A badge counting 47 idle drafts would be noise —
        // nothing is wrong with a draft sitting in drafts.
        '/drafts': stuckProcessing.data?.count ?? 0,
      }}
    >
      <Outlet />
    </AppShell>
  )
}
