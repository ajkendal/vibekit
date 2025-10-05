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

  return (
    <section className='card' style={{ marginTop: 16 }}>
      <strong>CSS Variables (:root)</strong>
      <pre
        style={{
          marginTop: 8,
          padding: 12,
          background: '#222222',
          color: '#F0F0F0',
          borderRadius: 10,
          overflow: 'auto',
          maxHeight: 300,
          border: '1px solid #111827',
        }}
      >
        {cssVars}
      </pre>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className='btn' onClick={copy}>
          {isCopied ? 'Copied!' : 'Copy CSS'}
        </button>
      </div>
      <small>
        Paste this into your global <code>:root</code> to adopt your theme.
      </small>
    </section>
  )
}
