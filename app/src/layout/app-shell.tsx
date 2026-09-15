import { useRef, useState, type ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { Topbar, type ShellUser } from './topbar'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import './app-shell.css'

/** App frame: fixed left rail (lg+) or a slide-in drawer (below lg) + top bar
    over scrolling content. User / logout / badges are injected by the
    app-level authed layout, so the shell itself stays feature-agnostic. */
export function AppShell({
  user,
  onLogout,
  badges,
  children,
}: {
  user?: ShellUser
  onLogout?: () => void
  badges?: Record<string, number>
  children: ReactNode
}) {
  const [navOpen, setNavOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navTrigger = useRef<HTMLElement | null>(null)

  function handleNavToggle() {
    navTrigger.current = document.activeElement as HTMLElement
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
      setSidebarCollapsed((collapsed) => !collapsed)
      return
    }
    setNavOpen(true)
  }

  return (
    <div className="app-shell flex h-screen overflow-hidden">
      <a href="#app-main" className="app-shell-skip">Skip to content</a>
      {/* Desktop: persistent rail */}
      {!sidebarCollapsed && (
        <div className="hidden lg:flex">
          <Sidebar badges={badges} user={user} />
        </div>
      )}

      {/* Mobile / tablet: slide-in drawer */}
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-[var(--spacing-sidebar)] max-w-[var(--spacing-sidebar)] p-0" onCloseAutoFocus={event => { event.preventDefault(); navTrigger.current?.focus() }}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Navigate the administration workspace.</SheetDescription>
          <Sidebar badges={badges} user={user} onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          onLogout={onLogout}
          onMenuClick={handleNavToggle}
          isSidebarCollapsed={sidebarCollapsed}
        />
        <main id="app-main" className="flex-1 overflow-y-auto" tabIndex={-1}>{children}</main>
      </div>
    </div>
  )
}
