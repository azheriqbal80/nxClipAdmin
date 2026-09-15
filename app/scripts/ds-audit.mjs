#!/usr/bin/env node
/**
 * Design-system consistency audit.
 *
 * Flags styling that bypasses the DS tokens/components. Runs over app source,
 * skipping generated shadcn primitives (components/ui) and the design-system
 * page (which documents raw hex on purpose). Exits 1 on any finding.
 *
 * Usage: npm run ds:audit
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const SRC = join(ROOT, 'src')

const SKIP_FILE = /\.(test|spec)\.tsx?$/

const RULES = [
  {
    id: 'non-token-surface-edge',
    re: /["'`][^\n]*\bring-foreground\/10/,
    msg: 'Surface edges must use border border-border so the shared border token applies to overlays too.',
    scanUi: true,
  },
  {
    id: 'hardcoded-color',
    re: /#[0-9a-fA-F]{3,8}\b/,
    msg: 'Hardcoded hex color — use a token (bg-surface, text-muted-foreground, tone-*, …).',
  },
  {
    id: 'raw-white-black',
    re: /\b(?:bg|text|border|ring)-(?:white|black)(?:\/\d+)?\b/,
    msg: 'Raw white/black utility — use a token (bg-foreground/10, bg-canvas, …).',
  },
  {
    id: 'inline-style-color',
    re: /style=\{\{[^}]*#[0-9a-fA-F]{3,8}/,
    msg: 'Inline hex in a style attribute — style via tokens/classes instead.',
  },
  {
    // any arbitrary shadow other than the DS-sanctioned health-dot glow
    id: 'ad-hoc-shadow',
    re: /shadow-\[(?!0_0_6px_currentColor\])/,
    msg: 'Ad-hoc shadow — depth is tonal + hairline borders (no drop shadows).',
  },
  {
    // The radius scale is xs/sm/md/lg/xl + full. `rounded-[inherit]` is not a
    // value (it follows the parent), so it stays allowed.
    // `scanUi` because the shadcn primitives are the DS — they must obey it too.
    id: 'off-scale-radius',
    re: /rounded-(?:\[(?!inherit\])|(?:[trbl]{1,2}-)?(?:2xl|3xl|4xl)\b)/,
    msg: 'Off-scale radius — use rounded-xs|sm|md|lg|xl or rounded-full (DESIGN.md § Radius).',
    scanUi: true,
  },
  {
    // 52 hand-written sizes had accumulated before the micro rungs were named.
    id: 'off-scale-text',
    re: /\btext-\[/,
    msg: 'Arbitrary font size — use text-micro|caption|xs|sm|subtitle|lg|2xl|display (DESIGN.md § Typography).',
    scanUi: true,
  },
  {
    // Icons come from one 4-rung scale; anything else is a one-off.
    id: 'off-scale-icon',
    re: /\bsize-\[/,
    msg: 'Arbitrary icon/box size — use size-3|3.5|4|5 for icons (DESIGN.md § Iconography).',
    scanUi: true,
  },
  {
    // One focus affordance across the app: `ring-3` + `ring-ring/50`.
    // `ring-[3px]` renders identically but is a second spelling of one rule.
    id: 'ad-hoc-ring-width',
    re: /\bring-\[/,
    msg: 'Arbitrary ring width — the focus ring is `ring-3` with `ring-ring/50` (DESIGN.md § Focus).',
    scanUi: true,
  },
  {
    // Radix emits data-state and data-orientation values, not shorthand
    // attributes such as data-open, data-checked, or data-horizontal.
    id: 'unsupported-radix-state-selector',
    re: /(?:^|[\s"'`])(?:(?:dark|sm|md|lg|xl|\*\*):)*(?:(?:group|peer)-)?data-(?:checked|unchecked|open|closed|horizontal|vertical)\b|(?:group|peer)-data-(?:checked|unchecked|open|closed|horizontal|vertical)\b/,
    msg: 'Unsupported Radix state/orientation selector — use data-[state=…] or data-[orientation=…].',
    scanUi: true,
  },
  {
    id: 'native-input',
    re: /<input\b/,
    msg: 'Use the shared Input or Checkbox component so form surfaces inherit the DS field treatment.',
  },
  {
    id: 'native-select',
    re: /<select\b/,
    msg: 'Use the shared Select component so option controls inherit the DS field treatment.',
  },
  {
    id: 'native-textarea',
    re: /<textarea\b/,
    msg: 'Use the shared Textarea component so form surfaces inherit the DS field treatment.',
  },
]

/** Every source file, with the rel path so per-rule scoping can be applied. */
function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const rel = relative(SRC, p).replace(/\\/g, '/')
    if (statSync(p).isDirectory()) {
      // The design-system page documents raw values on purpose — never scan it.
      if (rel === 'features/design-system' || rel.startsWith('features/design-system/')) continue
      out.push(...walk(p))
    } else if (/\.tsx?$/.test(name) && !SKIP_FILE.test(name)) {
      out.push({ path: p, rel })
    }
  }
  return out
}

