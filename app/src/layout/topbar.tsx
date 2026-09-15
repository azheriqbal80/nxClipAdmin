import { useRouterState } from '@tanstack/react-router'
import { ChevronRight, ChevronsUpDown, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/user-avatar'
import { NAV } from '@/config/nav'

export interface ShellUser {
  displayName: string
  username: string
  email: string
}

export function Topbar({
  user,
  onLogout,
  onMenuClick,
  isSidebarCollapsed = false,
}: {
  user?: ShellUser
  onLogout?: () => void
  onMenuClick?: () => void
  isSidebarCollapsed?: boolean
}) {
  const name = user?.displayName ?? 'Admin User'
  const handle = user?.username ?? 'admin'
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const navMatch = NAV.flatMap((section) =>
    section.items.map((item) => ({ section: section.title, item })),
  ).find(({ item }) => item.to === pathname)
  const sectionLabel = navMatch?.section ?? 'Admin'
  const pageLabel =
    navMatch?.item.label ??
    pathname
      .split('/')
      .filter(Boolean)
      .at(-1)
      ?.replace(/-/g, ' ') ??
    'Overview'

  return (
    <header data-slot="app-topbar" className="flex h-(--spacing-topbar) shrink-0 items-center gap-3 border-b border-border px-4 sm:px-6 md:px-8">
      <Button
        variant="ghost"
        size="icon-lg"
        aria-label={isSidebarCollapsed ? 'Show navigation' : 'Toggle navigation'}
        onClick={onMenuClick}
      >
        {isSidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
      </Button>

      <nav
        aria-label={`Breadcrumb: ${sectionLabel} / ${pageLabel}`}
        className="flex min-w-0 items-center gap-2 text-sm"
      >
        <span className="hidden truncate text-muted-foreground sm:inline">{sectionLabel}</span>
        <ChevronRight className="hidden size-4 shrink-0 text-faint sm:block" aria-hidden="true" />
        <span className="truncate font-medium text-foreground" aria-current="page">
          {pageLabel}
        </span>
      </nav>

      <div className="ml-auto flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="lg"
              aria-label={`Account menu for ${name}`}
              className="h-9 rounded-full bg-card pl-1 pr-2.5 hover:bg-secondary aria-expanded:bg-secondary"
            >
              <UserAvatar name={name} size="sm" />
              <span className="hidden min-w-0 text-left sm:block">
                <span className="block truncate text-sm font-medium leading-tight text-foreground">
                  {name}
                </span>
                <span className="block truncate text-caption leading-tight text-muted-foreground">
                  {handle}
                </span>
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0 text-faint" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="text-sm font-medium text-foreground">{name}</div>
              {user?.email && (
                <div className="text-xs font-normal text-muted-foreground">{user.email}</div>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onLogout}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
