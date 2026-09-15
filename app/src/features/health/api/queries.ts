import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { healthResponseSchema, type HealthResponse } from './schemas'

export const healthKeys = {
  all: ['health'] as const,
}

export function useHealth() {
  return useQuery({
    queryKey: healthKeys.all,
    queryFn: () => api.get<HealthResponse>('/admin/health', { schema: healthResponseSchema }),
    refetchInterval: 15_000, // keep the rail dots honest
  })
}
