import { API_BASE, setAccessToken, setTokenRefresher } from '@/api/client'

/**
 * Session persistence + token refresh wiring.
 *
 * Bearer access token lives in memory (client) + localStorage so a reload keeps
 * the session; the refresh token is stored alongside and exchanged at
 * `/auth/refresh`. We register the refresher with the shared client here so the
 * client can retry-once-on-401 without importing this feature.
 */
const ACCESS_KEY = 'nx_admin_token'
const REFRESH_KEY = 'nx_admin_refresh'

let proactiveTimer: ReturnType<typeof setTimeout> | undefined

export function getToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_KEY)
  } catch {
    return null
  }
}

/** Exported because `POST /auth/logout` needs the refresh token in its body —
    it is the token being revoked, and the endpoint 400s without it. */
export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY)
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return !!getToken()
}

export function setSession(accessToken: string, refreshToken?: string) {
  localStorage.setItem(ACCESS_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
  setAccessToken(accessToken)
  scheduleProactiveRefresh(accessToken)
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  setAccessToken(null)
  if (proactiveTimer) clearTimeout(proactiveTimer)
}

/** Exchange the refresh token for a new access token. Returns null on failure. */
async function refresh(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  try {
    const res = await fetch(new URL('/auth/refresh', API_BASE), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) {
      clearSession()
      return null
    }
    const data = (await res.json()) as { accessToken: string; refreshToken?: string }
    setSession(data.accessToken, data.refreshToken)
    return data.accessToken
  } catch {
    return null
  }
}

/** Decode a JWT `exp` (seconds) if the token is a real JWT; null for mock tokens. */
function jwtExpMs(token: string): number | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

/** Refresh ~5 min before expiry (real JWTs only; no-op for mock tokens). */
function scheduleProactiveRefresh(token: string) {
  if (proactiveTimer) clearTimeout(proactiveTimer)
  const expMs = jwtExpMs(token)
  if (!expMs) return
  const lead = 5 * 60_000
  const delay = Math.max(0, expMs - Date.now() - lead)
  proactiveTimer = setTimeout(() => void refresh(), delay)
}

/** Boot: rehydrate the token and register the refresher with the client. */
export function initSession() {
  const token = getToken()
  setAccessToken(token)
  setTokenRefresher(refresh)
  if (token) scheduleProactiveRefresh(token)
}
