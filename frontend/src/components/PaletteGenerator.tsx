import { useMemo, useState } from 'react'
import { useTheme } from '../store/theme'
import { hexToRgb as libHexToRgb, rgbToHex } from '../lib/color'

type Scheme = 'mono' | 'analogous' | 'complementary' | 'triadic'

const SCHEMES: { key: Scheme; label: string }[] = [
  { key: 'mono', label: 'Monochromatic' },
  { key: 'analogous', label: 'Analogous' },
  { key: 'complementary', label: 'Complementary' },
  { key: 'triadic', label: 'Triadic' },
]

/* ───────── color math helpers ───────── */

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  return libHexToRgb(hex) ?? { r: 0, g: 0, b: 0 }
}

function adjustBrightness(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(r * factor, g * factor, b * factor)
}

function blendColors(hex1: string, hex2: string, ratio = 0.5): string {
  const a = hexToRgb(hex1)
  const b = hexToRgb(hex2)
  return rgbToHex(
    a.r + (b.r - a.r) * ratio,
    a.g + (b.g - a.g) * ratio,
    a.b + (b.b - a.b) * ratio
  )
}

/**
 * Derive a set of neutral colors from a base hue.
 *
 * Lights pull strongly toward white (95% white + 5% base) and darks pull
 * strongly toward near-black (90% ink + 10% base). The base color
 * contributes only a faint tint — enough to feel related to the brand, but
 * the result still reads as a usable "white" or "black".
 *
 * Mid is the geometric midpoint between the two, which lands on a balanced
 * mid-gray with the same subtle tint.
 *
 * Users can still override any value via the color picker; this is only the
 * starting point when "Derive neutrals" is checked.
 */
function deriveNeutralsFrom(baseHex: string) {
  const { r, g, b } = hexToRgb(baseHex)

  // Light: 95% white + 5% base. Reads as "warm white" / "cool white".
  const lightR = Math.round(r * 0.05 + 255 * 0.95)
  const lightG = Math.round(g * 0.05 + 255 * 0.95)
  const lightB = Math.round(b * 0.05 + 255 * 0.95)

  // Dark: 90% near-black + 10% base. Reads as "warm ink" / "cool ink".
  const inkBase = 16 // not full black — a softer, paper-like dark
  const darkR = Math.round(r * 0.1 + inkBase * 0.9)
  const darkG = Math.round(g * 0.1 + inkBase * 0.9)
  const darkB = Math.round(b * 0.1 + inkBase * 0.9)

  // Mid: the geometric midpoint — balanced, still subtly tinted.
  const midR = Math.round((lightR + darkR) / 2)
  const midG = Math.round((lightG + darkG) / 2)
  const midB = Math.round((lightB + darkB) / 2)

  return {
    neutral_light: rgbToHex(lightR, lightG, lightB),
    neutral_mid: rgbToHex(midR, midG, midB),
    neutral_dark: rgbToHex(darkR, darkG, darkB),
  }
}

function deriveStatusFrom(baseHex: string) {
  const { r, g, b } = hexToRgb(baseHex)
  return {
    danger: rgbToHex(Math.min(255, r + 50), Math.max(0, g - 30), Math.max(0, b - 30)),
    warning: rgbToHex(Math.min(255, r + 30), Math.min(255, g + 40), Math.max(0, b - 40)),
    caution: rgbToHex(Math.min(255, r + 40), Math.min(255, g + 20), Math.max(0, b - 50)),
    success: rgbToHex(Math.max(0, r - 40), Math.min(255, g + 50), Math.max(0, b - 20)),
  }
}

function buildPalette(baseHex: string, scheme: Scheme) {
  const { r, g, b } = hexToRgb(baseHex)
  if (scheme === 'mono') {
    return {
      primary: baseHex,
      secondary: adjustBrightness(baseHex, 1.2),
      tertiary: adjustBrightness(baseHex, 0.8),
    }
  }
  if (scheme === 'analogous') {
    return {
      primary: baseHex,
      secondary: rgbToHex(Math.min(255, r + 30), g, Math.max(0, b - 20)),
      tertiary: rgbToHex(Math.max(0, r - 20), Math.min(255, g + 30), b),
    }
  }
  if (scheme === 'complementary') {
    const comp = rgbToHex(255 - r, 255 - g, 255 - b)
    return {
      primary: baseHex,
      secondary: comp,
      tertiary: blendColors(baseHex, comp, 0.3),
    }
  }
  // triadic — rotate channels
  return {
    primary: baseHex,
    secondary: rgbToHex(b, r, g),
    tertiary: rgbToHex(g, b, r),
  }
}

