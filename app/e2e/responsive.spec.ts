import { test, expect } from './fixtures'

test.use({ viewport: { width: 390, height: 844 } }) // iPhone-ish

test('mobile: sidebar is hidden and opens via the hamburger', async ({ page }) => {
  await page.goto('/')
  // Persistent rail is hidden below lg → the Moderation nav link isn't visible yet
  await expect(page.getByRole('link', { name: /Moderation/ })).toBeHidden()

  // One control serves both breakpoints: below lg it opens the drawer, at lg+ it
  // collapses the persistent rail. Its label reflects the collapsed state.
  await page.getByRole('button', { name: 'Toggle navigation' }).click()
  // Drawer opens with the nav
  const modLink = page.getByRole('link', { name: /Moderation/ })
  await expect(modLink).toBeVisible()

  // Navigating closes the drawer
  await modLink.click()
  await expect(page).toHaveURL(/\/moderation$/)
  await expect(page.getByRole('link', { name: /Moderation/ })).toBeHidden()
})
