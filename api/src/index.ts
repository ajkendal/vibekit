export interface Env {
  DB: D1Database
}

const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://vibekit.pages.dev',
  'https://vibekit.studio',
  'https://www.vibekit.studio',
  // add deploy domains, e.g. 'https://vibekit.yourdomain.com'
])

function corsHeaders(origin: string | null) {
  const allow =
    origin && (ALLOWED_ORIGINS.has(origin) || origin.endsWith('.vercel.app'))
      ? origin
      : '*'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  }
}

function json(
  data: any,
  init: ResponseInit = {},
  origin: string | null = null
) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(init.headers || {}),
      ...corsHeaders(origin),
    },
  })
}

function text(
  body: string,
  init: ResponseInit = {},
  origin: string | null = null
) {
  return new Response(body, {
    ...init,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      ...(init.headers || {}),
      ...corsHeaders(origin),
    },
  })
}

function html(
  body: string,
  init: ResponseInit = {},
  origin: string | null = null
) {
  return new Response(body, {
    ...init,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...(init.headers || {}),
      ...corsHeaders(origin),
    },
  })
}

type ThemeRow = {
  id: string
  name: string | null
  logo_url?: string | null
  colors?: string | null
  typography?: string | null
  spacing?: string | null
  created_at?: number | null
}

function parseTheme(row: ThemeRow | null) {
  if (!row) return null
  let colors = {}
  let typography = {}
  let spacing = {}
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
    name: row.name || null,
    logoUrl: row.logo_url || null,
    colors,
    typography,
    spacing,
    created_at: row.created_at ?? null,
  }
}

