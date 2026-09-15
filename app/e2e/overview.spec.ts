import { test, expect } from './fixtures'

const metric = (page: import('@playwright/test').Page, label: string) =>
  page.locator('section.overview-operation-metric').filter({ has: page.getByRole('heading', { name: label, exact: true }) })

test('overview renders the approved operations, moderation, users, and growth sections', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible()
  for (const label of ['In moderation', 'Queue depth', 'Failed jobs', 'Spend (30d)']) {
    await expect(metric(page, label)).toBeVisible()
  }
  await expect(page.getByRole('heading', { name: 'Quick access', exact: true })).toBeVisible()
  await expect(page.locator('.example-table tbody tr').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Users & subscriptions', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Plan distribution', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Growth & paid adoption', exact: true })).toBeVisible()
  await expect(page.getByLabel('Preview data state')).toHaveCount(0)
  await expect(page.getByText('Dummy data preview', { exact: true })).toHaveCount(0)
})

test('overview quick link opens the moderation queue', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Open queue', exact: true }).click()
  await expect(page).toHaveURL(/\/moderation$/)
  await expect(page.getByRole('heading', { name: 'Moderation Hub' })).toBeVisible()
})

test('growth preserves current-plan semantics, history scope, and cohort maturity', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('img', { name: /New accounts per month, split by each account's current plan/ })).toBeVisible()
  await expect(page.getByText(/\d+ months · \d+ accounts/)).toBeVisible()
  await expect(page.getByText(/vs prior \d+ months/)).toBeVisible()
  await expect(page.getByRole('img', { name: /Share of each signup cohort on a paid plan today/ })).toBeVisible()
  await expect(page.getByRole('img', { name: /Recent cohorts have had less time to convert/ })).toBeVisible()
  await expect(page.getByText(/%paid overall/)).toBeVisible()
  await expect(page.getByText(/still converting, so treat it as a floor/)).toBeVisible()
})

test('failed jobs are counted from the job list rather than queue counters', async ({ page }) => {
  let jobListQueried = false
  page.on('request', request => {
    const url = new URL(request.url())
    if (url.pathname === '/admin/jobs' && url.searchParams.get('status') === 'failed') jobListQueried = true
  })
  await page.goto('/')
  await expect(metric(page, 'Failed jobs').locator('.overview-metric-main > strong')).toHaveText('11')
  expect(jobListQueried).toBe(true)
})

test('signup comparisons use server-counted prior windows', async ({ page }) => {
  const ranged: string[] = []
  page.on('request', request => {
    const url = new URL(request.url())
    if (url.pathname === '/admin/users/stats' && url.searchParams.get('from')) ranged.push(url.pathname)
  })
  await page.goto('/')
  await expect(page.getByText(/-100% vs prior 7d \(1\)/)).toBeVisible()
  await expect(page.getByText(/\+100% vs prior 30d \(2\)/)).toBeVisible()
  await expect.poll(() => ranged.length).toBe(2)
})

test('cohorts disclose their denominator and preserve empty-period gaps', async ({ page }) => {
  await page.goto('/')
  const footer = page.getByText(/\d+ cohorts · \d+ accounts · paid = PRO or STUDIO today/)
  await expect(footer).toBeVisible()
  const cohorts = Number((await footer.innerText()).match(/^(\d+) cohorts/)?.[1])
  const months = Number((await page.getByText(/\d+ months · \d+ accounts/).innerText()).match(/^(\d+) months/)?.[1])
  expect(cohorts).toBeGreaterThan(0)
  expect(cohorts).toBeLessThanOrEqual(months)
})

test('search, status filters, inspection, and selection operate on loaded records', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Publishing', exact: true }).click()
  const table = page.getByRole('table')
  await expect(table.locator('tbody tr').first()).toBeVisible()
  for (const row of await table.locator('tbody tr').all()) await expect(row.getByText('Publishing', { exact: true })).toBeVisible()
  const inspect = table.getByRole('button', { name: /^Inspect / }).first()
  await inspect.click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Content details' })).toBeVisible()
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(inspect).toBeFocused()
  await table.getByRole('checkbox').nth(1).check()
  await expect(page.getByRole('button', { name: 'Export selected', exact: true })).toBeEnabled()
  await page.getByLabel('Search moderation items', { exact: true }).fill('definitely-no-matching-record')
  await expect(page.getByText('No matching moderation items', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Clear search and filters', exact: true }).click()
  await expect(page.getByLabel('Search moderation items', { exact: true })).toHaveValue('')
})

test('the mobile overview contains table overflow and restores navigation focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.locator('.example-table tbody tr').first()).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  const menu = page.getByRole('button', { name: 'Toggle navigation', exact: true })
  await menu.click()
  await expect(page.getByRole('dialog', { name: 'Navigation', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(menu).toBeFocused()
})
