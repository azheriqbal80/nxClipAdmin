import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import {
  authResponseSchema,
  userSchema,
  type AuthResponse,
  type LoginRequest,
  type User,
} from './schemas'
import { clearSession, getRefreshToken, getToken, setSession } from '../session'

export const authKeys = {
  me: ['auth', 'me'] as const,
}

/** Current admin profile — the source of truth for the auth gate. */
export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => api.get<User>('/auth/me', { schema: userSchema }),
    enabled: !!getToken(),
    retry: false,
    staleTime: 5 * 60_000,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: LoginRequest) =>
      api.post<AuthResponse>('/auth/login', { body, schema: authResponseSchema }),
    onSuccess: (res) => {
      setSession(res.accessToken, res.refreshToken)
      qc.setQueryData(authKeys.me, res.user)
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    /**
     * The refresh token is the thing being revoked, so it has to travel in the
     * body. Sending none returns `400` with an ASP.NET validation envelope
     * (`errors.RefreshToken`) — and because `onSettled` clears the local session
     * either way, that failure is invisible: the operator looks signed out while
     * the refresh token stays valid until it expires. Verified live 2026-09-09;
     * this endpoint accepted a bodiless call as recently as 2026-08-29.
     */
    mutationFn: () =>
      api.post<void>('/auth/logout', { body: { refreshToken: getRefreshToken() } }),
    onSettled: () => {
      clearSession()
      qc.clear()
    },
  })
}
