/**
 * VibeKit API client.
 *
 * Single source of truth for talking to the Cloudflare Worker. Handles
 * environment-aware base URL (proxy in dev, prod URL otherwise), JSON
 * unwrapping, error normalization, and provides URL builders for the
 * public /themes/:id/css and /themes/:id/preview endpoints.
 */

import type { Theme, ThemeRow } from '../types/theme'

const PROD = 'https://vibekit-api.ajkendal-openai.workers.dev'
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0'])
const LOCAL_API = 'http://127.0.0.1:8787'

function inferBase(): string {
  if (typeof window === 'undefined') return PROD
  if (LOCAL_HOSTS.has(window.location.hostname)) return '/api'
  return PROD
}

let baseUrl = inferBase()

export function getApiBase(): string {
  return baseUrl
}

export function setApiBase(url: string): void {
  baseUrl = url
}

function isLocalDev(): boolean {
  if (typeof window === 'undefined') return false
  return (
    LOCAL_HOSTS.has(window.location.hostname) &&
    (baseUrl === '/api' || !baseUrl.startsWith('http'))
  )
}

async function getJson<T = unknown>(
  res: Response | null | undefined
): Promise<T> {
  if (!res) throw new Error('Network error: empty response')
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const j = (await res.json()) as { error?: string }
      if (j?.error) msg = j.error
    } catch {
      /* body was not JSON — keep generic message */
    }
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}

/* ───────── themes ───────── */

/**
 * Fetch all themes. Tries the inferred base, then localhost, then the Vite
 * proxy — whichever responds first wins, and we cache that base URL for
 * subsequent calls in the same session.
 */
export async function listThemes(): Promise<ThemeRow[]> {
  const candidates = [`${baseUrl}/themes`, `${LOCAL_API}/themes`, '/api/themes']
  for (const url of candidates) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const j = await res.json()
      if (Array.isArray(j)) {
        if (url.endsWith('/themes')) {
          setApiBase(url.replace(/\/themes$/, ''))
        }
        return j as ThemeRow[]
      }
    } catch {
      /* try next */
    }
  }
  return []
}

export async function getTheme(id: string): Promise<Theme> {
  return getJson<Theme>(await fetch(`${baseUrl}/themes/${id}`))
}

export async function saveTheme(theme: Theme): Promise<Theme> {
  return getJson<Theme>(
    await fetch(`${baseUrl}/themes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(theme),
    })
  )
}

export async function deleteTheme(id: string): Promise<void> {
  // Try DELETE, fall back to POST { _action: 'delete' } if Worker doesn't accept it.
  try {
    const r = await fetch(`${baseUrl}/themes/${id}`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
    })
    if (r.ok) return
  } catch {
    /* fall through to POST fallback */
  }
  const r2 = await fetch(`${baseUrl}/themes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id, _action: 'delete' }),
  })
  if (!r2.ok) {
    let msg = 'Failed to delete theme'
    try {
      const j = (await r2.json()) as { error?: string }
      if (j?.error) msg = j.error
    } catch {
      /* keep generic */
    }
    throw new Error(msg)
  }
}

/* ───────── uploads ───────── */

export async function uploadLogo(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${baseUrl}/uploads/logo`, {
    method: 'POST',
    body: fd,
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  const out = (await res.json()) as { url?: string }
  if (!out?.url) throw new Error('Upload failed: bad response')
  return out.url
}

/* ───────── public URL builders ───────── */

/** Public URL for a theme's compiled CSS — for sharing/embedding. */
export function themeCssUrl(id: string): string {
  return isLocalDev() ? `${LOCAL_API}/themes/${id}/css` : `${baseUrl}/themes/${id}/css`
}

/** Public preview page URL for a theme. */
export function themePreviewUrl(id: string): string {
  return isLocalDev() ? `${LOCAL_API}/themes/${id}/preview` : `${baseUrl}/themes/${id}/preview`
}
