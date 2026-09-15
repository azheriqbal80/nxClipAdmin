import { test, expect } from '@playwright/test'

// Unauthenticated flows — start each test with a clean storage state.
test.use({ storageState: { cookies: [], origins: [] } })

test('unauthenticated user is redirected to /login', async ({ page }) => {
  await page.goto('/moderation')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
})

test('admin can log in and reach the console', async ({ page }) => {
  await page.goto('/login')
  await page.locator('#email').fill('admin@nxclip.com')
  await page.locator('#password').fill('secret123')
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Relative so the spec follows `use.baseURL` — never hardcode the e2e port.
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()
  // Shell is present — scope to the sidebar (Overview also has a Moderation quick-link)
  await expect(page.locator('aside').getByRole('link', { name: /Moderation/ })).toBeVisible()
})

test('bad credentials show an error', async ({ page }) => {
  await page.goto('/login')
  // Valid email format (passes native validation) but a password the mock rejects (<4 chars → 401).
  await page.locator('#email').fill('admin@nxclip.com')
  await page.locator('#password').fill('x')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText(/invalid email or password/i)).toBeVisible()
})

test('the login page fires no admin requests', async ({ page }) => {
  // The nav-badge and health queries used to sit above AuthedLayout's
  // isAuthenticated() guard. Hooks can't be conditional, so an unauthenticated
  // visit fired six admin requests with no Authorization header and collected
  // six 401s before redirecting. The fetching shell is now a child component
  // that only mounts once the guard passes.
  const adminCalls: string[] = []
  page.on('request', (r) => {
    const { pathname } = new URL(r.url())
    if (pathname.startsWith('/admin/')) adminCalls.push(`${r.method()} ${pathname}`)
  })

  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  await page.waitForTimeout(1200)

  expect(adminCalls).toEqual([])
})
