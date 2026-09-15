import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { isApiError } from '@/api/client'
import { useCreateCategory, type CategoryCreate } from '../api/queries'

const EMPTY: CategoryCreate = {
  slug: '',
  label: '',
  openingMessage: '',
  progressLabel: '',
  sortOrder: 0,
  isActive: true,
}

/** Server constraints, mirrored client-side so a create can't 400.
 *
 * Re-verified live 2026-09-09 against `POST /admin/coach/categories`:
 * label 1–128; progressLabel 1–128 (**required**); openingMessage ≥ 1.
 *
 * The slug rule was **relaxed** server-side between 2026-08-26 and 2026-08-29:
 * the message moved from `slug must be lowercase kebab-case` to
 * `slug must be alphanumeric (kebab-case, snake_case, or PascalCase)`. Probing
 * one shape at a time (a slug-only body always fails on the other required
 * fields, so nothing is created) shows `gaming`, `Gaming` and `UPPER_SNAKE`
 * accepted, and anything containing a space rejected.
 *
 * Mirroring server validation is what let this drift: the old pattern kept
 * rejecting slugs the API had started accepting. Keep it permissive — the server
 * is the authority, and this only exists to catch the obvious cases before a
 * round trip. */
const SLUG_RE = /^[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*$/

/** Suggest a slug from the label — "Tech & Gadgets" → "tech-gadgets". Lowercase
    kebab is the house convention for a *generated* slug, and the field stays
    editable afterwards. */
function toSlug(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

/** Repair what someone types into the slug field without changing its case —
    "Gaming & Esports!!" → "Gaming-Esports", "UPPER_SNAKE" → "UPPER_SNAKE". */
function normaliseSlug(input: string) {
  return input
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '')
    .slice(0, 64)
}

/** Default progress label derived from the category name, e.g. "gaming niche". */
function toProgress(label: string) {
  return label.trim() ? `${label.trim().toLowerCase()} niche` : ''
}

function slugError(slug: string) {
  if (slug.length < 2) return 'At least 2 characters.'
  if (slug.length > 64) return 'At most 64 characters.'
  if (!SLUG_RE.test(slug)) return 'Letters and numbers, separated by single hyphens or underscores.'
  return null
}

/** `label` and `progressLabel` are both 1–128 server-side. Only the slug's own
    bounds were mirrored before, so an over-long label reached the API and came
    back as a 400 the form had given no warning about. */
const TEXT_MAX = 128

function textError(value: string) {
  return value.trim().length > TEXT_MAX ? `At most ${TEXT_MAX} characters.` : null
}

export function NewCategoryDialog({ nextSortOrder }: { nextSortOrder: number }) {
  const create = useCreateCategory()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<CategoryCreate>({ ...EMPTY, sortOrder: nextSortOrder })

  // Once the slug has been edited by hand, stop deriving it from the label.
  const [slugTouched, setSlugTouched] = useState(false)

  const set = <K extends keyof CategoryCreate>(k: K, v: CategoryCreate[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  /** Typing a label fills the slug and the progress label until either is edited. */
  const setLabel = (label: string) =>
    setForm((f) => ({
      ...f,
      label,
      slug: slugTouched ? f.slug : toSlug(label),
      progressLabel: f.progressLabel && f.progressLabel !== toProgress(f.label) ? f.progressLabel : toProgress(label),
    }))

  const slugIssue = form.slug ? slugError(form.slug) : null
  const labelIssue = textError(form.label)
  const progressIssue = textError(form.progressLabel)
  const valid =
    !!form.label.trim() &&
    !!form.openingMessage.trim() &&
    // progressLabel is required server-side — the old check omitted it, so a
    // blank value produced a 400 the user could not have predicted.
    !!form.progressLabel.trim() &&
    !!form.slug &&
    !slugIssue &&
    !labelIssue &&
    !progressIssue

  const onSubmit = () => {
    if (!valid) return
    create.mutate(form, {
      onSuccess: () => {
        toast.success('Category created', { description: form.label })
        setOpen(false)
        setForm({ ...EMPTY, sortOrder: nextSortOrder })
      },
      // Surface the gateway's validation text — "Create failed" alone leaves
      // the operator with no idea which field the API rejected.
      onError: (err) =>
        toast.error('Create failed', {
          description: isApiError(err) ? err.message : undefined,
        }),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus /> New category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New coach category</DialogTitle>
          <DialogDescription>Create an onboarding niche. You can add questions after saving.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Label</span>
              <Input
                className="h-9"
                value={form.label}
                aria-invalid={!!labelIssue}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Tech &amp; Gadgets"
              />
              {labelIssue && <span className="block text-caption text-destructive">{labelIssue}</span>}
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Slug</span>
              <Input
                className="h-9"
                value={form.slug}
                aria-invalid={!!slugIssue}
                onChange={(e) => {
                  setSlugTouched(true)
                  // Repair separators as they type, but keep their capitals: the
                  // API accepts PascalCase and snake_case, and lowercasing here
                  // made valid slugs like "Gaming" impossible to enter.
                  set('slug', normaliseSlug(e.target.value))
                }}
                placeholder="tech-gadgets"
              />
              <span className={slugIssue ? 'block text-caption text-destructive' : 'block text-caption text-faint'}>
                {slugIssue ?? 'Letters, numbers, hyphens or underscores. 2–64 chars.'}
              </span>
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs text-muted-foreground">Progress label</span>
            <Input
              className="h-9"
              value={form.progressLabel}
              aria-invalid={!!progressIssue}
              onChange={(e) => set('progressLabel', e.target.value)}
              placeholder="gaming niche"
            />
            {progressIssue && <span className="block text-caption text-destructive">{progressIssue}</span>}
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs text-muted-foreground">Opening message</span>
            <Textarea
              value={form.openingMessage}
              onChange={(e) => set('openingMessage', e.target.value)}
              placeholder="Welcome! I'm your …"
            />
          </label>

          <div className="flex items-center justify-between gap-4">
            <label className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Sort order</span>
              <Input
                type="number"
                className="h-9 w-20 text-right font-mono tabular-nums"
                value={String(form.sortOrder)}
                onChange={(e) => set('sortOrder', Number(e.target.value) || 0)}
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active</span>
              <Switch checked={form.isActive} onCheckedChange={(v) => set('isActive', v)} />
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onSubmit} disabled={!valid || create.isPending}>
            {create.isPending ? 'Creating…' : 'Create category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
