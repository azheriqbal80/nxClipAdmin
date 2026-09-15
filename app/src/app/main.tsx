import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import '@fontsource-variable/jetbrains-mono'
import '../styles/index.css'
import { AppProviders } from './providers'
import { router } from './router'
import { MOCKS_ON } from '@/lib/env'
import { initSession } from '@/features/auth'

// Rehydrate the access token from storage before the first request fires.
initSession()

async function enableMocking() {
  if (!MOCKS_ON) return
  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })

  // Let e2e force a single endpoint to fail, so error branches are testable.
  // Playwright's own `route()` cannot reach these requests — MSW's service
  // worker answers them before they touch the network. Mock builds only.
  const { http, HttpResponse } = await import('msw')
  Object.assign(window, {
    __mswFail: (path: string, status = 500) =>
      worker.use(
        http.all(`*${path}`, () =>
          HttpResponse.json({ message: 'forced failure (e2e)' }, { status }),
        ),
      ),
    __mswReset: () => worker.resetHandlers(),
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  )
})
