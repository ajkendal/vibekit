import { useMemo, useState } from 'react'
import { useGoogleFontsCatalog } from '../hooks/useGoogleFontsCatalog'

const ALL_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900]

export default function FontPicker({
  label,
  value,
  onChangeFont,
  weights,
  onToggleWeight,
  italic,
  onToggleItalic,
}: {
  label: string
  value: string
  onChangeFont: (f: string) => void
  weights: number[]
  onToggleWeight: (w: number) => void
  italic: boolean
  onToggleItalic: () => void
}) {
  const { fonts, map } = useGoogleFontsCatalog()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    const list = fonts.map((f) => f.family)
    return !qq ? list : list.filter((name) => name.toLowerCase().includes(qq))
  }, [fonts, q])

  const supportedWeights = useMemo(() => {
    const f = map.get(value)
    if (!f) return ALL_WEIGHTS
    const nums = new Set<number>()
    for (const v of f.variants) {
      const m = v.match(/^(\d{3})/)
      if (m) nums.add(parseInt(m[1], 10))
    }
    const arr = Array.from(nums)
    return arr.length ? arr.sort((a, b) => a - b) : ALL_WEIGHTS
  }, [value, map])

  const supportsItalic = useMemo(() => {
    const f = map.get(value)
    return !!f?.variants?.some((v) => /italic$/.test(v))
  }, [value, map])

  return (
    <div className='card'>
      <strong>{label}</strong>

      {/* Font family + search */}
      <div className='row'>
        <input
          placeholder='Search fonts…'
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={value} onChange={(e) => onChangeFont(e.target.value)}>
          {filtered.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Styles: Normal / Italic */}
      <div
        className='row'
        style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
      >
        <span style={{ opacity: 0.75, fontSize: 12 }}>Style</span>
        <span className='chip active'>Normal</span>
        <button
          type='button'
          className={`chip ${italic ? 'active' : ''}`}
          onClick={onToggleItalic}
          disabled={!supportsItalic}
          title={
            supportsItalic
              ? 'Toggle italic'
              : 'This family has no italic variant'
          }
        >
          Italic
        </button>
      </div>

      {/* Weight chips */}
      <div className='row' style={{ gap: 6, flexWrap: 'wrap' }}>
        {supportedWeights.map((w) => {
          const active = weights.includes(w)
          return (
            <label
              key={w}
              className='chip'
              style={{
                background: active ? '#2563eb' : '#fff',
                color: active ? '#fff' : '#111',
              }}
            >
              <input
                type='checkbox'
                checked={active}
                onChange={() => onToggleWeight(w)}
                style={{ display: 'none' }}
              />
              {w}
            </label>
          )
        })}
      </div>

      <small>
        Selected: {weights.join(', ') || '—'}
        {italic ? ' (italic enabled)' : ''}
      </small>
    </div>
  )
}
