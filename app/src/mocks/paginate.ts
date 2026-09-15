/** Cursor-paginate a mock array the way the real gateway does:
    reads `cursor` (opaque offset) + `limit`, returns `{ items, nextCursor }`. */
export function paginate<T>(all: T[], url: URL, defaultLimit = 20) {
  const limit = Number(url.searchParams.get('limit')) || defaultLimit
  const offset = Number(url.searchParams.get('cursor')) || 0
  const items = all.slice(offset, offset + limit)
  const next = offset + limit
  return { items, nextCursor: next < all.length ? String(next) : undefined }
}
