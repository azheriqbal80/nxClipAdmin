import { test, expect, clickFirstRow } from './fixtures'

test('moderation queue loads and an item can be approved', async ({ page }) => {
  await page.goto('/moderation')
  await expect(page.getByRole('heading', { name: 'Content Moderation Hub' })).toBeVisible()

  // Row from the seeded publishing queue
  const row = page.getByRole('row', { name: /Neon skyline remix/ })
  await expect(row).toBeVisible()

  // Selecting it populates the inspector
  await row.click()
  await expect(page.getByText('neon cyberpunk skyline')).toBeVisible()

  // Approve → toast + row leaves the publishing queue
  await page.getByRole('button', { name: 'Approve' }).click()
  await expect(page.getByText('Content approved')).toBeVisible()
  await expect(page.getByRole('row', { name: /Neon skyline remix/ })).toHaveCount(0)
})

test('status filter switches the queue', async ({ page }) => {
  await page.goto('/moderation')
  await page.getByRole('button', { name: 'Status' }).click()
  await page.getByRole('menuitemcheckbox', { name: /Rejected/ }).click()
  await expect(page.getByRole('row', { name: /Boss fight clutch/ })).toBeVisible()
})

test('selecting a row fetches authoritative detail from GET /admin/content/:id', async ({
  page,
}) => {
  const detailCalls: string[] = []
  page.on('request', (r) => {
    const { pathname } = new URL(r.url())
    // the single-item route, not the list or the approve/takedown actions
    if (/^\/admin\/content\/[^/]+$/.test(pathname)) detailCalls.push(pathname)
  })

  await page.goto('/moderation')
  await clickFirstRow(page)

  await expect.poll(() => detailCalls.length).toBeGreaterThan(0)
})

test('sidebar shows a live moderation queue badge', async ({ page }) => {
  await page.goto('/moderation')
  const modLink = page.getByRole('link', { name: /Moderation/ })
  await expect(modLink).toBeVisible()
  await expect(modLink).toContainText(/\d+/) // live count injected from the query
})

test('content volume shows arrivals and their outcomes over time', async ({ page }) => {
  await page.goto('/moderation')
  const panel = page
    .locator('div.rounded-xl.border.bg-card')
    .filter({ hasText: 'Content created & outcome' })
    .first()
  await expect(panel).toBeVisible()

  // Counts share one scale, so volume and outcome mix stack on a single axis.
  await expect(page.getByRole('img', { name: /Content created per (day|week|month) by outcome/ })).toBeVisible()
  // Sample size and bucketing disclosed, not implied.
  await expect(panel.getByText(/most recent items · grouped by creation/)).toBeVisible()

  // Only bands that actually occur get a series — the legend must not advertise
  // outcomes this platform has never produced.
  const legend = (await panel.innerText()).split('\n').join(' ')
  expect(legend).toMatch(/Published/)
  expect(legend).not.toMatch(/\bDraft\b/) // mock content has no draft rows
})
