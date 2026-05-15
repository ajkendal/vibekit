/**
 * Public preview page for /themes/:id/preview.
 *
 * Renders a self-contained HTML page that showcases the user's theme
 * (colors, typography, components) and offers multi-format exports
 * (CSS variables, Tailwind, W3C Design Tokens, SCSS) with one-click copy.
 *
 * The page's "chrome" (top bar, footer, panel surfaces) uses VibeKit's
 * own design system — Plus Jakarta Sans, the violet/azure/flame palette,
 * the cream canvas — so the user's theme never has to fight ours. The
 * theme itself is applied only inside the showcase area via CSS variables.
 */

import {
  themeToCssVars,
  themeToTailwind,
  themeToTokens,
  themeToScss,
} from './exports'

type AnyTheme = {
  id?: string
  name?: string | null
  description?: string | null
  logoUrl?: string | null
  colors?: Record<string, string>
  typography?: Record<string, any>
  spacing?: Record<string, any>
}

const COLOR_GROUPS: { name: string; keys: string[] }[] = [
  { name: 'Neutrals', keys: ['neutral_light', 'neutral_mid', 'neutral_dark'] },
  { name: 'Brand', keys: ['primary', 'secondary', 'tertiary'] },
  { name: 'Status', keys: ['success', 'warning', 'caution', 'danger'] },
]

const COLOR_LABELS: Record<string, string> = {
  neutral_light: 'Light',
  neutral_mid: 'Mid',
  neutral_dark: 'Dark',
  primary: 'Primary',
  secondary: 'Secondary',
  tertiary: 'Tertiary',
  danger: 'Danger',
  warning: 'Warning',
  caution: 'Caution',
  success: 'Success',
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      default:
        return '&#39;'
    }
  })
}

function renderColorGroups(theme: AnyTheme): string {
  const colors = theme.colors ?? {}
  return COLOR_GROUPS.map((group) => {
    const cards = group.keys
      .filter((k) => colors[k])
      .map((k) => {
        const hex = colors[k]
        return `
          <div class="vk-pp-color-card">
            <div class="vk-pp-color-swatch" style="background:${escapeHtml(
              hex
            )}"></div>
            <div class="vk-pp-color-meta">
              <div class="vk-pp-color-name">${escapeHtml(
                COLOR_LABELS[k] || k
              )}</div>
              <div class="vk-pp-color-hex">${escapeHtml(hex.toLowerCase())}</div>
            </div>
          </div>
        `
      })
      .join('')

    return cards
      ? `
        <div class="vk-pp-color-group">
          <p class="vk-pp-color-group-label">${escapeHtml(group.name)}</p>
          <div class="vk-pp-color-grid">${cards}</div>
        </div>
      `
      : ''
  }).join('')
}

