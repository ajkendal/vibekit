// api/src/index.ts

export interface Env {
  DB: D1Database
  UPLOADS: R2Bucket
}

type ThemeRow = {
  id: string
  name: string | null
  colors: string | null
  typography: string | null
  spacing: string | null
  logo_url: string | null
  created_at?: number | null
}

type Theme = {
  id: string
  name: string
  colors: Record<string, any>
  typography: Record<string, any>
  spacing: Record<string, any>
  logoUrl: string | null
  created_at?: number | null
}

function json(data: unknown, status = 200, extra?: HeadersInit) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...extra,
    },
  })
}

function corsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get('Origin') || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

function parseThemeRow(row: ThemeRow | null): Theme | null {
  if (!row) return null
  let colors = {} as any
  let typography = {} as any
  let spacing = {} as any
  try {
    colors = row.colors ? JSON.parse(row.colors) : {}
  } catch {}
  try {
    typography = row.typography ? JSON.parse(row.typography) : {}
  } catch {}
  try {
    spacing = row.spacing ? JSON.parse(row.spacing) : {}
  } catch {}

  return {
    id: row.id,
    name: row.name ?? 'Untitled Theme',
    colors,
    typography,
    spacing,
    logoUrl: row.logo_url,
    created_at: row.created_at ?? null,
  }
}

function buildCssVars(theme: Theme): string {
  const c = theme.colors || {}
  const t = theme.typography || {}
  const s = theme.spacing || {}
  const lines: string[] = []

  function pushVar(name: string, value?: string | number | null) {
    if (value === undefined || value === null || value === '') return
    lines.push(`${name}: ${value};`)
  }

  // Colors (accept both your token names + generic surface/text)
  const colorKeys = [
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
  ]
  for (const k of colorKeys) {
    const v = c[k]
    if (v) pushVar(`--color-${k.replace('_', '-')}`, v)
  }

  // Typography
  if (typeof t.base === 'number') pushVar('--font-base', `${t.base}px`)
  if (typeof t.ratio === 'number') pushVar('--font-ratio', String(t.ratio))
  if (t.headerFont)
    pushVar(
      '--font-header',
      `'${t.headerFont}', system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
    )
  if (t.paragraphFont)
    pushVar(
      '--font-paragraph',
      `'${t.paragraphFont}', system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
    )

  // Spacing
  if (typeof s.base === 'number') pushVar('--space-base', `${s.base}px`)

  return `:root {\n  ${lines.join('\n  ')}\n}\n`
}

function buildCss(theme: Theme): string {
  return `/* VibeKit theme: ${theme.name} (${theme.id}) */
${buildCssVars(theme)}
`
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"]/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string)
  )
}

