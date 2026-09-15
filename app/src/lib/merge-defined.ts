/**
 * Merge `patch` over `base`, ignoring keys whose value is `undefined`.
 *
 * Used for progressive enrichment: a list row renders immediately and a
 * `GET /:id` detail response merges over it when it lands. The detail DTOs are
 * unpublished (BE-5), so a partial or unexpected shape must never blank out a
 * field the list already supplied — plain spread would do exactly that.
 */
export function mergeDefined<T extends object>(base: T, patch?: Partial<T> | null): T {
  if (!patch) return base
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) out[key] = value
  }
  return out as T
}