function themeToCssVars(theme: any) {
  const c = theme?.colors || {}
  const t = theme?.typography || {}
  const lines: string[] = []
  const push = (k: string, v?: string | number) =>
    v != null && lines.push(`${k}: ${v};`)

  const keys = [
    'neutral_light',
    'neutral_dark',
    'primary',
    'secondary',
    'tertiary',
    'warning',
    'danger',
    'caution',
    'success',
  ] as const

  keys.forEach((k) => {
    const val = c[k]
    if (val) push(`--color-${k.replace('_', '-')}`, val)
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

  return `:root{\n  ${lines.join('\n  ')}\n}`
}

async function getTheme(env: Env, id: string) {
  const row = await env.DB.prepare('SELECT * FROM themes WHERE id = ?')
    .bind(id)
    .first<ThemeRow>()
  return parseTheme(row)
}

async function getFileData(f: File | null) {
  if (!f) return null
  const buf = await f.arrayBuffer()
  return {
    name: f.name || 'upload',
    mime: f.type || 'application/octet-stream',
    data: new Uint8Array(buf),
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    // ---- THEMES ----

    // GET /themes
    if (request.method === 'GET' && url.pathname === '/themes') {
      const rows = await env.DB.prepare(
        'SELECT id, name, created_at FROM themes ORDER BY created_at DESC'
      ).all<ThemeRow>()
      const list = (rows.results || []).map((r: ThemeRow) => ({
        id: r.id,
        name: r.name || 'Untitled Theme',
        created_at: r.created_at ?? null,
      }))
      return json(list, {}, origin)
    }

    // POST /themes (create/update) or fallback delete
    if (request.method === 'POST' && url.pathname === '/themes') {
      const body = (await request.json().catch(() => ({}))) as any
      if (body && body._action === 'delete' && body.id) {
        await env.DB.prepare('DELETE FROM themes WHERE id = ?')
          .bind(body.id)
          .run()
        return json({ ok: true }, {}, origin)
      }

      const id = body.id || crypto.randomUUID()
      const name = (body.name || 'Untitled Theme').toString()
      const logo_url = body.logoUrl || null
      const colors = JSON.stringify(body.colors || {})
      const typography = JSON.stringify(body.typography || {})
      const spacing = JSON.stringify(body.spacing || {})
      const created_at = Math.floor(Date.now() / 1000)

      await env.DB.prepare(
        `
        INSERT INTO themes (id, name, logo_url, colors, typography, spacing, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          logo_url = excluded.logo_url,
          colors = excluded.colors,
          typography = excluded.typography,
          spacing = excluded.spacing
      `
      )
        .bind(id, name, logo_url, colors, typography, spacing, created_at)
        .run()

      return json({ id, name }, { status: 200 }, origin)
    }

    // GET /themes/:id
    {
      const match = url.pathname.match(/^\/themes\/([a-f0-9-]+)$/)
      if (request.method === 'GET' && match) {
        const id = match[1]
        const t = await getTheme(env, id)
        if (!t) return json({ error: 'Not found' }, { status: 404 }, origin)
        return json(t, {}, origin)
      }
    }

    // DELETE /themes/:id
    {
      const match = url.pathname.match(/^\/themes\/([a-f0-9-]+)$/)
      if (request.method === 'DELETE' && match) {
        const id = match[1]
        await env.DB.prepare('DELETE FROM themes WHERE id = ?').bind(id).run()
        return json({ ok: true }, {}, origin)
      }
    }

    // GET /themes/:id/css  (plain CSS)
    {
      const match = url.pathname.match(/^\/themes\/([a-f0-9-]+)\/css$/)
      if (request.method === 'GET' && match) {
        const id = match[1]
        const t = await getTheme(env, id)
        if (!t) return text('/* Not found */', { status: 404 }, origin)
        const css = themeToCssVars(t)
        return new Response(css, {
          status: 200,
          headers: {
            'Content-Type': 'text/css; charset=utf-8',
            ...corsHeaders(origin),
          },
        })
      }
    }

    // GET /themes/:id/preview (HTML demo)
    {
      const match = url.pathname.match(/^\/themes\/([a-f0-9-]+)\/preview$/)
      if (request.method === 'GET' && match) {
        const id = match[1]
        const t = await getTheme(env, id)
        if (!t) return html('<h1>Theme not found</h1>', { status: 404 }, origin)
        const css = themeToCssVars(t)
        const doc = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${t.name || 'Theme Preview'}</title>
<style>
${css}
:root {
  --bg: var(--color-neutral-light, #ffffff);
  --fg: var(--color-neutral-dark, #111111);
  --primary: var(--color-primary, #2563eb);
  --secondary: var(--color-secondary, #6b7280);
}
body {
  margin: 0;
  font-family: var(--font-paragraph, system-ui, -apple-system, Segoe UI, Roboto, sans-serif);
  background: var(--bg);
  color: var(--fg);
  line-height: var(--line-height-paragraph, 1.6);
  letter-spacing: var(--letter-spacing-paragraph, 0em);
}
h1,h2,h3 {
  font-family: var(--font-header, system-ui, -apple-system, Segoe UI, Roboto, sans-serif);
  line-height: var(--line-height-header, 1.25);
  letter-spacing: var(--letter-spacing-header, 0em);
}
.card {
  max-width: 760px; margin: 32px auto; padding: 20px;
  border-radius: 12px; border: 1px solid #e5e7eb; background: #fff;
}
.btn {
  padding: 8px 12px; border-radius: 8px; border: 0;
  background: var(--primary); color: #fff; font-weight: 600;
}
.badge {
  display:inline-block; padding: 4px 8px; border-radius: 999px;
  background: var(--secondary); color: #fff; font-size: 12px;
}
.code { background:#0b1020; color:#e5e7eb; padding:10px 12px; border-radius:10px; }
</style>
</head>
<body>
  <div class="card">
    <h1>${t.name || 'Theme Preview'}</h1>
    <p>This page uses your theme’s CSS variables from <code>/themes/${id}/css</code>.</p>
    <p><span class="badge">Badge</span></p>
    <p><button class="btn">Primary Button</button></p>
    <pre class="code">${css.replace(/</g, '&lt;')}</pre>
  </div>
</body>
</html>`
        return html(doc, { status: 200 }, origin)
      }
    }

    // ---- UPLOADS ----

    // POST /uploads/logo  (expects multipart form: file=...)
    {
      const match = url.pathname === '/uploads/logo'
      if (request.method === 'POST' && match) {
        const form = await request.formData()
        const file =
          (form.get('file') as File | null) || (form.get('logo') as File | null)
        const fd = await getFileData(file)
        if (!fd) return json({ error: 'file missing' }, { status: 400 }, origin)

        const id = crypto.randomUUID()
        const created_at = Math.floor(Date.now() / 1000)
        await env.DB.prepare(
          'INSERT INTO uploads (id, name, mime, data, created_at) VALUES (?,?,?,?,?)'
        )
          .bind(id, fd.name, fd.mime, fd.data, created_at)
          .run()

        return json({ url: `/uploads/${id}` }, { status: 200 }, origin)
      }
    }

    // GET /uploads/:id (binary)
    {
      const match = url.pathname.match(/^\/uploads\/([a-f0-9-]+)$/)
      if ((request.method === 'GET' || request.method === 'HEAD') && match) {
        const id = match[1]
        let row
        try {
          row = await env.DB.prepare(
            'SELECT mime, data FROM uploads WHERE id = ?'
          )
            .bind(id)
            .first<{ mime: string; data: ArrayBuffer | Uint8Array }>()
        } catch (error) {
          return json({ error: 'Database error' }, { status: 500 }, origin)
        }
        if (!row) return json({ error: 'Not found' }, { status: 404 }, origin)

        let body
        if (typeof row.data === 'string') {
          // If data is base64 encoded string, decode it
          body = Uint8Array.from(atob(row.data), (c) => c.charCodeAt(0))
        } else if (row.data instanceof ArrayBuffer) {
          body = row.data
        } else if (row.data instanceof Uint8Array) {
          body = row.data
        } else if (Array.isArray(row.data)) {
          // D1 returns binary data as a regular array, convert to Uint8Array
          body = new Uint8Array(row.data)
        } else {
          body = (row.data as any)?.buffer ?? row.data
        }
        return new Response(body, {
          status: 200,
          headers: { 'Content-Type': row.mime, ...corsHeaders(origin) },
        })
      }
    }

    return json({ error: 'Not found' }, { status: 404 }, origin)
  },
}
