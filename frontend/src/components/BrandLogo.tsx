import { useMemo, useState } from 'react'
import { uploadLogo } from '../lib/api'

type Props = {
  value?: string | null
  apiBase: string
  onChange: (url: string) => void
  description?: string
  onDescriptionChange?: (desc: string) => void
}

export default function BrandLogo({
  value,
  apiBase,
  onChange,
  description,
  onDescriptionChange,
}: Props) {
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
      const url = await uploadLogo(file)
      onChange(url)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload failed'
      setErr(msg)
    } finally {
      setBusy(false)
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) onUploadLogo(f)
    // Reset value so picking the same file again still fires onChange
    e.target.value = ''
  }

  return (
    <div className='vk-brand-field'>
      <span className='vk-brand-field-label'>Logo</span>

      <div
        className={`vk-brand-preview ${
          !previewSrc ? 'vk-brand-preview-empty' : ''
        }`}
      >
        {previewSrc ? (
          <img
            src={previewSrc}
            alt='Brand logo preview'
            className='vk-brand-preview-img'
          />
        ) : (
          <div className='vk-brand-empty-text'>
            No logo yet
            <span className='vk-brand-empty-sub'>
              Upload a mark for your theme
            </span>
          </div>
        )}
        {busy && <div className='vk-brand-uploading'>Uploading…</div>}
      </div>

      <div className='vk-brand-actions'>
        <label
          className={`vk-btn vk-btn--primary vk-btn--sm ${
            busy ? 'is-disabled' : ''
          }`}
          style={{ cursor: busy ? 'not-allowed' : 'pointer' }}
        >
          {previewSrc ? 'Replace' : 'Upload logo'}
          <input
            type='file'
            accept='image/png,image/jpeg,image/svg+xml,image/webp'
            onChange={handleFile}
            disabled={busy}
            style={{ display: 'none' }}
          />
        </label>
        {previewSrc && (
          <button
            type='button'
            className='vk-btn vk-btn--text-danger vk-btn--sm'
            onClick={() => onChange('')}
            disabled={busy}
          >
            Remove
          </button>
        )}
      </div>

      <span className='vk-brand-hint'>
        PNG, JPG, SVG, or WebP. Transparent backgrounds work best for both
        light and dark surfaces.
      </span>

      {err && <span className='vk-brand-err'>{err}</span>}

      {onDescriptionChange && (
        <div className='vk-brand-field' style={{ marginTop: 18 }}>
          <span className='vk-brand-field-label'>Description</span>
          <textarea
            className='vk-brand-name'
            value={description ?? ''}
            placeholder='A short one-line summary of this theme'
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={2}
            maxLength={200}
            style={{ resize: 'vertical', minHeight: 36, lineHeight: 1.4 }}
          />
          <span className='vk-brand-name-hint'>
            Shows up in the saved themes list and on the public preview page.
          </span>
        </div>
      )}
    </div>
  )
}
