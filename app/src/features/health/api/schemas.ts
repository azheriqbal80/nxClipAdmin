import { z } from 'zod'

/** System health aggregate — real gateway shape (`GET /admin/health`):
    { status, services: [{ key, url, ok, statusCode }] }. */

export const serviceHealthSchema = z.object({
  key: z.string(),
  url: z.string(),
  ok: z.boolean(),
  statusCode: z.number(),
})

export const healthResponseSchema = z.object({
  status: z.string(), // overall, e.g. "ok" | "degraded"
  services: z.array(serviceHealthSchema),
})

export type ServiceHealthDto = z.infer<typeof serviceHealthSchema>
export type HealthResponse = z.infer<typeof healthResponseSchema>

/** Per-service display status derived from `ok` (backend reports a boolean). */
export { serviceHealthDisplayStatus as displayStatus } from '@/domain/service-health'

/** Title-case a service key (`identity` → `Identity`) for labels. */
export { titleizeServiceKey as titleizeKey } from '@/domain/service-health'
