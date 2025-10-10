import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../store/theme'

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex || typeof hex !== 'string') return null
  const m = hex.trim().match(/^#?([a-f\d]{3}|[a-f\d]{6})$/i)
  if (!m) return null
  let h = m[1]
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  const num = parseInt(h, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

function textOn(bg: string, fallback = '#ffffff'): string {
  const rgb = hexToRgb(bg)
  if (!rgb) return fallback
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return yiq >= 186 ? '#111111' : '#ffffff'
}

function resolveLogoForUI(
  raw: string | null | undefined,
  apiBase: string
): string {
  const uiOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://vibekit.pages.dev'
  const val = (raw || '').trim()
  if (!val) return ''
  const low = val.toLowerCase()
  if (
    low.startsWith('http://') ||
    low.startsWith('https://') ||
    low.startsWith('data:')
  )
    return val
  if (val.startsWith('/uploads/')) return `${apiBase}${val}`
  if (val.startsWith('uploads/')) return `${apiBase}/${val}`
  if (val.startsWith('/brand/')) return `${uiOrigin}${val}`
  if (val.startsWith('brand/')) return `${uiOrigin}/${val}`
  if (val.startsWith('/')) return `${uiOrigin}${val}`
  return val
}

type Props = { apiBase: string }

export default function LivePreview({ apiBase }: Props) {
  const { theme } = useTheme() as { theme: any }

  const colors = theme?.colors || {}
  const logoUrlResolved = resolveLogoForUI(theme?.logoUrl, apiBase)
  const borderRadius = theme?.spacing?.borderRadius ?? 12

  const headerFont = theme?.typography?.headerFont || 'Inter'
  const headerWeight =
    (theme?.typography?.headerWeights?.[0] as number | undefined) ?? 400
  const headerItalic = !!theme?.typography?.headerItalic
  const headerLH =
    (theme?.typography?.headerLineHeight as number | undefined) ?? 1.25
  const headerLS =
    (theme?.typography?.headerLetterSpacing as number | undefined) ?? 0

  const paragraphFont = theme?.typography?.paragraphFont || 'Inter'
  const paragraphWeight =
    (theme?.typography?.paragraphWeights?.[0] as number | undefined) ?? 400
  const paragraphItalic = !!theme?.typography?.paragraphItalic
  const paragraphLH =
    (theme?.typography?.paragraphLineHeight as number | undefined) ?? 1.6
  const paragraphLS =
    (theme?.typography?.paragraphLetterSpacing as number | undefined) ?? 0

  const bg = colors.neutral_light || '#ffffff'
  const fg = colors.neutral_dark || '#111111'

  const [imgSrc, setImgSrc] = useState<string>(logoUrlResolved)
  useEffect(() => {
    setImgSrc(logoUrlResolved)
  }, [logoUrlResolved])

  const chips = useMemo(
    () =>
      (
        [
          'primary',
          'secondary',
          'tertiary',
          'danger',
          'warning',
          'caution',
          'success',
        ] as const
      ).map((k) => {
        const bgc = colors[k] || '#9ca3af'
        return { key: k, bg: bgc, fg: textOn(bgc) }
      }),
    [colors]
  )

  const fallback = () => {
    return (
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '6px',
          border: '1px dashed #cbd5e1',
          display: 'grid',
          placeItems: 'center',
          fontSize: 12,
          color: '#64748b',
        }}
      >
        no logo
      </div>
    )
  }

  return (
    <section className='card' style={{ flex: '1 1 420px' }}>
      <strong>Live Preview</strong>
      <div
        style={{
          marginTop: 8,
          padding: 16,
          borderRadius: `${borderRadius}px`,
          background: bg,
          color: fg,
          border: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
          }}
        >
          {imgSrc && imgSrc !== '' ? (
            <img
              src={imgSrc}
              alt='logo'
              style={{ height: 28 }}
              onError={() => {
                console.log('Image failed to load:', imgSrc)
                // Image failed, show the fallback component instead
                setImgSrc('')
              }}
            />
          ) : (
            fallback()
          )}
          <span style={{ opacity: 0.7, fontSize: 12 }}>
            {theme?.name || 'Untitled Theme'}
          </span>
        </div>

        <h2
          style={{
            margin: '8px 0',
            fontFamily: `'${headerFont}', system-ui, -apple-system, Segoe UI, Roboto, sans-serif`,
            fontWeight: headerWeight,
            fontStyle: headerItalic ? 'italic' : 'normal',
            lineHeight: headerLH,
            letterSpacing: `${headerLS}em`,
          }}
        >
          The Quick Brown Fox
        </h2>

        <p
          style={{
            margin: '6px 0 12px',
            fontFamily: `'${paragraphFont}', system-ui, -apple-system, Segoe UI, Roboto, sans-serif`,
            fontWeight: paragraphWeight,
            fontStyle: paragraphItalic ? 'italic' : 'normal',
            lineHeight: paragraphLH,
            letterSpacing: `${paragraphLS}em`,
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
          habitant morbi tristique senectus et netus et malesuada fames ac
          turpis egestas.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 12,
          }}
        >
          {chips.map((c) => (
            <span
              key={c.key}
              style={{
                padding: '6px 10px',
                borderRadius: `${borderRadius}px`,
                fontSize: 12,
                background: c.bg,
                color: c.fg,
                border: '1px solid rgba(0,0,0,.06)',
                textTransform: 'capitalize',
              }}
              title={c.key}
            >
              {c.key}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            style={{
              padding: '8px 12px',
              borderRadius: `${borderRadius}px`,
              border: 'none',
              background: colors.primary || '#2563eb',
              color: textOn(colors.primary || '#2563eb'),
              cursor: 'pointer',
            }}
          >
            Primary Button
          </button>
          <button
            style={{
              padding: '8px 12px',
              borderRadius: `${borderRadius}px`,
              border: '1px solid #e5e7eb',
              background: 'transparent',
              color: fg,
              cursor: 'pointer',
            }}
          >
            Secondary Button
          </button>
          <a
            href='#'
            onClick={(e) => e.preventDefault()}
            style={{
              alignSelf: 'center',
              color: colors.secondary || '#6b7280',
              textDecoration: 'underline',
            }}
          >
            Link example
          </a>
        </div>
      </div>
    </section>
  )
}
