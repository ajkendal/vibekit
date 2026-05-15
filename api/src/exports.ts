/**
 * Multi-format theme exporters used by the public preview page.
 *
 * Each function takes the parsed theme object (the same shape parseTheme
 * returns) and produces a self-contained text snippet ready to copy/paste
 * into the user's project.
 */

type AnyTheme = {
  id?: string
  name?: string | null
  description?: string | null
  logoUrl?: string | null
  colors?: Record<string, string>
  typography?: Record<string, any>
  spacing?: Record<string, any>
}

const FONT_FALLBACK = `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`

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

/* ───────── CSS variables ───────── */

export function themeToCssVars(theme: AnyTheme): string {
  const c = theme.colors ?? {}
  const t = theme.typography ?? {}
  const s = theme.spacing ?? {}
  const lines: string[] = []
  const push = (k: string, v: string | number | undefined) => {
    if (v != null && v !== '') lines.push(`  ${k}: ${v};`)
  }

  COLOR_KEYS.forEach((k) => {
    const v = c[k]
    if (v) push(`--color-${k.replace('_', '-')}`, v)
  })

  if (typeof t.base === 'number') push('--font-base', `${t.base}px`)
  if (typeof t.ratio === 'number') push('--font-ratio', String(t.ratio))
  if (t.headerFont) push('--font-header', `'${t.headerFont}', ${FONT_FALLBACK}`)
  if (t.paragraphFont)
    push('--font-paragraph', `'${t.paragraphFont}', ${FONT_FALLBACK}`)
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

  return `:root {\n${lines.join('\n')}\n}`
}

/* ───────── Tailwind ───────── */

export function themeToTailwind(theme: AnyTheme): string {
  const c = theme.colors ?? {}
  const t = theme.typography ?? {}
  const s = theme.spacing ?? {}

  const colors: Record<string, string> = {}
  COLOR_KEYS.forEach((k) => {
    if (c[k]) colors[k.replace('_', '-')] = c[k]
  })

  const fontFamily: Record<string, string[]> = {}
  if (t.headerFont)
    fontFamily.heading = [t.headerFont, ...FONT_FALLBACK.split(',').map((f) => f.trim())]
  if (t.paragraphFont)
    fontFamily.body = [t.paragraphFont, ...FONT_FALLBACK.split(',').map((f) => f.trim())]

  const borderRadius: Record<string, string> = {}
  if (typeof s.borderRadius === 'number')
    borderRadius.DEFAULT = `${s.borderRadius}px`

  const extend: Record<string, any> = {}
  if (Object.keys(colors).length) extend.colors = colors
  if (Object.keys(fontFamily).length) extend.fontFamily = fontFamily
  if (Object.keys(borderRadius).length) extend.borderRadius = borderRadius

  const config = { theme: { extend } }
  return `// Add to your tailwind.config.js\nmodule.exports = ${JSON.stringify(config, null, 2)}\n`
}

/* ───────── W3C Design Tokens ───────── */

export function themeToTokens(theme: AnyTheme): string {
  const c = theme.colors ?? {}
  const t = theme.typography ?? {}
  const s = theme.spacing ?? {}

  const tokens: Record<string, any> = {
    $description: theme.description || `Design tokens for ${theme.name || 'theme'}`,
    color: {},
    typography: {},
    spacing: {},
  }

  COLOR_KEYS.forEach((k) => {
    if (c[k]) {
      tokens.color[k.replace('_', '-')] = { $value: c[k], $type: 'color' }
    }
  })

  if (t.headerFont) {
    tokens.typography.headerFont = {
      $value: t.headerFont,
      $type: 'fontFamily',
    }
  }
  if (t.paragraphFont) {
    tokens.typography.paragraphFont = {
      $value: t.paragraphFont,
      $type: 'fontFamily',
    }
  }
  if (typeof t.base === 'number') {
    tokens.typography.baseSize = {
      $value: `${t.base}px`,
      $type: 'dimension',
    }
  }
  if (typeof t.ratio === 'number') {
    tokens.typography.scaleRatio = { $value: t.ratio, $type: 'number' }
  }
  if (typeof t.headerLineHeight === 'number') {
    tokens.typography.headerLineHeight = {
      $value: t.headerLineHeight,
      $type: 'number',
    }
  }
  if (typeof t.paragraphLineHeight === 'number') {
    tokens.typography.paragraphLineHeight = {
      $value: t.paragraphLineHeight,
      $type: 'number',
    }
  }

  if (typeof s.borderRadius === 'number') {
    tokens.spacing.borderRadius = {
      $value: `${s.borderRadius}px`,
      $type: 'dimension',
    }
  }

  // Drop empty top-level groups for cleanliness
  for (const k of Object.keys(tokens)) {
    if (typeof tokens[k] === 'object' && Object.keys(tokens[k]).length === 0) {
      delete tokens[k]
    }
  }

  return JSON.stringify(tokens, null, 2)
}

/* ───────── SCSS variables ───────── */

export function themeToScss(theme: AnyTheme): string {
  const c = theme.colors ?? {}
  const t = theme.typography ?? {}
  const s = theme.spacing ?? {}

  const sections: string[][] = []

  const colorLines: string[] = []
  COLOR_KEYS.forEach((k) => {
    if (c[k]) colorLines.push(`$color-${k.replace('_', '-')}: ${c[k]};`)
  })
  if (colorLines.length) sections.push(['// Colors', ...colorLines])

  const typoLines: string[] = []
  if (t.headerFont)
    typoLines.push(`$font-header: '${t.headerFont}', ${FONT_FALLBACK};`)
  if (t.paragraphFont)
    typoLines.push(`$font-paragraph: '${t.paragraphFont}', ${FONT_FALLBACK};`)
  if (typeof t.base === 'number') typoLines.push(`$font-base: ${t.base}px;`)
  if (typeof t.ratio === 'number')
    typoLines.push(`$font-ratio: ${t.ratio};`)
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
