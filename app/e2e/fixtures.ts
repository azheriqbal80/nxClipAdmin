import { test as base, expect, type Page } from '@playwright/test'

/**
 * `test` = an authenticated session. It seeds the access token in localStorage
 * before any page script runs, so the admin guard lets us straight in (MSW's
 * /auth/me returns the admin user for any Bearer token).
 *
 * For unauthenticated flows (the login page itself), import `test` from
 * '@playwright/test' directly instead.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      localStorage.setItem('nx_admin_token', 'e2e-access-token')
      localStorage.setItem('nx_admin_refresh', 'e2e-refresh-token')
    })
    await use(page)
  },
})

/**
 * Click the first **data** row of a DataGrid.
 *
 * While loading, DataGrid renders skeleton placeholder rows inside `<tbody>`
 * (they carry no row handler). Clicking `tbody tr` straight after navigation can
 * therefore hit a placeholder and silently do nothing — which surfaces as an
 * intermittent failure whenever the dev server is cold and compiling. Waiting
 * for the skeletons to clear makes the click deterministic.
 */
export async function clickFirstRow(page: Page) {
  await expect(page.locator('tbody [data-slot="skeleton"]')).toHaveCount(0)
  const row = page.locator('tbody tr').first()
  await expect(row).toBeVisible()
  await row.click()
}

export { expect }
