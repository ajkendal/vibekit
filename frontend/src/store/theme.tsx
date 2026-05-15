import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import type { Theme } from '../types/theme'
import {
  COLOR_DEFAULTS,
  TYPOGRAPHY_DEFAULTS,
  SPACING_DEFAULTS,
} from '../lib/theme'

type ThemeCtxValue = {
  theme: Theme
  setTheme: Dispatch<SetStateAction<Theme>>
}

const ThemeCtx = createContext<ThemeCtxValue | null>(null)

const INITIAL_THEME: Theme = {
  id: undefined,
  name: '',
  logoUrl: null,
  colors: { ...COLOR_DEFAULTS },
  typography: {
    headerFont: TYPOGRAPHY_DEFAULTS.headerFont,
    headerWeights: [TYPOGRAPHY_DEFAULTS.headerWeight],
    headerItalic: TYPOGRAPHY_DEFAULTS.headerItalic,
    headerLineHeight: TYPOGRAPHY_DEFAULTS.headerLineHeight,
    headerLetterSpacing: TYPOGRAPHY_DEFAULTS.headerLetterSpacing,
    paragraphFont: 'Roboto',
    paragraphWeights: [TYPOGRAPHY_DEFAULTS.paragraphWeight],
    paragraphItalic: TYPOGRAPHY_DEFAULTS.paragraphItalic,
    paragraphLineHeight: TYPOGRAPHY_DEFAULTS.paragraphLineHeight,
    paragraphLetterSpacing: TYPOGRAPHY_DEFAULTS.paragraphLetterSpacing,
  },
  spacing: { ...SPACING_DEFAULTS },
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(INITIAL_THEME)
  const value = useMemo(() => ({ theme, setTheme }), [theme])
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useTheme(): ThemeCtxValue {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}
