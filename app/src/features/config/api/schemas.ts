import { z } from 'zod'

/** Global config contracts — Plan limits (content-service) and AI Coach
    categories/questions (ai-service). Verified against the live gateway
    2026-08-07. See nxclip-admin-api-reconciliation.md. */

export const planNameSchema = z.enum(['FREE', 'PRO', 'STUDIO'])
export type PlanName = z.infer<typeof planNameSchema>

export const planLimitsSchema = z.object({
  plan: planNameSchema,
  dailyImageGenerations: z.number(),
  dailyUploadLimit: z.number(),
  maxReferenceImages: z.number(),
  maxClipOutputSeconds: z.number(),
  maxClipSourceSeconds: z.number(),
  maxUploadSizeMb: z.number(),
  canUseAnalyticsReport: z.boolean(),
  updatedAt: z.string(),
})
export const planListSchema = z.array(planLimitsSchema)
export type PlanLimits = z.infer<typeof planLimitsSchema>

/** Editable numeric fields (`-1` = unlimited) + the analytics entitlement. */
export const PLAN_FIELDS = [
  { key: 'dailyImageGenerations', label: 'Daily image generations' },
  { key: 'dailyUploadLimit', label: 'Daily upload limit' },
  { key: 'maxReferenceImages', label: 'Max reference images' },
  { key: 'maxClipOutputSeconds', label: 'Max clip output (s)' },
  { key: 'maxClipSourceSeconds', label: 'Max clip source (s)' },
  { key: 'maxUploadSizeMb', label: 'Max upload size (MB)' },
] as const satisfies readonly { key: keyof PlanLimits; label: string }[]

export const coachCategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  label: z.string(),
  openingMessage: z.string(),
  progressLabel: z.string(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  questionCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),

  /* Readiness — documented 2026-08-29, verified present live 2026-09-09.
     Optional on purpose: BE-12 showed fields can disappear from a DTO without
     notice, and readiness is decoration around the real work of editing a
     category. Absent means "unknown", never "not ready". */
  /** Always 5 — onboarding asks Q1–Q5. */
  requiredQuestionCount: z.number().optional(),
  activeQuestionCount: z.number().optional(),
  /** `true` when Q1–Q5 all have active rows; onboarding breaks without them. */
  isReady: z.boolean().optional(),
  /** e.g. `[3, 5]` — exactly which numbers have no active question. */
  missingQuestionNumbers: z.array(z.number()).optional(),
})
export const coachCategoryListSchema = z.array(coachCategorySchema)
export type CoachCategory = z.infer<typeof coachCategorySchema>

export const coachQuestionSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  questionNumber: z.number(),
  message: z.string(),
  chips: z.array(z.string()),
  /** Alias of `chips` the gateway also returns. Read `chips`; this exists so a
      response carrying only `options` still validates. */
  options: z.array(z.string()).optional(),
  multiSelect: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export const coachQuestionListSchema = z.array(coachQuestionSchema)
export type CoachQuestion = z.infer<typeof coachQuestionSchema>

/** Onboarding asks exactly Q1–Q5; Q0 is the runtime category picker and is not
    stored as a row. The gateway's schema allows up to 20. */
export const ONBOARDING_QUESTIONS = 5

/** Answer options, tolerating a response that used the `options` alias. */
export function questionChips(q: Pick<CoachQuestion, 'chips' | 'options'>): string[] {
  return q.chips.length > 0 ? q.chips : (q.options ?? [])
}

/**
 * The next free question number for a category: one past the highest that
 * exists, never one past the row count.
 *
 * Counting rows fails on exactly the categories the add button exists for. A
 * set missing Q3 — `Q1 Q2 Q4 Q5` — has four rows, so a count would propose the
 * Q5 that is already there, and a duplicate `questionNumber` within a category
 * is a 409 (§2.5). Pass the list fetched with `includeInactive=true`: a
 * switched-off row still owns its number, and a save that reused it would
 * collide with a row the operator cannot see.
 */
export function nextQuestionNumber(questions: Pick<CoachQuestion, 'questionNumber'>[]): number {
  return questions.reduce((highest, q) => Math.max(highest, q.questionNumber), 0) + 1
}

/**
 * Readiness, computed from whatever the DTO actually provided.
 *
 * Prefers the server's own `isReady` / `missingQuestionNumbers`; falls back to
 * `unknown` rather than guessing from `questionCount`, which counts inactive
 * rows too and would report a broken category as ready.
 */
export function categoryReadiness(c: CoachCategory):
  | { state: 'ready'; missing: [] }
  | { state: 'incomplete'; missing: number[] }
  | { state: 'unknown'; missing: [] } {
  if (c.isReady === true) return { state: 'ready', missing: [] }
  if (c.isReady === false) {
    return { state: 'incomplete', missing: c.missingQuestionNumbers ?? [] }
  }
  return { state: 'unknown', missing: [] }
}

export const PLAN_TONE: Record<PlanName, 'neutral' | 'accent' | 'info'> = {
  FREE: 'neutral',
  PRO: 'accent',
  STUDIO: 'info',
}

/** `-1` renders as an infinity glyph across the plan editor. */
export function fmtLimit(n: number) {
  return n === -1 ? '∞' : n.toLocaleString()
}

/** Human label for any editable plan field, including the non-numeric one. */
export function planFieldLabel(key: string) {
  if (key === 'canUseAnalyticsReport') return 'Analytics report'
  return PLAN_FIELDS.find((f) => f.key === key)?.label ?? key
}

/** Render a plan value for the save-adjustment summary (`-1` → `∞`). */
export function fmtPlanValue(v: number | boolean) {
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  return fmtLimit(v)
}
