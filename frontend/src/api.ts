// @ts-ignore
const BASE =
  import.meta.env?.VITE_API_BASE ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'vibekit.pages.dev' ||
    window.location.hostname === 'vibekit.studio' ||
    window.location.hostname === 'www.vibekit.studio')
    ? 'https://vibekit-api.ajkendal-openai.workers.dev'
    : '/api')

// Debug: log the BASE URL being used
console.log('API BASE URL:', BASE)

export async function listThemes() {
  return (await fetch(`${BASE}/themes`)).json()
}
export async function createTheme(theme: any) {
  return (
    await fetch(`${BASE}/themes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme),
    })
  ).json()
}
export async function getTheme(id: string) {
  return (await fetch(`${BASE}/themes/${id}`)).json()
}
export async function deleteTheme(id: string) {
  return (await fetch(`${BASE}/themes/${id}`, { method: 'DELETE' })).json()
}

export async function uploadLogo(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  const r = await fetch(`${BASE}/uploads/logo`, { method: 'POST', body: fd })
  if (!r.ok) throw new Error('Upload failed')
  return r.json()
}
