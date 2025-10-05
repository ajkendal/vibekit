import { useMemo, useState } from 'react'

type Props = {
  value?: string | null
  apiBase: string
  onChange: (url: string) => void
}

export default function BrandLogo({ value, apiBase, onChange }: Props) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const previewSrc = useMemo(() => {
    if (!value) return null
    if (/^https?:\/\//i.test(value)) return value
    const path = value.startsWith('/') ? value : `/${value}`
    return `${apiBase}${path}`
  }, [value, apiBase])

  async function onUploadLogo(file: File) {
    setBusy(true)
    setErr(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${apiBase}/uploads/logo`, {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
      const out = (await res.json()) as { url?: string }
      if (!out?.url) throw new Error('Upload failed: bad response')
      onChange(out.url) // e.g. "/uploads/<id>"
    } catch (e: any) {
      setErr(e.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className='card' style={{ marginTop: 16 }}>
      <strong>Brand Logo</strong>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginTop: 10,
          flexWrap: 'wrap',
        }}
      >
        {previewSrc ? (
          <img
            src={previewSrc}
            alt='Logo'
            style={{
              width: 72,
              height: 72,
              objectFit: 'contain',
              borderRadius: 12,
              border: '1px solid #e5e7eb',
            }}
          />
        ) : (
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              border: '1px dashed #cbd5e1',
              display: 'grid',
              placeItems: 'center',
              fontSize: 12,
              color: '#64748b',
            }}
          >
            no logo
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type='file'
            accept='image/*'
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onUploadLogo(f)
            }}
            disabled={busy}
          />

          {previewSrc && (
            <button
              type='button'
              className='btn'
              onClick={() => onChange('')}
              disabled={busy}
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              Remove Logo
            </button>
          )}
        </div>

        {busy && <span>Uploading…</span>}
        {err && <span style={{ color: 'crimson' }}>{err}</span>}
      </div>
      <small style={{ display: 'block', opacity: 0.7, marginTop: 6 }}>
        PNG / JPG / SVG / WEBP supported.
      </small>
    </section>
  )
}
