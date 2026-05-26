import { useEffect, useState } from 'react'
import { useTheme } from '../store/theme'
import { rgba, textOn } from '../lib/color'
import { Icon } from './Icon'
import { SHOWCASE_ICONS } from '../lib/icons'

/* ───────── helpers ───────── */

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

/* ───────── component ───────── */

type View = 'both' | 'web' | 'mobile'
type Props = { apiBase: string }

export default function LivePreview({ apiBase }: Props) {
  const { theme } = useTheme() as { theme: any }
  const [view, setView] = useState<View>('both')

  const colors = theme?.colors || {}
  const radius = theme?.spacing?.borderRadius ?? 12
  const t = theme?.typography || {}

  const headerFamily = `'${t.headerFont || 'Inter'}', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
  const paragraphFamily = `'${t.paragraphFont || 'Inter'}', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
  const headerItalic = !!t.headerItalic
  const paragraphItalic = !!t.paragraphItalic

  // user-tunable header style (used on the hero text in each mockup)
  const headerHero = {
    fontFamily: headerFamily,
    fontStyle: headerItalic ? 'italic' : 'normal',
    fontWeight: (t.headerWeights?.[0] as number | undefined) ?? 700,
    lineHeight: (t.headerLineHeight as number | undefined) ?? 1.15,
    letterSpacing: `${(t.headerLetterSpacing as number | undefined) ?? -0.02}em`,
  } as const

  // simpler header style for sub-headings (size/weight comes from the mockup, family from user)
  const fH = {
    fontFamily: headerFamily,
    fontStyle: headerItalic ? 'italic' : 'normal',
  } as const
  const fP = {
    fontFamily: paragraphFamily,
    fontStyle: paragraphItalic ? 'italic' : 'normal',
  } as const

  const primary = colors.primary || '#8338EC'
  const secondary = colors.secondary || '#3A86FF'
  const tertiary = colors.tertiary || '#FB5607'
  const success = colors.success || '#06D6A0'
  const warning = colors.warning || '#F4A261'
  const danger = colors.danger || '#E63946'
  const ink = colors.neutral_dark || '#1A1A1A'
  const canvas = colors.neutral_light || '#FFFFFF'
  const muted = colors.neutral_mid || '#6B7280'

  const onPrimary = textOn(primary)
  const onSecondary = textOn(secondary)

  const logoUrlResolved = resolveLogoForUI(theme?.logoUrl, apiBase)
  const [imgSrc, setImgSrc] = useState<string>(logoUrlResolved)
  useEffect(() => {
    setImgSrc(logoUrlResolved)
  }, [logoUrlResolved])

  const themeName = theme?.name || 'Untitled'
  const previewHref =
    theme?.id ? `${apiBase}/themes/${theme.id}/preview` : '#'

  /* ───────── WEB MOCKUP ───────── */
  const WebMockup = (
    <div
      style={{
        background: canvas,
        borderRadius: 10,
        overflow: 'hidden',
        border: `0.5px solid ${rgba(ink, 0.08)}`,
        color: ink,
      }}
    >
      {/* browser chrome */}
      <div
        style={{
          background: rgba(ink, 0.04),
          padding: '7px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          borderBottom: `0.5px solid ${rgba(ink, 0.06)}`,
        }}
      >
        <div style={{ width: 7, height: 7, background: rgba(ink, 0.18), borderRadius: '50%' }} />
        <div style={{ width: 7, height: 7, background: rgba(ink, 0.18), borderRadius: '50%' }} />
        <div style={{ width: 7, height: 7, background: rgba(ink, 0.18), borderRadius: '50%' }} />
        <div
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            fontSize: 10,
            color: rgba(ink, 0.45),
            marginLeft: 8,
          }}
        >
          app.{(themeName || 'untitled').toString().toLowerCase().replace(/\s+/g, '-')}.com
        </div>
      </div>

      {/* top nav */}
      <div
        style={{
          padding: '11px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `0.5px solid ${rgba(ink, 0.06)}`,
        }}
      >
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {imgSrc ? (
              <img
                src={imgSrc}
                alt=''
                style={{ width: 20, height: 20, objectFit: 'contain' }}
                onError={() => setImgSrc('')}
              />
            ) : (
              <div
                style={{
                  width: 20,
                  height: 20,
                  background: primary,
                  borderRadius: Math.min(radius, 6),
                }}
              />
            )}
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: ink,
                letterSpacing: '-0.02em',
                ...fH,
              }}
            >
              {themeName}
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              color: primary,
              fontWeight: 600,
              paddingBottom: 2,
              borderBottom: `1.5px solid ${primary}`,
            }}
          >
            Dashboard
          </div>
          <div style={{ fontSize: 11, color: rgba(ink, 0.55), fontWeight: 500 }}>Reports</div>
          <div style={{ fontSize: 11, color: rgba(ink, 0.55), fontWeight: 500 }}>Settings</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div
            style={{
              padding: '5px 12px',
              background: primary,
              color: onPrimary,
              borderRadius: Math.min(radius, 8),
              fontSize: 11,
              fontWeight: 600,
              ...fH,
            }}
          >
            + New
          </div>
          <div
            style={{
              width: 24,
              height: 24,
              background: secondary,
              borderRadius: '50%',
              color: onSecondary,
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            M
          </div>
        </div>
      </div>

      {/* content area: sidebar + main */}
      <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', minHeight: 280 }}>
        {/* sidebar */}
        <div
          style={{
            background: rgba(ink, 0.025),
            padding: '14px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            borderRight: `0.5px solid ${rgba(ink, 0.06)}`,
          }}
        >
          {(
            [
              { label: 'Overview', icon: 'grid', active: true },
              { label: 'Customers', icon: 'users', active: false },
              { label: 'Orders', icon: 'shoppingBag', active: false },
              { label: 'Products', icon: 'package', active: false },
              { label: 'Analytics', icon: 'barChart', active: false },
            ] as const
          ).map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 10px',
                background: item.active ? rgba(primary, 0.12) : 'transparent',
                color: item.active ? primary : rgba(ink, 0.7),
                borderRadius: Math.min(radius, 8),
                fontSize: 11,
                fontWeight: item.active ? 600 : 500,
                ...fP,
              }}
            >
              <Icon name={item.icon} size={12} strokeWidth={2} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* main content */}
        <div style={{ padding: '16px 20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 12,
            }}
          >
            <h1
              style={{
                fontSize: 20,
                margin: 0,
                color: ink,
                ...headerHero,
              }}
            >
              Good morning
            </h1>
            <div style={{ fontSize: 10, color: rgba(ink, 0.5), ...fP }}>May 5, 2026</div>
          </div>

          {/* stat cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: 8,
              marginBottom: 12,
            }}
          >
            {[
              { label: 'Revenue', val: '$12,840', delta: '↗ 12%', color: success },
              { label: 'Customers', val: '3,492', delta: '↗ 4%', color: success },
              { label: 'Bounce', val: '24.1%', delta: '↘ 3%', color: danger },
              { label: 'Avg session', val: '3:42', delta: '— flat', color: muted },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: rgba(ink, 0.03),
                  borderRadius: Math.min(radius, 8),
                  padding: 10,
                }}
              >
                <div style={{ fontSize: 9, color: rgba(ink, 0.6), fontWeight: 500, ...fP }}>
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: ink,
                    lineHeight: 1.1,
                    marginTop: 2,
                    ...fH,
                  }}
                >
                  {s.val}
                </div>
                <div style={{ fontSize: 9, color: s.color, fontWeight: 600, marginTop: 3, ...fP }}>
                  {s.delta}
                </div>
              </div>
            ))}
          </div>

          {/* table */}
          <div
            style={{
              background: canvas,
              border: `0.5px solid ${rgba(ink, 0.08)}`,
              borderRadius: Math.min(radius, 8),
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 80px',
                padding: '7px 12px',
                background: rgba(ink, 0.03),
                fontSize: 9,
                fontWeight: 600,
                color: rgba(ink, 0.55),
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                ...fP,
              }}
            >
              <div>Customer</div>
              <div>Amount</div>
              <div>Status</div>
            </div>
            {[
              { name: 'Sara Chen', amt: '$240.00', label: 'paid', color: success },
              { name: 'Jordan Park', amt: '$48.50', label: 'pending', color: warning },
              { name: 'Mike Alvarez', amt: '$120.00', label: 'failed', color: danger },
            ].map((r) => (
              <div
                key={r.name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 80px 80px',
                  padding: '8px 12px',
                  borderTop: `0.5px solid ${rgba(ink, 0.06)}`,
                  fontSize: 11,
                  alignItems: 'center',
                  ...fP,
                }}
              >
                <div style={{ fontWeight: 600, color: ink }}>{r.name}</div>
                <div style={{ color: ink }}>{r.amt}</div>
                <div>
                  <span
                    style={{
                      padding: '2px 8px',
                      background: rgba(r.color, 0.15),
                      color: r.color,
                      borderRadius: Math.min(radius, 12),
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {r.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  /* ───────── MOBILE MOCKUP ───────── */
  const MobileMockup = (
    <div
      style={{
        background: ink,
        borderRadius: 28,
        padding: 6,
        width: 220,
      }}
    >
      <div
        style={{
          background: rgba(ink, 0.05),
          borderRadius: 24,
          padding: '14px 12px 0',
          minHeight: 410,
          display: 'flex',
          flexDirection: 'column',
          color: canvas,
        }}
      >
        {/* status bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 9,
            color: canvas,
            marginBottom: 14,
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            fontWeight: 600,
          }}
        >
          <span>9:41</span>
          <span>●●●  ▮</span>
        </div>

        {/* header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 16,
                color: canvas,
                ...headerHero,
              }}
            >
              Hello, Maya
            </div>
            <div style={{ fontSize: 10, color: rgba(canvas, 0.7), marginTop: 2, ...fP }}>
              Tuesday, May 5
            </div>
          </div>
          <div
            style={{
              position: 'relative',
              width: 30,
              height: 30,
              background: canvas,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: ink,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                background: primary,
                borderRadius: '50%',
                position: 'absolute',
                top: 5,
                right: 5,
              }}
            />
            <Icon name='bell' size={14} strokeWidth={1.8} />
          </div>
        </div>

        {/* hero balance card with primary */}
        <div
          style={{
            background: primary,
            borderRadius: Math.min(radius + 2, 16),
            padding: 14,
            color: onPrimary,
            marginBottom: 10,
          }}
        >
          <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 500, marginBottom: 4, ...fP }}>
            Total balance
          </div>
          <div
            style={{
              fontSize: 26,
              ...headerHero,
              color: onPrimary,
            }}
          >
            $4,820.18
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            <div
              style={{
                padding: '5px 10px',
                background: 'rgba(255,255,255,0.22)',
                borderRadius: Math.min(radius, 14),
                fontSize: 9,
                fontWeight: 600,
                ...fP,
              }}
            >
              Send
            </div>
            <div
              style={{
                padding: '5px 10px',
                background: 'rgba(255,255,255,0.22)',
                borderRadius: Math.min(radius, 14),
                fontSize: 9,
                fontWeight: 600,
                ...fP,
              }}
            >
              Top up
            </div>
          </div>
        </div>

        {/* secondary + tertiary stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              background: rgba(secondary, 0.14),
              borderRadius: Math.min(radius, 12),
              padding: 10,
            }}
          >
            <div style={{ fontSize: 9, color: rgba(canvas, 0.7), fontWeight: 500, ...fP }}>Saved</div>
            <div
              style={{
                fontSize: 14,
                color: secondary,
                lineHeight: 1.1,
                marginTop: 2,
                ...fH,
                fontWeight: 700,
              }}
            >
              $1,240
            </div>
          </div>
          <div
            style={{
              background: rgba(tertiary, 0.14),
              borderRadius: Math.min(radius, 12),
              padding: 10,
            }}
          >
            <div style={{ fontSize: 9, color: rgba(canvas, 0.7), fontWeight: 500, ...fP }}>Spent</div>
            <div
              style={{
                fontSize: 14,
                color: tertiary,
                lineHeight: 1.1,
                marginTop: 2,
                ...fH,
                fontWeight: 700,
              }}
            >
              $680
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: 9,
            color: rgba(canvas, 0.7),
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 6,
            ...fP,
          }}
        >
          Recent
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {[
            { name: 'Spotify', sub: 'Subscription', amt: '−$4.99', color: danger },
            { name: 'Refund', sub: 'From Acme Inc.', amt: '+$24.00', color: success },
            { name: 'Coffee', sub: 'Today, 8:14am', amt: '−$5.20', color: ink },
          ].map((it) => (
            <div
              key={it.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: canvas,
                borderRadius: Math.min(radius, 10),
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: ink,
                    lineHeight: 1.2,
                    ...fP,
                  }}
                >
                  {it.name}
                </div>
                <div style={{ fontSize: 9, color: rgba(ink, 0.5), ...fP }}>{it.sub}</div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: it.color, ...fP }}>{it.amt}</div>
            </div>
          ))}
        </div>

        {/* bottom nav */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '10px 0',
            borderTop: `0.5px solid ${rgba(ink, 0.08)}`,
            margin: '10px -12px 0',
          }}
        >
          <div style={{ color: primary, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Icon name='home' size={18} strokeWidth={2} />
            <div style={{ width: 16, height: 2, background: primary, borderRadius: 1 }} />
          </div>
          <div style={{ color: rgba(canvas, 0.55), paddingBottom: 5 }}>
            <Icon name='search' size={18} strokeWidth={2} />
          </div>
          <div style={{ color: rgba(canvas, 0.55), paddingBottom: 5 }}>
            <Icon name='list' size={18} strokeWidth={2} />
          </div>
          <div style={{ color: rgba(canvas, 0.55), paddingBottom: 5 }}>
            <Icon name='user' size={18} strokeWidth={2} />
          </div>
        </div>
      </div>
    </div>
  )

  const gridClass =
    view === 'web'
      ? 'vk-preview-grid vk-preview-grid--web-only'
      : view === 'mobile'
      ? 'vk-preview-grid vk-preview-grid--mobile-only'
      : 'vk-preview-grid'

  return (
    <section className='vk-section'>
      <div className='vk-section-head'>
        <div>
          <div className='vk-eyebrow'>Live preview</div>
          <h2 className='vk-section-title'>Your theme, in context</h2>
        </div>
        <div className='vk-tabs'>
          <button
            className={`vk-tab ${view === 'both' ? 'vk-tab--active' : ''}`}
            onClick={() => setView('both')}
          >
            Both
          </button>
          <button
            className={`vk-tab ${view === 'web' ? 'vk-tab--active' : ''}`}
            onClick={() => setView('web')}
          >
            Web
          </button>
          <button
            className={`vk-tab ${view === 'mobile' ? 'vk-tab--active' : ''}`}
            onClick={() => setView('mobile')}
          >
            Mobile
          </button>
        </div>
      </div>

      <div className='vk-preview-canvas'>
        <div className={gridClass}>
          {view !== 'mobile' && WebMockup}
          {view !== 'web' && (
            <div className='vk-mobile-mount'>{MobileMockup}</div>
          )}
        </div>

        {/* Icons showcase — your theme applied to common UI icons */}
        <div className='vk-icons-block'>
          <div className='vk-icons-block-label'>Icons</div>
          <div className='vk-icons-grid'>
            {SHOWCASE_ICONS.map((iconName) => (
              <div
                key={iconName}
                className='vk-icon-cell'
                style={{ background: canvas, color: ink }}
                title={iconName}
              >
                <Icon name={iconName} size={18} strokeWidth={1.8} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='vk-preview-footer'>
        <div>
          <span className='vk-pulse' />
          <span>Updates as you edit</span>
        </div>
        {theme?.id ? (
          <a
            href={previewHref}
            target='_blank'
            rel='noreferrer'
            className='vk-preview-link'
          >
            Open in /preview ↗
          </a>
        ) : (
          <span className='vk-preview-link' style={{ opacity: 0.4 }}>
            Save theme to share preview
          </span>
        )}
      </div>
    </section>
  )
}