function buildPreviewHTML(theme: Theme): string {
  const vars = buildCssVars(theme)
  const headerFont = theme.typography?.headerFont || 'Inter'
  const paragraphFont = theme.typography?.paragraphFont || 'Inter'
  const name = escapeHtml(theme.name || 'Untitled Theme')
  const logo = theme.logoUrl
    ? `<img src="${escapeHtml(theme.logoUrl)}" alt="Logo" />`
    : ''

  // No nested backticks in the inline script; only concatenations.
  const headFonts = (() => {
    const hW =
      Array.isArray(theme.typography?.headerWeights) &&
      theme.typography!.headerWeights!.length
        ? theme
            .typography!.headerWeights!.slice()
            .sort((a: number, b: number) => a - b)
            .join(';')
        : '400;600;700'
    const pW =
      Array.isArray(theme.typography?.paragraphWeights) &&
      theme.typography!.paragraphWeights!.length
        ? theme
            .typography!.paragraphWeights!.slice()
            .sort((a: number, b: number) => a - b)
            .join(';')
        : '300;400;500'
    const h = headerFont
      ? 'family=' + encodeURIComponent(headerFont) + ':wght@' + hW
      : ''
    const p =
      paragraphFont && paragraphFont !== headerFont
        ? '&family=' + encodeURIComponent(paragraphFont) + ':wght@' + pW
        : ''
    return h || p
      ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${h}${p}&display=swap">`
      : ''
  })()

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>VibeKit – ${name}</title>
${headFonts}
<style>
${vars}
*{box-sizing:border-box}
body{margin:0;background:var(--color-surface,#fff);color:var(--color-text,#111827);font-family:var(--font-paragraph,system-ui,-apple-system,Segoe UI,Roboto,sans-serif)}
h1,h2,h3{font-family:var(--font-header,var(--font-paragraph,system-ui))}
.container{max-width:960px;margin:2rem auto;padding:1rem}
.row{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0}
.card{border:1px solid #e5e7eb;border-radius:12px;padding:16px;background:rgba(255,255,255,.06)}
.btn{padding:8px 12px;border-radius:10px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer}
.btn.primary{background:var(--color-primary,#2563eb);color:#fff;border-color:transparent}
.btn.secondary{background:var(--color-secondary,#14b8a6);color:#fff;border-color:transparent}
.alert.warning{background:var(--color-warning,#f59e0b);color:#111;padding:8px 12px;border-radius:10px}
.field{display:grid;gap:.5rem}
.field input{padding:10px 12px;border-radius:10px;border:1px solid #e5e7eb}
header img{width:28px;height:28px;border-radius:6px}
.sample-header{font-weight:600;font-size:1.5rem}
.sample-paragraph{line-height:1.6}
</style>
</head>
<body>
  <main class="container">
    <header style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      ${logo}
      <h1>${name}</h1>
    </header>

    <section class="row" style="flex-direction:column">
      <div class="sample-header" style="font-family:'${escapeHtml(
        headerFont
      )}',system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
        The quick brown fox jumps over the lazy dog
      </div>
      <div class="sample-paragraph" style="font-family:'${escapeHtml(
        paragraphFont
      )}',system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </div>
    </section>

    <div class="row">
      <button class="btn primary">Primary</button>
      <button class="btn secondary">Secondary</button>
      <div class="alert warning">Warning alert using tokens</div>
    </div>

    <div class="card">
      <h3>Card Title</h3>
      <p>Body text uses the paragraph font and color tokens.</p>
      <button class="btn">Action</button>
    </div>
  </main>
</body>
</html>`
}

function buildOgSvg(theme: Theme): string {
  const name = escapeHtml(theme.name || 'VibeKit Theme')
  const p = theme.colors?.primary || '#2563eb'
  const s = theme.colors?.secondary || '#14b8a6'
  const t = theme.colors?.tertiary || '#8b5cf6'
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p}"/>
      <stop offset="50%" stop-color="${s}"/>
      <stop offset="100%" stop-color="${t}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="40" y="40" width="1120" height="550" rx="28" fill="rgba(255,255,255,0.92)"/>
  <text x="80" y="180" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-weight="700" font-size="72" fill="#111827">VibeKit</text>
  <text x="80" y="260" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-size="48" fill="#111827">${name}</text>
</svg>`
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) })
    }

    const url = new URL(request.url)
    let path = url.pathname
    const method = request.method.toUpperCase()

    // Accept both /api/* and bare
    if (path.startsWith('/api/')) path = path.slice(4)

    // Health
    if (path === '/health' && method === 'GET') {
      return json({ status: 'ok' }, 200, corsHeaders(request))
    }

    // Serve R2 assets (e.g., uploaded logos) at /assets/*
    if (path.startsWith('/assets/') && method === 'GET') {
      const key = path.replace(/^\/assets\//, '')
      const obj = await env.UPLOADS.get(key)
      if (!obj) return json({ error: 'Not found' }, 404, corsHeaders(request))
      const headers: HeadersInit = {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        ...corsHeaders(request),
      }
      // Try to guess content type by extension
      const ct = key.endsWith('.png')
        ? 'image/png'
        : key.endsWith('.jpg') || key.endsWith('.jpeg')
        ? 'image/jpeg'
        : key.endsWith('.webp')
        ? 'image/webp'
        : key.endsWith('.svg')
        ? 'image/svg+xml'
        : 'application/octet-stream'
      return new Response(obj.body, {
        headers: { 'content-type': ct, ...headers },
      })
    }

    // Upload logo -> store in R2, return {url}
    if (path === '/uploads/logo' && method === 'POST') {
      const ct = request.headers.get('content-type') || ''
      if (!ct.includes('multipart/form-data')) {
        return json(
          { error: 'multipart/form-data required' },
          400,
          corsHeaders(request)
        )
      }
      const form = await request.formData()
      const file = form.get('file')
      if (!(file instanceof File)) {
        return json({ error: 'file field missing' }, 400, corsHeaders(request))
      }
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
      const id =
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const key = `logos/${id}.${ext}`
      await env.UPLOADS.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type || 'application/octet-stream' },
      })
      // Serve via our /assets route
      const urlPath = `/assets/${key}`
      return json({ url: urlPath }, 200, corsHeaders(request))
    }

    // List themes (minimal fields for the Saved Themes list)
    if (path === '/themes' && method === 'GET') {
      const res = await env.DB.prepare(
        `SELECT id, name, created_at FROM themes ORDER BY COALESCE(created_at, strftime('%s','now')) DESC`
      ).all()
      const results = (res.results || []) as ThemeRow[]
      return json(results, 200, corsHeaders(request))
    }

    // Create/Update theme (UPSERT)
    if (path === '/themes' && method === 'POST') {
      const data = await request.json().catch(() => ({} as any))

      // Accept both top-level and nested fields
      const rawName = (data?.name ?? data?.theme?.name ?? '').toString().trim()
      const name = rawName || 'Untitled Theme'

      const id =
        typeof data?.id === 'string' && data.id.trim()
          ? data.id.trim()
          : globalThis.crypto?.randomUUID?.() ??
            `${Date.now()}-${Math.random().toString(36).slice(2)}`

      const colors = JSON.stringify(data?.colors ?? data?.theme?.colors ?? {})
      const typography = JSON.stringify(
        data?.typography ?? data?.theme?.typography ?? {}
      )
      const spacing = JSON.stringify(
        data?.spacing ?? data?.theme?.spacing ?? {}
      )
      const logo_url = (data?.logoUrl ?? data?.logo_url ?? null) as
        | string
        | null

      // Ensure created_at on first insert; upsert otherwise
      await env.DB.prepare(
        `INSERT INTO themes (id, name, colors, typography, spacing, logo_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, strftime('%s','now')))
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           colors = excluded.colors,
           typography = excluded.typography,
           spacing = excluded.spacing,
           logo_url = excluded.logo_url`
      )
        .bind(id, name, colors, typography, spacing, logo_url, null)
        .run()

      const row = await env.DB.prepare(
        `SELECT id, name, colors, typography, spacing, logo_url, created_at FROM themes WHERE id = ?`
      )
        .bind(id)
        .first<ThemeRow>()
      const parsed = parseThemeRow(row)
      return json(parsed, 200, corsHeaders(request))
    }

    // Get a single theme (full)
    const themeMatch = path.match(/^\/themes\/([A-Za-z0-9._-]+)$/)
    if (themeMatch && method === 'GET') {
      const id = themeMatch[1]
      const row = await env.DB.prepare(
        `SELECT id, name, colors, typography, spacing, logo_url, created_at FROM themes WHERE id = ?`
      )
        .bind(id)
        .first<ThemeRow>()
      if (!row) return json({ error: 'Not found' }, 404, corsHeaders(request))
      return json(parseThemeRow(row), 200, corsHeaders(request))
    }

    // CSS for a theme
    const cssMatch = path.match(/^\/themes\/([A-Za-z0-9._-]+)\.css$/)
    if (cssMatch && method === 'GET') {
      const id = cssMatch[1]
      const row = await env.DB.prepare(
        `SELECT id, name, colors, typography, spacing, logo_url, created_at FROM themes WHERE id = ?`
      )
        .bind(id)
        .first<ThemeRow>()
      if (!row)
        return new Response('/* Not found */', {
          status: 404,
          headers: corsHeaders(request),
        })
      const theme = parseThemeRow(row)!
      const css = buildCss(theme)
      return new Response(css, {
        status: 200,
        headers: {
          'content-type': 'text/css; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          ...corsHeaders(request),
        },
      })
    }

    // Preview page
    const prevMatch = path.match(/^\/themes\/([A-Za-z0-9._-]+)\/preview$/)
    if (prevMatch && method === 'GET') {
      const id = prevMatch[1]
      const row = await env.DB.prepare(
        `SELECT id, name, colors, typography, spacing, logo_url, created_at FROM themes WHERE id = ?`
      )
        .bind(id)
        .first<ThemeRow>()
      if (!row)
        return new Response('Not found', {
          status: 404,
          headers: corsHeaders(request),
        })
      const html = buildPreviewHTML(parseThemeRow(row)!)
      return new Response(html, {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=600',
          ...corsHeaders(request),
        },
      })
    }

    // OG image (SVG)
    const ogMatch = path.match(/^\/themes\/([A-Za-z0-9._-]+)\.og\.svg$/)
    if (ogMatch && method === 'GET') {
      const id = ogMatch[1]
      const row = await env.DB.prepare(
        `SELECT id, name, colors, typography, spacing, logo_url, created_at FROM themes WHERE id = ?`
      )
        .bind(id)
        .first<ThemeRow>()
      if (!row)
        return new Response('Not found', {
          status: 404,
          headers: corsHeaders(request),
        })
      const svg = buildOgSvg(parseThemeRow(row)!)
      return new Response(svg, {
        status: 200,
        headers: {
          'content-type': 'image/svg+xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          ...corsHeaders(request),
        },
      })
    }

    // Optional API homepage
    if (path === '/' && method === 'GET') {
      const countRes = await env.DB.prepare(
        `SELECT COUNT(1) as c FROM themes`
      ).first<{ c: number }>()
      const c = countRes?.c ?? 0
      const html = `<!doctype html><meta charset="utf-8">
<title>VibeKit API</title>
<style>body{font-family:system-ui;margin:2rem}code{background:#f3f4f6;padding:.2rem .4rem;border-radius:.25rem}</style>
<h1>VibeKit API</h1>
<p>Themes in DB: <strong>${c}</strong></p>
<ul>
  <li><a href="/health">/health</a></li>
  <li><a href="/themes">/themes</a> (GET)</li>
  <li>POST <code>/themes</code> JSON: { name, colors, typography, spacing, logoUrl }</li>
</ul>`
      return new Response(html, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          ...corsHeaders(request),
        },
      })
    }

    return json({ error: 'Not found' }, 404, corsHeaders(request))
  },
}
