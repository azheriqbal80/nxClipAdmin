import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/cn'
import { Logo } from '@/components/logo'
import { Badge } from '@/components/ui/badge'
import { NAV } from '@/config/nav'
import { UserAvatar } from '@/components/user-avatar'
import type { ShellUser } from './topbar'

/** `badges` maps a route path → live count, injected from the app layer so the
    shared shell never imports a feature. */
export function Sidebar({
  badges,
  onNavigate,
  user,
}: {
  badges?: Record<string, number>
  /** Called when a nav link is clicked — closes the mobile drawer. */
  onNavigate?: () => void
  user?: ShellUser
}) {
  return (
    <aside data-slot="app-sidebar" className="flex h-full w-full flex-col border-r border-border bg-sidebar lg:w-[var(--spacing-sidebar)]">
      <div className="flex h-(--spacing-topbar) items-center px-4">
        <Logo />
      </div>

      <div className="shell-workspace"><span>N</span><div><strong>nxClip workspace</strong><small>Administration</small></div></div>

      <nav aria-label="Main navigation" className="flex-1 space-y-6 overflow-y-auto px-4 py-2">
        {NAV.map((section) => (
          <div key={section.title}>
            <div className="mb-2 px-2 text-caption font-medium tracking-[0.12em] text-faint uppercase">
              {section.title}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className="group block rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    activeOptions={{ exact: item.to === '/' }}
                  >
                    {({ isActive }) => (
                      <span
                        className={cn(
                          'flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 py-2 text-ui transition-colors',
                          isActive
                            ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                            : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                        )}
                      >
                        <item.icon className={cn('size-4', isActive ? 'text-primary' : 'text-faint')} />
                        <span className="flex-1">{item.label}</span>
                        {(() => {
                          const count = badges?.[item.to] ?? item.badge
                          return count ? (
                            <Badge variant="accent" className="px-1.5 py-0 text-micro">
                              {count}
                            </Badge>
                          ) : null
                        })()}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shell-account"><UserAvatar name={user?.displayName || user?.username || 'Admin'} size="sm" /><div><strong>{user?.displayName || user?.username || 'Admin'}</strong><small>Workspace administrator</small></div></div>
    </aside>
  )
}
