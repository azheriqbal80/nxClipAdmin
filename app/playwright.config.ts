import { defineConfig, devices } from '@playwright/test'

/**
 * E2E config. Tests run against the Vite dev server, which starts MSW in dev —
 * so the whole admin app is exercised against the same typed mock contract the
 * UI uses. When the real /admin/* backend exists, point baseURL at it and the
 * same specs become live smoke tests.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Cap concurrency — too many parallel Chromium contexts crash on constrained machines.
  workers: process.env.CI ? 2 : 3,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:5175',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Port 5175 is reserved for e2e. Previously this was 5173 — the same port a
    // developer runs the app on — so with `reuseExistingServer` the suite would
    // silently attach to a LIVE (mocks-off) server, every request would 401, and
    // the whole run failed for reasons unrelated to the code under test.
    // A dedicated port removes that collision entirely.
    command: 'npm run dev -- --port 5175 --strictPort',
    url: 'http://localhost:5175',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Force MSW mocks on for e2e even when a dev .env.local points at the live
    // gateway (VITE_ENABLE_MOCKS=false). Existing env vars win over .env files.
    env: { VITE_ENABLE_MOCKS: 'true', VITE_API_URL: '' },
  },
})
