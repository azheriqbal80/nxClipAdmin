import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { api } from '@/api/client'

/** Resolves userId → display label.
 *
 * Works around BE-2: the content / jobs / explore list DTOs return only `userId`,
 * so we fetch the (small) user directory once and map ids to names. Falls back to
 * a short id when a user isn't found. */
const usersSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      displayName: z.string().nullish(),
      username: z.string().nullish(),
    }),
  ),
  nextCursor: z.string().nullish(),
})
type Users = z.infer<typeof usersSchema>

export function useUserNames() {
  const query = useQuery({
    queryKey: ['user-names'],
    queryFn: () => api.get<Users>('/admin/users', { params: { limit: 100 }, schema: usersSchema }),
    staleTime: 5 * 60_000,
  })

  // Stable across renders (only changes when the user list loads/refreshes).
  const resolve = useMemo(() => {
    const map = new Map<string, string>()
    for (const u of query.data?.items ?? []) {
      map.set(u.id, u.displayName?.trim() || u.username?.trim() || u.id.slice(0, 8))
    }
    return (userId: string) => map.get(userId) ?? userId.slice(0, 8)
  }, [query.data])

  return { resolve, isLoading: query.isLoading }
}
