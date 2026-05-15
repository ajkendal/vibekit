import { useState } from 'react'
import DeleteModal from './DeleteModal'
import { themeCssUrl, themePreviewUrl } from '../lib/api'

type Row = {
  id: string
  name?: string
  description?: string
  created_at?: number | null
}

type Props = {
  apiBase?: string
  themes: Row[]
  loading?: boolean
  err?: string | null
  onLoad?: (id: string) => void
  onDuplicate?: (row: Row) => void
  onDelete?: (id: string) => void
}

/** "5 minutes ago", "2 days ago", or "May 12" for older. */
function relativeTime(ms: number): string {
  const now = Date.now()
  const diff = ms - now
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (abs < 60_000) return rtf.format(Math.round(diff / 1000), 'second')
  if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), 'minute')
  if (abs < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), 'hour')
  if (abs < 7 * 86_400_000)
    return rtf.format(Math.round(diff / 86_400_000), 'day')
  return new Date(ms).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
  })
}

export default function SavedThemes({
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
    const id = selectedTheme.id
    setBusyId(id)
    closeDeleteModal()
    try {
      await onDelete(id)
    } finally {
      setBusyId(null)
    }
  }

  async function copyCssUrl(id: string) {
    try {
      await navigator.clipboard.writeText(themeCssUrl(id))
      setCopiedCssId(id)
      setTimeout(() => setCopiedCssId(null), 2000)
    } catch {
      alert('Copy failed')
    }
  }

  /* ───────── render branches ───────── */

  if (loading) {
    return <div className='vk-saved-status'>Loading…</div>
  }

  if (err) {
    return <span className='vk-brand-err'>{err}</span>
  }

  if (!themes || themes.length === 0) {
    return (
      <div className='vk-saved-empty'>
        <div className='vk-saved-empty-title'>No themes saved yet</div>
        <div className='vk-saved-empty-sub'>
          Save your first theme to load it, share it, or duplicate it later.
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='vk-saved-list'>
        {themes.map((t) => {
          const busy = busyId === t.id
          const ts = t.created_at
            ? t.created_at > 1e12
              ? t.created_at
              : t.created_at * 1000
            : 0
          const when = ts ? relativeTime(ts) : ''

          return (
            <div key={t.id} className='vk-saved-card'>
              <div className='vk-saved-head'>
                <span className='vk-saved-title'>
                  {t.name || 'Untitled Theme'}
                </span>
                <button
                  className='vk-btn vk-btn--primary vk-btn--sm'
                  disabled={busy}
                  onClick={() => load(t.id)}
                >
                  {busy ? 'Loading…' : 'Load'}
                </button>
              </div>
              <div className='vk-saved-meta'>
                {when ? `Saved ${when}` : ' '}
              </div>
              {t.description && (
                <div className='vk-saved-desc'>{t.description}</div>
              )}
              <div className='vk-saved-actions'>
                <button
                  className='vk-btn vk-btn--outline vk-btn--sm'
                  disabled={busy}
                  onClick={() => duplicate(t)}
                >
                  Duplicate
                </button>
                <button
                  className='vk-btn vk-btn--outline vk-btn--sm'
                  disabled={busy}
                  onClick={() => copyCssUrl(t.id)}
                >
                  {copiedCssId === t.id ? '✓ Copied' : 'Copy CSS'}
                </button>
                <a
                  className='vk-btn vk-btn--outline vk-btn--sm'
                  href={themePreviewUrl(t.id)}
                  target='_blank'
                  rel='noreferrer'
                >
                  Preview ↗
                </a>
                <button
                  className='vk-btn vk-btn--text-danger vk-btn--sm vk-saved-actions-end'
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
    </>
  )
}