function renderWebMockup(theme: AnyTheme): string {
  const radius = theme.spacing?.borderRadius
  const radiusPx = typeof radius === 'number' ? `${Math.min(radius, 10)}px` : '8px'
  const radiusSm = typeof radius === 'number' ? `${Math.min(radius, 6)}px` : '6px'
  const radiusPill =
    typeof radius === 'number' ? `${Math.min(radius, 12)}px` : '12px'

  // Colors used in the mockup, with sane fallbacks
  const bg = 'var(--color-neutral-light, #FFFFFF)'
  const fg = 'var(--color-neutral-dark, #1A1A1A)'
  const primary = 'var(--color-primary, #2563eb)'
  const secondary = 'var(--color-secondary, #3b82f6)'
  const success = 'var(--color-success, #10b981)'
  const warning = 'var(--color-warning, #f59e0b)'
  const danger = 'var(--color-danger, #ef4444)'
  const muted = `color-mix(in srgb, ${fg} 4%, transparent)`
  const hairline = `color-mix(in srgb, ${fg} 7%, transparent)`

  return `
    <div class="demo-app-frame" style="background:${bg}; color:${fg}; border-radius:${radiusPx}; overflow:hidden; border:0.5px solid ${hairline};">
      <!-- browser chrome -->
      <div style="background:${muted}; padding:8px 12px; display:flex; align-items:center; gap:6px; border-bottom:0.5px solid ${hairline};">
        <span style="width:7px; height:7px; background:color-mix(in srgb, ${fg} 18%, transparent); border-radius:50%;"></span>
        <span style="width:7px; height:7px; background:color-mix(in srgb, ${fg} 18%, transparent); border-radius:50%;"></span>
        <span style="width:7px; height:7px; background:color-mix(in srgb, ${fg} 18%, transparent); border-radius:50%;"></span>
        <span style="font-family: var(--vk-font-mono); font-size:10px; color:color-mix(in srgb, ${fg} 45%, transparent); margin-left:8px;">app.${escapeHtml(
          (theme.name || 'untitled').toString().toLowerCase().replace(/\s+/g, '-')
        )}.com</span>
      </div>

      <!-- top nav -->
      <div style="padding:12px 18px; display:flex; justify-content:space-between; align-items:center; border-bottom:0.5px solid ${hairline};">
        <div style="display:flex; gap:18px; align-items:center;">
          <div style="display:flex; gap:8px; align-items:center;">
            <span style="width:18px; height:18px; background:${primary}; border-radius:${radiusSm};"></span>
            <span style="font-family: var(--font-header, var(--vk-font-sans)); font-size:13px; font-weight:700; letter-spacing:-0.02em;">${escapeHtml(
              theme.name || 'Acme'
            )}</span>
          </div>
          <span style="font-size:11px; color:${primary}; font-weight:600; padding-bottom:2px; border-bottom:1.5px solid ${primary};">Dashboard</span>
          <span style="font-size:11px; color:color-mix(in srgb, ${fg} 55%, transparent); font-weight:500;">Reports</span>
          <span style="font-size:11px; color:color-mix(in srgb, ${fg} 55%, transparent); font-weight:500;">Settings</span>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <span style="padding:5px 12px; background:${primary}; color:var(--color-neutral-light, #fff); border-radius:${radiusSm}; font-size:11px; font-weight:600; font-family: var(--font-header, var(--vk-font-sans));">+ New</span>
          <span style="width:24px; height:24px; background:${secondary}; border-radius:50%; color:var(--color-neutral-light, #fff); font-size:10px; font-weight:700; display:inline-flex; align-items:center; justify-content:center;">M</span>
        </div>
      </div>

      <!-- content -->
      <div style="display:grid; grid-template-columns:120px minmax(0, 1fr); min-height:260px;">
        <div style="background:color-mix(in srgb, ${fg} 3%, transparent); padding:14px 10px; display:flex; flex-direction:column; gap:4px; border-right:0.5px solid ${hairline};">
          <span style="padding:6px 10px; background:color-mix(in srgb, ${primary} 12%, transparent); color:${primary}; border-radius:${radiusSm}; font-size:11px; font-weight:600;">Overview</span>
          <span style="padding:6px 10px; color:color-mix(in srgb, ${fg} 70%, transparent); font-size:11px; font-weight:500;">Customers</span>
          <span style="padding:6px 10px; color:color-mix(in srgb, ${fg} 70%, transparent); font-size:11px; font-weight:500;">Orders</span>
          <span style="padding:6px 10px; color:color-mix(in srgb, ${fg} 70%, transparent); font-size:11px; font-weight:500;">Products</span>
        </div>
        <div style="padding:16px 20px;">
          <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:12px;">
            <h3 style="font-family: var(--font-header, var(--vk-font-sans)); font-size:20px; margin:0; font-weight:700; letter-spacing:-0.03em; line-height:1.1;">Good morning</h3>
            <span style="font-size:10px; color:color-mix(in srgb, ${fg} 50%, transparent);">May 5, 2026</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:8px; margin-bottom:12px;">
            ${renderStatCard('Revenue', '$12,840', '↗ 12%', success, muted, fg)}
            ${renderStatCard('Customers', '3,492', '↗ 4%', success, muted, fg)}
            ${renderStatCard('Bounce', '24.1%', '↘ 3%', danger, muted, fg)}
            ${renderStatCard('Avg session', '3:42', '— flat', `color-mix(in srgb, ${fg} 50%, transparent)`, muted, fg)}
          </div>
          <div style="background:${bg}; border:0.5px solid ${hairline}; border-radius:${radiusSm}; overflow:hidden;">
            <div style="display:grid; grid-template-columns:minmax(0, 1fr) 80px 80px; padding:7px 12px; background:color-mix(in srgb, ${fg} 3%, transparent); font-size:9px; font-weight:600; color:color-mix(in srgb, ${fg} 55%, transparent); text-transform:uppercase; letter-spacing:0.05em;">
              <span>Customer</span><span>Amount</span><span>Status</span>
            </div>
            ${renderTableRow('Sara Chen', '$240.00', 'paid', success, hairline, fg, radiusPill)}
            ${renderTableRow('Jordan Park', '$48.50', 'pending', warning, hairline, fg, radiusPill)}
            ${renderTableRow('Mike Alvarez', '$120.00', 'failed', danger, hairline, fg, radiusPill)}
          </div>
        </div>
      </div>
    </div>
  `
}

