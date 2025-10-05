import { useState } from 'react'
import DeleteModal from './DeleteModal'

type Row = { id: string; name?: string; created_at?: number | null }

type Props = {
  apiBase: string
  themes: Row[]
  loading?: boolean
  err?: string | null
  onLoad?: (id: string) => void
  onDuplicate?: (row: Row) => void
  onDelete?: (id: string) => void
}

export default function SavedThemes({
  apiBase,
  themes,
  loading,
  err,
  onLoad,
  onDuplicate,
  onDelete,
}: Props) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [copiedCssId, setCopiedCssId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<{
    id: string
    name: string
  } | null>(null)

  async function load(id: string) {
    if (!onLoad) return
    setBusyId(id)
    try {
      await onLoad(id)
    } finally {
      setBusyId(null)
    }
  }

  async function duplicate(row: Row) {
    if (!onDuplicate) return
    setBusyId(row.id)
    try {
      await onDuplicate(row)
    } finally {
      setBusyId(null)
    }
  }

  function openDeleteModal(id: string, name: string) {
    setSelectedTheme({ id, name })
    setShowModal(true)
  }

  function closeDeleteModal() {
    setShowModal(false)
    setSelectedTheme(null)
  }

  async function handleDeleteConfirm() {
    if (!onDelete || !selectedTheme) return

    setBusyId(selectedTheme.id)
    closeDeleteModal()

    try {
      await onDelete(selectedTheme.id)
    } finally {
      setBusyId(null)
    }
  }

  async function copyCssUrl(id: string) {
    try {
      const url = getCssUrl(id)
      await navigator.clipboard.writeText(url)
      setCopiedCssId(id)
      setTimeout(() => setCopiedCssId(null), 2000)
    } catch {
      alert('Copy failed')
    }
  }

  function getCssUrl(id: string) {
    if (
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1'
    ) {
      return `http://127.0.0.1:61341/themes/${id}/css`
    }
    return `${apiBase}/themes/${id}/css`
  }

  function previewUrl(id: string) {
    if (
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1'
    ) {
      return `http://127.0.0.1:61341/themes/${id}/preview`
    }
    return `${apiBase}/themes/${id}/preview`
  }

  return (
    <section className='card' style={{ marginTop: 16 }}>
      <strong>Saved Themes</strong>
      {loading && <p style={{ marginTop: 8 }}>Loading…</p>}
      {err && <p style={{ marginTop: 8, color: 'crimson' }}>{err}</p>}
      {!loading && (!themes || themes.length === 0) && (
        <p style={{ marginTop: 8, opacity: 0.7 }}>No themes yet</p>
      )}

      <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
        {themes?.map((t) => {
          const busy = busyId === t.id
          const ts = t.created_at
            ? t.created_at > 1e12
              ? t.created_at
              : t.created_at * 1000
            : 0
          const dt = ts ? new Date(ts).toLocaleString() : ''
          return (
            <div
              key={t.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                padding: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ minWidth: 220 }}>
                <div style={{ fontWeight: 600 }}>
                  {t.name || 'Untitled Theme'}
                </div>
                {dt && (
                  <div style={{ fontSize: 12, opacity: 0.65 }}>Saved {dt}</div>
                )}
                <code style={{ fontSize: 11, opacity: 0.6 }}>{t.id}</code>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className='btn'
                  disabled={busy}
                  onClick={() => load(t.id)}
                >
                  {busy ? 'Working…' : 'Load'}
                </button>
                <button
                  className='btn'
                  disabled={busy}
                  onClick={() => duplicate(t)}
                >
                  {busy ? 'Working…' : 'Duplicate'}
                </button>
                <button
                  className='btn'
                  disabled={busy}
                  onClick={() => copyCssUrl(t.id)}
                >
                  {copiedCssId === t.id ? 'Copied!' : 'Copy CSS URL'}
                </button>
                <a
                  className='btn'
                  href={previewUrl(t.id)}
                  target='_blank'
                  rel='noreferrer'
                >
                  Open Preview
                </a>
                <button
                  className='btn'
                  style={{ background: '#ef4444' }}
                  disabled={busy}
                  onClick={() =>
                    openDeleteModal(t.id, t.name || 'Untitled Theme')
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <DeleteModal
        isOpen={showModal}
        themeName={selectedTheme?.name || 'Untitled Theme'}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
      />
    </section>
  )
}
