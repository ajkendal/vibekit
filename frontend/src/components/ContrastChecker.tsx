import { useTheme } from '../store/theme'

function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  const b = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16
  )
  return { r: (b >> 16) & 255, g: (b >> 8) & 255, b: b & 255 }
}
function s2l(c: number) {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}
function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  return 0.2126 * s2l(r) + 0.7152 * s2l(g) + 0.0722 * s2l(b)
}
function ratio(fg: string, bg: string) {
  const L1 = Math.max(luminance(fg), luminance(bg))
  const L2 = Math.min(luminance(fg), luminance(bg))
  return (L1 + 0.05) / (L2 + 0.05)
}

export default function ContrastChecker() {
  const { theme } = useTheme()
  const pairs = [
    {
      name: 'On Primary',
      fg: theme.colors.neutral_dark,
      bg: theme.colors.primary,
    },
    {
      name: 'On Secondary',
      fg: theme.colors.neutral_dark,
      bg: theme.colors.secondary,
    },
    {
      name: 'On Tertiary',
      fg: theme.colors.neutral_dark,
      bg: theme.colors.tertiary,
    },
  ]
  return (
    <div className='card'>
      <strong>Contrast Checker</strong>
      <div className='row'>
        {pairs.map((p) => {
          const r = ratio(p.fg!, p.bg!)
          const okAA = r >= 4.5
          const okAAA = r >= 7
          return (
            <div
              key={p.name}
              className='card'
              style={{ background: p.bg, color: p.fg, minWidth: 220 }}
            >
              <div>{p.name}</div>
              <div style={{ fontSize: 12 }}>
                Ratio: {r.toFixed(2)} — {okAAA ? 'AAA' : okAA ? 'AA' : 'fail'}
              </div>
              <div
                style={{
                  padding: 8,
                  borderRadius: 8,
                  background: p.bg,
                  color: p.fg,
                }}
              >
                The quick brown fox
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
