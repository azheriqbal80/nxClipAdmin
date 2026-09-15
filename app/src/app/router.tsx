import { createRootRoute, createRoute, createRouter, lazyRouteComponent, Outlet } from '@tanstack/react-router'
import { AuthedLayout } from './authed-layout'
import { LoginPage } from '@/features/auth'
import { OverviewPage } from '@/features/overview'
import { DesignSystemPage } from '@/features/design-system'
import { ModerationPage } from '@/features/moderation'
import { CreatorsPage } from '@/features/creators'
import { QueuesPage } from '@/features/queues'
import { ExplorePage } from '@/features/explore'
import { PublishingPage } from '@/features/publishing'
import { DraftsPage } from '@/features/drafts'
import { HealthPage } from '@/features/health'
import { PlansPage, CoachPage } from '@/features/config'
import { SettingsPage } from '@/features/settings'

const rootRoute = createRootRoute({ component: () => <Outlet /> })

/** Public route (no shell). */
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

/** Everything below requires an admin session (guarded shell). */
const authedLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authed',
  component: AuthedLayout,
})

const routeTree = rootRoute.addChildren([
  // Standalone design example: illustrative fixtures, no admin API access.
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/overview-example',
    component: lazyRouteComponent(
      () => import('@/features/overview-example/pages/overview-example-page'),
      'OverviewExamplePage',
    ),
  }),
  loginRoute,
  authedLayout.addChildren([
    createRoute({
      getParentRoute: () => authedLayout,
      path: '/',
      component: OverviewPage,
    }),
    createRoute({
      getParentRoute: () => authedLayout,
      path: '/design-system',
      component: DesignSystemPage,
    }),
    createRoute({
      getParentRoute: () => authedLayout,
      path: '/moderation',
      component: ModerationPage,
    }),
    createRoute({
      getParentRoute: () => authedLayout,
      path: '/creators',
      component: CreatorsPage,
    }),
    createRoute({
      getParentRoute: () => authedLayout,
      path: '/queues',
      component: QueuesPage,
    }),
    createRoute({
      getParentRoute: () => authedLayout,
      path: '/explore',
      component: ExplorePage,
    }),
    createRoute({
      getParentRoute: () => authedLayout,
      path: '/drafts',
      component: DraftsPage,
    }),
    createRoute({
      getParentRoute: () => authedLayout,
      path: '/publishing',
      component: PublishingPage,
    }),
    createRoute({
      getParentRoute: () => authedLayout,
      path: '/health',
      component: HealthPage,
    }),
    createRoute({
      getParentRoute: () => authedLayout,
      path: '/config/plans',
      component: PlansPage,
    }),
    createRoute({
      getParentRoute: () => authedLayout,
      path: '/config/coach',
      component: CoachPage,
    }),
    createRoute({
      getParentRoute: () => authedLayout,
      path: '/settings',
      component: SettingsPage,
    }),
  ]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
