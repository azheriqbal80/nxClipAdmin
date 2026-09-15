/**
 * Base HTTP client for the admin app.
 *
 * All admin calls go through one place so flipping MSW mocks → real `/admin/*`
 * is a single change. Auth is Bearer (access token in memory). Per the
 * frontend-integration-guide, an expired access token is refreshed once on a
 * gateway 401 and the original request is retried. The refresher is *injected*
 * by the auth feature (setTokenRefresher) so this shared client never imports a
 * feature.
 */
import type { ZodType } from 'zod'

/** Empty = same-origin: dev proxies /auth and /admin to the gateway (vite.config),
    and a same-origin production deploy needs no base. Set VITE_API_URL to call a
    cross-origin gateway directly (requires CORS on the gateway). */
export const API_BASE = import.meta.env.VITE_API_URL ?? ''

let accessToken: string | null = null
export function setAccessToken(token: string | null) {
  accessToken = token
}
export function getAccessToken(): string | null {
  return accessToken
}

/** Returns a fresh access token (or null if refresh failed). Injected by auth. */
export type TokenRefresher = () => Promise<string | null>
let tokenRefresher: TokenRefresher | null = null
export function setTokenRefresher(fn: TokenRefresher | null) {
  tokenRefresher = fn
}

/** De-dupe concurrent refreshes: many 401s share one refresh round-trip. */
let refreshInFlight: Promise<string | null> | null = null
function refreshOnce(): Promise<string | null> {
  if (!tokenRefresher) return Promise.resolve(null)
  if (!refreshInFlight) {
    refreshInFlight = tokenRefresher().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

/** Auth endpoints must not themselves trigger the refresh-and-retry loop. */
function isAuthEntryPath(path: string) {
  return /\/auth\/(login|refresh|logout)/.test(path)
}

export interface ApiError {
  status: number
  message: string
  code?: string
  /** Gateway trace id, echoed in error responses — surface for support. */
  correlationId?: string
}

function isApiError(e: unknown): e is ApiError {
  return typeof e === 'object' && e !== null && 'status' in e && 'message' in e
}
export { isApiError }

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Validate + parse the JSON response against this schema. */
  schema?: ZodType
  /** Query params appended to the path. */
  params?: Record<string, string | number | undefined>
  /** Internal: set once we've already refreshed+retried this request. */
  _retried?: boolean
}

export async function apiRequest<T = unknown>(
  path: string,
  { body, schema, params, headers, _retried, ...init }: RequestOptions = {},
): Promise<T> {
  // Empty API_BASE = same-origin (dev proxy / same-host deploy); fall back to
  // the page origin so relative paths resolve instead of throwing on new URL().
  const url = new URL(path, API_BASE || window.location.origin)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v))
    }
  }

  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-Id': crypto.randomUUID(),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  // Gateway JWT expiry → refresh once, then retry the original request once.
  if (res.status === 401 && !_retried && !isAuthEntryPath(path) && tokenRefresher) {
    const fresh = await refreshOnce()
    if (fresh) {
      return apiRequest<T>(path, {
        body,
        schema,
        params,
        headers,
        _retried: true,
        ...init,
      })
    }
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    const err: ApiError = {
      status: res.status,
      message: payload.message ?? res.statusText,
      code: payload.code,
      correlationId: payload.correlationId,
    }
    throw err
  }

  if (res.status === 204) return undefined as T
  const json = await res.json()
  return schema ? (schema.parse(json) as T) : (json as T)
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => apiRequest<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, opts?: RequestOptions) => apiRequest<T>(path, { ...opts, method: 'POST' }),
  put: <T>(path: string, opts?: RequestOptions) => apiRequest<T>(path, { ...opts, method: 'PUT' }),
  patch: <T>(path: string, opts?: RequestOptions) => apiRequest<T>(path, { ...opts, method: 'PATCH' }),
  delete: <T>(path: string, opts?: RequestOptions) => apiRequest<T>(path, { ...opts, method: 'DELETE' }),
}
