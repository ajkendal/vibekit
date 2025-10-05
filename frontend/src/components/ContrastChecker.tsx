import { useMemo } from 'react'
import { useTheme } from '../store/theme'

type RGB = { r: number; g: number; b: number }

function hexToRgb(hex: string): RGB | null {
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

function srgbToLinear(c: number) {
  const cs = c / 255
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4)
}

function relativeLuminance(hex: string) {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const R = srgbToLinear(rgb.r)
  const G = srgbToLinear(rgb.g)
  const B = srgbToLinear(rgb.b)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

function contrastRatio(fg: string, bg: string) {
  const L1 = relativeLuminance(fg)
  const L2 = relativeLuminance(bg)
  const lighter = Math.max(L1, L2)
  const darker = Math.min(L1, L2)
  return (lighter + 0.05) / (darker + 0.05)
}

function fmt(r: number) {
  return `${r.toFixed(2)}:1`
}

type Verdict =
  | { label: 'Excellent'; note: string; bg: string; fg: string; border: string }
  | { label: 'Good'; note: string; bg: string; fg: string; border: string }
  | {
      label: 'OK for Large Text'
      note: string
      bg: string
      fg: string
      border: string
    }
  | {
      label: 'Hard to Read'
      note: string
      bg: string
      fg: string
      border: string
    }

function verdictFrom(ratio: number): Verdict {
  if (ratio >= 7) {
    return {
      label: 'Excellent',
      note: 'Works well for any text size.',
      bg: '#DCFCE7',
      fg: '#14532D',
      border: '#86EFAC',
    }
  }
  if (ratio >= 4.5) {
    return {
      label: 'Good',
      note: 'Readable for body text and headings.',
      bg: '#E0E7FF',
      fg: '#1E3A8A',
      border: '#93C5FD',
    }
  }
  if (ratio >= 3) {
    return {
      label: 'OK for Large Text',
      note: 'Use for headlines / large UI only.',
      bg: '#FEF9C3',
      fg: '#713F12',
      border: '#FDE68A',
    }
  }
  return {
    label: 'Hard to Read',
    note: 'Choose different colors or increase contrast.',
    bg: '#FEE2E2',
    fg: '#7F1D1D',
    border: '#FCA5A5',
  }
}

export default function ContrastChecker() {
  const { theme } = useTheme() as { theme: any }

  const colors = theme?.colors || {}
  const light = colors.neutral_light || '#ffffff'
  const dark = colors.neutral_dark || '#111111'
  const primary = colors.primary || '#2563eb'
  const secondary = colors.secondary || '#6b7280'
  const tertiary = colors.tertiary || '#9333ea'

  const rows = useMemo(() => {
    const mk = (title: string, fg: string, bg: string) => {
      const ratio = contrastRatio(fg, bg)
      const v = verdictFrom(ratio)
      return { title, fg, bg, ratio, verdict: v }
    }
    return [
      mk('Light text on Dark background', light, dark),
      mk('Dark text on Light background', dark, light),

      mk('Light text on Primary', light, primary),
      mk('Dark text on Primary', dark, primary),

      mk('Light text on Secondary', light, secondary),
      mk('Dark text on Secondary', dark, secondary),

      mk('Light text on Tertiary', light, tertiary),
      mk('Dark text on Tertiary', dark, tertiary),
    ]
  }, [light, dark, primary, secondary, tertiary])

  return (
    <section className='card' style={{ flex: '1 1 460px' }}>
      <strong>Contrast Checker</strong>
      <p style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
        Quick readability checks for common color pairs. Aim for <b>Good</b> or{' '}
        <b>Excellent</b> for body text.
      </p>

      <div style={{ marginTop: 8, display: 'grid', gap: 10 }}>
        {rows.map((row) => (
          <div
            key={row.title}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              overflow: 'hidden',
              background: '#fff',
            }}
          >
            {/* Sample (swatch removed) */}
            <div
              style={{
                background: row.bg,
                color: row.fg,
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>{row.title}</div>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: 12, opacity: 0.7 }}>Background</span>
                  <code>{row.bg}</code>
                  <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 8 }}>
                    Text
                  </span>
                  <code>{row.fg}</code>
                </div>
              </div>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: row.bg,
                  color: row.fg,
                  border: '1px solid rgba(0,0,0,.08)',
                  fontWeight: 700,
                }}
              >
                This is easy to read
              </div>
            </div>

            {/* Verdict */}
            <div
              style={{
                padding: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: row.verdict.bg,
                  color: row.verdict.fg,
                  border: `1px solid ${row.verdict.border}`,
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                {row.verdict.label}
                <span style={{ fontWeight: 400, opacity: 0.9 }}>
                  · {row.verdict.note}
                </span>
              </span>

              <span style={{ fontSize: 12, opacity: 0.75 }}>
                Details: contrast {fmt(row.ratio)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <small style={{ display: 'block', marginTop: 8, opacity: 0.7 }}>
        Tips: Use <b>Good</b> or <b>Excellent</b> for body text.{' '}
        <b>OK for Large Text</b> is fine for big headlines. Avoid{' '}
        <b>Hard to Read</b>.
      </small>
    </section>
  )
}
