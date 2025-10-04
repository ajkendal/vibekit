import { useEffect, useMemo, useState } from 'react'
import ColorControls from './components/ColorControls'
import LivePreview from './components/LivePreview'
import PaletteGenerator from './components/PaletteGenerator'
import FontPicker from './components/FontPicker'
import { useTheme } from './store/theme'

type ThemeRow = { id: string; name?: string; [k: string]: any }

// ───────────────────────── helpers ─────────────────────────

const DEFAULT_API_BASE = (() => {
  const h = location.hostname
  if (h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0')
    return 'http://127.0.0.1:8787'
  return '/api'
})()

async function getJson<T = any>(res: Response | undefined | null): Promise<T> {
  if (!res) throw new Error('Network error: empty response')
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const j = await res.json()
      if ((j as any)?.error) msg = (j as any).error
    } catch {}
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}

function gfParam(
  family: string | undefined,
  weights: number[],
  italic: boolean
) {
  if (!family) return ''
  const ws = (weights && weights.length ? weights : [400, 600, 700]).sort(
    (a, b) => a - b
  )
  if (italic) {
    const pairs = [...ws.map((w) => `0,${w}`), ...ws.map((w) => `1,${w}`)]
    return `${encodeURIComponent(family)}:ital,wght@${pairs.join(';')}`
  }
  return `${encodeURIComponent(family)}:wght@${ws.join(';')}`
}

function themeToCssVars(theme: any) {
  const lines: string[] = []
  const c = theme?.colors || {}
  const t = theme?.typography || {}
  const s = theme?.spacing || {}
  const push = (k: string, v?: string | number) =>
    v != null && lines.push(`${k}: ${v};`)

  ;[
    'neutral_light',
    'neutral_dark',
    'surface',
    'text',
    'primary',
    'secondary',
    'tertiary',
    'warning',
    'danger',
    'caution',
    'success',
  ].forEach((k) => c[k] && push(`--color-${k.replace('_', '-')}`, c[k]))

  if (typeof t.base === 'number') push('--font-base', `${t.base}px`)
  if (typeof t.ratio === 'number') push('--font-ratio', String(t.ratio))
  if (t.headerFont)
    push(
      '--font-header',
      `'${t.headerFont}', system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
    )
  if (t.paragraphFont)
    push(
      '--font-paragraph',
      `'${t.paragraphFont}', system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
    )
  if (typeof s.base === 'number') push('--space-base', `${s.base}px`)

  return `:root{\n  ${lines.join('\n  ')}\n}`
}

// robust id generator for “Save New Theme”
function newId() {
  // @ts-ignore
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    /* @ts-ignore */ return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const displayNameOf = (t: any) =>
  typeof t?.name === 'string' && t.name.trim()
    ? t.name.trim()
    : 'Untitled Theme'

async function fetchArray(url: string): Promise<any[] | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const j = await res.json()
    return Array.isArray(j)
      ? j
      : Array.isArray((j as any)?.results)
      ? (j as any).results
      : []
  } catch {
    return null
  }
}

// Clipboard helpers (robust copy + fallback + feedback)
function canUseClipboard() {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  )
}

async function copyTextStrong(text: string) {
  try {
    if (canUseClipboard()) {
      await navigator.clipboard.writeText(text)
      return true
    }
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', 'true')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    ta.style.pointerEvents = 'none'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    try {
      window.prompt('Copy this URL:', text)
    } catch {}
    return false
  }
}

// ───────────────────────── component ─────────────────────────

