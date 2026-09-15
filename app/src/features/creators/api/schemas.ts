import { z } from 'zod'
import type { Tone } from '@/domain/content'

/** Admin creator-directory contract (from admin-panel-mvp-review § Identity). */

export const planSchema = z.enum(['FREE', 'PRO', 'STUDIO'])
export type Plan = z.infer<typeof planSchema>

export const creatorSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  displayName: z.string(),
  plan: planSchema,
  roles: z.array(z.string()),
  /** Backing field for suspend/activate (users.is_active). */
  isActive: z.boolean(),
  onboardingCompleted: z.boolean(),
  createdAt: z.string(),
  // Not returned by the live /admin/users DTO today — optional so live responses validate.
  emailVerified: z.boolean().optional(),
  contentCount: z.number().optional(),
})

export const creatorListSchema = z.object({
  items: z.array(creatorSchema),
  nextCursor: z.string().nullish(),
})

/** `GET /admin/users/:id`. The detail DTO isn't published (BE-5), so every field
    is optional: any shape validates, and only the fields actually returned get
    merged over the list row. This is where `contentCount` / `emailVerified`
    come from — the list DTO omits both. */
export const creatorDetailSchema = creatorSchema.partial()

export type Creator = z.infer<typeof creatorSchema>
export type CreatorList = z.infer<typeof creatorListSchema>
export type CreatorDetail = z.infer<typeof creatorDetailSchema>

export const PLAN_TONE: Record<Plan, Tone> = {
  FREE: 'neutral',
  PRO: 'accent',
  STUDIO: 'info',
}

export function isCreatorAdmin(c: Pick<Creator, 'roles'>) {
  return c.roles.some((r) => r.toLowerCase() === 'admin')
}
