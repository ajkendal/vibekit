import { useMemo, useState } from 'react'

type Format = 'css' | 'tailwind' | 'tokens' | 'scss'

const FORMATS: { key: Format; label: string; hint: string }[] = [
  {
    key: 'css',
    label: 'CSS variables',
    hint: 'Paste into your global :root selector.',
  },
  {
    key: 'tailwind',
    label: 'Tailwind',
    hint: 'Drop into tailwind.config.js under theme.extend.',
  },
  {
    key: 'tokens',
    label: 'Tokens JSON',
    hint: 'W3C Design Tokens — works with Style Dictionary, Figma Tokens.',
  },
  {
    key: 'scss',
    label: 'SCSS',
    hint: 'Import into your Sass build.',
  },
]

type Props = {
  exports: Record<Format, string>
}

export default function CssVarsPanel({ exports }: Props) {
  const [format, setFormat] = useState<Format>('css')
  const [isCopied, setIsCopied] = useState(false)

  const current = exports[format]

  const lineCount = useMemo(
    () => current.split('\n').filter(Boolean).length,
    [current]
  )

  async function copy() {
    try {
      await navigator.clipboard.writeText(current)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      alert('Copy failed')
    }
  }

  const activeHint = FORMATS.find((f) => f.key === format)?.hint ?? ''

  return (
    <section className='vk-section'>
      <div className='vk-section-head'>
        <div>
          <div className='vk-eyebrow'>Export</div>
          <h2 className='vk-section-title'>Drop into your project</h2>
        </div>
        <div className='vk-section-meta'>{lineCount} lines</div>
      </div>

      <div className='vk-tabs' style={{ marginBottom: 14 }}>
        {FORMATS.map((f) => (
          <button
            key={f.key}
            className={`vk-tab ${format === f.key ? 'vk-tab--active' : ''}`}
            onClick={() => setFormat(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <pre className='vk-code-block'>{current}</pre>

      <div className='vk-code-foot'>
        <span className='vk-code-hint'>{activeHint}</span>
        <button
          className={`vk-btn ${
            isCopied ? 'vk-btn--soft' : 'vk-btn--primary'
          } vk-btn--sm`}
          onClick={copy}
        >
          {isCopied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </section>
  )
}
