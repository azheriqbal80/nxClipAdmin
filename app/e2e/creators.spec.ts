import { test, expect } from './fixtures'

test('creator search filters the directory', async ({ page }) => {
  await page.goto('/creators')
  await expect(page.getByRole('heading', { name: 'Creator Directory' })).toBeVisible()

  await page.getByPlaceholder('Search name, @handle or email…').fill('emily')
  await expect(page.getByRole('row', { name: /Emily Carter/ })).toBeVisible()
  await expect(page.getByRole('row', { name: /Sarah Khan/ })).toHaveCount(0)
})

test('a creator can be suspended from the inspector', async ({ page }) => {
  await page.goto('/creators')
  await page.getByRole('row', { name: /Olivia Brown/ }).click()

  await page.getByRole('button', { name: 'Suspend' }).click()
  await expect(page.getByText('Creator suspended')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reactivate' })).toBeVisible()
})

test('faceted plan filter narrows the directory', async ({ page }) => {
  await page.goto('/creators')
  // The facet trigger (a dropdown menu), not the sortable "Plan" column header.
  await page.locator('button[aria-haspopup="menu"]', { hasText: 'Plan' }).click()
  await page.getByRole('menuitemcheckbox', { name: /Studio/ }).click()
  await page.keyboard.press('Escape')

  await expect(page.getByRole('row', { name: /Emily Carter/ })).toBeVisible() // STUDIO
  await expect(page.getByRole('row', { name: /Sarah Khan/ })).toHaveCount(0) // PRO
})

test('inspector enriches the selected creator from GET /admin/users/:id', async ({ page }) => {
  await page.goto('/creators')
  // The list DTO omits contentCount / emailVerified (mirrors live), so the
  // table's Content column is empty…
  await expect(page.getByRole('cell', { name: '—' }).first()).toBeVisible()

  await page.getByRole('row', { name: /Emily Carter/ }).click()
  // …and both fields appear in the inspector only once the detail route lands.
  await expect(page.getByText('130 items')).toBeVisible()
  await expect(page.getByText('Verified', { exact: true })).toBeVisible()
})

test('selecting rows reveals bulk actions', async ({ page }) => {
  await page.goto('/creators')
  await page.getByRole('checkbox', { name: 'Select row' }).first().check()

  await expect(page.getByText(/1 selected/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Suspend' })).toBeVisible()
})

test('plan headroom ranks creators by pressure against their daily cap', async ({ page }) => {
  await page.goto('/creators')
  const panel = page
    .locator('div.rounded-xl.border.bg-card')
    .filter({ hasText: 'Daily generation headroom' })
    .first()
  await expect(panel).toBeVisible()

  // Over cap is called out, not buried.
  await expect(panel.getByText(/at or over cap/)).toBeVisible()
  // FREE cap is 5/day; the seeded over-cap creator shows 7 / 5.
  await expect(panel.getByText('7 / 5')).toBeVisible()
  // Unlimited plans render as ∞ rather than a fake percentage.
  await expect(panel.getByText(/\/ ∞/)).toBeVisible()

  // Worst pressure first: the over-cap FREE creator outranks the 12/100 PRO one.
  const order = await panel.locator('li').evaluateAll((els) =>
    els.map((el) => el.textContent?.match(/\d+ \/ (?:\d+|∞)/)?.[0] ?? ''),
  )
  expect(order[0]).toBe('7 / 5')

  // The window is disclosed, never implied to be a full aggregate.
  await expect(panel.getByText(/vs each plan's daily cap/)).toBeVisible()
})
