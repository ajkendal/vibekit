/**
 * Theme defaults, helpers, and the CSS-vars renderer.
 *
 * `themeToCssVars` is the canonical way to turn a Theme into a `:root { ... }`
 * CSS block. Used by the in-app CSS Vars panel and (via API) by the public
 * /themes/:id/css endpoint.
 */

import type { Theme, Typography } from '../types/theme'
import { formatHex } from './color'

export const COLOR_DEFAULTS = {
  neutral_light: '#ffffff',
  neutral_mid: '#6b7280',
  neutral_dark: '#000000',
  primary: '#2563eb',
  secondary: '#3b82f6',
  tertiary: '#9333ea',
  danger: '#ef4444',
  warning: '#f59e0b',
  caution: '#f97316',
  success: '#10b981',
} as const

export const TYPOGRAPHY_DEFAULTS = {
  headerFont: 'Inter',
  headerWeight: 400,
  headerItalic: false,
  headerLineHeight: 1.25,
  headerLetterSpacing: 0,
  paragraphFont: 'Inter',
  paragraphWeight: 400,
  paragraphItalic: false,
  paragraphLineHeight: 1.6,
  paragraphLetterSpacing: 0,
} as const

export const SPACING_DEFAULTS = {
  borderRadius: 8,
} as const

/** Generate a fresh theme id (uses crypto.randomUUID when available). */
export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Read user typography with sensible defaults pulled out into one place.
 * Replaces the old "theme.typography?.headerFont || 'Inter'" pattern that was
 * duplicated across App, LivePreview, and ContrastChecker.
 */
export function readTypography(t?: Typography) {
  return {
    headerFont: t?.headerFont ?? TYPOGRAPHY_DEFAULTS.headerFont,
    headerWeight: t?.headerWeights?.[0] ?? TYPOGRAPHY_DEFAULTS.headerWeight,
    headerItalic: !!t?.headerItalic,
    headerLineHeight:
      t?.headerLineHeight ?? TYPOGRAPHY_DEFAULTS.headerLineHeight,
    headerLetterSpacing:
      t?.headerLetterSpacing ?? TYPOGRAPHY_DEFAULTS.headerLetterSpacing,
    paragraphFont: t?.paragraphFont ?? TYPOGRAPHY_DEFAULTS.paragraphFont,
    paragraphWeight:
      t?.paragraphWeights?.[0] ?? TYPOGRAPHY_DEFAULTS.paragraphWeight,
    paragraphItalic: !!t?.paragraphItalic,
    paragraphLineHeight:
      t?.paragraphLineHeight ?? TYPOGRAPHY_DEFAULTS.paragraphLineHeight,
    paragraphLetterSpacing:
      t?.paragraphLetterSpacing ?? TYPOGRAPHY_DEFAULTS.paragraphLetterSpacing,
  }
}

/** Build a Google Fonts URL fragment for one family. */
export function gfParam(
  family: string | undefined,
  weights: number[],
  italic: boolean
): string {
  if (!family) return ''
  const ws = (weights && weights.length ? weights : [400]).sort((a, b) => a - b)
  if (italic) {
    const pairs = [...ws.map((w) => `0,${w}`), ...ws.map((w) => `1,${w}`)]
    return `${encodeURIComponent(family)}:ital,wght@${pairs.join(';')}`
  }
  return `${encodeURIComponent(family)}:wght@${ws.join(';')}`
}

const FONT_STACK_FALLBACK = `system-ui, -apple-system, Segoe UI, Roboto, sans-serif`

const COLOR_KEYS = [
  'neutral_light',
  'neutral_mid',
  'neutral_dark',
  'primary',
  'secondary',
  'tertiary',
  'danger',
  'warning',
  'caution',
  'success',
] as const

/** Render a theme as a CSS `:root { ... }` block. */
export function themeToCssVars(theme: Theme): string {
  const c = theme.colors ?? {}
  const t = theme.typography ?? {}
  const s = theme.spacing ?? {}
  const lines: string[] = []
  const push = (k: string, v: string | number | undefined) => {
    if (v != null) lines.push(`${k}: ${v};`)
  }

  ;(Object.keys(COLOR_DEFAULTS) as Array<keyof typeof COLOR_DEFAULTS>).forEach(
    (k) => {
      const hex = c[k] ?? COLOR_DEFAULTS[k]
      push(`--color-${k.replace('_', '-')}`, formatHex(hex))
    }
  )

  if (typeof t.base === 'number') push('--font-base', `${t.base}px`)
  if (typeof t.ratio === 'number') push('--font-ratio', String(t.ratio))
  if (t.headerFont)
    push('--font-header', `'${t.headerFont}', ${FONT_STACK_FALLBACK}`)
  if (t.paragraphFont)
    push('--font-paragraph', `'${t.paragraphFont}', ${FONT_STACK_FALLBACK}`)
  if (typeof t.headerLineHeight === 'number')
    push('--line-height-header', String(t.headerLineHeight))
  if (typeof t.paragraphLineHeight === 'number')
    push('--line-height-paragraph', String(t.paragraphLineHeight))
  if (typeof t.headerLetterSpacing === 'number')
    push('--letter-spacing-header', `${t.headerLetterSpacing}em`)
  if (typeof t.paragraphLetterSpacing === 'number')
    push('--letter-spacing-paragraph', `${t.paragraphLetterSpacing}em`)

  if (typeof s.borderRadius === 'number')
    push('--border-radius', `${s.borderRadius}px`)

  return `:root{\n  ${lines.join('\n  ')}\n}`
}

