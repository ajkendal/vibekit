import React, { createContext, useContext, useState } from 'react'

export type Theme = {
  id?: string
  name: string
  logoUrl?: string
  colors: {
    neutral_light: string
    neutral_dark: string
    primary: string
    secondary: string
    tertiary: string
    danger: string
    warning: string
    caution: string
    success: string
    surface?: string
    text?: string
  }
  typography: {
    base: number
    ratio: number
    headerFont: string
    headerWeights: number[]
    paragraphFont: string
    paragraphWeights: number[]
  }
  spacing: { base: number }
}

export const defaultTheme: Theme = {
  name: 'My Theme',
  logoUrl: '',
  colors: {
    neutral_light: '#ffffff',
    neutral_dark: '#0b0f14',
    primary: '#2563eb',
    secondary: '#14b8a6',
    tertiary: '#8b5cf6',
    danger: '#ef4444',
    warning: '#f59e0b',
    caution: '#fbbf24',
    success: '#16a34a',
    surface: '#ffffff',
    text: '#111827'
  },
  typography: {
    base: 16,
    ratio: 1.25,
    headerFont: 'Inter',
    headerWeights: [400,600,700],
    paragraphFont: 'Inter',
    paragraphWeights: [300,400,500]
  },
  spacing: { base: 4 }
}

type Ctx = { theme: Theme; setTheme: React.Dispatch<React.SetStateAction<Theme>> }
const ThemeContext = createContext<Ctx | null>(null)
export const ThemeProvider = ({children}:{children:React.ReactNode}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  return <ThemeContext.Provider value={{theme, setTheme}}>{children}</ThemeContext.Provider>
}
export function useTheme(){ const ctx = useContext(ThemeContext); if(!ctx) throw new Error('useTheme inside provider'); return ctx }
