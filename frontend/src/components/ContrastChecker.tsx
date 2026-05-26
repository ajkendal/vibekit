import { useMemo } from 'react'
import { useTheme } from '../store/theme'
import { contrastRatio } from '../lib/color'

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

  // Pairs are built from the user's own theme tokens — neutral_light / mid /
  // dark plus their brand colors. The "Light"/"Dark"/"Mid" labels refer to
  // what the user picked in Color tokens, not VibeKit's design system.
  //
  // The matrix runs every brand color (primary/secondary/tertiary) as text
  // on every neutral background (light/mid/dark) — and also tests Light/Dark
  // as text on the brand colors, for button labels and inverse layouts.
  const pairs: Pair[] = useMemo(
    () => [
      // Text on the Light surface
      { title: 'Dark on Light', fg: dark, bg: light },
      { title: 'Mid on Light', fg: mid, bg: light },
      { title: 'Primary on Light', fg: primary, bg: light },
      { title: 'Secondary on Light', fg: secondary, bg: light },
      { title: 'Tertiary on Light', fg: tertiary, bg: light },

      // Text on the Mid surface
      { title: 'Primary on Mid', fg: primary, bg: mid },
      { title: 'Secondary on Mid', fg: secondary, bg: mid },
      { title: 'Tertiary on Mid', fg: tertiary, bg: mid },

      // Text on the Dark surface
      { title: 'Light on Dark', fg: light, bg: dark },
      { title: 'Primary on Dark', fg: primary, bg: dark },
      { title: 'Secondary on Dark', fg: secondary, bg: dark },
      { title: 'Tertiary on Dark', fg: tertiary, bg: dark },

      // Neutrals on brand colors — for button text and inverse layouts
      { title: 'Light on Primary', fg: light, bg: primary },
      { title: 'Dark on Primary', fg: dark, bg: primary },
      { title: 'Light on Secondary', fg: light, bg: secondary },
      { title: 'Dark on Secondary', fg: dark, bg: secondary },
      { title: 'Light on Tertiary', fg: light, bg: tertiary },
      { title: 'Dark on Tertiary', fg: dark, bg: tertiary },
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
                  <span className='vk-pill vk-pill--pass'>✓ AAA</span>
                )}
                {v === 'aa' && (
                  <span className='vk-pill vk-pill--pass'>✓ AA</span>
                )}
                {v === 'aa-large' && (
                  <span className='vk-pill vk-pill--warn'>Large only</span>
                )}
                {v === 'fail' && (
                  <span className='vk-pill vk-pill--fail'>Fail</span>
                )}
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
