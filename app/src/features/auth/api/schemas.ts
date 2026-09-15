import { z } from 'zod'

/** Identity contract (from api-reference.md § Identity). */

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  displayName: z.string(),
  plan: z.enum(['FREE', 'PRO', 'STUDIO']),
  emailVerified: z.boolean(),
  roles: z.array(z.string()),
  createdAt: z.string(),
  onboardingCompleted: z.boolean().optional(),
  onboardingPlan: z.record(z.string(), z.unknown()).nullable().optional(),
})

export const authResponseSchema = z.object({
  user: userSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
})

export interface LoginRequest {
  email: string
  password: string
}

export type User = z.infer<typeof userSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>

/** Admin gate: prefer /auth/me roles over the JWT claim (which is unreliable). */
export function isAdmin(user: Pick<User, 'roles'>) {
  return user.roles.some((r) => r.toLowerCase() === 'admin')
}
