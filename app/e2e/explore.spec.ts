import { test, expect, clickFirstRow } from './fixtures'

test('explore audit renders ranked projections and KPIs', async ({ page }) => {
  await page.goto('/explore')
  await expect(page.getByRole('heading', { name: 'Explore Audit' })).toBeVisible()
  await expect(page.getByText('Projections', { exact: true })).toBeVisible()
  await expect(page.getByText('Avg WES')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Status' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Type' })).toBeVisible()
  await page.getByRole('button', { name: 'Type' }).click()
  await page.getByRole('menuitemcheckbox').first().click()
  await page.keyboard.press('Escape')

  // Selecting a row opens the read-only inspector ("Live externally" is inspector-only)
  await clickFirstRow(page)
  await expect(page.getByText('Live externally')).toBeVisible()
})

test('explore pages through projections', async ({ page }) => {
  await page.goto('/explore')
  await expect(page.getByText(/Page 1 of/)).toBeVisible()
  await page.getByRole('button', { name: 'Next page' }).click()
  await expect(page.getByText(/Page 2 of/)).toBeVisible()
})

test('WES scatter audits whether the ranking follows engagement', async ({ page }) => {
  await page.goto('/explore')
  const panel = page
    .locator('div.rounded-xl.border.bg-card')
    .filter({ hasText: 'WES vs engagement' })
    .first()
  await expect(panel).toBeVisible()

  // The chart's job is the correlation, not the picture — it must be stated.
  await expect(panel.getByText(/ρ \d\.\d\d/)).toBeVisible()
  // …in plain language, so the number isn't over-read.
  await expect(panel.getByText(/tracks engagement|related to engagement|inverted/)).toBeVisible()
  // Method and sample size disclosed, never implied.
  await expect(panel.getByText(/Spearman rank correlation/)).toBeVisible()
  await expect(panel.getByText(/\d+ projections/)).toBeVisible()

  await expect(page.getByRole('img', { name: /Weighted engagement score/ })).toBeVisible()
})
