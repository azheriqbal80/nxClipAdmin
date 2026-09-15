/**
 * Colour maths for the palette gate. No dependencies — the DS owns its own
 * checks so `npm run palette` works in CI without a browser.
 */

// ── sRGB ↔ linear ────────────────────────────────────────────────────────────
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const gam = (c) => {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055
  return Math.round(Math.min(1, Math.max(0, v)) * 255)
}

export const hex2rgb = (h) => {
  const s = h.replace('#', '')
  const n = parseInt(s.length === 3 ? s.split('').map((c) => c + c).join('') : s.slice(0, 6), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
export const rgb2hex = ([r, g, b]) =>
  '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')

// ── OKLab / OKLCH (Ottosson) ─────────────────────────────────────────────────
export function rgb2oklab([r, g, b]) {
  const R = lin(r), G = lin(g), B = lin(b)
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ]
}
export function oklch(rgb) {
  const [L, a, b] = rgb2oklab(rgb)
  return { L, C: Math.hypot(a, b), h: (Math.atan2(b, a) * 180 / Math.PI + 360) % 360 }
}
function oklab2rgb([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
  return [
    gam(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    gam(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    gam(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  ]
}
/** OKLCH → sRGB. Reduces chroma until the colour is in gamut, so the returned
    hex always round-trips to the requested L and h. */
export function oklch2rgb(L, C, h) {
  const rad = (h * Math.PI) / 180
  for (let c = C; c >= 0; c -= 0.002) {
    const rgb = oklab2rgb([L, c * Math.cos(rad), c * Math.sin(rad)])
    const back = oklch(rgb)
    // in gamut when the round-trip didn't get clipped
    if (Math.abs(back.L - L) < 0.01 && Math.abs(back.C - c) < 0.01) return rgb
  }
  return oklab2rgb([L, 0, 0])
}
/** Highest chroma sRGB can hold at this lightness and hue. */
export function maxChroma(L, h) {
  return oklch(oklch2rgb(L, 0.4, h)).C
}

// ── CIELAB + ΔE76, for the perceptual-separation threshold ───────────────────
function rgb2lab([r, g, b]) {
  const R = lin(r), G = lin(g), B = lin(b)
  let X = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047
  let Y = 0.2126729 * R + 0.7151522 * G + 0.0721750 * B
  let Z = (0.0193339 * R + 0.1191920 * G + 0.9503041 * B) / 1.08883
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  ;[X, Y, Z] = [f(X), f(Y), f(Z)]
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)]
}
export function deltaE(a, b) {
  const [l1, a1, b1] = rgb2lab(a), [l2, a2, b2] = rgb2lab(b)
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2)
}

// ── Colour-vision-deficiency simulation (Machado 2009, severity 1.0) ─────────
const CVD = {
  protanopia:   [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
  tritanopia:   [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
}
export const CVD_TYPES = Object.keys(CVD)
export function simulate(rgb, type) {
  const M = CVD[type]
  const v = [lin(rgb[0]), lin(rgb[1]), lin(rgb[2])]
  return M.map((row) => gam(row[0] * v[0] + row[1] * v[1] + row[2] * v[2]))
}

// ── WCAG contrast ────────────────────────────────────────────────────────────
const relLum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
export function contrast(a, b) {
  const [x, y] = [relLum(a), relLum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
/** Flatten a colour with alpha over an opaque backdrop, for #rrggbbaa tokens. */
export function over(fg, alpha, bg) {
  return fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)))
}
