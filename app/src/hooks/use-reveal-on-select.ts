import { useEffect, type RefObject } from 'react'

/** Bring the inspector panel into view when a table row is selected.
 *
 * The inspector can sit far down the page (e.g. AI Queues) or stack below the
 * table on narrow/mobile layouts, so selecting a row would otherwise leave it
 * off-screen. `block: 'nearest'` is a no-op when the panel is already visible,
 * so this never scrolls unnecessarily on desktop.
 *
 * NOTE: `behavior: 'smooth'` is intentionally omitted — it is a no-op inside a
 * nested `overflow-y-auto` scroll container (the app shell's <main>) in Chromium,
 * so we use the reliable instant scroll. */
export function useRevealOnSelect(ref: RefObject<HTMLElement | null>, selectedId: string | null) {
  useEffect(() => {
    if (!selectedId) return
    ref.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedId, ref])
}