export default function App() {
  const { theme, setTheme } = useTheme()

  const [saving, setSaving] = useState(false)
  const [themes, setThemes] = useState<ThemeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [themeName, setThemeName] = useState<string>(theme.name || '')
  const [copied, setCopied] = useState<string | null>(null)

  // ✅ Track which API base actually works; use it everywhere (prevents "Not found" URLs)
  const [apiBase, setApiBase] = useState<string>(DEFAULT_API_BASE)

  useEffect(() => {
    setThemeName(theme.name || '')
  }, [theme.name])

  // Try multiple endpoints so Saved Themes works in dev & prod; remember the working base
  async function fetchThemes() {
    setLoading(true)
    setErr(null)
    const candidates = [
      `${DEFAULT_API_BASE}/themes`,
      'http://127.0.0.1:8787/themes',
      '/api/themes',
    ]
    let results: any[] = []
    for (const u of candidates) {
      const arr = await fetchArray(u)
      if (arr && arr.length) {
        results = arr
        // set apiBase based on the successful candidate
        if (u.endsWith('/themes')) setApiBase(u.replace(/\/themes$/, ''))
        break
      }
    }
    setThemes(results)
    setLoading(false)
  }

  useEffect(() => {
    fetchThemes()
  }, [])

  // Fonts (with italics)
  const headerFamily = theme.typography?.headerFont || 'Inter'
  const headerWeights = theme.typography?.headerWeights || [600, 700]
  const headerItalic = !!theme.typography?.headerItalic

  const paragraphFamily = theme.typography?.paragraphFont || 'Inter'
  const paragraphWeights = theme.typography?.paragraphWeights || [400, 500]
  const paragraphItalic = !!theme.typography?.paragraphItalic

  function setTypography(patch: Partial<typeof theme.typography>) {
    setTheme((prev: any) => ({
      ...prev,
      typography: { ...(prev.typography || {}), ...patch },
    }))
  }

  // Google Fonts link
  useEffect(() => {
    const h = gfParam(headerFamily, headerWeights, headerItalic)
    const p =
      paragraphFamily && paragraphFamily !== headerFamily
        ? gfParam(paragraphFamily, paragraphWeights, paragraphItalic)
        : ''
    const fams = [h, p].filter(Boolean)
    if (!fams.length) return
    const href = `https://fonts.googleapis.com/css2?family=${fams.join(
      '&family='
    )}&display=swap`
    let link = document.getElementById('gf-dynamic') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.id = 'gf-dynamic'
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
    link.href = href
  }, [
    headerFamily,
    headerWeights,
    headerItalic,
    paragraphFamily,
    paragraphWeights,
    paragraphItalic,
  ])

  // 🔵 Italic preview toggle: inject a tiny style so you see italics immediately
  useEffect(() => {
    let style = document.getElementById(
      'vk-italic-style'
    ) as HTMLStyleElement | null
    if (!style) {
      style = document.createElement('style')
      style.id = 'vk-italic-style'
      document.head.appendChild(style)
    }
    const headerRule = headerItalic
      ? 'h1,h2,h3{font-style:italic;}'
      : 'h1,h2,h3{font-style:normal;}'
    const paraRule = paragraphItalic
      ? 'p{font-style:italic;}'
      : 'p{font-style:normal;}'
    style.textContent = `${headerRule}\n${paraRule}`
  }, [headerItalic, paragraphItalic])

  // Save / Update
  async function saveTheme(asNew: boolean) {
    if (saving) return
    setSaving(true)

    const raw = (themeName || theme.name || '').trim()
    const safeName = raw || `Untitled Theme ${new Date().toLocaleDateString()}`

    const body: any = {
      name: safeName,
      logoUrl: theme.logoUrl || null,
      colors: theme.colors || {},
      typography: {
        ...(theme.typography || {}),
        headerFont: headerFamily,
        headerWeights,
        headerItalic,
        paragraphFont: paragraphFamily,
        paragraphWeights,
        paragraphItalic,
      },
      spacing: theme.spacing || {},
    }

    if (asNew) {
      body.id = newId() // NEW row
    } else if (theme.id) {
      body.id = theme.id // update existing
    }

    try {
      const resp = await fetch(`${apiBase}/themes`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const created = await getJson<any>(resp)

      setTheme((prev: any) => ({ ...prev, id: created.id, name: created.name }))
      setThemeName(created.name)
      await fetchThemes()
    } finally {
      setSaving(false)
    }
  }

  async function loadTheme(id: string) {
    const resp = await fetch(`${apiBase}/themes/${id}`)
    const t = await getJson<any>(resp)
    setTheme((prev: any) => ({ ...prev, ...t }))
  }

  // robust copy feedback
  async function handleCopy(text: string, key: string = text) {
    const ok = await copyTextStrong(text)
    if (ok) {
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    }
  }

  // Brand Logo (built-ins + upload)
  const PRIMARY_LOGO = '/brand/vibekit-logo-primary.png'
  const MONO_WHITE = '/brand/vibekit-logo-mono-white.png'
  const MONO_BLACK = '/brand/vibekit-logo-mono-black.png'

  async function onUploadLogo(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    const resp = await fetch(`${apiBase}/uploads/logo`, {
      method: 'POST',
      body: fd,
    })
    const j = await getJson<any>(resp)
    if (j?.url) setTheme((prev: any) => ({ ...prev, logoUrl: j.url }))
  }

  const cssVars = useMemo(
    () =>
      themeToCssVars({
        ...theme,
        typography: {
          ...(theme.typography || {}),
          headerFont: headerFamily,
          headerWeights,
          paragraphFont: paragraphFamily,
          paragraphWeights,
        },
      }),
    [theme, headerFamily, headerWeights, paragraphFamily, paragraphWeights]
  )

  const guard = (fn: () => void) => (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    fn()
  }

  return (
    <div
      className='container'
      style={{ padding: '1rem', maxWidth: 1200, margin: '0 auto' }}
    >
      {/* Theme name */}
      <section className='card' style={{ marginBottom: 16 }}>
        <label htmlFor='themeName'>
          <strong>Theme Name</strong>
        </label>
        <input
          id='themeName'
          placeholder='e.g. Ocean Breeze'
          value={themeName}
          onChange={(e) => {
            const v = e.target.value
            setThemeName(v)
            setTheme((prev: any) => ({ ...prev, name: v }))
          }}
          style={{
            marginTop: 8,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #e5e7eb',
            width: '100%',
            maxWidth: 480,
          }}
        />
      </section>

      {/* Controls + Preview */}
      <section
        className='row'
        style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
      >
        <div className='card' style={{ flex: '1 1 320px' }}>
          <FontPicker
            label='Header Font'
            value={headerFamily}
            weights={headerWeights}
            onChangeFont={(f) =>
              setTypography({ headerFont: f, headerWeights: [] })
            }
            onToggleWeight={(w) => {
              const setW = new Set(headerWeights)
              setW.has(w) ? setW.delete(w) : setW.add(w)
              setTypography({
                headerWeights: Array.from(setW).sort((a, b) => a - b),
              })
            }}
            italic={headerItalic}
            onToggleItalic={() =>
              setTypography({ headerItalic: !headerItalic })
            }
          />
        </div>
        <div className='card' style={{ flex: '1 1 320px' }}>
          <FontPicker
            label='Paragraph Font'
            value={paragraphFamily}
            weights={paragraphWeights}
            onChangeFont={(f) =>
              setTypography({ paragraphFont: f, paragraphWeights: [] })
            }
            onToggleWeight={(w) => {
              const setW = new Set(paragraphWeights)
              setW.has(w) ? setW.delete(w) : setW.add(w)
              setTypography({
                paragraphWeights: Array.from(setW).sort((a, b) => a - b),
              })
            }}
            italic={paragraphItalic}
            onToggleItalic={() =>
              setTypography({ paragraphItalic: !paragraphItalic })
            }
          />
        </div>
        <div className='card' style={{ flex: '1 1 360px' }}>
          <ColorControls />
        </div>
        <LivePreview />
      </section>

      {/* Brand Logo */}
      <section className='card' style={{ marginTop: 16 }}>
        <strong>Brand Logo</strong>
        <div
          className='row'
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <label
            className='chip'
            style={{ display: 'flex', gap: 8, alignItems: 'center' }}
          >
            <input
              type='radio'
              name='logoChoice'
              onChange={() =>
                setTheme((p: any) => ({ ...p, logoUrl: PRIMARY_LOGO }))
              }
              checked={theme.logoUrl === PRIMARY_LOGO}
            />
            <img
              src={PRIMARY_LOGO}
              alt='Primary'
              style={{ width: 24, height: 24, borderRadius: 6 }}
            />
            Primary
          </label>
          <label
            className='chip'
            style={{ display: 'flex', gap: 8, alignItems: 'center' }}
          >
            <input
              type='radio'
              name='logoChoice'
              onChange={() =>
                setTheme((p: any) => ({ ...p, logoUrl: MONO_WHITE }))
              }
              checked={theme.logoUrl === MONO_WHITE}
            />
            <img
              src={MONO_WHITE}
              alt='Mono white'
              style={{ width: 24, height: 24, borderRadius: 6 }}
            />
            Mono – White
          </label>
          <label
            className='chip'
            style={{ display: 'flex', gap: 8, alignItems: 'center' }}
          >
            <input
              type='radio'
              name='logoChoice'
              onChange={() =>
                setTheme((p: any) => ({ ...p, logoUrl: MONO_BLACK }))
              }
              checked={theme.logoUrl === MONO_BLACK}
            />
            <img
              src={MONO_BLACK}
              alt='Mono black'
              style={{ width: 24, height: 24, borderRadius: 6 }}
            />
            Mono – Black
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type='file'
              accept='image/png,image/svg+xml,image/jpeg,image/webp'
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onUploadLogo(f)
              }}
            />
            {theme.logoUrl && (
              <code style={{ fontSize: 12 }}>{theme.logoUrl}</code>
            )}
          </div>
        </div>
        <small>
          Built-in logos live under <code>frontend/public/brand/</code> or
          upload a custom one.
        </small>
      </section>

      {/* CSS Variables + Save */}
      <section className='card' style={{ marginTop: 16 }}>
        <strong>CSS Variables (:root)</strong>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            background: '#0b0f140a',
            padding: 12,
            borderRadius: 8,
            overflow: 'auto',
          }}
        >
          {themeToCssVars({
            ...theme,
            typography: {
              ...(theme.typography || {}),
              headerFont: headerFamily,
              headerWeights,
              paragraphFont: paragraphFamily,
              paragraphWeights,
            },
          })}
        </pre>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type='button'
            className='btn'
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleCopy(
                themeToCssVars({
                  ...theme,
                  typography: {
                    ...(theme.typography || {}),
                    headerFont: headerFamily,
                    headerWeights,
                    paragraphFont: paragraphFamily,
                    paragraphWeights,
                  },
                }),
                '__vars__'
              )
            }}
          >
            {copied === '__vars__' ? 'Copied!' : 'Copy'}
          </button>
          <button
            type='button'
            className='btn'
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              saveTheme(true)
            }}
            disabled={saving}
            title='Create a brand new theme'
          >
            {saving ? 'Saving…' : 'Save New Theme'}
          </button>
          {theme.id && (
            <button
              type='button'
              className='btn'
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                saveTheme(false)
              }}
              disabled={saving}
              title='Update the currently loaded theme'
            >
              {saving ? 'Saving…' : 'Update Current'}
            </button>
          )}
        </div>
      </section>

      {/* Saved Themes */}
      <section className='card' style={{ marginTop: 16 }}>
        <strong>
          Saved Themes <small style={{ opacity: 0.6 }}>({themes.length})</small>
        </strong>

        {loading ? (
          <div style={{ marginTop: 8 }}>Loading…</div>
        ) : err ? (
          <div className='error' style={{ marginTop: 8 }}>
            Failed to load themes: {err}
          </div>
        ) : themes.length === 0 ? (
          <div style={{ marginTop: 8 }}>No themes yet</div>
        ) : (
          <div
            style={{
              marginTop: 8,
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              overflow: 'auto',
              maxHeight: 360,
              background: '#fff',
            }}
          >
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {themes.map((t) => {
                const name = displayNameOf(t)
                const cssUrl = `${apiBase}/themes/${t.id}.css`
                const previewUrl = `${apiBase}/themes/${t.id}/preview`
                return (
                  <li
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      borderBottom: '1px solid #eef2f7',
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {name}
                    </span>

                    <button
                      type='button'
                      className='btn'
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        loadTheme(t.id)
                      }}
                    >
                      Load
                    </button>

                    {/* Duplicate: load then clear id so Save New creates a fresh copy */}
                    <button
                      type='button'
                      className='btn'
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        loadTheme(t.id).then(() => {
                          setTheme((p: any) => ({
                            ...p,
                            id: undefined,
                            name: `${name} (copy)`,
                          }))
                        })
                      }}
                      title='Load as new (clears id so Save New creates a fresh copy)'
                    >
                      Duplicate
                    </button>

                    <button
                      type='button'
                      className='btn'
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleCopy(cssUrl, t.id)
                      }}
                    >
                      {copied === t.id ? 'Copied!' : 'Copy CSS URL'}
                    </button>

                    <a
                      className='btn'
                      href={previewUrl}
                      target='_blank'
                      rel='noreferrer'
                    >
                      Open Preview
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </section>

      {/* Palette generator */}
      <section
        className='row'
        style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
      >
        <PaletteGenerator />
      </section>
    </div>
  )
}
