import { cn } from '@/lib/cn'

/**
 * The nxClip mark + wordmark.
 *
 * The mark is the real brand asset from `public/logo-mark.svg` — the supplied
 * artwork with its opaque backing square removed. That square is a shade lighter
 * than the `--sidebar` surface, so keeping it would read as a misaligned box
 * rather than a logo. The full artwork keeps its square as `favicon.svg`, where a
 * self-contained tile is exactly what a browser tab wants.
 *
 * Served as a file rather than inlined: it carries radial gradients and a drop
 * shadow that would add ~8KB to every bundle for a mark that never changes
 * colour.
 */

/** Two rungs. `size` scales the whole lockup so the mark never outgrows the
    wordmark: chrome (sidebar) vs full-viewport moments (login, splash). */
const SIZES = {
  sm: { mark: 'size-8', px: 32, word: 'text-base', gap: 'gap-2.5' },
  lg: { mark: 'size-12', px: 48, word: 'text-lg', gap: 'gap-3' },
} as const

export function Logo({
  className,
  showWordmark = true,
  size = 'sm',
}: {
  className?: string
  showWordmark?: boolean
  size?: keyof typeof SIZES
}) {
  const s = SIZES[size]
  return (
    <div className={cn('flex items-center', s.gap, className)}>
      <img
        src="/logo-mark.svg"
        // Decorative beside the wordmark — the name is already read out there.
        alt={showWordmark ? '' : 'nxClip'}
        aria-hidden={showWordmark || undefined}
        width={s.px}
        height={s.px}
        className={cn(s.mark, 'shrink-0')}
      />
      {showWordmark && (
        <span className={cn(s.word, 'font-semibold text-foreground')}>
          nxClip <span className="text-muted-foreground">Admin</span>
        </span>
      )}
    </div>
  )
}
