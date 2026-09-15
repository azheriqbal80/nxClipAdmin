import { test, expect } from './fixtures'

test('system health page lists services with live status', async ({ page }) => {
  await page.goto('/health')
  await expect(page.getByRole('heading', { name: 'System Health' })).toBeVisible()
  const main = page.getByRole('main')
  await expect(main.getByText('Identity', { exact: true })).toBeVisible()
  await expect(main.getByText('Notification', { exact: true })).toBeVisible()
  // Feed is seeded down → a "down" pill + overall "Degraded"
  await expect(main.getByText('down').first()).toBeVisible()
  await expect(main.getByText('Degraded', { exact: true })).toBeVisible()
})

test('overview health summary reflects the live aggregate', async ({ page }) => {
  await page.goto('/')
  const summary = page.getByRole('region', { name: 'System health summary', exact: true })
  await expect(summary.getByText('1 down', { exact: true })).toBeVisible()
  await summary.getByText('View service status', { exact: true }).click()
  await expect(summary.getByText('Down', { exact: true })).toBeVisible()
  await expect(summary.getByRole('link', { name: 'Open system health', exact: true })).toBeVisible()
})

test('a failed health check reports unknown, never "operational"', async ({ page }) => {
  // This page's whole job is reporting failure — rendering green off an errored
  // request is the one thing it must never do (DESIGN.md § The Honest Health Rule).
  // Playwright's route() can't intercept here: MSW's service worker answers
  // first, so the app exposes __mswFail in mock builds to force one endpoint.
  await page.goto('/')
  await page.waitForFunction(() => '__mswFail' in window)
  await page.evaluate(() =>
    (window as unknown as { __mswFail: (p: string, s?: number) => void }).__mswFail(
      '/admin/health',
      500,
    ),
  )

  // Client-side nav (a reload would discard the override), then force a refetch
  // past the cache the sidebar already warmed.
  await page.getByRole('link', { name: 'System Health' }).click()
  await page.getByRole('button', { name: 'Refresh' }).click()

  await expect(page.getByText('Service state unknown')).toBeVisible()
  await expect(page.getByText(/not a clean bill of health/)).toBeVisible()
  await expect(page.getByText('Unknown', { exact: true }).first()).toBeVisible()

  // The false positive that used to render instead:
  await expect(page.getByText('All systems operational')).toHaveCount(0)
  await expect(page.getByText('Operational', { exact: true })).toHaveCount(0)
})
