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
import { useDynamicFonts } from './hooks/useDynamicFonts'
import { useItalicStyle } from './hooks/useItalicStyle'
import {
  getApiBase,
  listThemes,
  getTheme as apiGetTheme,
  saveTheme as apiSaveTheme,
  deleteTheme as apiDeleteTheme,
} from './lib/api'
import { newId, readTypography, themeToCssVars } from './lib/theme'
import type { Theme, ThemeRow } from './types/theme'
import {
  BgColorsOutlined,
  FontSizeOutlined,
  RadiusUprightOutlined,
  FileImageOutlined,
  SaveOutlined,
} from '@ant-design/icons'

/* Re-exported for legacy callers; the canonical implementation lives in lib/theme. */
export { themeToCssVars }

type Category = 'colors' | 'type' | 'spacing' | 'brand' | 'themes'

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'colors', label: 'Colors' },
  { key: 'type', label: 'Typography' },
  { key: 'spacing', label: 'Spacing' },
  { key: 'brand', label: 'Brand' },
  { key: 'themes', label: 'Themes' },
]

export default function App() {
  const { theme, setTheme } = useTheme()
  const [activeCategory, setActiveCategory] = useState<Category>('colors')
  const [themes, setThemes] = useState<ThemeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [themeName, setThemeName] = useState<string>(theme.name || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setThemeName(theme.name || '')
  }, [theme.name])

  async function refreshThemes() {
    setLoading(true)
    setErr(null)
    try {
      const list = await listThemes()
      setThemes(list)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load themes'
      setErr(msg)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    refreshThemes()
  }, [])

  // Read user typography in one place — avoids ten separate `?? default` reads.
  const typo = readTypography(theme.typography)

  useDynamicFonts({
    headerFamily: typo.headerFont,
    headerWeight: typo.headerWeight,
    headerItalic: typo.headerItalic,
    paragraphFamily: typo.paragraphFont,
    paragraphWeight: typo.paragraphWeight,
    paragraphItalic: typo.paragraphItalic,
  })
  useItalicStyle(typo.headerItalic, typo.paragraphItalic)

  async function save(asNew: boolean) {
    if (saving) return
    setSaving(true)
    const raw = (themeName || theme.name || '').trim()
    const safeName = raw || `Untitled Theme ${new Date().toLocaleDateString()}`
    const body: Theme = {
      ...theme,
      name: safeName,
      logoUrl: theme.logoUrl ?? null,
      typography: {
        ...(theme.typography ?? {}),
        headerFont: typo.headerFont,
        headerWeights: [typo.headerWeight],
        headerItalic: typo.headerItalic,
        headerLineHeight: typo.headerLineHeight,
        headerLetterSpacing: typo.headerLetterSpacing,
        paragraphFont: typo.paragraphFont,
        paragraphWeights: [typo.paragraphWeight],
        paragraphItalic: typo.paragraphItalic,
        paragraphLineHeight: typo.paragraphLineHeight,
        paragraphLetterSpacing: typo.paragraphLetterSpacing,
      },
    }
    body.id = asNew || !theme.id ? newId() : theme.id

    try {
      const created = await apiSaveTheme(body)
      setTheme((prev) => ({ ...prev, id: created.id, name: created.name }))
      setThemeName(created.name || '')
      await refreshThemes()
    } finally {
      setSaving(false)
    }
  }

  async function loadTheme(id: string) {
    const t = await apiGetTheme(id)
    setTheme((prev) => ({ ...prev, ...t }))
  }

  async function duplicateTheme(row: ThemeRow) {
    await loadTheme(row.id)
    const name = (row.name || 'Untitled Theme') + ' (copy)'
    setTheme((p) => ({ ...p, id: undefined, name }))
    setThemeName(name)
  }

  async function deleteTheme(id: string) {
    await apiDeleteTheme(id)
    await refreshThemes()
  }

  const cssVars = useMemo(
    () =>
      themeToCssVars({
        ...theme,
        typography: {
          ...(theme.typography ?? {}),
          headerFont: typo.headerFont,
          headerWeights: [typo.headerWeight],
          headerLineHeight: typo.headerLineHeight,
          headerLetterSpacing: typo.headerLetterSpacing,
          paragraphFont: typo.paragraphFont,
          paragraphWeights: [typo.paragraphWeight],
          paragraphLineHeight: typo.paragraphLineHeight,
          paragraphLetterSpacing: typo.paragraphLetterSpacing,
        },
      }),
    [theme, typo]
  )

  const apiBase = getApiBase()
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
              setTheme((prev) => ({ ...prev, name: v }))
            }}
          />
        </div>
        <div className='vk-topbar-actions'>
          {hasCurrent && (
            <button
              className='vk-btn vk-btn--outline vk-btn--sm'
              onClick={() => save(true)}
              disabled={saving}
            >
              Save as new
            </button>
          )}
          <button
            className='vk-btn vk-btn--primary vk-btn--sm'
            onClick={() => save(hasCurrent ? false : true)}
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

      {/* ───────── WORKSPACE ───────── */}
      <main className='vk-workspace'>
        <section className='vk-canvas'>
          <LivePreview apiBase={apiBase} />
          <ContrastChecker />
          <CssVarsPanel cssVars={cssVars} />
        </section>

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
                  family={typo.headerFont}
                  weight={typo.headerWeight}
                  italic={typo.headerItalic}
                  lineHeight={typo.headerLineHeight}
                  letterSpacing={typo.headerLetterSpacing}
                  onChange={(u) => {
                    setTheme((prev) => ({
                      ...prev,
                      typography: {
                        ...(prev.typography ?? {}),
                        ...(u.family !== undefined && { headerFont: u.family }),
                        ...(u.weight !== undefined && {
                          headerWeights: [u.weight],
                        }),
                        ...(u.italic !== undefined && { headerItalic: u.italic }),
                        ...(u.lineHeight !== undefined && {
                          headerLineHeight: u.lineHeight,
                        }),
                        ...(u.letterSpacing !== undefined && {
                          headerLetterSpacing: u.letterSpacing,
                        }),
                      },
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
                  family={typo.paragraphFont}
                  weight={typo.paragraphWeight}
                  italic={typo.paragraphItalic}
                  lineHeight={typo.paragraphLineHeight}
                  letterSpacing={typo.paragraphLetterSpacing}
                  onChange={(u) => {
                    setTheme((prev) => ({
                      ...prev,
                      typography: {
                        ...(prev.typography ?? {}),
                        ...(u.family !== undefined && {
                          paragraphFont: u.family,
                        }),
                        ...(u.weight !== undefined && {
                          paragraphWeights: [u.weight],
                        }),
                        ...(u.italic !== undefined && {
                          paragraphItalic: u.italic,
                        }),
                        ...(u.lineHeight !== undefined && {
                          paragraphLineHeight: u.lineHeight,
                        }),
                        ...(u.letterSpacing !== undefined && {
                          paragraphLetterSpacing: u.letterSpacing,
                        }),
                      },
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
                  setTheme((p) => ({ ...p, logoUrl: url }))
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
