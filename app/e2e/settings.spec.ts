import { test, expect } from './fixtures'

test('settings shows the signed-in admin and environment', async ({ page }) => {
  await page.goto('/settings')
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await expect(page.getByText('Signed-in admin')).toBeVisible()
  await expect(page.getByText('Connection')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
})

test('sign out returns to the login screen', async ({ page }) => {
  await page.goto('/settings')
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login/)
})

test('sign out sends the refresh token, so the server can actually revoke it', async ({
  page,
}) => {
  // `POST /auth/logout` requires the token being revoked in its body; a bodiless
  // call 400s. Because the mutation clears the local session in `onSettled`, that
  // failure is invisible — the operator looks signed out while the refresh token
  // stays valid until it expires. This asserts the body, not just the redirect,
  // because the redirect passes either way.
  let body: unknown = null
  page.on('request', (r) => {
    if (new URL(r.url()).pathname === '/auth/logout' && r.method() === 'POST') {
      try {
        body = JSON.parse(r.postData() ?? 'null')
      } catch {
        body = r.postData()
      }
    }
  })

  await page.goto('/settings')
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login/)

  await expect.poll(() => body).not.toBeNull()
  expect((body as { refreshToken?: string })?.refreshToken).toBe('e2e-refresh-token')
})
