import { useMemo, useState } from 'react'
import { useTheme } from '../store/theme'

type HSL = { h: number; s: number; l: number }
type Scheme = 'Monochromatic' | 'Analogous' | 'Complementary' | 'Triadic'

function clamp(n: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, n))
}
function rotateHue(h: number, deg: number) {
  let v = (h + deg) % 360
  if (v < 0) v += 360
  return v
}

function hexToHsl(hex: string): HSL {
  let h = hex.trim().replace('#', '')
  if (!/^[0-9a-fA-F]{3,6}$/.test(h)) h = '2563eb'
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let hDeg = 0
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d !== 0) {
    switch (max) {
      case r:
        hDeg = ((g - b) / d) % 6
        break
      case g:
        hDeg = (b - r) / d + 2
        break
      case b:
        hDeg = (r - g) / d + 4
        break
    }
    hDeg *= 60
    if (hDeg < 0) hDeg += 360
  }
  return { h: hDeg, s: clamp(s), l: clamp(l) }
}
function hslToHex({ h, s, l }: HSL): string {
  s = clamp(s)
  l = clamp(l)
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0,
    g = 0,
    b = 0
  if (0 <= h && h < 60) {
    r = c
    g = x
    b = 0
  } else if (60 <= h && h < 120) {
    r = x
    g = c
    b = 0
  } else if (120 <= h && h < 180) {
    r = 0
    g = c
    b = x
  } else if (180 <= h && h < 240) {
    r = 0
    g = x
    b = c
  } else if (240 <= h && h < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }
  const R = Math.round((r + m) * 255)
    .toString(16)
    .padStart(2, '0')
  const G = Math.round((g + m) * 255)
    .toString(16)
    .padStart(2, '0')
  const B = Math.round((b + m) * 255)
    .toString(16)
    .padStart(2, '0')
  return `#${R}${G}${B}`.toLowerCase()
}
const lighten = (hsl: HSL, amt = 0.1): HSL => ({
  ...hsl,
  l: clamp(hsl.l + amt),
})
const darken = (hsl: HSL, amt = 0.1): HSL => ({ ...hsl, l: clamp(hsl.l - amt) })
const saturate = (hsl: HSL, amt = 0.1): HSL => ({
  ...hsl,
  s: clamp(hsl.s + amt),
})

function deriveNeutralsFrom(baseHex: string) {
  const b = hexToHsl(baseHex)
  const desat: HSL = { h: b.h, s: clamp(b.s * 0.08), l: b.l }
  const light = { ...desat, l: 0.96 }
  const dark = { ...desat, l: 0.14 }
  return { neutral_light: hslToHex(light), neutral_dark: hslToHex(dark) }
}

function buildPalette(baseHex: string, scheme: Scheme) {
  const base = hexToHsl(baseHex)

  if (scheme === 'Monochromatic') {
    const primary = base
    const secondary = {
      h: base.h,
      s: clamp(base.s * 0.65),
      l: clamp(base.l * 1.15),
    }
    const tertiary = {
      h: base.h,
      s: clamp(base.s * 0.95),
      l: clamp(base.l * 0.78),
    }
    return {
      primary: hslToHex(primary),
      secondary: hslToHex(secondary),
      tertiary: hslToHex(tertiary),
    }
  }

  if (scheme === 'Analogous') {
    const primary = base
    const secondary = { ...base, h: rotateHue(base.h, -30) }
    const tertiary = { ...base, h: rotateHue(base.h, +30) }
    return {
      primary: hslToHex(primary),
      secondary: hslToHex(saturate(secondary, 0.05)),
      tertiary: hslToHex(lighten(tertiary, 0.05)),
    }
  }

  if (scheme === 'Complementary') {
    const primary = base
    const secondary = { ...base, h: rotateHue(base.h, 180) }
    const tertiary = { ...base, h: rotateHue(base.h, 160) }
    return {
      primary: hslToHex(primary),
      secondary: hslToHex(secondary),
      tertiary: hslToHex(lighten(tertiary, 0.08)),
    }
  }

  // Triadic
  const primary = base
  const secondary = { ...base, h: rotateHue(base.h, 120) }
  const tertiary = { ...base, h: rotateHue(base.h, -120) }
  return {
    primary: hslToHex(primary),
    secondary: hslToHex(saturate(secondary, 0.04)),
    tertiary: hslToHex(darken(tertiary, 0.04)),
  }
}

