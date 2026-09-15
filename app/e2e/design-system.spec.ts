import { test, expect } from './fixtures'

test('radius scale resolves and is documented on the living page', async ({ page }) => {
  await page.goto('/design-system')
  await expect(page.getByRole('heading', { name: 'Radius' })).toBeVisible()

  // Every rung must be a real custom property. `@theme inline` would inline the
  // value and emit nothing, so var(--radius-*) would silently fall back — the
  // same failure that once collapsed the topbar.
  const tokens = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement)
    const read = (k: string) => s.getPropertyValue(`--radius-${k}`).trim()
    return { xs: read('xs'), sm: read('sm'), md: read('md'), lg: read('lg'), xl: read('xl'), x2: read('2xl') }
  })
  expect(tokens).toEqual({ xs: '4px', sm: '8px', md: '10px', lg: '14px', xl: '18px', x2: '' })
})

test('every card surface uses the xl rung', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()

  const radii = await page.evaluate(() => {
    const set = new Set<string>()
    for (const el of document.querySelectorAll<HTMLElement>('div.rounded-xl.border.bg-card')) {
      set.add(getComputedStyle(el).borderTopLeftRadius)
    }
    return [...set]
  })
  // One system = one card corner.
  expect(radii).toEqual(['18px'])
})

test('type and icon scales resolve as real tokens', async ({ page }) => {
  await page.goto('/design-system')
  await expect(page.getByRole('heading', { name: 'Iconography' })).toBeVisible()

  // Micro rungs must be real custom properties, not inlined values.
  const type = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement)
    const read = (k: string) => s.getPropertyValue(`--text-${k}`).trim()
    return { micro: read('micro'), caption: read('caption'), subtitle: read('subtitle'), display: read('display') }
  })
  expect(type).toEqual({ micro: '10px', caption: '11px', subtitle: '15px', display: '32px' })

  // …and generate utilities at the same values.
  const rendered = await page.evaluate(() => {
    const mk = (cls: string) => {
      const d = document.createElement('span')
      d.className = cls
      document.body.appendChild(d)
      return getComputedStyle(d).fontSize
    }
    return [mk('text-micro'), mk('text-caption'), mk('text-subtitle'), mk('text-display')]
  })
  expect(rendered).toEqual(['10px', '11px', '15px', '32px'])
})

test('Metric is a shared component, not hand-rolled per feature', async ({ page }) => {
  await page.goto('/design-system')
  await expect(page.locator('#metric')).toBeVisible()

  // The DS decision: the micro-label sits ABOVE the figure, matching StatCard.
  // Compared by geometry rather than DOM order so it survives markup changes.
  const above = await page.evaluate(() => {
    const label = document.querySelector('#metric .text-micro')
    const root = label?.parentElement?.parentElement
    const value = root?.querySelector('.text-lg')
    if (!label || !value) return null
    return label.getBoundingClientRect().top < value.getBoundingClientRect().top
  })
  expect(above).toBe(true)
})

  test('brand ramp is wired to the logo, and the swatches cannot lie about it', async ({
    page,
  }) => {
    await page.goto('/design-system#colors')
    // exact: name matching is substring-based, and another section heading
    // contains the word 'color'.
    await expect(page.getByRole('heading', { name: 'Color', exact: true })).toBeVisible()

    // `npm run palette` checks the token values statically. What it cannot see is
    // whether they actually reach the browser, so check the wiring here.
    const t = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement)
      const v = (n: string) => s.getPropertyValue(n).trim().toLowerCase()
      return {
        violet: v('--brand-violet'),
        indigo: v('--brand-indigo'),
        cyan: v('--brand-cyan'),
        // Chart slots 1 and 3 are aliases, not copies — they must resolve to the ramp.
        chart1: v('--chart-1'),
        chart3: v('--chart-3'),
        // The accent had three literal duplicates that drifted; all are var(--primary) now.
        primary: v('--primary'),
        ring: v('--ring'),
        sidebarPrimary: v('--sidebar-primary'),
      }
    })
    expect(t.chart1).toBe(t.violet)
    expect(t.chart3).toBe(t.cyan)
    expect(t.ring).toBe(t.primary)
    expect(t.sidebarPrimary).toBe(t.primary)

    // The ramp utility must actually paint. A typo'd class name renders nothing,
    // which no static check would catch.
    const ramp = await page.evaluate(() => {
      const el = document.querySelector('.brand-ramp')
      return el ? getComputedStyle(el).backgroundImage : null
    })
    expect(ramp).toContain('gradient')
    for (const rung of [t.violet, t.indigo, t.cyan]) {
      // getComputedStyle reports gradient stops as rgb(); compare via a canvas-free
      // channel check on the hex the token resolved to.
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(rung.slice(i, i + 2), 16))
      expect(ramp).toContain(`rgb(${r}, ${g}, ${b})`)
    }
  })
