/**
 * Small statistics helpers shared by the derived-analytics modules.
 *
 * Kept in one place because a percentile implemented twice is a percentile
 * implemented two slightly different ways.
 */

/**
 * Nearest-rank percentile. `p` is 0–1. Returns `null` for an empty set — a
 * percentile over nothing does not exist, and returning 0 would assert a value
 * the data never contained.
 */
export function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const rank = Math.ceil(p * sorted.length)
  return sorted[Math.min(sorted.length - 1, Math.max(0, rank - 1))]
}
