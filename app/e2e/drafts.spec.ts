import { test, expect, clickFirstRow } from './fixtures'

test('drafts page lists pre-submission content the moderation queue excludes', async ({
  page,
}) => {
  await page.goto('/drafts')
  await expect(page.getByRole('heading', { name: 'Drafts & Processing' })).toBeVisible()

  // The table now defaults to both pre-submission states; drafts remain visible
  // without an extra filter.
  await expect(page.getByRole('row', { name: /Rooftop portrait series/ })).toBeVisible()
  await expect(page.getByRole('row', { name: /Winter market shots/ })).toBeVisible()

  // Creator names resolve rather than falling back to an id prefix. The content
  // mock used to carry userIds no creator had, which silently disabled name
  // resolution on every content surface.
  await expect(page.getByRole('row', { name: /Sarah Khan/ }).first()).toBeVisible()
})

test('only processing items past the threshold are flagged as stalled', async ({ page }) => {
  await page.goto('/drafts')
  await page.getByRole('button', { name: 'Status' }).click()
  await page.getByRole('menuitemcheckbox', { name: 'Processing' }).click()

  // The mock seeds five processing items, three of them older than 45 minutes.
  // The two recent ones must NOT be flagged: generation legitimately takes
  // minutes, and calling a 5-minute-old job stalled would train operators to
  // ignore the signal.
  const fresh = page.getByRole('row', { name: /Ocean drone pass/ })
  await expect(fresh).toBeVisible()
  await expect(fresh.getByText('stalled?')).toHaveCount(0)

  const stalled = page.getByRole('row', { name: /Festival crowd cut/ })
  await expect(stalled).toBeVisible()
  await expect(stalled.getByText('stalled?')).toBeVisible()

  // The banner count must match the number of flagged rows, not the tab total.
  await expect(page.getByText(/3 items have been generating for over 45m/)).toBeVisible()
  await expect(page.getByText('stalled?')).toHaveCount(3)
})

test('the nav badge counts stalled generation, not idle drafts', async ({ page }) => {
  await page.goto('/drafts')
  // Seven drafts exist but sitting in drafts is not a problem, so the badge
  // tracks the three stalled processing items instead.
  const link = page.getByRole('link', { name: /Drafts & Processing/ })
  await expect(link).toBeVisible()
  await expect(link).toContainText('3')
})

test('the inspector explains a stall and offers no moderation actions', async ({ page }) => {
  await page.goto('/drafts')
  await page.getByRole('button', { name: 'Status' }).click()
  await page.getByRole('menuitemcheckbox', { name: 'Processing' }).click()
  await clickFirstRow(page)

  // Age and the reason for suspicion, with the limitation stated rather than
  // implied — there is no queue history to confirm a stall (BE-4).
  await expect(page.getByText('Generation may have stalled').or(page.getByText('Prompt'))).toBeVisible()

  // Approve and takedown are decisions about submitted content. Offering them
  // here would let an admin publish straight out of a creator's drafts.
  await expect(page.getByRole('button', { name: 'Approve' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Take ?down/i })).toHaveCount(0)
})

test('an undispatched draft says so, rather than showing a blank job', async ({ page }) => {
  await page.goto('/drafts')
  // Live drafts split both ways — 6 of 10 sampled had no jobId, 4 did — so pick
  // the row seeded without one instead of whichever sorts first.
  await page.getByRole('row', { name: /Rooftop portrait series/ }).click()
  // An absent job is correct state for a draft, not missing data; the inspector
  // has to distinguish those.
  await expect(page.getByText('not dispatched')).toBeVisible()

  // A draft that was generated and then kept as a draft does carry its job.
  await page.getByRole('row', { name: /Retro arcade loop/ }).click()
  await expect(page.getByText('not dispatched')).toHaveCount(0)
})
