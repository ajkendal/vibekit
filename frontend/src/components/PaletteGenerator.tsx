import { useMemo, useState } from 'react'
import { useTheme } from '../store/theme'
import styles from '../styles/PaletteGenerator.module.scss'

type Scheme = 'Monochromatic' | 'Analogous' | 'Complementary' | 'Triadic'

// Simple hex color manipulation functions
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return { r, g, b }
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n)))
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function adjustBrightness(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(r * factor, g * factor, b * factor)
}

function blendColors(hex1: string, hex2: string, ratio: number = 0.5): string {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)
  return rgbToHex(
    rgb1.r + (rgb2.r - rgb1.r) * ratio,
    rgb1.g + (rgb2.g - rgb1.g) * ratio,
    rgb1.b + (rgb2.b - rgb1.b) * ratio
  )
}

// Generate neutral colors from a base color
function deriveNeutralsFrom(baseHex: string) {
  const { r, g, b } = hexToRgb(baseHex)
  // Create a desaturated version by blending with gray
  const gray = Math.round((r + g + b) / 3)
  const desatR = Math.round(r * 0.15 + gray * 0.85)
  const desatG = Math.round(g * 0.15 + gray * 0.85)
  const desatB = Math.round(b * 0.15 + gray * 0.85)

  return {
    neutral_light: rgbToHex(desatR + 50, desatG + 50, desatB + 50), // Lighter
    neutral_mid: rgbToHex(desatR + 10, desatG + 10, desatB + 10), // Mid tone
    neutral_dark: rgbToHex(desatR - 40, desatG - 40, desatB - 40), // Darker
  }
}

// Generate status colors from a base color
function deriveStatusFrom(baseHex: string) {
  const { r, g, b } = hexToRgb(baseHex)

  return {
    danger: rgbToHex(
      Math.min(255, r + 50),
      Math.max(0, g - 30),
      Math.max(0, b - 30)
    ), // More red
    warning: rgbToHex(
      Math.min(255, r + 30),
      Math.min(255, g + 40),
      Math.max(0, b - 40)
    ), // Yellow/orange
    caution: rgbToHex(
      Math.min(255, r + 40),
      Math.min(255, g + 20),
      Math.max(0, b - 50)
    ), // Orange
    success: rgbToHex(
      Math.max(0, r - 40),
      Math.min(255, g + 50),
      Math.max(0, b - 20)
    ), // More green
  }
}

// Simple palette generation using predefined color relationships
function buildPalette(baseHex: string, scheme: Scheme) {
  const { r, g, b } = hexToRgb(baseHex)

  if (scheme === 'Monochromatic') {
    return {
      primary: baseHex,
      secondary: adjustBrightness(baseHex, 1.2), // Lighter version
      tertiary: adjustBrightness(baseHex, 0.8), // Darker version
    }
  }

  if (scheme === 'Analogous') {
    // Shift color channels slightly for analogous colors
    return {
      primary: baseHex,
      secondary: rgbToHex(Math.min(255, r + 30), g, Math.max(0, b - 20)), // Shift toward red/yellow
      tertiary: rgbToHex(Math.max(0, r - 20), Math.min(255, g + 30), b), // Shift toward green/blue
    }
  }

  if (scheme === 'Complementary') {
    return {
      primary: baseHex,
      secondary: rgbToHex(255 - r, 255 - g, 255 - b), // Invert colors for complement
      tertiary: blendColors(baseHex, rgbToHex(255 - r, 255 - g, 255 - b), 0.3), // Blend
    }
  }

  // Triadic - rotate through RGB channels
  return {
    primary: baseHex,
    secondary: rgbToHex(b, r, g), // Rotate RGB channels
    tertiary: rgbToHex(g, b, r), // Rotate RGB channels differently
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
  const [deriveStatus, setDeriveStatus] = useState<boolean>(false)

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
        next.colors.neutral_mid = ns.neutral_mid
        next.colors.neutral_dark = ns.neutral_dark
      }
      if (deriveStatus) {
        const st = deriveStatusFrom(result.primary)
        next.colors.danger = st.danger
        next.colors.warning = st.warning
        next.colors.caution = st.caution
        next.colors.success = st.success
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
    <section>
      <strong>Generate Palette</strong>

      <div className={styles.controlsGrid}>
        <label className={styles.controlRow}>
          <span className={styles.controlLabel}>Base Color</span>
          <input
            type='color'
            value={base}
            onChange={(e) => setBase(e.target.value)}
            className={styles.colorInput}
          />
          <input
            type='text'
            value={base}
            onChange={(e) => setBase(e.target.value)}
            placeholder='#RRGGBB'
            className={styles.textInput}
          />
        </label>

        <label className={styles.controlRow}>
          <span className={styles.controlLabel}>Scheme</span>
          <select
            value={scheme}
            onChange={(e) => setScheme(e.target.value as Scheme)}
            className={styles.schemeSelect}
          >
            <option value='Monochromatic'>Monochromatic</option>
            <option value='Analogous'>Analogous</option>
            <option value='Complementary'>Complementary</option>
            <option value='Triadic'>Triadic</option>
          </select>
        </label>
      </div>

      {/* Derive options */}
      <div className={styles.deriveOptions}>
        <label className={`chip ${styles.deriveLabel}`}>
          <input
            type='checkbox'
            checked={deriveNeutrals}
            onChange={() => setDeriveNeutrals((v) => !v)}
          />
          Derive Neutrals (Light/Mid/Dark)
        </label>

        <label className={`chip ${styles.deriveLabel}`}>
          <input
            type='checkbox'
            checked={deriveStatus}
            onChange={() => setDeriveStatus((v) => !v)}
          />
          Derive Status (Danger/Warning/Caution/Success)
        </label>
      </div>

      {/* Preview swatches */}
      <div className={styles.previewGrid}>
        {(['primary', 'secondary', 'tertiary'] as const).map((k) => {
          const value = (result as any)[k]
          return (
            <div key={k} className={styles.swatchCard}>
              <div
                className={styles.colorSwatch}
                style={{ background: value }}
              />
              <div className={styles.swatchMeta}>
                <span className={styles.swatchLabel}>{k}</span>
                <code className={styles.swatchCode}>{value}</code>
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.actionButtons}>
        <button type='button' className='btn' onClick={applyToTheme}>
          Apply to Theme
        </button>
        <button type='button' className='btn' onClick={randomize}>
          Randomize Base
        </button>
      </div>

      <small className={styles.helperText}>
        All schemes can optionally derive Neutral (Light/Dark) from the Primary
        hue by desaturating &amp; adjusting lightness.
      </small>
    </section>
  )
}
