import { test, expect } from './fixtures'

test('plan limits page lists plans and opens the editor', async ({ page }) => {
  await page.goto('/config/plans')
  await expect(page.getByRole('heading', { name: 'Plan Limits' })).toBeVisible()
  await expect(page.getByRole('row', { name: /FREE/ })).toBeVisible()
  await expect(page.getByRole('row', { name: /STUDIO/ })).toBeVisible()

  // Selecting a plan opens the entitlement editor
  await page.getByRole('row', { name: /FREE/ }).click()
  await expect(page.getByText('Entitlement limits')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save changes' })).toBeVisible()
})

test('saving a plan reads it back and reports server adjustments', async ({ page }) => {
  const readBacks: string[] = []
  page.on('response', (r) => {
    const { pathname } = new URL(r.url())
    if (r.request().method() === 'GET' && /^\/admin\/plans\/[A-Z]+$/.test(pathname)) {
      readBacks.push(pathname)
    }
  })

  await page.goto('/config/plans')
  await page.getByRole('row', { name: /FREE/ }).click()

  // Above the server ceiling (mock clamps daily image generations to 1000).
  const field = page.getByRole('spinbutton').first()
  await field.fill('9999')
  await page.getByRole('button', { name: 'Save changes' }).click()

  // The adjustment is reported truthfully rather than echoing what we sent…
  await expect(page.getByText(/adjusted by the server/)).toBeVisible()
  await expect(page.getByText(/Daily image generations: 9,999 → 1,000/)).toBeVisible()
  // …the form now shows what was actually stored…
  await expect(field).toHaveValue('1000')
  // …and that came from GET /admin/plans/:plan, not the list.
  expect(readBacks.length).toBeGreaterThan(0)
})

test('saving an in-range plan value reports a plain success', async ({ page }) => {
  await page.goto('/config/plans')
  await page.getByRole('row', { name: /PRO/ }).click()

  await page.getByRole('spinbutton').first().fill('250')
  await page.getByRole('button', { name: 'Save changes' }).click()

  await expect(page.getByText('Plan limits saved')).toBeVisible()
  await expect(page.getByText(/adjusted by the server/)).toHaveCount(0)
})

test('coach page lists categories and shows a question bank', async ({ page }) => {
  await page.goto('/config/coach')
  await expect(page.getByRole('heading', { name: 'AI Coach' })).toBeVisible()
  await expect(page.getByRole('row', { name: /Gaming/ })).toBeVisible()

  // Selecting a category loads its questions. They render as editable inputs
  // now, so assert the value rather than a text node.
  await page.getByRole('row', { name: /Gaming/ }).click()
  await expect(page.getByLabel('Q1 message')).toHaveValue(
    /Which games do you mainly create content for/,
  )
})

test('coach categories can be searched and filtered', async ({ page }) => {
  await page.goto('/config/coach')
  await expect(page.getByRole('button', { name: 'Status' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Onboarding' })).toBeVisible()

  await page.getByPlaceholder(/Search category/).fill('Cooking')
  await expect(page.getByRole('row', { name: /Cooking/ })).toBeVisible()
  await expect(page.getByRole('row', { name: /Gaming/ })).toHaveCount(0)

  await page.getByPlaceholder(/Search category/).fill('')
  await page.getByRole('button', { name: 'Onboarding' }).click()
  await page.getByRole('menuitemcheckbox', { name: /Incomplete/ }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('row', { name: /Cooking/ })).toBeVisible()
  await expect(page.getByRole('row', { name: /Gaming/ })).toHaveCount(0)

  await page.getByRole('button', { name: /Onboarding/ }).click()
  await page.getByRole('menuitem', { name: 'Clear filter' }).click()
  await page.getByRole('button', { name: 'Status' }).click()
  await page.getByRole('menuitemcheckbox', { name: /Inactive/ }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('row', { name: /Travel/ })).toBeVisible()
  await expect(page.getByRole('row', { name: /Gaming/ })).toHaveCount(0)
})

test('a new coach category can be created', async ({ page }) => {
  await page.goto('/config/coach')
  await page.getByRole('button', { name: 'New category' }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  // Typing the label suggests a slug: "Tech & Gadgets" → "tech-gadgets".
  // Lowercase kebab is the convention for a generated slug, not a server rule —
  // the API also accepts PascalCase and snake_case.
  await dialog.getByPlaceholder('Tech & Gadgets').fill('Tech & Gadgets')
  await expect(dialog.getByPlaceholder('tech-gadgets')).toHaveValue('tech-gadgets')
  await dialog.getByPlaceholder("Welcome! I'm your …").fill('Welcome! I am your Tech coach.')
  await dialog.getByRole('button', { name: 'Create category' }).click()

  await expect(page.getByText('Category created')).toBeVisible()
  await expect(page.getByRole('row', { name: /Tech & Gadgets/ })).toBeVisible()
})

test('a question can be added to a category', async ({ page }) => {
  await page.goto('/config/coach')
  await page.getByRole('row', { name: /Gaming/ }).click()

  await page.getByRole('button', { name: 'Add question' }).click()
  await page.getByPlaceholder('Which games do you create for?').fill('What platform do you stream on?')
  await page.getByRole('button', { name: 'Add', exact: true }).click()

  await expect(page.getByText('Question added')).toBeVisible()
})

test('category slug is normalised so the gateway cannot reject it', async ({ page }) => {
  await page.goto('/config/coach')
  await page.getByRole('button', { name: 'New category' }).click()
  const dialog = page.getByRole('dialog')

  // Bad separators are repaired as they type, but capitals survive: the gateway
  // accepts PascalCase and snake_case, and lowercasing here used to make a valid
  // slug like "Gaming" impossible to enter.
  const slug = dialog.getByPlaceholder('tech-gadgets')
  await slug.fill('Gaming & Esports!!')
  await expect(slug).toHaveValue('Gaming-Esports')

  // Both shapes the gateway accepts must survive typing and raise no error. The
  // hint replaces the error text, so its presence is the "valid" signal — the
  // Create button stays disabled either way until label and message are filled.
  const hint = 'Letters, numbers, hyphens or underscores. 2–64 chars.'
  await slug.fill('Gaming')
  await expect(slug).toHaveValue('Gaming')
  await expect(dialog.getByText(hint)).toBeVisible()

  await slug.fill('UPPER_SNAKE')
  await expect(slug).toHaveValue('UPPER_SNAKE')
  await expect(dialog.getByText(hint)).toBeVisible()

  // Too short → blocked client-side with the reason, not a surprise 400.
  await slug.fill('a')
  await expect(dialog.getByText('At least 2 characters.')).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Create category' })).toBeDisabled()
})

test('coach list flags a category whose onboarding cannot complete', async ({ page }) => {
  await page.goto('/config/coach')

  // Onboarding needs Q1-Q5 active. Cooking has Q3 inactive and no Q5 at all, so
  // the exact gap is named rather than just a count being off.
  const cooking = page.getByRole('row', { name: /Cooking/ })
  await expect(cooking.getByText('Incomplete')).toBeVisible()
  await expect(cooking.getByText('missing Q3, Q5')).toBeVisible()
  await expect(cooking.getByText('3/5')).toBeVisible()

  // Complete categories say so instead of being left blank.
  await expect(page.getByRole('row', { name: /Gaming/ }).getByText('Ready')).toBeVisible()

  // Page-level summary, so a gap is visible without reading every row.
  await expect(page.getByText(/1 of 4 categories is missing active questions/)).toBeVisible()
})

test('a question can be reworded and saved', async ({ page }) => {
  // Before the bulk route the app could add a question and toggle it off, but
  // had no way to change its text at all.
  await page.goto('/config/coach')
  await page.getByRole('row', { name: /Gaming/ }).click()

  const q1 = page.getByLabel('Q1 message')
  await expect(q1).toHaveValue(/Which games/)

  // Clean form: the save is disabled rather than relabelled, so its text never
  // collides with the success toast.
  await expect(page.getByRole('button', { name: 'Save questions' })).toBeDisabled()

  await q1.fill('Which titles do you post about?')
  const save = page.getByRole('button', { name: 'Save questions' })
  await expect(save).toBeEnabled()
  await save.click()

  await expect(page.getByText('Questions saved')).toBeVisible()

  // The button going clean is the proof the round trip worked: dirtiness is
  // computed against the refetched server data, so it can only clear if the
  // server came back with the edited text.
  await expect(page.getByRole('button', { name: 'Save questions' })).toBeDisabled()

  // And it survives a refetch. Not a page reload — mock state is per page load,
  // so reloading would reset the fixture and prove nothing.
  await page.getByRole('row', { name: /Fitness/ }).click()
  await page.getByRole('row', { name: /Gaming/ }).click()
  await expect(page.getByLabel('Q1 message')).toHaveValue('Which titles do you post about?')
})

test('the bulk save sends every question and never deactivates by omission', async ({ page }) => {
  // `deactivateMissing: true` switches off any question absent from the payload,
  // so a partial payload would silently break live onboarding. Two guarantees
  // are asserted here: the flag is false, and the payload is complete —
  // including the inactive question, which is only fetched because the editor
  // requests includeInactive.
  await page.goto('/config/coach')
  await page.getByRole('row', { name: /Cooking/ }).click()
  await page.getByLabel('Q1 message').fill('Which cuisines are your focus?')

  // Await the request itself rather than sampling a captured variable — polling
  // after the click races the save and made this flaky.
  const pending = page.waitForRequest(
    (r) =>
      r.method() === 'PUT' &&
      /\/admin\/coach\/categories\/[^/]+\/questions$/.test(new URL(r.url()).pathname),
  )
  await page.getByRole('button', { name: 'Save questions' }).click()
  const req = await pending

  const body = JSON.parse(req.postData() ?? 'null') as {
    deactivateMissing?: boolean
    questions?: { questionNumber: number }[]
  }
  expect(body.deactivateMissing).toBe(false)
  // Cooking holds four rows (Q1, Q2, inactive Q3, Q4) — all four must travel,
  // or the ones left out would be the ones at risk.
  expect(body.questions?.map((q) => q.questionNumber).sort()).toEqual([1, 2, 3, 4])
})

test('an empty question message blocks the save instead of 400ing', async ({ page }) => {
  await page.goto('/config/coach')
  await page.getByRole('row', { name: /Gaming/ }).click()

  await page.getByLabel('Q1 message').fill('')
  await expect(page.getByText('Every question needs a message.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save questions' })).toBeDisabled()

  // Revert restores the server values and clears the error.
  await page.getByRole('button', { name: 'Revert' }).click()
  await expect(page.getByLabel('Q1 message')).toHaveValue(/Which games/)
  await expect(page.getByText('Every question needs a message.')).toHaveCount(0)
})

test('picker order is set in one atomic call, not per category', async ({ page }) => {
  await page.goto('/config/coach')

  // Reorder is an explicit mode. Outside it the Order column is a plain number,
  // so clicking rows to edit can never nudge the order creators see.
  await expect(page.getByRole('button', { name: 'Move Gaming down' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Reorder' }).click()
  await expect(page.getByRole('button', { name: 'Move Gaming down' })).toBeVisible()

  // Nothing moved yet, so there is nothing to save.
  await expect(page.getByRole('button', { name: 'Save order' })).toBeDisabled()

  // Send the whole order in one request: a swap cannot be expressed as two
  // independent per-category writes without briefly colliding on a number.
  const pending = page.waitForRequest(
    (r) => r.method() === 'PATCH' && new URL(r.url()).pathname.endsWith('/coach/categories/reorder'),
  )
  await page.getByRole('button', { name: 'Move Gaming down' }).click()
  await expect(page.getByRole('button', { name: 'Save order' })).toBeEnabled()
  await page.getByRole('button', { name: 'Save order' }).click()
  const req = await pending

  const body = JSON.parse(req.postData() ?? 'null') as {
    items?: { id: string; sortOrder: number }[]
  }
  // Every category travels, renumbered 1..n so the order is unambiguous however
  // the previous numbers were spaced.
  expect(body.items).toHaveLength(4)
  expect(body.items!.map((i) => i.sortOrder)).toEqual([1, 2, 3, 4])

  await expect(page.getByText('Picker order saved')).toBeVisible()
  // Mode exits on success, and Gaming has moved down one.
  await expect(page.getByRole('button', { name: 'Move Gaming down' })).toHaveCount(0)
  const firstRow = page.getByRole('row').nth(1)
  await expect(firstRow).toContainText('Fitness')
})

test('cancelling a reorder discards it', async ({ page }) => {
  await page.goto('/config/coach')
  await page.getByRole('button', { name: 'Reorder' }).click()
  await page.getByRole('button', { name: 'Move Gaming down' }).click()

  await page.getByRole('button', { name: 'Cancel' }).click()
  // Back to the server order, untouched.
  await expect(page.getByRole('button', { name: 'Move Gaming down' })).toHaveCount(0)
  await expect(page.getByRole('row').nth(1)).toContainText('Gaming')
})

test('the editor shows picker position but does not let you edit it', async ({ page }) => {
  await page.goto('/config/coach')
  await page.getByRole('row', { name: /Gaming/ }).click()

  // A per-category number field could put two categories on the same value,
  // leaving the creator-facing order undefined. Read-only, pointing at Reorder.
  await expect(page.getByText('Picker position')).toBeVisible()
  await expect(page.getByText('set via Reorder')).toBeVisible()
  await expect(page.getByRole('spinbutton')).toHaveCount(0)
})
