import React, { createContext, useContext, useMemo, useState } from 'react'

type Theme = any
type ThemeCtxValue = {
  theme: Theme
  setTheme: React.Dispatch<React.SetStateAction<Theme>>
}

const ThemeCtx = createContext<ThemeCtxValue | null>(null)

const INITIAL_THEME: Theme = {
  id: undefined,
  name: '',
  logoUrl: null,
  colors: {
    neutral_light: '#ffffff',
    neutral_dark: '#111111',
    primary: '#2563eb',
    secondary: '#6b7280',
    tertiary: '#9333ea',
    warning: '#f59e0b',
    danger: '#ef4444',
    caution: '#f97316',
    success: '#10b981',
  },
  typography: {
    headerFont: 'Inter',
    headerWeights: [400],
    headerItalic: false,
    headerLineHeight: 1.25,
    headerLetterSpacing: 0,
    paragraphFont: 'Roboto',
    paragraphWeights: [400],
    paragraphItalic: false,
    paragraphLineHeight: 1.6,
    paragraphLetterSpacing: 0,
  },
  spacing: {},
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(INITIAL_THEME)
  const value = useMemo(() => ({ theme, setTheme }), [theme])
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}
