import { useEffect, useMemo, useState } from 'react'
import ColorControls from './components/ColorControls'
import LivePreview from './components/LivePreview'
import PaletteGenerator from './components/PaletteGenerator'
import FontPicker from './components/FontPicker'
import SavedThemes from './components/SavedThemes'
import BrandLogo from './components/BrandLogo'
import CssVarsPanel from './components/CssVarsPanel'
import ContrastChecker from './components/ContrastChecker'
import BorderRadius from './components/BorderRadius'
import { useTheme } from './store/theme'
import {
  BgColorsOutlined,
  FontSizeOutlined,
  RadiusUprightOutlined,
  FileImageOutlined,
  SaveOutlined,
} from '@ant-design/icons'

type ThemeRow = { id: string; name?: string; [k: string]: any }

type Category = 'colors' | 'type' | 'spacing' | 'brand' | 'themes'

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'colors', label: 'Colors' },
  { key: 'type', label: 'Typography' },
  { key: 'spacing', label: 'Spacing' },
  { key: 'brand', label: 'Brand' },
  { key: 'themes', label: 'Themes' },
]

const DEFAULT_API_BASE = (() => {
  const h = location.hostname
  if (h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0') return '/api'
  return 'https://vibekit-api.ajkendal-openai.workers.dev'
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
  const ws = (weights && weights.length ? weights : [400]).sort((a, b) => a - b)
  if (italic) {
    const pairs = [...ws.map((w) => `0,${w}`), ...ws.map((w) => `1,${w}`)]
    return `${encodeURIComponent(family)}:ital,wght@${pairs.join(';')}`
  }
  return `${encodeURIComponent(family)}:wght@${ws.join(';')}`
}

function formatHex(hex: string) {
  const h = (hex || '').toLowerCase()
  return h.startsWith('#') ? h : `#${h}`
}

export function themeToCssVars(theme: any) {
  const c = theme?.colors || {}
  const t = theme?.typography || {}
  const lines: string[] = []
  const push = (k: string, v?: string | number) =>
    v != null && lines.push(`${k}: ${v};`)

  const DEFAULTS: Record<string, string> = {
    neutral_light: '#ffffff',
    neutral_mid: '#6b7280',
    neutral_dark: '#000000',
    primary: '#2563eb',
    secondary: '#3b82f6',
    tertiary: '#9333ea',
    danger: '#ef4444',
    warning: '#f59e0b',
    caution: '#f97316',
    success: '#10b981',
  }
  const KEYS = Object.keys(DEFAULTS)

  KEYS.forEach((k) => {
    const hex = (c as any)[k] ?? DEFAULTS[k]
    push(`--color-${k.replace('_', '-')}`, formatHex(hex))
  })

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
  if (typeof t.headerLineHeight === 'number')
    push('--line-height-header', String(t.headerLineHeight))
  if (typeof t.paragraphLineHeight === 'number')
    push('--line-height-paragraph', String(t.paragraphLineHeight))
  if (typeof t.headerLetterSpacing === 'number')
    push('--letter-spacing-header', `${t.headerLetterSpacing}em`)
  if (typeof t.paragraphLetterSpacing === 'number')
    push('--letter-spacing-paragraph', `${t.paragraphLetterSpacing}em`)

  const s = theme?.spacing || {}
  if (typeof s.borderRadius === 'number')
    push('--border-radius', `${s.borderRadius}px`)

  return `:root{\n  ${lines.join('\n  ')}\n}`
}

function newId() {
  // @ts-ignore
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    /* @ts-ignore */ return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function App() {
  const { theme, setTheme } = useTheme()

  const [activeCategory, setActiveCategory] = useState<Category>('colors')
  const [apiBase, setApiBase] = useState<string>(DEFAULT_API_BASE)
  const [themes, setThemes] = useState<ThemeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const [themeName, setThemeName] = useState<string>(theme.name || '')
  useEffect(() => {
    setThemeName(theme.name || '')
  }, [theme.name])

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
      try {
        const res = await fetch(u)
        if (!res.ok) continue
        const j = await res.json()
        if (Array.isArray(j)) {
          if (u.endsWith('/themes')) setApiBase(u.replace(/\/themes$/, ''))
          results = j
          break
        }
      } catch {}
    }
    setThemes(results)
    setLoading(false)
  }
  useEffect(() => {
    fetchThemes()
  }, [])

  // Typography reads (used for Google Fonts loading + save payload)
  const headerFamily = theme.typography?.headerFont || 'Inter'
  const headerWeight =
    (theme.typography?.headerWeights?.[0] as number | undefined) ?? 400
  const headerItalic = !!theme.typography?.headerItalic
  const headerLH =
    (theme.typography?.headerLineHeight as number | undefined) ?? 1.25
  const headerLS =
    (theme.typography?.headerLetterSpacing as number | undefined) ?? 0

  const paragraphFamily = theme.typography?.paragraphFont || 'Inter'
  const paragraphWeight =
    (theme.typography?.paragraphWeights?.[0] as number | undefined) ?? 400
  const paragraphItalic = !!theme.typography?.paragraphItalic
  const paragraphLH =
    (theme.typography?.paragraphLineHeight as number | undefined) ?? 1.6
  const paragraphLS =
    (theme.typography?.paragraphLetterSpacing as number | undefined) ?? 0

  // Google Fonts dynamic loader
  useEffect(() => {
    const h = gfParam(headerFamily, [headerWeight], headerItalic)
    const p =
      paragraphFamily && paragraphFamily !== headerFamily
        ? gfParam(paragraphFamily, [paragraphWeight], paragraphItalic)
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
    headerWeight,
    headerItalic,
    paragraphFamily,
    paragraphWeight,
    paragraphItalic,
  ])

  // Italic preview style injection (for h1/h2/h3 + p)
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
  const [saving, setSaving] = useState(false)
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
        headerWeights: [headerWeight],
        headerItalic,
        headerLineHeight: headerLH,
        headerLetterSpacing: headerLS,
        paragraphFont: paragraphFamily,
        paragraphWeights: [paragraphWeight],
        paragraphItalic,
        paragraphLineHeight: paragraphLH,
        paragraphLetterSpacing: paragraphLS,
      },
      spacing: theme.spacing || {},
    }
    if (asNew) body.id = newId()
    else if (theme.id) body.id = theme.id

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

  function duplicateTheme(row: ThemeRow) {
    loadTheme(row.id).then(() => {
      const name = (row.name || 'Untitled Theme') + ' (copy)'
      setTheme((p: any) => ({ ...p, id: undefined, name }))
      setThemeName(name)
    })
  }

  async function deleteTheme(id: string) {
    try {
      const r = await fetch(`${apiBase}/themes/${id}`, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
      })
      if (r.ok) {
        await fetchThemes()
        return
      }
    } catch {}
    const r2 = await fetch(`${apiBase}/themes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, _action: 'delete' }),
    })
    if (!r2.ok) {
      let msg = 'Failed to delete theme'
      try {
        const j = await r2.json()
        if (j?.error) msg = j.error
      } catch {}
      throw new Error(msg)
    }
    await fetchThemes()
  }

  const cssVars = useMemo(
    () =>
      themeToCssVars({
        ...theme,
        typography: {
          ...(theme.typography || {}),
          headerFont: headerFamily,
          headerWeights: [headerWeight],
          headerLineHeight: headerLH,
          headerLetterSpacing: headerLS,
          paragraphFont: paragraphFamily,
          paragraphWeights: [paragraphWeight],
          paragraphLineHeight: paragraphLH,
          paragraphLetterSpacing: paragraphLS,
        },
      }),
    [
      theme,
      headerFamily,
      headerWeight,
      headerLH,
      headerLS,
      paragraphFamily,
      paragraphWeight,
      paragraphLH,
      paragraphLS,
    ]
  )

  const hasCurrent = !!theme.id

  return (
    <div className='vk-app'>
      {/* ───────── TOP BAR ───────── */}
      <header className='vk-topbar'>
        <div className='vk-topbar-brand'>
          <img
            src='/brand/VibeKit_Mark.svg'
            alt='VibeKit'
            className='vk-topbar-mark'
          />
          <h1 className='vk-topbar-wordmark'>VibeKit</h1>
          <div className='vk-topbar-divider' />
          <input
            className='vk-topbar-name'
            type='text'
            value={themeName}
            placeholder='Untitled theme'
            onChange={(e) => {
              const v = e.target.value
              setThemeName(v)
              setTheme((prev: any) => ({ ...prev, name: v }))
            }}
          />
        </div>
        <div className='vk-topbar-actions'>
          {hasCurrent && (
            <button
              className='vk-btn vk-btn--outline vk-btn--sm'
              onClick={() => saveTheme(true)}
              disabled={saving}
            >
              Save as new
            </button>
          )}
          <button
            className='vk-btn vk-btn--primary vk-btn--sm'
            onClick={() => saveTheme(hasCurrent ? false : true)}
            disabled={saving}
          >
            {saving ? 'Saving…' : hasCurrent ? 'Save' : 'Save theme'}
          </button>
        </div>
      </header>

      {/* ───────── CATEGORY TABS ───────── */}
      <nav className='vk-categorybar'>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            className={`vk-category ${
              activeCategory === c.key ? 'vk-category--active' : ''
            }`}
            onClick={() => setActiveCategory(c.key)}
          >
            {c.label}
          </button>
        ))}
      </nav>

      {/* ───────── WORKSPACE: canvas + controls ───────── */}
      <main className='vk-workspace'>
        {/* LEFT: canvas (preview / contrast / vars) */}
        <section className='vk-canvas'>
          <LivePreview apiBase={apiBase} />
          <ContrastChecker />
          <CssVarsPanel cssVars={cssVars} />
        </section>

        {/* RIGHT: contextual controls */}
        <aside className='vk-controls'>
          {activeCategory === 'colors' && (
            <>
              <div className='vk-control-card'>
                <div className='vk-control-card-head'>
                  <span className='vk-control-card-icon'>
                    <BgColorsOutlined />
                  </span>
                  <h3 className='vk-control-card-title'>Color tokens</h3>
                </div>
                <ColorControls />
              </div>
              <div className='vk-control-card'>
                <div className='vk-control-card-head'>
                  <span className='vk-control-card-icon'>
                    <BgColorsOutlined />
                  </span>
                  <h3 className='vk-control-card-title'>Palette generator</h3>
                </div>
                <PaletteGenerator />
              </div>
            </>
          )}

          {activeCategory === 'type' && (
            <>
              <div className='vk-control-card'>
                <div className='vk-control-card-head'>
                  <span className='vk-control-card-icon'>
                    <FontSizeOutlined />
                  </span>
                  <h3 className='vk-control-card-title'>Header font</h3>
                </div>
                <FontPicker
                  label=''
                  family={theme.typography?.headerFont || 'Inter'}
                  weight={
                    (theme.typography?.headerWeights?.[0] as
                      | number
                      | undefined) ?? 400
                  }
                  italic={!!theme.typography?.headerItalic}
                  lineHeight={
                    (theme.typography?.headerLineHeight as
                      | number
                      | undefined) ?? 1.25
                  }
                  letterSpacing={
                    (theme.typography?.headerLetterSpacing as
                      | number
                      | undefined) ?? 0
                  }
                  onChange={(u) => {
                    const patch: any = {}
                    if (u.family !== undefined) patch.headerFont = u.family
                    if (u.weight !== undefined) patch.headerWeights = [u.weight]
                    if (u.italic !== undefined) patch.headerItalic = u.italic
                    if (u.lineHeight !== undefined)
                      patch.headerLineHeight = u.lineHeight
                    if (u.letterSpacing !== undefined)
                      patch.headerLetterSpacing = u.letterSpacing
                    setTheme((prev: any) => ({
                      ...prev,
                      typography: { ...(prev.typography || {}), ...patch },
                    }))
                  }}
                />
              </div>

              <div className='vk-control-card'>
                <div className='vk-control-card-head'>
                  <span className='vk-control-card-icon'>
                    <FontSizeOutlined />
                  </span>
                  <h3 className='vk-control-card-title'>Paragraph font</h3>
                </div>
                <FontPicker
                  label=''
                  family={theme.typography?.paragraphFont || 'Inter'}
                  weight={
                    (theme.typography?.paragraphWeights?.[0] as
                      | number
                      | undefined) ?? 400
                  }
                  italic={!!theme.typography?.paragraphItalic}
                  lineHeight={
                    (theme.typography?.paragraphLineHeight as
                      | number
                      | undefined) ?? 1.6
                  }
                  letterSpacing={
                    (theme.typography?.paragraphLetterSpacing as
                      | number
                      | undefined) ?? 0
                  }
                  onChange={(u) => {
                    const patch: any = {}
                    if (u.family !== undefined) patch.paragraphFont = u.family
                    if (u.weight !== undefined)
                      patch.paragraphWeights = [u.weight]
                    if (u.italic !== undefined) patch.paragraphItalic = u.italic
                    if (u.lineHeight !== undefined)
                      patch.paragraphLineHeight = u.lineHeight
                    if (u.letterSpacing !== undefined)
                      patch.paragraphLetterSpacing = u.letterSpacing
                    setTheme((prev: any) => ({
                      ...prev,
                      typography: { ...(prev.typography || {}), ...patch },
                    }))
                  }}
                />
              </div>
            </>
          )}

          {activeCategory === 'spacing' && (
            <div className='vk-control-card'>
              <div className='vk-control-card-head'>
                <span className='vk-control-card-icon'>
                  <RadiusUprightOutlined />
                </span>
                <h3 className='vk-control-card-title'>Border radius</h3>
              </div>
              <BorderRadius />
            </div>
          )}

          {activeCategory === 'brand' && (
            <div className='vk-control-card'>
              <div className='vk-control-card-head'>
                <span className='vk-control-card-icon'>
                  <FileImageOutlined />
                </span>
                <h3 className='vk-control-card-title'>Brand logo</h3>
              </div>
              <BrandLogo
                value={theme.logoUrl}
                apiBase={apiBase}
                onChange={(url) =>
                  setTheme((p: any) => ({ ...p, logoUrl: url }))
                }
              />
            </div>
          )}

          {activeCategory === 'themes' && (
            <div className='vk-control-card'>
              <div className='vk-control-card-head'>
                <span className='vk-control-card-icon'>
                  <SaveOutlined />
                </span>
                <h3 className='vk-control-card-title'>Saved themes</h3>
              </div>
              <SavedThemes
                apiBase={apiBase}
                themes={themes}
                loading={loading}
                err={err}
                onLoad={loadTheme}
                onDuplicate={duplicateTheme}
                onDelete={deleteTheme}
              />
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}
