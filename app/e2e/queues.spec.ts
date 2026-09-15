import { test, expect, clickFirstRow } from './fixtures'

test('AI queues dashboard renders KPIs, queue health and cost', async ({ page }) => {
  await page.goto('/queues')
  await expect(page.getByRole('heading', { name: 'AI Queues & Cost' })).toBeVisible()

  await expect(page.getByText('Processing mode')).toBeVisible()
  await expect(page.getByText('Queue health')).toBeVisible()
  await expect(page.getByText('Image generation').first()).toBeVisible()
  await expect(page.getByText('Top spenders')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Queue' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Type' })).toBeVisible()
  await page.getByRole('button', { name: 'Queue' }).click()
  await page.getByRole('menuitemcheckbox', { name: 'Image generation' }).click()
  await page.keyboard.press('Escape')
})

test('a failed job can be retried', async ({ page }) => {
  await page.goto('/queues')

  // Select the first failed job row (skip the header row)
  await clickFirstRow(page)

  await expect(page.getByRole('button', { name: 'Retry job' })).toBeVisible()
  await page.getByRole('button', { name: 'Retry job' }).click()
  await expect(page.getByText('Job re-queued')).toBeVisible()
})

test('reliability charts derive a trend and rank failures by error', async ({ page }) => {
  await page.goto('/queues')

  // Single-axis stacked bars: failed vs succeeded counts share one scale.
  const trend = page.getByRole('img', { name: /AI jobs per day by outcome/ })
  await expect(trend).toBeVisible()
  // Derived client-side from job createdAt — gap-filled, so 14 days of bars.
  await expect(page.getByText(/14 days · \d+ jobs/)).toBeVisible()

  // The improvement signal: rate over the recent half vs the earlier half.
  await expect(page.getByText(/% failing/)).toBeVisible()
  await expect(page.getByText(/pp vs earlier/)).toBeVisible()

  // Ranked error taxonomy, with the dominant error called out.
  await expect(page.getByRole('img', { name: /Failed jobs grouped by error/ })).toBeVisible()
  await expect(page.getByText(/top error is/)).toBeVisible()
  await expect(page.getByText(/grouped by first line of the error/)).toBeVisible()
})

test('pipeline timing compares queues instead of bucketing durations', async ({ page }) => {
  await page.goto('/queues')
  const panel = page
    .locator('div.rounded-xl.border.bg-card')
    .filter({ hasText: 'Time per queue' })
    .first()
  await expect(panel).toBeVisible()

  // Median and p90 are both seconds — one axis, two series.
  await expect(panel.getByText('Median', { exact: true })).toBeVisible()
  await expect(panel.getByText('90th percentile')).toBeVisible()
  // Overall readout gives the headline numbers.
  await expect(panel.getByText(/overall/)).toBeVisible()
  // Failed jobs are excluded, and that's stated rather than assumed.
  await expect(panel.getByText(/failed jobs excluded/)).toBeVisible()

  // Slowest queue first — that's the one worth looking at.
  const rows = await panel
    .getByRole('img', { name: /Median and 90th percentile duration/ })
    .getAttribute('aria-label')
  expect(rows).toMatch(/^Median and 90th percentile duration per queue: Transcription/)
})
