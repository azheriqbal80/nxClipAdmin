import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  ListTree,
  Compass,
  FileText,
  Hourglass,
  Activity,
  Palette,
  Settings,
  SlidersHorizontal,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  /** Optional badge count (e.g. moderation queue depth). */
  badge?: number
}

export interface NavSection {
  title: string
  items: NavItem[]
}

/** Left-rail navigation. Structured for a single admin tier now, role-ready later. */
export const NAV: NavSection[] = [
  {
    title: 'Operations',
    items: [
      { label: 'Overview', to: '/', icon: LayoutDashboard },
      { label: 'Content Moderation', to: '/moderation', icon: ShieldCheck },
      // Sits next to moderation because it holds exactly what moderation excludes.
      { label: 'Drafts & Processing', to: '/drafts', icon: FileText },
      { label: 'Creators', to: '/creators', icon: Users },
      { label: 'AI Queues', to: '/queues', icon: ListTree },
      { label: 'Stuck Publishing', to: '/publishing', icon: Hourglass },
      { label: 'Explore Audit', to: '/explore', icon: Compass },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { label: 'Plan Limits', to: '/config/plans', icon: SlidersHorizontal },
      { label: 'AI Coach', to: '/config/coach', icon: GraduationCap },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'System Health', to: '/health', icon: Activity },
      { label: 'Design System', to: '/design-system', icon: Palette },
      { label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
]

/** Backend services surfaced as health dots in the left rail. */
export type ServiceHealth = 'up' | 'degraded' | 'down'

export interface ServiceStatus {
  name: string
  key: string
  status: ServiceHealth
}

export const SERVICES: ServiceStatus[] = [
  { name: 'Identity', key: 'identity', status: 'up' },
  { name: 'Content', key: 'content', status: 'up' },
  { name: 'Feed', key: 'feed', status: 'degraded' },
  { name: 'AI', key: 'ai', status: 'up' },
  { name: 'Notification', key: 'notification', status: 'up' },
]
