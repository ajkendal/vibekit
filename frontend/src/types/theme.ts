/**
 * Shared theme types — the source of truth for what a VibeKit theme contains.
 *
 * Every field is optional because partial themes are valid throughout the app
 * (the user is in the middle of editing them) and defaults are filled in by
 * `lib/theme.ts` only when a concrete value is needed (saving, rendering CSS).
 */

export type ColorKey =
  | 'neutral_light'
  | 'neutral_mid'
  | 'neutral_dark'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'danger'
  | 'warning'
  | 'caution'
  | 'success'

export type Colors = Partial<Record<ColorKey, string>>

export type Typography = {
  headerFont?: string
  headerWeights?: number[]
  headerItalic?: boolean
  headerLineHeight?: number
  headerLetterSpacing?: number
  paragraphFont?: string
  paragraphWeights?: number[]
  paragraphItalic?: boolean
  paragraphLineHeight?: number
  paragraphLetterSpacing?: number
  base?: number
  ratio?: number
}

export type Spacing = {
  borderRadius?: number
}

export type Theme = {
  id?: string
  name?: string
  description?: string
  logoUrl?: string | null
  colors?: Colors
  typography?: Typography
  spacing?: Spacing
}

/** Shape returned by GET /themes — slim list rows. */
export type ThemeRow = {
  id: string
  name?: string
  description?: string
  created_at?: number | null
  [k: string]: unknown
}
