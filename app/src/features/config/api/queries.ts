import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import {
  coachCategoryListSchema,
  coachCategorySchema,
  coachQuestionListSchema,
  planLimitsSchema,
  planListSchema,
  type CoachCategory,
  type CoachQuestion,
  type PlanLimits,
  type PlanName,
} from './schemas'

export const configKeys = {
  plans: ['config', 'plans'] as const,
  coach: ['config', 'coach'] as const,
  coachCategory: (categoryId: string) => ['config', 'coach', 'category', categoryId] as const,
  questions: (categoryId: string) => ['config', 'coach', categoryId, 'questions'] as const,
}

/* ---- Plan limits ---- */

export function usePlans() {
  return useQuery({
    queryKey: configKeys.plans,
    queryFn: () => api.get<PlanLimits[]>('/admin/plans', { schema: planListSchema }),
  })
}

export type PlanUpdate = Omit<PlanLimits, 'plan' | 'updatedAt'>

/** A field the server stored differently from what we submitted. */
export interface PlanAdjustment {
  key: keyof PlanUpdate
  sent: number | boolean
  stored: number | boolean
}

export interface PlanSaveResult {
  /** Authoritative post-save state, from `GET /admin/plans/:plan`. */
  saved: PlanLimits
  adjusted: PlanAdjustment[]
}

export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      plan,
      body,
    }: {
      plan: PlanName
      body: PlanUpdate
    }): Promise<PlanSaveResult> => {
      await api.put<void>(`/admin/plans/${plan}`, { body })
      // PUT returns 204 with no body, so read the single plan back to learn what
      // was actually stored — entitlement values can be clamped server-side, and
      // silently showing the submitted number would be a lie. Cheaper than
      // refetching all three plans.
      const saved = await api.get<PlanLimits>(`/admin/plans/${plan}`, {
        schema: planLimitsSchema,
      })
      const adjusted = (Object.keys(body) as (keyof PlanUpdate)[])
        .filter((key) => saved[key] !== body[key])
        .map((key) => ({ key, sent: body[key], stored: saved[key] }))
      return { saved, adjusted }
    },
    onSuccess: ({ saved }, { plan }) => {
      // Seed the list cache with the authoritative row so the table updates
      // immediately, then revalidate.
      qc.setQueryData<PlanLimits[]>(configKeys.plans, (old) =>
        old?.map((p) => (p.plan === plan ? saved : p)),
      )
      qc.invalidateQueries({ queryKey: configKeys.plans })
    },
  })
}

/* ---- Coach categories + questions ---- */

export function useCoachCategories() {
  return useQuery({
    queryKey: configKeys.coach,
    queryFn: () =>
      api.get<CoachCategory[]>('/admin/coach/categories', { schema: coachCategoryListSchema }),
  })
}

export function useCoachCategory(categoryId: string | null) {
  return useQuery({
    queryKey: configKeys.coachCategory(categoryId ?? 'none'),
    enabled: !!categoryId,
    queryFn: () =>
      api.get<CoachCategory>(`/admin/coach/categories/${categoryId}`, {
        schema: coachCategorySchema,
      }),
  })
}

export type CategoryCreate = Pick<
  CoachCategory,
  'slug' | 'label' | 'openingMessage' | 'progressLabel' | 'sortOrder' | 'isActive'
>

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CategoryCreate) => api.post<void>('/admin/coach/categories', { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: configKeys.coach }),
  })
}

export type QuestionCreate = Pick<
  CoachQuestion,
  'questionNumber' | 'message' | 'chips' | 'multiSelect' | 'isActive'
>

export function useAddQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, body }: { categoryId: string; body: QuestionCreate }) =>
      api.post<void>(`/admin/coach/categories/${categoryId}/questions`, { body }),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: configKeys.questions(v.categoryId) })
      qc.invalidateQueries({ queryKey: configKeys.coach }) // questionCount changed
    },
  })
}

export type CategoryUpdate = Partial<
  Pick<CoachCategory, 'label' | 'openingMessage' | 'progressLabel' | 'sortOrder' | 'isActive'>
