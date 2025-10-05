// Force production URL for now - will fix hostname detection later
const BASE = 'https://vibekit-api.ajkendal-openai.workers.dev'

// Debug logging - VERY OBVIOUS
console.log('🚀🚀🚀 VIBEKIT API URL:', BASE)
console.log('🌍🌍🌍 HOSTNAME:', typeof window !== 'undefined' ? window.location.hostname : 'server-side')
console.log('✅✅✅ NEW CODE DEPLOYED!')

// Add alert for testing (remove later)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    alert(`VibeKit Debug: API URL is ${BASE}`)
  }, 1000)
}

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