function renderStatCard(
  label: string,
  value: string,
  delta: string,
  deltaColor: string,
  bg: string,
  fg: string
): string {
  return `
    <div style="background:${bg}; border-radius:8px; padding:10px;">
      <div style="font-size:9px; color:color-mix(in srgb, ${fg} 60%, transparent); font-weight:500;">${escapeHtml(
    label
  )}</div>
      <div style="font-family: var(--font-header, var(--vk-font-sans)); font-size:16px; font-weight:700; letter-spacing:-0.02em; line-height:1.1; margin-top:2px;">${escapeHtml(
    value
  )}</div>
      <div style="font-size:9px; color:${deltaColor}; font-weight:600; margin-top:3px;">${escapeHtml(
    delta
  )}</div>
    </div>
  `
}

function renderTableRow(
  name: string,
  amount: string,
  status: string,
  statusColor: string,
  hairline: string,
  fg: string,
  pillRadius: string
): string {
  return `
    <div style="display:grid; grid-template-columns:minmax(0, 1fr) 80px 80px; padding:8px 12px; border-top:0.5px solid ${hairline}; font-size:11px; align-items:center;">
      <span style="font-weight:600;">${escapeHtml(name)}</span>
      <span>${escapeHtml(amount)}</span>
      <span><span style="padding:2px 8px; background:color-mix(in srgb, ${statusColor} 15%, transparent); color:${statusColor}; border-radius:${pillRadius}; font-size:9px; font-weight:700; letter-spacing:0.02em;">${escapeHtml(
    status
  )}</span></span>
    </div>
  `
}

function renderMobileMockup(theme: AnyTheme): string {
  const radius = theme.spacing?.borderRadius
  const radiusCard =
    typeof radius === 'number' ? `${Math.min(radius + 2, 16)}px` : '14px'
  const radiusItem =
    typeof radius === 'number' ? `${Math.min(radius, 10)}px` : '8px'
  const radiusPill =
    typeof radius === 'number' ? `${Math.min(radius, 14)}px` : '14px'

  const bg = 'var(--color-neutral-light, #FFFFFF)'
  const fg = 'var(--color-neutral-dark, #1A1A1A)'
  const primary = 'var(--color-primary, #2563eb)'
  const secondary = 'var(--color-secondary, #3b82f6)'
  const tertiary = 'var(--color-tertiary, #9333ea)'
  const success = 'var(--color-success, #10b981)'
  const danger = 'var(--color-danger, #ef4444)'
  const phoneBg = `color-mix(in srgb, ${fg} 5%, transparent)`
  const hairline = `color-mix(in srgb, ${fg} 7%, transparent)`

  return `
    <div style="background:${fg}; border-radius:28px; padding:6px;">
      <div style="background:${phoneBg}; border-radius:24px; padding:14px 12px 0; min-height:440px; display:flex; flex-direction:column;">
        <!-- status bar -->
        <div style="display:flex; justify-content:space-between; font-family: var(--vk-font-mono); font-size:9px; color:${fg}; font-weight:600; margin-bottom:14px;">
          <span>9:41</span><span>●●●  ▮</span>
        </div>

        <!-- header -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div>
            <div style="font-family: var(--font-header, var(--vk-font-sans)); font-size:16px; font-weight:700; letter-spacing:-0.02em; line-height:1;">Hello, Maya</div>
            <div style="font-size:10px; color:color-mix(in srgb, ${fg} 55%, transparent); margin-top:2px;">Tuesday, May 5</div>
          </div>
          <div style="position:relative; width:30px; height:30px; background:${bg}; border-radius:50%; display:flex; align-items:center; justify-content:center;">
            <span style="width:7px; height:7px; background:${primary}; border-radius:50%; position:absolute; top:5px; right:5px;"></span>
            <span style="font-size:13px;">♡</span>
          </div>
        </div>

        <!-- balance card with primary -->
        <div style="background:${primary}; color:var(--color-neutral-light, #fff); border-radius:${radiusCard}; padding:14px; margin-bottom:10px;">
          <div style="font-size:10px; opacity:0.85; font-weight:500; margin-bottom:4px;">Total balance</div>
          <div style="font-family: var(--font-header, var(--vk-font-sans)); font-size:26px; font-weight:700; letter-spacing:-0.03em; line-height:1;">$4,820.18</div>
          <div style="display:flex; gap:6px; margin-top:12px;">
            <span style="padding:5px 10px; background:rgba(255,255,255,0.22); border-radius:${radiusPill}; font-size:9px; font-weight:600;">Send</span>
            <span style="padding:5px 10px; background:rgba(255,255,255,0.22); border-radius:${radiusPill}; font-size:9px; font-weight:600;">Top up</span>
          </div>
        </div>

        <!-- secondary stats -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:12px;">
          <div style="background:color-mix(in srgb, ${secondary} 14%, transparent); border-radius:${radiusItem}; padding:10px;">
            <div style="font-size:9px; color:color-mix(in srgb, ${fg} 60%, transparent); font-weight:500;">Saved</div>
            <div style="font-family: var(--font-header, var(--vk-font-sans)); font-size:14px; color:${secondary}; font-weight:700; letter-spacing:-0.02em; line-height:1.1; margin-top:2px;">$1,240</div>
          </div>
          <div style="background:color-mix(in srgb, ${tertiary} 14%, transparent); border-radius:${radiusItem}; padding:10px;">
            <div style="font-size:9px; color:color-mix(in srgb, ${fg} 60%, transparent); font-weight:500;">Spent</div>
            <div style="font-family: var(--font-header, var(--vk-font-sans)); font-size:14px; color:${tertiary}; font-weight:700; letter-spacing:-0.02em; line-height:1.1; margin-top:2px;">$680</div>
          </div>
        </div>

        <div style="font-size:9px; color:color-mix(in srgb, ${fg} 55%, transparent); font-weight:600; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:6px;">Recent</div>

        <div style="display:flex; flex-direction:column; gap:4px; flex:1;">
          ${renderTxnRow('Spotify', 'Subscription', '−$4.99', danger, bg, fg, radiusItem)}
          ${renderTxnRow('Refund', 'From Acme Inc.', '+$24.00', success, bg, fg, radiusItem)}
          ${renderTxnRow('Coffee', 'Today, 8:14am', '−$5.20', fg, bg, fg, radiusItem)}
        </div>

        <!-- bottom nav -->
        <div style="display:flex; justify-content:space-around; align-items:center; padding:12px 0; border-top:0.5px solid ${hairline}; margin:10px -12px 0;">
          <span style="width:18px; height:3px; background:${primary}; border-radius:2px;"></span>
          <span style="width:5px; height:5px; background:color-mix(in srgb, ${fg} 25%, transparent); border-radius:50%;"></span>
          <span style="width:5px; height:5px; background:color-mix(in srgb, ${fg} 25%, transparent); border-radius:50%;"></span>
          <span style="width:5px; height:5px; background:color-mix(in srgb, ${fg} 25%, transparent); border-radius:50%;"></span>
        </div>
      </div>
    </div>
  `
}

