import { useMemo } from 'react'
import { useGoogleFontsCatalog } from '../hooks/useGoogleFontsCatalog'

type Props = {
  label: string
  family: string
  weight: number
  italic: boolean
  lineHeight?: number
  letterSpacing?: number
  onChange: (
    update: Partial<{
      family: string
      weight: number
      italic: boolean
      lineHeight: number
      letterSpacing: number
    }>
  ) => void
}

const ALL_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900]

export default function FontPicker({
  label,
  family,
  weight,
  italic,
  lineHeight = 1.4,
  letterSpacing = 0,
  onChange,
}: Props) {
  const { fonts, map } = useGoogleFontsCatalog()

  // Alphabetical family list
  const families = useMemo(
    () =>
      fonts.length
        ? fonts.map((f) => f.family).sort((a, b) => a.localeCompare(b))
        : ['Inter'],
    [fonts]
  )

  // Supported weights for selected family (ensure 400)
  const supportedWeights = useMemo(() => {
    const f = map.get(family)
    if (!f) return ensure400(ALL_WEIGHTS)
    const nums = new Set<number>()
    for (const v of f.variants) {
      const m = v.match(/^(\d{3})/)
      if (m) nums.add(parseInt(m[1], 10))
    }
    const arr = Array.from(nums).sort((a, b) => a - b)
    return ensure400(arr.length ? arr : ALL_WEIGHTS)
  }, [family, map])

  const radioName = `weight-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className='card'>
      <strong>{label}</strong>

      {/* Family */}
      <div className='row' style={{ gap: 8, marginTop: 8 }}>
        <select
          value={family}
          onChange={(e) => onChange({ family: e.target.value })}
          style={{ flex: 1 }}
        >
          {families.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Single weight (radio chips) */}
      <div className='row' style={{ gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
        {supportedWeights.map((w) => {
          const active = w === weight
          return (
            <label
              key={w}
              className='chip'
              style={{
                background: active ? '#2563eb' : '#fff',
                color: active ? '#fff' : '#111',
                cursor: 'pointer',
              }}
              title={`Weight ${w}`}
            >
              <input
                type='radio'
                name={radioName}
                checked={active}
                onChange={() => onChange({ weight: w })}
                style={{ display: 'none' }}
              />
              {w}
            </label>
          )
        })}
      </div>

      {/* Italic */}
      <div
        className='row'
        style={{ gap: 8, marginTop: 8, alignItems: 'center' }}
      >
        <label
          className='chip'
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <input
            type='checkbox'
            checked={italic}
            onChange={() => onChange({ italic: !italic })}
          />
          Italic
        </label>
        <small>
          Selected: {weight}
          {italic ? ' italic' : ''}
        </small>
      </div>

      {/* Line height & Letter spacing */}
      <div
        className='row'
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 10,
          marginTop: 8,
        }}
      >
        <label
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 64px',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>Line Height</span>
          <input
            type='range'
            min={1.0}
            max={2.2}
            step={0.05}
            value={lineHeight}
            onChange={(e) =>
              onChange({ lineHeight: parseFloat(e.target.value) })
            }
          />
          <code style={{ textAlign: 'right' }}>{lineHeight.toFixed(2)}</code>
        </label>
        <label
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 64px',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>Letter Spacing</span>
          <input
            type='range'
            min={-0.05}
            max={0.2}
            step={0.01}
            value={letterSpacing}
            onChange={(e) =>
              onChange({ letterSpacing: parseFloat(e.target.value) })
            }
          />
          <code style={{ textAlign: 'right' }}>
            {letterSpacing.toFixed(2)}em
          </code>
        </label>
      </div>
    </div>
  )
}

function ensure400(ws: number[]) {
  return ws.includes(400) ? ws : [...ws, 400].sort((a, b) => a - b)
}
