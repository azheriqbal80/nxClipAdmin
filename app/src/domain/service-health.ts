import type { Tone } from '@/domain/content'

export type ServiceHealthProbe = {
  ok: boolean
}

export type ServiceHealthDisplay = 'up' | 'down'

export const serviceHealthDisplayStatus = (service: ServiceHealthProbe): ServiceHealthDisplay =>
  service.ok ? 'up' : 'down'

export function serviceHealthMeta(service: ServiceHealthProbe): { label: string; tone: Tone } {
  return service.ok
    ? { label: 'Operational', tone: 'success' }
    : { label: 'Down', tone: 'danger' }
}

export const titleizeServiceKey = (key: string) => key.charAt(0).toUpperCase() + key.slice(1)