/* ───────── Tailwind config ───────── */

export function themeToTailwind(theme: Theme): string {
  const c = theme.colors ?? {}
  const t = theme.typography ?? {}
  const s = theme.spacing ?? {}

  const colors: Record<string, string> = {}
  COLOR_KEYS.forEach((k) => {
    const v = c[k]
    if (v) colors[k.replace('_', '-')] = v
  })

  const fallback = FONT_STACK_FALLBACK.split(',').map((f) => f.trim())
  const fontFamily: Record<string, string[]> = {}
  if (t.headerFont) fontFamily.heading = [t.headerFont, ...fallback]
  if (t.paragraphFont) fontFamily.body = [t.paragraphFont, ...fallback]

  const borderRadius: Record<string, string> = {}
  if (typeof s.borderRadius === 'number')
    borderRadius.DEFAULT = `${s.borderRadius}px`

  const extend: Record<string, unknown> = {}
  if (Object.keys(colors).length) extend.colors = colors
  if (Object.keys(fontFamily).length) extend.fontFamily = fontFamily
  if (Object.keys(borderRadius).length) extend.borderRadius = borderRadius

  const config = { theme: { extend } }
  return `// Add to your tailwind.config.js\nmodule.exports = ${JSON.stringify(
    config,
    null,
    2
  )}\n`
}

/* ───────── W3C Design Tokens ───────── */

export function themeToTokens(theme: Theme): string {
  const c = theme.colors ?? {}
  const t = theme.typography ?? {}
  const s = theme.spacing ?? {}

  const tokens: Record<string, any> = {
    $description:
      theme.description || `Design tokens for ${theme.name || 'theme'}`,
    color: {},
    typography: {},
    spacing: {},
  }

  COLOR_KEYS.forEach((k) => {
    const v = c[k]
    if (v) tokens.color[k.replace('_', '-')] = { $value: v, $type: 'color' }
  })

  if (t.headerFont)
    tokens.typography.headerFont = {
      $value: t.headerFont,
      $type: 'fontFamily',
    }
  if (t.paragraphFont)
    tokens.typography.paragraphFont = {
      $value: t.paragraphFont,
      $type: 'fontFamily',
    }
  if (typeof t.base === 'number')
    tokens.typography.baseSize = { $value: `${t.base}px`, $type: 'dimension' }
  if (typeof t.ratio === 'number')
    tokens.typography.scaleRatio = { $value: t.ratio, $type: 'number' }
  if (typeof t.headerLineHeight === 'number')
    tokens.typography.headerLineHeight = {
      $value: t.headerLineHeight,
      $type: 'number',
    }
  if (typeof t.paragraphLineHeight === 'number')
    tokens.typography.paragraphLineHeight = {
      $value: t.paragraphLineHeight,
      $type: 'number',
    }

  if (typeof s.borderRadius === 'number')
    tokens.spacing.borderRadius = {
      $value: `${s.borderRadius}px`,
      $type: 'dimension',
    }

  // Drop empty top-level groups so the output is tidy
  for (const k of Object.keys(tokens)) {
    const v = tokens[k]
    if (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) {
      delete tokens[k]
    }
  }

  return JSON.stringify(tokens, null, 2)
}

/* ───────── SCSS variables ───────── */

export function themeToScss(theme: Theme): string {
  const c = theme.colors ?? {}
  const t = theme.typography ?? {}
  const s = theme.spacing ?? {}

  const sections: string[][] = []

  const colorLines: string[] = []
  COLOR_KEYS.forEach((k) => {
    const v = c[k]
    if (v) colorLines.push(`$color-${k.replace('_', '-')}: ${v};`)
  })
  if (colorLines.length) sections.push(['// Colors', ...colorLines])

  const typoLines: string[] = []
  if (t.headerFont)
    typoLines.push(`$font-header: '${t.headerFont}', ${FONT_STACK_FALLBACK};`)
  if (t.paragraphFont)
    typoLines.push(
      `$font-paragraph: '${t.paragraphFont}', ${FONT_STACK_FALLBACK};`
    )
  if (typeof t.base === 'number') typoLines.push(`$font-base: ${t.base}px;`)
  if (typeof t.ratio === 'number') typoLines.push(`$font-ratio: ${t.ratio};`)
  if (typeof t.headerLineHeight === 'number')
    typoLines.push(`$line-height-header: ${t.headerLineHeight};`)
  if (typeof t.paragraphLineHeight === 'number')
    typoLines.push(`$line-height-paragraph: ${t.paragraphLineHeight};`)
  if (typoLines.length) sections.push(['// Typography', ...typoLines])

  const spaceLines: string[] = []
  if (typeof s.borderRadius === 'number')
    spaceLines.push(`$border-radius: ${s.borderRadius}px;`)
  if (spaceLines.length) sections.push(['// Spacing', ...spaceLines])

  return sections.map((s) => s.join('\n')).join('\n\n') + '\n'
}