/* ───────── component ───────── */

export default function PaletteGenerator() {
  const { theme, setTheme } = useTheme()
  const [base, setBase] = useState<string>(theme.colors?.primary ?? '#2563eb')
  const [scheme, setScheme] = useState<Scheme>('mono')
  const [deriveNeutrals, setDeriveNeutrals] = useState(false)
  const [deriveStatus, setDeriveStatus] = useState(false)

  const result = useMemo(() => buildPalette(base, scheme), [base, scheme])

  function applyToTheme() {
    setTheme((prev) => {
      const next = {
        ...prev,
        colors: {
          ...(prev.colors ?? {}),
          primary: result.primary,
          secondary: result.secondary,
          tertiary: result.tertiary,
        },
      }
      if (deriveNeutrals) Object.assign(next.colors, deriveNeutralsFrom(result.primary))
      if (deriveStatus) Object.assign(next.colors, deriveStatusFrom(result.primary))
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
    <>
      {/* Base color */}
      <div className='vk-pg-field'>
        <span className='vk-pg-field-label'>Base color</span>
        <div className='vk-pg-base'>
          <label
            className='vk-pg-base-swatch'
            style={{ background: base }}
            aria-label='Pick base color'
          >
            <input
              type='color'
              value={base}
              onChange={(e) => setBase(e.target.value)}
            />
          </label>
          <input
            type='text'
            className='vk-pg-base-input'
            value={base}
            onChange={(e) => setBase(e.target.value)}
            placeholder='#RRGGBB'
            spellCheck={false}
          />
        </div>
      </div>

      {/* Scheme */}
      <div className='vk-pg-field'>
        <span className='vk-pg-field-label'>Scheme</span>
        <div className='vk-pg-scheme'>
          {SCHEMES.map((s) => (
            <button
              key={s.key}
              type='button'
              className={`vk-pg-scheme-pill ${
                scheme === s.key ? 'is-active' : ''
              }`}
              onClick={() => setScheme(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Derive options */}
      <div className='vk-pg-field'>
        <span className='vk-pg-field-label'>Also derive</span>
        <div className='vk-pg-derive'>
          <label
            className={`vk-pg-toggle ${deriveNeutrals ? 'is-on' : ''}`}
          >
            <input
              type='checkbox'
              checked={deriveNeutrals}
              onChange={() => setDeriveNeutrals((v) => !v)}
            />
            <span className='vk-pg-toggle-track'>
              <span className='vk-pg-toggle-thumb' />
            </span>
            <span className='vk-pg-toggle-text'>
              <span className='vk-pg-toggle-label'>Neutrals</span>
              <span className='vk-pg-toggle-sub'>Light · Mid · Dark from base</span>
            </span>
          </label>
          <label className={`vk-pg-toggle ${deriveStatus ? 'is-on' : ''}`}>
            <input
              type='checkbox'
              checked={deriveStatus}
              onChange={() => setDeriveStatus((v) => !v)}
            />
            <span className='vk-pg-toggle-track'>
              <span className='vk-pg-toggle-thumb' />
            </span>
            <span className='vk-pg-toggle-text'>
              <span className='vk-pg-toggle-label'>Status colors</span>
              <span className='vk-pg-toggle-sub'>Success · Warning · Caution · Danger</span>
            </span>
          </label>
        </div>
      </div>

      {/* Preview */}
      <div className='vk-pg-field'>
        <span className='vk-pg-field-label'>Preview</span>
        <div className='vk-pg-preview'>
          {(['primary', 'secondary', 'tertiary'] as const).map((k) => {
            const value = result[k]
            return (
              <div key={k} className='vk-pg-preview-card'>
                <div
                  className='vk-pg-preview-swatch'
                  style={{ background: value }}
                />
                <div className='vk-pg-preview-meta'>
                  <div className='vk-pg-preview-name'>{k}</div>
                  <div className='vk-pg-preview-hex'>{value}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className='vk-pg-actions'>
        <button
          type='button'
          className='vk-btn vk-btn--primary vk-btn--sm'
          onClick={applyToTheme}
        >
          Apply to theme
        </button>
        <button
          type='button'
          className='vk-btn vk-btn--outline vk-btn--sm'
          onClick={randomize}
        >
          Randomize base
        </button>
      </div>

      <small className='vk-pg-helper'>
        Pick a base color, choose a relationship, optionally derive your neutrals
        and status colors from it.
      </small>
    </>
  )
}