function renderTxnRow(
  name: string,
  sub: string,
  amount: string,
  amountColor: string,
  bg: string,
  fg: string,
  radius: string
): string {
  return `
    <div style="display:flex; justify-content:space-between; padding:8px 10px; background:${bg}; border-radius:${radius}; align-items:center;">
      <div>
        <div style="font-size:10px; font-weight:600; line-height:1.2;">${escapeHtml(
          name
        )}</div>
        <div style="font-size:9px; color:color-mix(in srgb, ${fg} 50%, transparent);">${escapeHtml(
    sub
  )}</div>
      </div>
      <div style="font-size:10px; font-weight:700; color:${amountColor};">${escapeHtml(
    amount
  )}</div>
    </div>
  `
}

function renderTypeScale(theme: AnyTheme): string {
  const t = theme.typography ?? {}
  const base = typeof t.base === 'number' ? t.base : 16
  const ratio = typeof t.ratio === 'number' ? t.ratio : 1.25
  const steps = [
    { exp: 3, label: 'Display · H1' },
    { exp: 2, label: 'H2' },
    { exp: 1, label: 'H3' },
    { exp: 0, label: 'Body' },
    { exp: -1, label: 'Caption' },
  ]
  return steps
    .map(({ exp, label }) => {
      const size = Math.round(base * Math.pow(ratio, exp) * 10) / 10
      return `
        <div class="vk-pp-type-row">
          <span class="vk-pp-type-sample" style="font-size:${size}px">
            The quick brown fox
          </span>
          <span class="vk-pp-type-label">${escapeHtml(label)}</span>
          <code class="vk-pp-type-size">${size}px</code>
        </div>
      `
    })
    .join('')
}