const isUi = (rel) => rel === 'components/ui' || rel.startsWith('components/ui/')

/** A feature may arrange content, but the application theme has one owner.
 * Otherwise a global border/palette change silently stops at a route or portal. */
function auditCss(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    const rel = relative(SRC, path).replace(/\\/g, '/')
    if (entry.isDirectory()) { auditCss(path); continue }
    if (!entry.name.endsWith('.css') || path === join(SRC, 'styles', 'index.css')) continue
    readFileSync(path, 'utf8').split('\n').forEach((line, i) => {
      const rawColor = /#[0-9a-fA-F]{3,8}\b/.test(line)
      const themeOverride = /--(?:background|foreground|card(?:-foreground)?|popover(?:-foreground)?|primary(?:-[a-z]+)?|secondary(?:-foreground)?|muted(?:-foreground)?|accent(?:-foreground)?|destructive(?:-foreground)?|border|input|ring|sidebar(?:-[a-z-]+)?|canvas|surface(?:-2)?|elevated|ink|faint|line(?:-strong)?|success|warning|info|action(?:-[a-z]+)?|chart-[a-z0-9]+|brand-[a-z]+|radius(?:-[a-z]+)?|spacing-(?:sidebar|topbar)|example-[a-z-]+)\s*:/.test(line)
      const unscopedSharedSlot = rel.startsWith('features/') && /^\s*\[data-slot=/.test(line)
      if (rawColor || themeOverride) findings.push({
        file: relative(ROOT, path).replace(/\\/g, '/'), line: i + 1,
        rule: rawColor ? 'hardcoded-color' : 'feature-theme-override',
        msg: 'Use the shared theme in styles/index.css; feature CSS must not define its own palette or radii.',
        text: line.trim().slice(0, 100),
      })
      if (unscopedSharedSlot) findings.push({
        file: relative(ROOT, path).replace(/\\/g, '/'), line: i + 1,
        rule: 'unscoped-shared-slot-selector',
        msg: 'Feature CSS may style shared slots only through a local wrapper or a shared component variant.',
        text: line.trim().slice(0, 100),
      })
    })
  }
}

const findings = []
const shadcnConfigPath = join(ROOT, 'components.json')
if (existsSync(shadcnConfigPath)) {
  const componentsJson = JSON.parse(readFileSync(shadcnConfigPath, 'utf8'))
  if (componentsJson?.tailwind?.css !== 'src/styles/index.css') {
    findings.push({
      file: 'components.json',
      line: 8,
      rule: 'shadcn-css-path',
      msg: 'shadcn must point at the live shared stylesheet.',
      text: `"css": "${componentsJson?.tailwind?.css ?? ''}"`,
    })
  }
}
auditCss(SRC)
for (const { path: file, rel } of walk(SRC)) {
  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) return
    if (!isUi(rel) && rel !== 'components/data-grid.tsx' && /<button\b/.test(line)) {
      findings.push({
        file: relative(ROOT, file).replace(/\\/g, '/'),
        line: i + 1,
        rule: 'native-button',
        msg: 'Use the shared Button component for app controls.',
        text: line.trim().slice(0, 100),
      })
    }
    for (const rule of RULES) {
      // Generated shadcn primitives are exempt from most rules (they carry
      // upstream markup), but not from rules flagged `scanUi`.
      if (isUi(rel) && !rule.scanUi) continue
      if (rule.re.test(line)) {
        findings.push({ file: relative(ROOT, file).replace(/\\/g, '/'), line: i + 1, rule: rule.id, msg: rule.msg, text: line.trim().slice(0, 100) })
      }
    }
  })
}

if (findings.length === 0) {
  console.log('✓ ds-audit: no design-system violations')
  process.exit(0)
}

console.error(`✗ ds-audit: ${findings.length} violation(s)\n`)
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}  [${f.rule}]`)
  console.error(`    ${f.msg}`)
  console.error(`    → ${f.text}\n`)
}
process.exit(1)
