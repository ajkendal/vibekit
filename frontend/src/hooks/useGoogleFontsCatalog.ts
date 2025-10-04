import { useEffect, useMemo, useState } from 'react'

export type GFItem = { family: string; variants: string[] }

const CURATED: GFItem[] = [
  {
    family: 'Inter',
    variants: [
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '300italic',
      '400italic',
      '600italic',
    ],
  },
  {
    family: 'Poppins',
    variants: [
      '300',
      '400',
      '500',
      '600',
      '700',
      '300italic',
      '400italic',
      '600italic',
    ],
  },
  {
    family: 'Roboto',
    variants: [
      '300',
      '400',
      '500',
      '700',
      '900',
      '300italic',
      '400italic',
      '700italic',
    ],
  },
  {
    family: 'Lato',
    variants: [
      '300',
      '400',
      '700',
      '900',
      '300italic',
      '400italic',
      '700italic',
      '900italic',
    ],
  },
  {
    family: 'Montserrat',
    variants: [
      '300',
      '400',
      '500',
      '600',
      '700',
      '300italic',
      '400italic',
      '600italic',
    ],
  },
  {
    family: 'Merriweather',
    variants: [
      '300',
      '400',
      '700',
      '900',
      '300italic',
      '400italic',
      '700italic',
      '900italic',
    ],
  },
  {
    family: 'Playfair Display',
    variants: [
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
      '400italic',
      '500italic',
      '700italic',
      '900italic',
    ],
  },
  {
    family: 'Source Sans 3',
    variants: [
      '300',
      '400',
      '500',
      '600',
      '700',
      '900',
      '300italic',
      '400italic',
      '700italic',
      '900italic',
    ],
  },
]

export function useGoogleFontsCatalog() {
  const [fonts, setFonts] = useState<GFItem[]>(CURATED)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const key = import.meta.env.VITE_GF_API_KEY as string | undefined
    if (!key) return
    let cancelled = false
    fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=${key}`
    )
      .then((r) => {
        if (!r.ok) throw new Error(`Google Fonts: HTTP ${r.status}`)
        return r.json()
      })
      .then((j: any) => {
        if (cancelled || !j?.items) return
        const next: GFItem[] = j.items.map((it: any) => ({
          family: it.family,
          variants: Array.isArray(it.variants) ? it.variants : [],
        }))
        setFonts(next)
      })
      .catch((e) => setError(e.message || String(e)))
    return () => {
      cancelled = true
    }
  }, [])

  const map = useMemo(() => new Map(fonts.map((f) => [f.family, f])), [fonts])
  return { fonts, map, error }
}
