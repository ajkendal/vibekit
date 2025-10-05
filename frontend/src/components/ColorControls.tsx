import { useMemo } from 'react'
import { useTheme } from '../store/theme'

type ColorFormat = 'hex' | 'rgb' | 'hsl'

type Props = {
  format: ColorFormat
  onChangeFormat: (f: ColorFormat) => void
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function hexToRgb(hex: string) {
  const m = (hex || '').trim().match(/^#?([a-f\d]{3}|[a-f\d]{6})$/i)
  if (!m) return null
  let h = m[1].toLowerCase()
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  const n = parseInt(h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function hexToHsl(hex: string) {
  const rgb = hexToRgb(hex) || { r: 37, g: 99, b: 235 }
  let { r, g, b } = rgb
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2
  const d = max - min
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r:
        h = ((g - b) / d) % 6
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h *= 60
    if (h < 0) h += 360
  }
  return {
    h: Math.round(h),
    s: Math.round(clamp01(s) * 100),
    l: Math.round(clamp01(l) * 100),
  }
}

function formatColor(hex: string, fmt: ColorFormat) {
  const h = (hex || '').toLowerCase()
  if (fmt === 'hex') return h.startsWith('#') ? h : `#${h}`
  if (fmt === 'rgb') {
    const rgb = hexToRgb(h) || { r: 37, g: 99, b: 235 }
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  }
  const { h: H, s, l } = hexToHsl(h)
  return `hsl(${H} ${s}% ${l}%)`
}

// Added Warning, Danger, Caution, Success back in
const FIELDS: Array<{ key: keyof any; label: string; def: string }> = [
  { key: 'neutral_light', label: 'Neutral – Light', def: '#ffffff' },
  { key: 'neutral_dark', label: 'Neutral – Dark', def: '#111111' },
  { key: 'primary', label: 'Primary', def: '#2563eb' },
  { key: 'secondary', label: 'Secondary', def: '#6b7280' },
  { key: 'tertiary', label: 'Tertiary', def: '#9333ea' },
  { key: 'danger', label: 'Danger', def: '#ef4444' },
  { key: 'warning', label: 'Warning', def: '#f59e0b' },
  { key: 'caution', label: 'Caution', def: '#f97316' },
  { key: 'success', label: 'Success', def: '#10b981' },
]

export default function ColorControls({ format, onChangeFormat }: Props) {
  const { theme, setTheme } = useTheme() as {
    theme: any
    setTheme: (u: any) => void
  }
  const c = theme?.colors || {}

  const rows = useMemo(
    () =>
      FIELDS.map((f) => {
        const hex = (c as any)[f.key] || f.def
        return {
          key: f.key as string,
          label: f.label,
          hex: hex.toLowerCase(),
          shown: formatColor(hex, format),
        }
      }),
    [c, format]
  )

  function updateColor(key: string, hex: string) {
    // Normalize to hex
    let val = hex.trim().toLowerCase()
    if (!val.startsWith('#')) {
      if (/^[0-9a-f]{6}$/i.test(val)) val = `#${val}`
    }
    if (!/^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(val)) return
    setTheme((prev: any) => ({
      ...prev,
      colors: { ...(prev.colors || {}), [key]: val },
    }))
  }

  return (
    <section className='card'>
      <strong>Colors</strong>

      <div
        style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}
      >
        <span style={{ fontSize: 12, opacity: 0.7 }}>Display as</span>
        <select
          value={format}
          onChange={(e) => onChangeFormat(e.target.value as ColorFormat)}
        >
          <option value='hex'>HEX</option>
          <option value='rgb'>RGB</option>
          <option value='hsl'>HSL</option>
        </select>
      </div>

      <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
        {rows.map((r) => (
          <div
            key={r.key}
            style={{
              display: 'grid',
              gridTemplateColumns: '140px auto 120px',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <label style={{ fontSize: 13 }}>{r.label}</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type='color'
                value={r.hex}
                onChange={(e) => updateColor(r.key, e.target.value)}
                style={{
                  width: 44,
                  height: 28,
                  padding: 0,
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                }}
                aria-label={`${r.label} color`}
              />
              <input
                type='text'
                value={r.hex}
                onChange={(e) => updateColor(r.key, e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  minWidth: 140,
                }}
              />
            </div>
            <code
              style={{
                fontSize: 12,
                background: '#f3f4f6',
                padding: '4px 6px',
                borderRadius: 6,
                textAlign: 'right',
              }}
            >
              {r.shown}
            </code>
          </div>
        ))}
      </div>
    </section>
  )
}
