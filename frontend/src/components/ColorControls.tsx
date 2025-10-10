import { useMemo } from 'react'
import { useTheme } from '../store/theme'

function formatHex(hex: string) {
  const h = (hex || '').toLowerCase()
  return h.startsWith('#') ? h : `#${h}`
}

const FIELDS: Array<{ key: keyof any; label: string; def: string }> = [
  { key: 'neutral_light', label: 'Neutral – Light', def: '#ffffff' },
  { key: 'neutral_dark', label: 'Neutral – Dark', def: '#111111' },
  { key: 'primary', label: 'Primary', def: '#2563eb' },
  { key: 'secondary', label: 'Secondary', def: '#6b7280' },
  { key: 'tertiary', label: 'Tertiary', def: '#9333ea' },
  { key: 'danger', label: 'Danger', def: '#ef4444' },
  { key: 'warning', label: 'Warning', def: '#f59e0b' },
  { key: 'caution', label: 'Caution', def: '#f97316' },
  { key: 'success', label: 'Success', def: '#10b981' },
]

export default function ColorControls() {
  const { theme, setTheme } = useTheme() as {
    theme: any
    setTheme: (u: any) => void
  }
  const c = theme?.colors || {}

  const rows = useMemo(
    () =>
      FIELDS.map((f) => {
        const hex = (c as any)[f.key] || f.def
        return {
          key: f.key as string,
          label: f.label,
          hex: hex.toLowerCase(),
          shown: formatHex(hex),
        }
      }),
    [c]
  )

  function updateColor(key: string, hex: string) {
    let val = hex.trim().toLowerCase()
    if (!val.startsWith('#')) {
      if (/^[0-9a-f]{6}$/i.test(val)) val = `#${val}`
    }
    if (!/^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(val)) return
    setTheme((prev: any) => ({
      ...prev,
      colors: { ...(prev.colors || {}), [key]: val },
    }))
  }

  return (
    <section className='card'>
      <strong>Colors</strong>

      <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
        {rows.map((r) => (
          <div
            key={r.key}
            style={{
              display: 'grid',
              gridTemplateColumns: '140px auto 120px',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <label style={{ fontSize: 13 }}>{r.label}</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type='color'
                value={r.hex}
                onChange={(e) => updateColor(r.key, e.target.value)}
                style={{
                  width: 44,
                  height: 28,
                  padding: 0,
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                }}
                aria-label={`${r.label} color`}
              />
              <input
                type='text'
                value={r.hex}
                onChange={(e) => updateColor(r.key, e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  minWidth: 140,
                }}
              />
            </div>
            <code
              style={{
                fontSize: 12,
                background: '#f3f4f6',
                padding: '4px 6px',
                borderRadius: 6,
                textAlign: 'right',
              }}
            >
              {r.shown}
            </code>
          </div>
        ))}
      </div>
    </section>
  )
}
