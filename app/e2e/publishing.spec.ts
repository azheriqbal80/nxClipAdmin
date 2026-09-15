import { test, expect, clickFirstRow } from './fixtures'

test('stuck publishing view renders KPIs and pipeline inspector', async ({ page }) => {
  await page.goto('/publishing')
  await expect(page.getByRole('heading', { name: 'Stuck Publishing' })).toBeVisible()
  await expect(page.getByText('Stuck in publishing')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Status' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Type' })).toBeVisible()
  await page.getByRole('button', { name: 'Status' }).click()
  await page.getByRole('menuitemcheckbox', { name: 'Error' }).click()
  await page.keyboard.press('Escape')

  // Select a row → pipeline stepper appears (Feed projection is inspector-only)
  await clickFirstRow(page)
  await expect(page.getByText('Feed projection', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Force approve & publish' })).toBeVisible()
})

test('force-approve re-drives a stuck item', async ({ page }) => {
  await page.goto('/publishing')
  await clickFirstRow(page)
  await page.getByRole('button', { name: 'Force approve & publish' }).click()
  await expect(page.getByText('Re-approved — publish re-driven')).toBeVisible()
})

test('publishing charts show latency trend and backlog age distribution', async ({ page }) => {
  await page.goto('/publishing')

  // p50 + p90 share one axis (both minutes) — no dual axis.
  await expect(page.getByRole('img', { name: /create-to-publish latency/ })).toBeVisible()
  await expect(page.getByText(/median/).first()).toBeVisible()
  await expect(page.getByText(/\d+ published items/)).toBeVisible()

  // Age bands separate a fresh blip from a rotting backlog.
  await expect(page.getByRole('img', { name: /Stuck items by age band/ })).toBeVisible()
  await expect(page.getByText(/over a day old/)).toBeVisible()
  await expect(page.getByText(/age since creation/)).toBeVisible()
})
