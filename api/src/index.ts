import { themeToCssVars as exportCss } from './exports'
import { renderPreviewPage } from './preview'

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
  description?: string | null
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
    description: row.description || null,
    logoUrl: row.logo_url || null,
    colors,
    typography,
    spacing,
    created_at: row.created_at ?? null,
  }
}

// Canonical implementation lives in ./exports — re-export to keep
// existing call sites working without changes.
const themeToCssVars = exportCss

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
        'SELECT id, name, description, created_at FROM themes ORDER BY created_at DESC'
      ).all<ThemeRow>()
      const list = (rows.results || []).map((r: ThemeRow) => ({
        id: r.id,
        name: r.name || 'Untitled Theme',
        description: r.description || null,
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
      const description = body.description
        ? String(body.description).slice(0, 500)
        : null
      const logo_url = body.logoUrl || null
      const colors = JSON.stringify(body.colors || {})
      const typography = JSON.stringify(body.typography || {})
      const spacing = JSON.stringify(body.spacing || {})
      const created_at = Math.floor(Date.now() / 1000)

      await env.DB.prepare(
        `
        INSERT INTO themes (id, name, description, logo_url, colors, typography, spacing, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          description = excluded.description,
          logo_url = excluded.logo_url,
          colors = excluded.colors,
          typography = excluded.typography,
          spacing = excluded.spacing
      `
      )
        .bind(
          id,
          name,
          description,
          logo_url,
          colors,
          typography,
          spacing,
          created_at
        )
        .run()

      return json({ id, name, description }, { status: 200 }, origin)
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

    // GET /themes/:id/preview (HTML demo + multi-format exports)
    {
      const match = url.pathname.match(/^\/themes\/([a-f0-9-]+)\/preview$/)
      if (request.method === 'GET' && match) {
        const id = match[1]
        const t = await getTheme(env, id)
        if (!t) return html('<h1>Theme not found</h1>', { status: 404 }, origin)
        return html(renderPreviewPage(t), { status: 200 }, origin)
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
