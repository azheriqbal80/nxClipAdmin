import { useEffect, useState } from 'react'
import { GraduationCap, Plus, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { Panel } from '@/components/panel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import { EmptyState } from '@/components/empty-state'
import {
  useUpdateCategory,
  useCategoryQuestions,
  useAddQuestion,
  useSaveQuestions,
  type CategoryUpdate,
} from '../api/queries'
import {
  ONBOARDING_QUESTIONS,
  categoryReadiness,
  nextQuestionNumber,
  questionChips,
  type CoachCategory,
  type CoachQuestion,
} from '../api/schemas'

function toForm(c: CoachCategory): CategoryUpdate {
  return {
    label: c.label,
    openingMessage: c.openingMessage,
    progressLabel: c.progressLabel,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
  }
}

/** Editable row. `chipsText` is the raw comma-separated string so typing a comma
    doesn't immediately split into an empty chip. */
interface QuestionForm {
  questionNumber: number
  message: string
  chipsText: string
  multiSelect: boolean
  isActive: boolean
}

const toQuestionForm = (q: CoachQuestion): QuestionForm => ({
  questionNumber: q.questionNumber,
  message: q.message,
  chipsText: questionChips(q).join(', '),
  multiSelect: q.multiSelect,
  isActive: q.isActive,
})

const parseChips = (text: string) =>
  text.split(',').map((c) => c.trim()).filter(Boolean)

export function CategoryEditor({
  category,
  onClose,
}: {
  category: CoachCategory | null
  onClose?: () => void
}) {
  const update = useUpdateCategory()
  const questions = useCategoryQuestions(category?.id ?? null)
  const addQuestion = useAddQuestion()
  const saveQuestions = useSaveQuestions()
  const [form, setForm] = useState<CategoryUpdate | null>(null)
  const [newQ, setNewQ] = useState<{ message: string; chips: string; multiSelect: boolean } | null>(
    null,
  )
  const [qForm, setQForm] = useState<QuestionForm[]>([])

  useEffect(() => {
    setForm(category ? toForm(category) : null)
    setNewQ(null)
  }, [category])

  // Re-seed the editable rows whenever the fetched set changes — after a save,
  // an invalidation, or switching category. Keyed on the server data rather than
  // the category id so a successful save refreshes what "clean" means.
  const loaded = questions.data
  useEffect(() => {
    setQForm((loaded ?? []).map(toQuestionForm))
  }, [loaded])

  const setQ = (index: number, patch: Partial<QuestionForm>) =>
    setQForm((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  const resetQuestions = () => setQForm((loaded ?? []).map(toQuestionForm))

  if (!category || !form) {
    return (
      <Panel className="h-full">
        <EmptyState
          icon={<GraduationCap />}
          title="No category selected"
          description="Select a coach category to edit its copy and manage its question bank."
          className="h-full"
        />
      </Panel>
    )
  }

  const onSave = () =>
    update.mutate(
      { id: category.id, body: form },
      {
        onSuccess: () => toast.success('Category saved', { description: category.label }),
        onError: () => toast.error('Save failed'),
      },
    )

  const readiness = categoryReadiness(category)
  const baseline = (loaded ?? []).map(toQuestionForm)
  const questionsDirty = JSON.stringify(qForm) !== JSON.stringify(baseline)
  const questionsValid = qForm.every((q) => q.message.trim().length > 0)

  /**
   * Save the whole question set in one call.
   *
   * Sends every row the editor holds — which is every row the category has,
   * because the fetch uses `includeInactive=true`. That completeness is what
   * makes a bulk replace safe; `useSaveQuestions` additionally pins
   * `deactivateMissing: false` so an unexpected gap can't switch questions off.
   */
  const onSaveQuestions = () => {
    if (!questionsValid || qForm.length === 0) return
    saveQuestions.mutate(
      {
        categoryId: category.id,
        questions: qForm.map((q) => ({
          questionNumber: q.questionNumber,
          message: q.message.trim(),
          chips: parseChips(q.chipsText),
          multiSelect: q.multiSelect,
          isActive: q.isActive,
        })),
      },
      {
        onSuccess: () =>
          toast.success('Questions saved', {
            description: `${qForm.length} question${qForm.length === 1 ? '' : 's'} in ${category.label}`,
          }),
        onError: () => toast.error('Save failed — questions unchanged'),
      },
    )
  }

  // `questions.data` is fetched with `includeInactive=true`, so switched-off
  // rows are counted — they still own their numbers. See `nextQuestionNumber`.
  const nextNumber = nextQuestionNumber(questions.data ?? [])

  const onAddQuestion = () => {
    if (!newQ || !newQ.message.trim()) return
    addQuestion.mutate(
      {
        categoryId: category.id,
        body: {
          questionNumber: nextNumber,
          message: newQ.message.trim(),
          chips: newQ.chips.split(',').map((c) => c.trim()).filter(Boolean),
          multiSelect: newQ.multiSelect,
          isActive: true,
        },
      },
      {
        onSuccess: () => {
          toast.success(`Question added as Q${nextNumber}`)
          setNewQ(null)
        },
        // Surface the server's own words: a 409 says which number collided,
        // which a flat "Add failed" hides. Another operator adding a question
        // between this component's fetch and its write is the live case.
        onError: (error) =>
          toast.error('Add failed', {
            description: error instanceof Error ? error.message : undefined,
          }),
      },
    )
  }

  return (
    <Panel className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <span className="text-sm font-semibold text-foreground">{category.slug}</span>
        <Badge variant={form.isActive ? 'success' : 'neutral'} className="ml-auto">
          {form.isActive ? 'Active' : 'Inactive'}
        </Badge>
        {onClose && (
          <Button variant="ghost" size="icon-sm" aria-label="Close panel" onClick={onClose}>
            <X />
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <label className="block space-y-1.5">
          <span className="text-xs text-muted-foreground">Label</span>
          <Input
            className="h-9"
            value={form.label ?? ''}
            onChange={(e) => setForm((f) => (f ? { ...f, label: e.target.value } : f))}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs text-muted-foreground">Progress label</span>
          <Input
            className="h-9"
            value={form.progressLabel ?? ''}
            onChange={(e) => setForm((f) => (f ? { ...f, progressLabel: e.target.value } : f))}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs text-muted-foreground">Opening message</span>
          <Textarea
            value={form.openingMessage ?? ''}
            onChange={(e) => setForm((f) => (f ? { ...f, openingMessage: e.target.value } : f))}
          />
        </label>

        {/* Order is set from the list's Reorder mode, which commits every
            category at once. A per-category number here could put two
            categories on the same value, leaving the creator-facing picker order
            undefined — and it could not express a swap atomically. Shown, not
            editable. */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Picker position</span>
          <span className="font-mono text-sm tabular-nums text-muted-foreground">
            {form.sortOrder ?? category.sortOrder}
            <span className="ml-2 text-caption text-faint">set via Reorder</span>
          </span>
        </div>

        <label className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Active</span>
          <Switch
            checked={form.isActive ?? false}
            onCheckedChange={(v) => setForm((f) => (f ? { ...f, isActive: v } : f))}
          />
        </label>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-micro font-medium tracking-[0.12em] text-faint uppercase">
              Questions
            </span>
            {readiness.state === 'incomplete' && (
              <span className="text-caption text-muted-foreground">
                onboarding needs Q1–Q{ONBOARDING_QUESTIONS}
              </span>
            )}
          </div>

          {readiness.state === 'incomplete' && (
            <div className="rounded-md border border-warning/25 bg-warning/10 p-2.5 text-sm text-muted-foreground">
              No active question for{' '}
              <span className="font-mono text-foreground">Q{readiness.missing.join(', Q')}</span>.
              Creators who pick this niche stop here.
            </div>
          )}

          {questions.isLoading ? (
            <span className="text-sm text-muted-foreground">Loading…</span>
          ) : (
            <ul className="space-y-2">
              {qForm.map((q, i) => (
                <li
                  key={q.questionNumber}
                  className="space-y-2 rounded-lg border border-border bg-surface-2 p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-caption text-faint">Q{q.questionNumber}</span>
                    {!q.isActive && <Badge variant="neutral" size="sm">Inactive</Badge>}
                    <Switch
                      className="ml-auto"
                      aria-label={`Q${q.questionNumber} active`}
                      checked={q.isActive}
                      onCheckedChange={(v) => setQ(i, { isActive: v })}
                    />
                  </div>
                  <Input
                    className="h-9"
                    aria-label={`Q${q.questionNumber} message`}
                    value={q.message}
                    onChange={(e) => setQ(i, { message: e.target.value })}
                  />
                  <Input
                    className="h-9"
                    aria-label={`Q${q.questionNumber} chips`}
                    value={q.chipsText}
                    onChange={(e) => setQ(i, { chipsText: e.target.value })}
                    placeholder="Comma-separated options"
                  />
                  <label className="flex items-center justify-between gap-4">
                    <span className="text-xs text-muted-foreground">Multi-select</span>
                    <Switch
                      aria-label={`Q${q.questionNumber} multi-select`}
                      checked={q.multiSelect}
                      onCheckedChange={(v) => setQ(i, { multiSelect: v })}
                    />
                  </label>
                </li>
              ))}
            </ul>
          )}

          {qForm.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={onSaveQuestions}
                disabled={saveQuestions.isPending || !questionsDirty || !questionsValid}
              >
                <Save />
                {/* One label in every state. A distinct "saved" label collided
                    with the success toast's text, so the two were
                    indistinguishable to a name-based query — and to anyone
                    reading the screen. Disabled already means "nothing to
                    save". */}
                {saveQuestions.isPending ? 'Saving…' : 'Save questions'}
              </Button>
              {questionsDirty && (
                <Button size="sm" variant="ghost" onClick={resetQuestions}>
                  Revert
                </Button>
              )}
            </div>
          )}
          {!questionsValid && (
            <p className="text-caption text-destructive">Every question needs a message.</p>
          )}
        </div>

        {newQ === null ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setNewQ({ message: '', chips: '', multiSelect: true })}
          >
            <Plus /> Add question
          </Button>
        ) : (
          <div className="space-y-2.5 rounded-lg border border-border bg-surface-2 p-3">
            {/* Name the slot before the write, so a number past Q5 is a visible
                choice rather than a surprise — onboarding only ever asks Q1–Q5. */}
            <p className="text-caption text-muted-foreground">
              Will be added as{' '}
              <span className="font-mono text-foreground">Q{nextNumber}</span>
              {nextNumber > ONBOARDING_QUESTIONS && (
                <> — past Q{ONBOARDING_QUESTIONS}, so onboarding will not ask it</>
              )}
            </p>
            <label className="block space-y-1.5">
              <span className="text-xs text-muted-foreground">Question message</span>
              <Input
                className="h-9"
                value={newQ.message}
                onChange={(e) => setNewQ({ ...newQ, message: e.target.value })}
                placeholder="Which games do you create for?"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs text-muted-foreground">Chips (comma-separated)</span>
              <Input
                className="h-9"
                value={newQ.chips}
                onChange={(e) => setNewQ({ ...newQ, chips: e.target.value })}
                placeholder="Valorant, Fortnite, CS2"
              />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Multi-select</span>
              <Switch
                checked={newQ.multiSelect}
                onCheckedChange={(v) => setNewQ({ ...newQ, multiSelect: v })}
              />
            </label>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={onAddQuestion} disabled={addQuestion.isPending || !newQ.message.trim()}>
                {addQuestion.isPending ? 'Adding…' : 'Add'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setNewQ(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4">
        <Button className="w-full" onClick={onSave} disabled={update.isPending}>
          <Save /> {update.isPending ? 'Saving…' : 'Save category'}
        </Button>
      </div>
    </Panel>
  )
}
