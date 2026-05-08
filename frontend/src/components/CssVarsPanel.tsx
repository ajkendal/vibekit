import { useState } from 'react'

type Props = {
  cssVars: string
}

export default function CssVarsPanel({ cssVars }: Props) {
  const [isCopied, setIsCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(cssVars)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      alert('Copy failed')
    }
  }

  // Count tokens for the meta line
  const tokenCount = (cssVars.match(/^\s*--/gm) || []).length

  return (
    <section className='vk-section'>
      <div className='vk-section-head'>
        <div>
          <div className='vk-eyebrow'>CSS variables</div>
          <h2 className='vk-section-title'>Drop into your :root</h2>
        </div>
        <div className='vk-section-meta'>{tokenCount} tokens</div>
      </div>

      <pre className='vk-code-block'>{cssVars}</pre>

      <div className='vk-code-foot'>
        <span className='vk-code-hint'>
          Paste this into your global <code>:root</code> to adopt your theme.
        </span>
        <button
          className={`vk-btn ${isCopied ? 'vk-btn--soft' : 'vk-btn--primary'} vk-btn--sm`}
          onClick={copy}
        >
          {isCopied ? '✓ Copied' : 'Copy CSS'}
        </button>
      </div>
    </section>
  )
}