export function renderPreviewPage(theme: AnyTheme): string {
  const name = theme.name || 'Untitled Theme'
  const description = theme.description || ''
  const cssVars = themeToCssVars(theme)
  const tailwind = themeToTailwind(theme)
  const tokens = themeToTokens(theme)
  const scss = themeToScss(theme)
  const headerFont = theme.typography?.headerFont || 'Inter'
  const paragraphFont = theme.typography?.paragraphFont || 'Inter'
  const fontFamilies = [headerFont, paragraphFont]
    .filter((f, i, arr) => f && arr.indexOf(f) === i)
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
    .join('&')

  const logoSrc = theme.logoUrl
    ? /^https?:\/\//i.test(theme.logoUrl)
      ? theme.logoUrl
      : theme.logoUrl.startsWith('/')
      ? theme.logoUrl
      : `/${theme.logoUrl}`
    : ''

  // Embed exports as JSON strings the inline JS can swap between
  const exportsPayload = JSON.stringify({
    css: cssVars,
    tailwind,
    tokens,
    scss,
  })

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(name)} — VibeKit theme</title>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="3" y="16" width="10" height="40" rx="2" fill="#FFBE0B"/><rect x="15" y="12" width="10" height="40" rx="2" fill="#FB5607"/><rect x="27" y="8" width="10" height="40" rx="2" fill="#FF006E"/><rect x="39" y="12" width="10" height="40" rx="2" fill="#8338EC"/><rect x="51" y="16" width="10" height="40" rx="2" fill="#3A86FF"/></svg>'
  )}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500${
    fontFamilies ? `&${fontFamilies}` : ''
  }&display=swap" />
