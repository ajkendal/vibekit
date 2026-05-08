import { useMemo } from 'react'
import { useTheme } from '../store/theme'

type RGB = { r: number; g: number; b: number }

function hexToRgb(hex: string): RGB | null {
  const m = (hex || '').trim().match(/^#?([a-f\d]{3}|[a-f\d]{6})$/i)
  if (!m) return null
  let h = m[1].toLowerCase()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
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
  return (
    0.2126 * srgbToLinear(rgb.r) +
    0.7152 * srgbToLinear(rgb.g) +
    0.0722 * srgbToLinear(rgb.b)
  )
}

function contrastRatio(fg: string, bg: string) {
  const L1 = relativeLuminance(fg)
  const L2 = relativeLuminance(bg)
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
}

type Pair = {
  title: string
  fg: string
  bg: string
}

type Verdict = 'aaa' | 'aa' | 'aa-large' | 'fail'

function verdictFor(ratio: number): Verdict {
  if (ratio >= 7) return 'aaa'
  if (ratio >= 4.5) return 'aa'
  if (ratio >= 3) return 'aa-large'
  return 'fail'
}

export default function ContrastChecker() {
  const { theme } = useTheme() as { theme: any }
  const colors = theme?.colors || {}

  const light = colors.neutral_light || '#ffffff'
  const mid = colors.neutral_mid || '#6b7280'
  const dark = colors.neutral_dark || '#000000'
  const primary = colors.primary || '#2563eb'
  const secondary = colors.secondary || '#3b82f6'
  const tertiary = colors.tertiary || '#9333ea'

  const pairs: Pair[] = useMemo(
    () => [
      { title: 'Ink on canvas', fg: dark, bg: light },
      { title: 'Mid on canvas', fg: mid, bg: light },
      { title: 'Primary on canvas', fg: primary, bg: light },
      { title: 'Secondary on canvas', fg: secondary, bg: light },
      { title: 'Tertiary on canvas', fg: tertiary, bg: light },
      { title: 'Canvas on primary', fg: light, bg: primary },
      { title: 'Canvas on secondary', fg: light, bg: secondary },
      { title: 'Canvas on tertiary', fg: light, bg: tertiary },
    ],
    [light, mid, dark, primary, secondary, tertiary]
  )

  const summary = useMemo(() => {
    const counts = { aaa: 0, aa: 0, 'aa-large': 0, fail: 0 } as Record<Verdict, number>
    pairs.forEach((p) => {
      counts[verdictFor(contrastRatio(p.fg, p.bg))] += 1
    })
    return counts
  }, [pairs])

  return (
    <section className='vk-section'>
      <div className='vk-section-head'>
        <div>
          <div className='vk-eyebrow'>Contrast checker</div>
          <h2 className='vk-section-title'>WCAG compliance, at a glance</h2>
        </div>
        <div className='vk-section-meta'>
          {pairs.length} pairs · {summary.aaa} pass AAA · {summary.fail} fail
        </div>
      </div>

      <div className='vk-pair-grid'>
        {pairs.map((p) => {
          const ratio = contrastRatio(p.fg, p.bg)
          const v = verdictFor(ratio)
          return (
            <div key={p.title} className='vk-pair-card'>
              <div className='vk-pair-head'>
                <div className='vk-pair-swatch'>
                  <div style={{ background: p.fg }} />
                  <div style={{ background: p.bg }} />
                </div>
                <div className='vk-pair-title'>{p.title}</div>
              </div>

              <div className='vk-pair-sample' style={{ background: p.bg, color: p.fg }}>
                <div className='vk-pair-sample-h'>The quick brown fox</div>
                <div className='vk-pair-sample-p'>jumps over the lazy dog.</div>
              </div>

              <div className='vk-pair-status'>
                {v === 'aaa' && (
                  <>
                    <span className='vk-pill vk-pill--pass'>✓ AAA pass</span>
                    <span className='vk-pill vk-pill--pass'>✓ AA pass</span>
                  </>
                )}
                {v === 'aa' && (
                  <>
                    <span className='vk-pill vk-pill--pass'>✓ AA pass</span>
                    <span className='vk-pill vk-pill--fail'>AAA fails</span>
                  </>
                )}
                {v === 'aa-large' && (
                  <>
                    <span className='vk-pill vk-pill--warn'>AA large only</span>
                    <span className='vk-pill vk-pill--fail'>AA fails</span>
                  </>
                )}
                {v === 'fail' && <span className='vk-pill vk-pill--fail'>Fails — try another pair</span>}
                <span className='vk-ratio'>{ratio.toFixed(2)}</span>
              </div>
            </div>
          )
        })}
      </div>

      <small className='vk-tips'>
        AAA passes both body and large text. AA passes body text. AA-large is fine for headlines but
        not body. Anything below 3 is hard to read — pick a different pair.
      </small>
    </section>
  )
}