export default function PaletteGenerator() {
  const { theme, setTheme } = useTheme() as {
    theme: any
    setTheme: (updater: any) => void
  }
  const [base, setBase] = useState<string>(theme.colors?.primary || '#2563eb')
  const [scheme, setScheme] = useState<Scheme>('Monochromatic')
  const [deriveNeutrals, setDeriveNeutrals] = useState<boolean>(false)

  const result = useMemo(() => buildPalette(base, scheme), [base, scheme])

  function applyToTheme() {
    setTheme((prev: any) => {
      const next = {
        ...prev,
        colors: {
          ...(prev.colors || {}),
          primary: result.primary,
          secondary: result.secondary,
          tertiary: result.tertiary,
        },
      }
      if (deriveNeutrals) {
        const ns = deriveNeutralsFrom(result.primary)
        next.colors.neutral_light = ns.neutral_light
        next.colors.neutral_dark = ns.neutral_dark
      }
      return next
    })
  }

  function randomize() {
    const rand = `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0')}`
    setBase(rand)
  }

  return (
    <section className='card' style={{ flex: '1 1 420px' }}>
      <strong>Generate Palette</strong>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginTop: 8,
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 120 }}>Base Color</span>
          <input
            type='color'
            value={base}
            onChange={(e) => setBase(e.target.value)}
            style={{
              width: 44,
              height: 28,
              padding: 0,
              border: '1px solid #e5e7eb',
              borderRadius: 6,
            }}
          />
          <input
            type='text'
            value={base}
            onChange={(e) => setBase(e.target.value)}
            placeholder='#RRGGBB'
            style={{
              flex: 1,
              minWidth: 140,
              padding: '8px 10px',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
            }}
          />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 120 }}>Scheme</span>
          <select
            value={scheme}
            onChange={(e) => setScheme(e.target.value as Scheme)}
            style={{ flex: 1 }}
          >
            <option value='Monochromatic'>Monochromatic</option>
            <option value='Analogous'>Analogous</option>
            <option value='Complementary'>Complementary</option>
            <option value='Triadic'>Triadic</option>
          </select>
        </label>
      </div>

      {/* Derive neutrals toggle */}
      <label
        className='chip'
        style={{
          marginTop: 10,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <input
          type='checkbox'
          checked={deriveNeutrals}
          onChange={() => setDeriveNeutrals((v) => !v)}
        />
        Also derive Neutrals (Light/Dark)
      </label>

      {/* Preview swatches */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          marginTop: 12,
        }}
      >
        {(['primary', 'secondary', 'tertiary'] as const).map((k) => {
          const value = (result as any)[k]
          return (
            <div
              key={k}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <div style={{ background: value, height: 56 }} />
              <div
                style={{
                  padding: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ textTransform: 'capitalize' }}>{k}</span>
                <code
                  style={{
                    padding: '2px 6px',
                    borderRadius: 6,
                    background: '#f3f4f6',
                    color: '#111',
                  }}
                >
                  {value}
                </code>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button type='button' className='btn' onClick={applyToTheme}>
          Apply to Theme
        </button>
        <button type='button' className='btn' onClick={randomize}>
          Randomize Base
        </button>
      </div>

      <small style={{ display: 'block', marginTop: 8, opacity: 0.7 }}>
        All schemes can optionally derive Neutral (Light/Dark) from the Primary
        hue by desaturating &amp; adjusting lightness.
      </small>
    </section>
  )
}