>

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CategoryUpdate }) =>
      api.patch<void>(`/admin/coach/categories/${id}`, { body }),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: configKeys.coach })
      qc.invalidateQueries({ queryKey: configKeys.coachCategory(v.id) })
    },
  })
}

/**
 * Every question for a category, **including inactive ones**.
 *
 * `includeInactive=true` is not cosmetic here: the bulk save below replaces the
 * category's question set, so the editor has to hold the complete set or a save
 * could drop rows it never knew about. Documented 2026-08-29, verified live.
 */
export function useCategoryQuestions(categoryId: string | null) {
  return useQuery({
    queryKey: configKeys.questions(categoryId ?? 'none'),
    enabled: !!categoryId,
    queryFn: () =>
      api.get<CoachQuestion[]>(`/admin/coach/categories/${categoryId}/questions`, {
        params: { includeInactive: 'true' },
        schema: coachQuestionListSchema,
      }),
  })
}

/**
 * Set the picker order for every category in one call.
 *
 * The alternative is `PATCH /admin/coach/categories/:id` per category, which is
 * what the editor's old sort-order field did — and that cannot express a swap
 * atomically. Two categories could end up sharing a number, leaving the picker
 * order undefined for creators. This route takes the whole order at once, so the
 * set is always internally consistent.
 */
export function useReorderCategories() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (items: { id: string; sortOrder: number }[]) => {
      if (items.length === 0) throw new Error('Refusing to send an empty reorder.')
      return api.patch<void>('/admin/coach/categories/reorder', { body: { items } })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: configKeys.coach }),
  })
}

export type QuestionUpsert = Pick<
  CoachQuestion,
  'questionNumber' | 'message' | 'chips' | 'multiSelect' | 'isActive'
>

/**
 * Bulk-save a category's whole question set — the only route that can change a
 * question's **text**. `PATCH /admin/coach/questions/:id` only toggles
 * `isActive`, so before this the sole way to reword a question was to deactivate
 * it and add a replacement.
 *
 * **`deactivateMissing` is pinned to `false`.** With `true`, any question absent
 * from the payload is deactivated — so a partially-built payload silently
 * switches off live onboarding questions. Sending `false` makes an incomplete
 * payload a no-op for the rows it omits instead of a deletion. Callers must
 * still pass the full set (see `useCategoryQuestions`); this is the second line
 * of defence, not the first.
 *
 * Live rejects an empty array (`questions must contain at least 1 elements`) and
 * more than 20, so the caller is guarded rather than relying on the 400.
 */
export function useSaveQuestions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, questions }: { categoryId: string; questions: QuestionUpsert[] }) => {
      if (questions.length === 0) {
        throw new Error('Refusing to save an empty question set — the gateway rejects it, and an accidental empty payload should never reach the wire.')
      }
      return api.put<void>(`/admin/coach/categories/${categoryId}/questions`, {
        body: { deactivateMissing: false, questions },
      })
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: configKeys.questions(v.categoryId) })
      // Readiness and questionCount both move when questions change.
      qc.invalidateQueries({ queryKey: configKeys.coach })
    },
  })
}

export function useToggleQuestionActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      questionId,
      isActive,
    }: {
      categoryId: string
      questionId: string
      isActive: boolean
    }) => api.patch<void>(`/admin/coach/questions/${questionId}`, { body: { isActive } }),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: configKeys.questions(v.categoryId) })
      qc.invalidateQueries({ queryKey: configKeys.coachCategory(v.categoryId) })
      // Readiness and active counts both move when a question is toggled.
      qc.invalidateQueries({ queryKey: configKeys.coach })
    },
  })
}

/**
 * `PATCH /admin/coach/questions/:id` is intentionally separate from the bulk
 * question editor.
 *
 * The row Active switch uses PATCH for the narrow operational case: enable or
 * disable one existing row immediately, without rewriting the whole category's
 * question set. Text, chips, and multi-select still use the bulk save.
 */
