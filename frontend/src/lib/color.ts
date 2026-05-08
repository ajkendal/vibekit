/**
 * Shared color utilities. Single source of truth — do not duplicate
 * hexToRgb / rgba / textOn / contrastRatio in components.
 */

export type RGB = { r: number; g: number; b: number }

export function hexToRgb(hex: string): RGB | null {
  if (!hex || typeof hex !== 'string') return null
  const m = hex.trim().match(/^#?([a-f\d]{3}|[a-f\d]{6})$/i)
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.round(Math.max(0, Math.min(255, n)))
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/** Apply alpha to a hex color, returning a CSS rgba() string. */
export function rgba(hex: string, alpha: number): string {
  const c = hexToRgb(hex)
  if (!c) return `rgba(0, 0, 0, ${alpha})`
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`
}

/** Normalize a hex string — adds the leading `#` if missing, lowercases. */
export function formatHex(hex: string): string {
  const h = (hex || '').toLowerCase()
  return h.startsWith('#') ? h : `#${h}`
}

/** Pick black or white text for the given background using the YIQ heuristic. */
export function textOn(bg: string, fallback = '#ffffff'): string {
  const c = hexToRgb(bg)
  if (!c) return fallback
  const yiq = (c.r * 299 + c.g * 587 + c.b * 114) / 1000
  return yiq >= 186 ? '#111111' : '#ffffff'
}

function srgbToLinear(c: number): number {
  const cs = c / 255
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4)
}

/** WCAG relative luminance — 0 (black) to 1 (white). */
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  return (
    0.2126 * srgbToLinear(rgb.r) +
    0.7152 * srgbToLinear(rgb.g) +
    0.0722 * srgbToLinear(rgb.b)
  )
}

/** WCAG contrast ratio — 1 (no contrast) to 21 (max contrast). */
export function contrastRatio(fg: string, bg: string): number {
  const L1 = relativeLuminance(fg)
  const L2 = relativeLuminance(bg)
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
}
