import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from '@tanstack/react-router'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Panel } from '@/components/panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isApiError } from '@/api/client'
import { MOCKS_ON } from '@/lib/env'
import { useLogin } from '../api/queries'
import { isAuthenticated } from '../session'

export function LoginPage() {
  const login = useLogin()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated()) return <Navigate to="/" />

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    login.mutate(
      { email, password },
      {
        onSuccess: () => navigate({ to: '/' }),
        onError: (err) =>
          setError(isApiError(err) ? err.message : 'Something went wrong. Try again.'),
      },
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" />
        </div>
        <Panel className="p-6">
          <h1 className="text-lg font-semibold text-foreground">Sign in</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Admin access to the nxClip operations console.
          </p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nxclip.com"
                className="h-9"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-9"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertTriangle className="size-3.5 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
              {login.isPending && <Loader2 className="animate-spin" />}
              Sign in
            </Button>
          </form>

          {MOCKS_ON && (
            <p className="mt-4 text-center text-caption text-faint">
              Dev mock: any email + password (min 4 chars).
            </p>
          )}
        </Panel>
      </div>
    </div>
  )
}