<style>
  /* ── VibeKit chrome (never themed by user) ── */
  :root {
    --vk-violet: #8338EC;
    --vk-azure: #3A86FF;
    --vk-flame: #FB5607;
    --vk-sun: #FFBE0B;
    --vk-pink: #FF006E;
    --vk-ink: #1A1A1A;
    --vk-canvas: #FAF7F2;
    --vk-surface: #FFFFFF;
    --vk-surface-muted: #F5F2EC;
    --vk-border: rgba(26, 26, 26, 0.08);
    --vk-font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    --vk-font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  /* ── User theme applied inside .vk-pp-showcase only ── */
  .vk-pp-showcase {
${cssVars
  .split('\n')
  .slice(1, -1)
  .join('\n')}
  }

  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: var(--vk-font-sans);
    background: var(--vk-canvas);
    color: var(--vk-ink);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.5;
  }
  a { color: inherit; }

  /* Top bar */
  .vk-pp-topbar {
    padding: 14px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 0.5px solid var(--vk-border);
    background: var(--vk-canvas);
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .vk-pp-topbar-brand { display: flex; align-items: center; gap: 12px; }
  .vk-pp-topbar-wordmark {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--vk-ink);
  }
  .vk-pp-topbar-link {
    font-size: 13px;
    font-weight: 600;
    color: var(--vk-ink);
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 8px;
    border: 0.5px solid rgba(26, 26, 26, 0.15);
    transition: background 0.15s ease;
  }
  .vk-pp-topbar-link:hover { background: var(--vk-surface-muted); }

  /* Page */
  .vk-pp-page {
    max-width: 980px;
    margin: 0 auto;
    padding: 56px 24px 80px;
  }

  /* Hero */
  .vk-pp-hero { margin-bottom: 72px; }
  .vk-pp-hero-logo {
    width: 64px; height: 64px; object-fit: contain;
    margin-bottom: 24px; display: block;
  }
  .vk-pp-hero-title {
    font-size: clamp(40px, 6vw, 56px);
    font-weight: 700;
    letter-spacing: -0.035em;
    margin: 0 0 16px;
    line-height: 1.05;
    color: var(--vk-ink);
  }
  .vk-pp-hero-desc {
    font-size: 18px;
    color: rgba(26, 26, 26, 0.65);
    margin: 0;
    line-height: 1.55;
    max-width: 640px;
  }

  /* Showcase wrapper — user theme variables scoped here */
  .vk-pp-showcase { /* user theme css vars injected above */ }

  /* Section */
  .vk-pp-section { margin-bottom: 64px; }
  .vk-pp-section-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(26, 26, 26, 0.45);
    margin: 0 0 12px;
  }
  .vk-pp-section-title {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.025em;
    margin: 0 0 28px;
    color: var(--vk-ink);
    line-height: 1.2;
  }

  /* Colors */
  .vk-pp-color-group { margin-bottom: 24px; }
  .vk-pp-color-group:last-child { margin-bottom: 0; }
  .vk-pp-color-group-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(26, 26, 26, 0.5);
    margin: 0 0 12px;
  }
  .vk-pp-color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }
  .vk-pp-color-card {
    border-radius: 12px;
    overflow: hidden;
    border: 0.5px solid var(--vk-border);
    background: var(--vk-surface);
  }
  .vk-pp-color-swatch { height: 80px; }
  .vk-pp-color-meta { padding: 10px 12px; }
  .vk-pp-color-name {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--vk-ink);
  }
  .vk-pp-color-hex {
    font-family: var(--vk-font-mono);
    font-size: 11px;
    color: rgba(26, 26, 26, 0.55);
    margin-top: 2px;
  }

  /* Typography scale */
  .vk-pp-type-row {
    display: flex;
    align-items: baseline;
    gap: 20px;
    padding: 14px 0;
    border-bottom: 0.5px solid var(--vk-border);
  }
  .vk-pp-type-row:last-child { border-bottom: 0; }
  .vk-pp-type-sample {
    flex: 1;
    color: var(--vk-ink);
    font-family: var(--font-header, var(--vk-font-sans));
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .vk-pp-type-label {
    font-size: 11px;
    font-weight: 500;
    color: rgba(26, 26, 26, 0.55);
    flex-shrink: 0;
    min-width: 100px;
    text-align: right;
  }
  .vk-pp-type-size {
    font-family: var(--vk-font-mono);
    font-size: 11px;
    color: rgba(26, 26, 26, 0.45);
    flex-shrink: 0;
    min-width: 56px;
    text-align: right;
  }

  /* Mockup grid */
  .vk-pp-mockup-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 240px;
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 720px) {
    .vk-pp-mockup-grid {
      grid-template-columns: 1fr;
      justify-items: center;
    }
  }

  /* Components grid */
  .vk-pp-comp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }
  .vk-pp-comp-card {
    background: var(--vk-surface);
    border: 0.5px solid var(--vk-border);
    border-radius: 12px;
    padding: 18px 20px;
  }
  .vk-pp-comp-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(26, 26, 26, 0.45);
    margin: 0 0 14px;
  }

  /* Themed primitives — these use the user's theme variables */
  .vk-pp-showcase .demo-btn {
    padding: 10px 18px;
    font-family: var(--font-header, var(--vk-font-sans));
    font-weight: 600;
    border: 0;
    border-radius: var(--border-radius, 8px);
    font-size: 14px;
    cursor: pointer;
    line-height: 1.2;
  }
  .vk-pp-showcase .demo-btn--primary {
    background: var(--color-primary, #2563eb);
    color: var(--color-neutral-light, #fff);
  }
  .vk-pp-showcase .demo-btn--secondary {
    background: var(--color-secondary, #3b82f6);
    color: var(--color-neutral-light, #fff);
  }
  .vk-pp-showcase .demo-btn--tertiary {
    background: var(--color-tertiary, #9333ea);
    color: var(--color-neutral-light, #fff);
  }
  .vk-pp-showcase .demo-btn--outline {
    background: transparent;
    border: 1px solid var(--color-neutral-dark, #111);
    color: var(--color-neutral-dark, #111);
    font-weight: 500;
  }
  .vk-pp-showcase .demo-buttons {
    display: flex; gap: 8px; flex-wrap: wrap;
  }

  .vk-pp-showcase .demo-badges {
    display: flex; gap: 6px; flex-wrap: wrap;
  }
  .vk-pp-showcase .demo-badge {
    padding: 4px 10px;
    border-radius: var(--border-radius, 8px);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.02em;
    font-family: var(--font-paragraph, var(--vk-font-sans));
  }
  .vk-pp-showcase .demo-badge--success {
    background: color-mix(in srgb, var(--color-success, #10b981) 18%, transparent);
    color: var(--color-success, #10b981);
  }
  .vk-pp-showcase .demo-badge--warning {
    background: color-mix(in srgb, var(--color-warning, #f59e0b) 18%, transparent);
    color: var(--color-warning, #f59e0b);
  }
  .vk-pp-showcase .demo-badge--caution {
    background: color-mix(in srgb, var(--color-caution, #f97316) 18%, transparent);
    color: var(--color-caution, #f97316);
  }
  .vk-pp-showcase .demo-badge--danger {
    background: color-mix(in srgb, var(--color-danger, #ef4444) 18%, transparent);
    color: var(--color-danger, #ef4444);
  }

  .vk-pp-showcase .demo-content { background: var(--color-neutral-light, #fff); color: var(--color-neutral-dark, #111); padding: 16px; border-radius: var(--border-radius, 8px); border: 0.5px solid rgba(0,0,0,0.06); }
  .vk-pp-showcase .demo-content-title {
    font-family: var(--font-header, var(--vk-font-sans));
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0 0 6px;
    line-height: var(--line-height-header, 1.2);
  }
  .vk-pp-showcase .demo-content-body {
    font-family: var(--font-paragraph, var(--vk-font-sans));
    font-size: 13px;
    color: color-mix(in srgb, var(--color-neutral-dark, #111) 70%, transparent);
    margin: 0 0 8px;
    line-height: var(--line-height-paragraph, 1.55);
  }
  .vk-pp-showcase .demo-link {
    color: var(--color-primary, #2563eb);
    font-family: var(--font-paragraph, var(--vk-font-sans));
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
  }

  .vk-pp-showcase .demo-input {
    width: 100%;
    padding: 8px 12px;
    border-radius: var(--border-radius, 8px);
    border: 1px solid color-mix(in srgb, var(--color-neutral-dark, #111) 15%, transparent);
    font-family: var(--font-paragraph, var(--vk-font-sans));
    font-size: 14px;
    background: var(--color-neutral-light, #fff);
    color: var(--color-neutral-dark, #111);
    outline: 0;
  }
  .vk-pp-showcase .demo-input:focus {
    border-color: var(--color-primary, #2563eb);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary, #2563eb) 30%, transparent);
  }

  /* Export section */
  .vk-pp-export-tabs {
    display: inline-flex;
    gap: 4px;
    padding: 3px;
    background: var(--vk-surface-muted);
    border-radius: 9px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .vk-pp-export-tab {
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    color: rgba(26, 26, 26, 0.55);
    border: 0;
    background: transparent;
    font-family: var(--vk-font-sans);
    transition: background 0.15s ease, color 0.15s ease;
  }
  .vk-pp-export-tab:hover { color: var(--vk-ink); }
  .vk-pp-export-tab.is-active {
    background: var(--vk-ink);
    color: var(--vk-canvas);
    font-weight: 600;
  }

  .vk-pp-export-block {
    position: relative;
    background: var(--vk-ink);
    color: #E4DFFA;
    border-radius: 12px;
    padding: 24px 28px;
    font-family: var(--vk-font-mono);
    font-size: 13px;
    line-height: 1.65;
    overflow: auto;
    max-height: 480px;
    margin: 0;
    white-space: pre;
  }

  .vk-pp-export-copy {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(255, 255, 255, 0.1);
    color: #E4DFFA;
    border: 0;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--vk-font-sans);
    letter-spacing: -0.01em;
    transition: background 0.15s ease;
  }
  .vk-pp-export-copy:hover { background: rgba(255, 255, 255, 0.2); }
  .vk-pp-export-copy.is-copied { background: var(--vk-violet); color: #fff; }

  /* Footer */
  .vk-pp-footer {
    padding: 32px 24px;
    text-align: center;
    border-top: 0.5px solid var(--vk-border);
    font-size: 12px;
    color: rgba(26, 26, 26, 0.5);
  }
  .vk-pp-footer a {
    color: var(--vk-violet);
    text-decoration: none;
    font-weight: 600;
  }
  .vk-pp-footer a:hover { text-decoration: underline; }
</style>
</head>
<body>

<header class="vk-pp-topbar">
  <div class="vk-pp-topbar-brand">
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none" aria-label="VibeKit">
      <rect x="3" y="16" width="10" height="40" rx="2" fill="#FFBE0B"/>
      <rect x="15" y="12" width="10" height="40" rx="2" fill="#FB5607"/>
      <rect x="27" y="8" width="10" height="40" rx="2" fill="#FF006E"/>
      <rect x="39" y="12" width="10" height="40" rx="2" fill="#8338EC"/>
      <rect x="51" y="16" width="10" height="40" rx="2" fill="#3A86FF"/>
    </svg>
    <span class="vk-pp-topbar-wordmark">VibeKit</span>
  </div>
  <a class="vk-pp-topbar-link" href="https://vibekit.studio" rel="noopener">Open in editor ↗</a>
</header>

<main class="vk-pp-page">

  <section class="vk-pp-hero">
    ${
      logoSrc
        ? `<img class="vk-pp-hero-logo" src="${escapeHtml(
            logoSrc
          )}" alt="${escapeHtml(name)} logo" />`
        : ''
    }
    <h1 class="vk-pp-hero-title">${escapeHtml(name)}</h1>
    ${
      description
        ? `<p class="vk-pp-hero-desc">${escapeHtml(description)}</p>`
        : ''
    }
  </section>

  <div class="vk-pp-showcase">

    <section class="vk-pp-section">
      <p class="vk-pp-section-eyebrow">Mockups</p>
      <h2 class="vk-pp-section-title">In real product UI</h2>
      <div class="vk-pp-mockup-grid">
        ${renderWebMockup(theme)}
        ${renderMobileMockup(theme)}
      </div>
    </section>

    <section class="vk-pp-section">
      <p class="vk-pp-section-eyebrow">Colors</p>
      <h2 class="vk-pp-section-title">Tokens in the palette</h2>
      ${renderColorGroups(theme)}
    </section>

    <section class="vk-pp-section">
      <p class="vk-pp-section-eyebrow">Typography</p>
      <h2 class="vk-pp-section-title">${escapeHtml(headerFont)}${
    paragraphFont && paragraphFont !== headerFont
      ? ` + ${escapeHtml(paragraphFont)}`
      : ''
  }</h2>
      <div class="vk-pp-type-scale">${renderTypeScale(theme)}</div>
    </section>

    <section class="vk-pp-section">
      <p class="vk-pp-section-eyebrow">Components</p>
      <h2 class="vk-pp-section-title">Primitives in your theme</h2>
      <div class="vk-pp-comp-grid">

        <div class="vk-pp-comp-card">
          <p class="vk-pp-comp-label">Buttons</p>
          <div class="demo-buttons">
            <button class="demo-btn demo-btn--primary">Primary</button>
            <button class="demo-btn demo-btn--secondary">Secondary</button>
            <button class="demo-btn demo-btn--tertiary">Tertiary</button>
            <button class="demo-btn demo-btn--outline">Outline</button>
          </div>
        </div>

        <div class="vk-pp-comp-card">
          <p class="vk-pp-comp-label">Status badges</p>
          <div class="demo-badges">
            <span class="demo-badge demo-badge--success">Success</span>
            <span class="demo-badge demo-badge--warning">Warning</span>
            <span class="demo-badge demo-badge--caution">Caution</span>
            <span class="demo-badge demo-badge--danger">Danger</span>
          </div>
        </div>

        <div class="vk-pp-comp-card">
          <p class="vk-pp-comp-label">Card</p>
          <div class="demo-content">
            <h3 class="demo-content-title">Article heading</h3>
            <p class="demo-content-body">A short paragraph rendered with your paragraph font and color tokens.</p>
            <a href="#" class="demo-link">Read more →</a>
          </div>
        </div>

        <div class="vk-pp-comp-card">
          <p class="vk-pp-comp-label">Form input</p>
          <input class="demo-input" type="text" placeholder="Type something…" />
        </div>

      </div>
    </section>

  </div>

  <section class="vk-pp-section" style="margin-bottom: 0;">
    <p class="vk-pp-section-eyebrow">Export</p>
    <h2 class="vk-pp-section-title">Drop into your project</h2>

    <div class="vk-pp-export-tabs" role="tablist">
      <button class="vk-pp-export-tab is-active" data-format="css" type="button">CSS variables</button>
      <button class="vk-pp-export-tab" data-format="tailwind" type="button">Tailwind</button>
      <button class="vk-pp-export-tab" data-format="tokens" type="button">Tokens JSON</button>
      <button class="vk-pp-export-tab" data-format="scss" type="button">SCSS</button>
    </div>

    <pre class="vk-pp-export-block"><button class="vk-pp-export-copy" id="vk-pp-copy" type="button">Copy</button><code id="vk-pp-content">${escapeHtml(
      cssVars
    )}</code></pre>
  </section>

</main>

<footer class="vk-pp-footer">
  <span>Made with </span><a href="https://vibekit.studio" rel="noopener">VibeKit ↗</a>
</footer>

<script>
  (function () {
    var EXPORTS = ${exportsPayload};
    var tabs = document.querySelectorAll('.vk-pp-export-tab');
    var content = document.getElementById('vk-pp-content');
    var copyBtn = document.getElementById('vk-pp-copy');
    var copyTimer = null;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        content.textContent = EXPORTS[tab.dataset.format] || '';
      });
    });

    copyBtn.addEventListener('click', function () {
      var text = content.textContent || '';
      navigator.clipboard.writeText(text).then(function () {
        copyBtn.classList.add('is-copied');
        copyBtn.textContent = '✓ Copied';
        clearTimeout(copyTimer);
        copyTimer = setTimeout(function () {
          copyBtn.classList.remove('is-copied');
          copyBtn.textContent = 'Copy';
        }, 2000);
      }).catch(function () {
        copyBtn.textContent = 'Copy failed';
        copyTimer = setTimeout(function () { copyBtn.textContent = 'Copy'; }, 2000);
      });
    });
  })();
</script>

</body>
</html>`
}
