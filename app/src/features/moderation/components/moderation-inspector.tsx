import { useEffect, useState } from 'react'
import { AlertTriangle, Check, Clapperboard, ImageIcon, Loader2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Panel } from '@/components/panel'
import { Field } from '@/components/field'
import { EmptyState } from '@/components/empty-state'
import { StatusPill } from '@/components/status-pill'
import { UserAvatar } from '@/components/user-avatar'
import { useAuthenticatedMedia } from '@/hooks/use-authenticated-media'
import { useApproveContent, useTakedownContent } from '../api/queries'
import { contentTitle, type ModerationItem } from '../api/schemas'

const ASPECT: Record<string, string> = {
  '16:9': 'aspect-video',
  '1:1': 'aspect-square',
  '9:16': 'aspect-[9/16]',
}

/** Reduce an absolute media URL to its path so the fetch stays same-origin
    (dev proxy / VITE_API_URL). Leaves relative or data/blob URLs untouched. */
function toRelativeMedia(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) return url
  try {
    const u = new URL(url)
    return `${u.pathname}${u.search}`
  } catch {
    return url
  }
}

export function ModerationInspector({
  item,
  userName,
  onClose,
}: {
  item: ModerationItem | null
  userName?: string
  onClose?: () => void
}) {
  const approve = useApproveContent()
  const takedown = useTakedownContent()
  const [imgError, setImgError] = useState(false)

  // The gateway returns an absolute media URL; use just its path so the request
  // goes same-origin (dev proxy forwards /content with the Bearer header; prod
  // resolves it against VITE_API_URL).
  const rawMediaUrl = toRelativeMedia(item?.cdnUrl ?? item?.thumbnailUrl)
  const { mediaSrc, isLoading: isMediaLoading, error: mediaFetchError } = useAuthenticatedMedia(rawMediaUrl)

  useEffect(() => {
    setImgError(false)
  }, [item?.id])

  if (!item) {
    return (
      <Panel className="h-full">
        <EmptyState
          icon={<ImageIcon />}
          title="No item selected"
          description="Select a row from the queue to inspect its media, prompt, and moderation details."
          className="h-full"
        />
      </Panel>
    )
  }

  const busy = approve.isPending || takedown.isPending
  const Icon = item.contentType === 'clip' ? Clapperboard : ImageIcon
  const title = contentTitle(item)
  const creatorName = userName ?? item.userId.slice(0, 8)

  // No per-call callbacks: both actions move the item out of the queue on
  // screen, which unmounts this panel, and React Query drops an unmounted
  // caller's `mutate()` callbacks. The toasts live on the mutations instead.
  const onApprove = () => approve.mutate(item)
  const onTakedown = () => takedown.mutate({ item })

  return (
    <Panel className="flex h-full flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="truncate text-subtitle font-semibold text-foreground">{title}</div>
          <div className="mt-2 flex items-center gap-2.5">
            <UserAvatar name={creatorName} size="sm" />
            <div className="min-w-0">
              <div className="truncate text-xs text-muted-foreground">Creator</div>
              <div className="truncate text-sm font-medium text-foreground">{creatorName}</div>
              <div className="truncate font-mono text-caption text-faint">{item.userId}</div>
            </div>
          </div>
        </div>
        <StatusPill status={item.status} />
        {onClose && (
          <Button variant="ghost" size="icon-sm" aria-label="Close panel" onClick={onClose}>
            <X />
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {/* Media preview (authenticated blob URL fetch via JWT header + token param) */}
        <div
          className={`relative w-full overflow-hidden rounded-lg border border-border bg-elevated ${
            ASPECT[item.aspectRatio ?? '16:9'] ?? 'aspect-video'
          }`}
        >
          {isMediaLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : mediaSrc && !imgError && !mediaFetchError ? (
            <div className="relative size-full">
              {item.contentType === 'clip' ? (
                <video
                  src={mediaSrc}
                  controls
                  playsInline
                  className="size-full object-cover"
                />
              ) : (
                <img
                  src={mediaSrc}
                  alt={title}
                  onError={() => setImgError(true)}
                  className="size-full object-cover"
                />
              )}
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,color-mix(in_srgb,var(--primary)_20%,transparent),transparent_70%)]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-4 text-center text-faint">
                <Icon className="size-7" />
                <span className="text-caption font-medium text-muted-foreground">
                  {rawMediaUrl ? 'Preview unavailable' : 'No media'}
                </span>
                {rawMediaUrl && (
                  <span className="max-w-full text-micro text-faint">
                    Admin isn’t authorized for the content media route yet (BE-10).
                  </span>
                )}
              </div>
            </>
          )}
          <Badge variant="neutral" className="absolute left-2 top-2 capitalize shadow-sm">
            {item.contentType}
          </Badge>
        </div>

        <Field label="Content ID">
          <span className="font-mono text-xs break-all text-faint">{item.id}</span>
        </Field>

        {item.prompt && <Field label="Prompt">{item.prompt}</Field>}

        <div className="grid grid-cols-2 gap-4">
          {item.style && <Field label="Style"><span className="capitalize">{item.style}</span></Field>}
          {item.aspectRatio && <Field label="Aspect">{item.aspectRatio}</Field>}
        </div>

        {item.failureReason && (
          <div className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="text-xs text-foreground/90">{item.failureReason}</div>
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t border-border p-4">
        <Button className="flex-1" onClick={onApprove} disabled={busy}>
          <Check /> Approve
        </Button>
        <Button variant="destructive" className="flex-1" onClick={onTakedown} disabled={busy}>
          <Trash2 /> Take down
        </Button>
      </div>
    </Panel>
  )
}
