import { http, HttpResponse } from 'msw'

/** Mirrors the real gateway shape: { status, services:[{ key, url, ok, statusCode }] }.
    Feed seeded down so the "degraded" overall state is exercised. */
const SERVICES = [
  { key: 'identity', url: 'http://identity/health', ok: true, statusCode: 200 },
  { key: 'content', url: 'http://content/health', ok: true, statusCode: 200 },
  { key: 'feed', url: 'http://feed/health', ok: false, statusCode: 503 },
  { key: 'ai', url: 'http://ai/health', ok: true, statusCode: 200 },
  { key: 'notification', url: 'http://notification/health', ok: true, statusCode: 200 },
]

export const healthHandlers = [
  http.get('*/admin/health', () => {
    const status = SERVICES.every((s) => s.ok) ? 'ok' : 'degraded'
    return HttpResponse.json({ status, services: SERVICES })
  }),
]
