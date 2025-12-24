import { useEffect, useMemo, useState } from 'react'
import ColorControls from './components/ColorControls'
import LivePreview from './components/LivePreview'
import PaletteGenerator from './components/PaletteGenerator'
import FontPicker from './components/FontPicker'
import SavedThemes from './components/SavedThemes'
import BrandLogo from './components/BrandLogo'
import CssVarsPanel from './components/CssVarsPanel'
import ThemeHeader from './components/ThemeHeader'
import ContrastChecker from './components/ContrastChecker'
import BorderRadius from './components/BorderRadius'
import { useTheme } from './store/theme'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  FontSizeOutlined,
  BgColorsOutlined,
  RadiusUprightOutlined,
  FileImageOutlined,
  SaveOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { Button, Layout, Collapse } from 'antd'

type ThemeRow = { id: string; name?: string; [k: string]: any }
const { Header, Sider, Content } = Layout

const DEFAULT_API_BASE = (() => {
  const h = location.hostname
  // Always use Vite proxy in development to avoid CORS and port issues
  if (h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0') return '/api'
  // Production - use the Worker URL
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

  // ✅ Always include all keys (with defaults if missing)
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

  // Border radius from spacing
  const s = theme?.spacing || {}
  if (typeof s.borderRadius === 'number')
    push('--border-radius', `${s.borderRadius}px`)

  return `:root{\n  ${lines.join('\n  ')}\n}`
}
/* ───────────────────────────────────────────────────────── */

function newId() {
  // @ts-ignore
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    /* @ts-ignore */ return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function App() {
  const { theme, setTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)

  const [apiBase, setApiBase] = useState<string>(DEFAULT_API_BASE)
  const [themes, setThemes] = useState<ThemeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  // Sidebar section expansion state
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'theme-name',
    'typography',
    'colors',
    'brand-logo',
    'border-radius',
    'saved-themes',
  ])

  const toggleSection = (sectionKey: string) => {
    if (collapsed) {
      // If sidebar is collapsed, open it and show only the clicked section
      setCollapsed(false)
      setExpandedSections([sectionKey])
    } else {
      // Normal toggle behavior when sidebar is open
      setExpandedSections((prev) =>
        prev.includes(sectionKey)
          ? prev.filter((key) => key !== sectionKey)
          : [...prev, sectionKey]
      )
    }
  }

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

  // Typography state reads
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

  // Google Fonts
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

  // Italic preview (global)
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

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${!collapsed ? 'visible' : ''}`}
        onClick={() => setCollapsed(true)}
      />

      <Layout className='app-layout'>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={700}
          className='app-sider'
        >
          {/* App Branding Header */}
          <div className='app-branding'>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src='/brand/VibeKit_Logo.svg'
                alt='VibeKit Logo'
                className={`app-logo ${collapsed ? 'collapsed' : 'expanded'}`}
              />
              {!collapsed && (
                <div>
                  <h1 className='app-title'>VibeKit</h1>
                  <p className='app-subtitle'>Theme Builder</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <Button
                type='text'
                icon={<MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className='mobile-collapse-btn'
                style={{ fontSize: '16px' }}
              />
            )}
          </div>

          <div className='sider-content'>
            {/* Theme Name Section */}
            <div className='sidebar-section'>
              <div
                className='section-header'
                onClick={() => toggleSection('theme-name')}
              >
                <FileTextOutlined className='section-icon' />
                {!collapsed && <h3 className='section-title'>Theme Name</h3>}
                {!collapsed && (
                  <RightOutlined
                    className={`section-toggle ${
                      expandedSections.includes('theme-name') ? 'expanded' : ''
                    }`}
                  />
                )}
              </div>
              {!collapsed && expandedSections.includes('theme-name') && (
                <div className='section-content'>
                  <ThemeHeader
                    name={themeName}
                    saving={saving}
                    hasCurrent={!!theme.id}
                    onChange={(v) => {
                      setThemeName(v)
                      setTheme((prev: any) => ({ ...prev, name: v }))
                    }}
                    onSaveNew={() => saveTheme(true)}
                    onSaveUpdate={() => saveTheme(false)}
                  />
                </div>
              )}
            </div>

            {/* Typography Section */}
            <div className='sidebar-section'>
              <div
                className='section-header'
                onClick={() => toggleSection('typography')}
              >
                <FontSizeOutlined className='section-icon' />
                {!collapsed && <h3 className='section-title'>Typography</h3>}
                {!collapsed && (
                  <RightOutlined
                    className={`section-toggle ${
                      expandedSections.includes('typography') ? 'expanded' : ''
                    }`}
                  />
                )}
              </div>
              {!collapsed && expandedSections.includes('typography') && (
                <div className='section-content'>
                  <FontPicker
                    label='Header Font'
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
                      if (u.weight !== undefined)
                        patch.headerWeights = [u.weight]
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

                  <FontPicker
                    label='Paragraph Font'
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
                      if (u.italic !== undefined)
                        patch.paragraphItalic = u.italic
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
              )}
            </div>

            {/* Colors Section */}
            <div className='sidebar-section'>
              <div
                className='section-header'
                onClick={() => toggleSection('colors')}
              >
                <BgColorsOutlined className='section-icon' />
                {!collapsed && <h3 className='section-title'>Colors</h3>}
                {!collapsed && (
                  <RightOutlined
                    className={`section-toggle ${
                      expandedSections.includes('colors') ? 'expanded' : ''
                    }`}
                  />
                )}
              </div>
              {!collapsed && expandedSections.includes('colors') && (
                <div className='section-content'>
                  <ColorControls />
                  <PaletteGenerator />
                </div>
              )}
            </div>

            {/* Border Radius Section */}
            <div className='sidebar-section'>
              <div
                className='section-header'
                onClick={() => toggleSection('border-radius')}
              >
                <RadiusUprightOutlined className='section-icon' />
                {!collapsed && <h3 className='section-title'>Border Radius</h3>}
                {!collapsed && (
                  <RightOutlined
                    className={`section-toggle ${
                      expandedSections.includes('border-radius')
                        ? 'expanded'
                        : ''
                    }`}
                  />
                )}
              </div>
              {!collapsed && expandedSections.includes('border-radius') && (
                <div className='section-content'>
                  <BorderRadius />
                </div>
              )}
            </div>

            {/* Brand Logo Section */}
            <div className='sidebar-section'>
              <div
                className='section-header'
                onClick={() => toggleSection('brand-logo')}
              >
                <FileImageOutlined className='section-icon' />
                {!collapsed && <h3 className='section-title'>Brand Logo</h3>}
                {!collapsed && (
                  <RightOutlined
                    className={`section-toggle ${
                      expandedSections.includes('brand-logo') ? 'expanded' : ''
                    }`}
                  />
                )}
              </div>
              {!collapsed && expandedSections.includes('brand-logo') && (
                <div className='section-content'>
                  <BrandLogo
                    value={theme.logoUrl}
                    apiBase={apiBase}
                    onChange={(url) =>
                      setTheme((p: any) => ({ ...p, logoUrl: url }))
                    }
                  />
                </div>
              )}
            </div>

            {/* Saved Themes Section */}
            <div className='sidebar-section'>
              <div
                className='section-header'
                onClick={() => toggleSection('saved-themes')}
              >
                <SaveOutlined className='section-icon' />
                {!collapsed && <h3 className='section-title'>Saved Themes</h3>}
                {!collapsed && (
                  <RightOutlined
                    className={`section-toggle ${
                      expandedSections.includes('saved-themes')
                        ? 'expanded'
                        : ''
                    }`}
                  />
                )}
              </div>
              {!collapsed && expandedSections.includes('saved-themes') && (
                <div className='section-content'>
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
            </div>
          </div>
        </Sider>

        <Layout>
          <Header className='app-header'>
            <Button
              type='text'
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className={`header-toggle ${
                !collapsed ? 'hidden-when-open' : ''
              }`}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
          </Header>

          <Content className='app-content'>
            <div className='content-container'>
              {/* Live Preview */}
              <LivePreview apiBase={apiBase} />

              {/* Contrast Checker */}
              <ContrastChecker />

              {/* CSS Vars Panel */}
              <CssVarsPanel cssVars={cssVars} />
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  )
}
