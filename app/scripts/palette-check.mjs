/**
 * Palette gate. Every non-neutral colour the app ships must survive this.
 *
 * The rules encode two things the eye can't check by inspection: that chart
 * series stay distinguishable for colour-blind viewers, and that brand hues
 * don't drift into the reserved status hues (a blue accent 10° from `--info`
 * quietly breaks the Honest Health Rule).
 *
 * Run: npm run palette
 */
import { readFileSync } from 'node:fs'
import {
  hex2rgb, rgb2hex, oklch, deltaE, simulate, CVD_TYPES, contrast, over,
} from './lib/color.mjs'

const CSS = readFileSync('src/styles/index.css', 'utf8')

/**
 * Resolve one token to sRGB. Follows `var(--x)` chains, because the chart slots
 * point at the brand ramp rather than repeating its hexes, and flattens
 * `#rrggbbaa` over the canvas so alpha tokens can be checked too.
 */
function token(name) {
  for (let hop = 0; hop < 8; hop++) {
    const line = CSS.match(new RegExp('--' + name + ':[ ]*([^;]+);'))
    if (!line) throw new Error('token --' + name + ' not found in src/styles/index.css')
    const val = line[1].trim()
    if (val.startsWith('var(--')) {
      name = val.slice(6, val.indexOf(')'))
      continue
    }
    if (val[0] !== '#') {
      throw new Error('token --' + name + ' is neither a hex nor a var() alias: ' + val)
    }
    const hex = val.slice(1).match(/^[0-9a-fA-F]{3,8}/)[0]
    if (hex.length === 8) {
      const a = parseInt(hex.slice(6, 8), 16) / 255
      return over(hex2rgb('#' + hex.slice(0, 6)), a, hex2rgb(CANVAS_HEX))
    }
    return hex2rgb('#' + hex)
  }
  throw new Error('token --' + name + ': var() chain too deep')
}
const CANVAS_HEX = (CSS.match(/--canvas:\s*(#[0-9a-fA-F]{6})/) ?? [undefined, '#09090b'])[1]

// ── thresholds ───────────────────────────────────────────────────────────────
/** Dark-field readability band. Below 0.48 a series vanishes into the canvas;
    above 0.67 it glares and stops reading as a data colour. */
const L_MIN = 0.48, L_MAX = 0.67
/** Below this the colour reads as grey and stops carrying identity. */
const C_MIN = 0.10
/** CIE ΔE76 between any two chart series, in normal vision and every CVD type. */
const DE_MIN = 8
/** Minimum hue gap between a brand voice and any reserved status hue. */
const BRAND_STATUS_DEG = 25

const CHARTS = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5']
const STATUS = ['success', 'warning', 'destructive', 'info']
/** Brand voices that appear as flat colour. Gradient-only brand rungs are
    exempt: they never carry meaning, so they cannot be confused with status. */
const BRAND_FLAT = ['primary', 'primary-strong', 'brand-cyan']

const fails = []
const warns = []
const fail = (rule, msg) => fails.push({ rule, msg })
const warn = (rule, msg) => warns.push({ rule, msg })
const hueGap = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d }

// ── 1. chart series sit in the readable band ─────────────────────────────────
for (const c of CHARTS) {
  const o = oklch(token(c))
  if (o.L < L_MIN || o.L > L_MAX) {
    fail('chart-band', `--${c} L ${o.L.toFixed(3)} outside [${L_MIN}, ${L_MAX}]`)
  }
  if (o.C < C_MIN) fail('chart-chroma', `--${c} C ${o.C.toFixed(3)} below ${C_MIN} — reads as grey`)
}

// ── 2. chart series stay distinguishable, including under CVD ────────────────
for (let i = 0; i < CHARTS.length; i++) {
  for (let j = i + 1; j < CHARTS.length; j++) {
    const a = token(CHARTS[i]), b = token(CHARTS[j])
    const pair = `${CHARTS[i]} vs ${CHARTS[j]}`
    const d = deltaE(a, b)
    if (d < DE_MIN) fail('chart-separation', `${pair} ΔE ${d.toFixed(1)} < ${DE_MIN}`)
    for (const t of CVD_TYPES) {
      const dc = deltaE(simulate(a, t), simulate(b, t))
      if (dc < DE_MIN) fail('chart-cvd', `${pair} ΔE ${dc.toFixed(1)} < ${DE_MIN} under ${t}`)
    }
  }
}

// ── 3. brand voices stay clear of the reserved status hues ───────────────────
for (const b of BRAND_FLAT) {
  let bo
  try { bo = oklch(token(b)) } catch { continue } // optional token
  for (const s of STATUS) {
    const g = hueGap(bo.h, oklch(token(s)).h)
    if (g < BRAND_STATUS_DEG) {
      fail('brand-status-collision',
        `--${b} (h ${bo.h.toFixed(0)}°) is only ${g.toFixed(0)}° from --${s} — a flat brand colour must not read as a status`)
    }
  }
}

// ── 4. text and fills clear WCAG on every surface they land on ───────────────
const SURFACES = ['canvas', 'surface', 'surface-2', 'elevated']
const TEXT = { ink: 4.5, 'muted-foreground': 4.5, faint: 3 }
for (const [t, min] of Object.entries(TEXT)) {
  for (const s of SURFACES) {
    const r = contrast(token(t), token(s))
    if (r < min) fail('text-contrast', `--${t} on --${s} is ${r.toFixed(2)}:1, need ${min}:1`)
  }
}
const pf = contrast(token('primary-foreground'), token('primary'))
if (pf < 4.5) fail('text-contrast', `--primary-foreground on --primary is ${pf.toFixed(2)}:1, need 4.5:1`)
for (const fill of ['action', 'action-hover']) {
  const ratio = contrast(token('action-foreground'), token(fill))
  if (ratio < 4.5) fail('text-contrast', `--action-foreground on --${fill} is ${ratio.toFixed(2)}:1, need 4.5:1`)
}

// ── 5. a chart colour must be visible against the panel it draws on ──────────
for (const c of CHARTS) {
  const r = contrast(token(c), token('surface'))
  if (r < 3) warn('chart-on-surface', `--${c} on --surface is ${r.toFixed(2)}:1 — thin strokes will be hard to see`)
}

// ── 6. DESIGN.md's frontmatter is a token source, so it must not drift ───────
// Documented color names map directly to runtime CSS tokens, including aliases.
const doc = readFileSync('../DESIGN.md', 'utf8')
const fm = doc.slice(doc.indexOf('colors:'), doc.indexOf('typography:'))
let documentedColors = 0
for (const line of fm.split(/\r?\n/)) {
  const m = line.match(/^ {2}([a-z0-9-]+): "(#[0-9a-fA-F]{6})"$/)
  if (!m) continue
  const [, docName, docHex] = m
  const cssName = docName
  documentedColors++
  let css
  try { css = token(cssName) } catch {
    fail('doc-drift', `DESIGN.md documents ${docName}, but no matching runtime color resolves`)
    continue
  }
  if (rgb2hex(css).toLowerCase() !== docHex.toLowerCase()) {
    fail('doc-drift', `DESIGN.md frontmatter has ${docName}: ${docHex}, but --${cssName} is ${rgb2hex(css)}`)
  }
}
if (!documentedColors) fail('doc-drift', 'DESIGN.md must document the runtime colors in its frontmatter')

// ── report ───────────────────────────────────────────────────────────────────
const label = process.argv.includes('--quiet') ? () => {} : console.log
if (!fails.length) {
  label(`✓ palette: ${CHARTS.length} chart series, ${BRAND_FLAT.length} brand voices — band, CVD separation, status clearance and contrast all pass`)
}
for (const w of warns) label(`  ! [${w.rule}] ${w.msg}`)
if (fails.length) {
  console.error(`\n✗ palette: ${fails.length} violation(s)\n`)
  for (const f of fails) console.error(`  [${f.rule}] ${f.msg}`)
  process.exit(1)
}
