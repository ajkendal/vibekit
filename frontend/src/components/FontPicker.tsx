import { useMemo } from 'react'
import { useGoogleFontsCatalog } from '../hooks/useGoogleFontsCatalog'

type Props = {
  label?: string
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

function ensure400(ws: number[]) {
  return ws.includes(400) ? ws : [...ws, 400].sort((a, b) => a - b)
}

export default function FontPicker({
  family,
  weight,
  italic,
  lineHeight = 1.4,
  letterSpacing = 0,
  onChange,
}: Props) {
  const { fonts, map } = useGoogleFontsCatalog()

  const families = useMemo(
    () =>
      fonts.length
        ? fonts.map((f) => f.family).sort((a, b) => a.localeCompare(b))
        : ['Inter'],
    [fonts]
  )

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

  // Live preview style. Note: line-height is intentionally NOT applied here —
  // the preview is single-line so line-height would only change the line-box
  // height (causing layout shift) without showing a visible spacing effect.
  // The number is shown in the meta caption, and the actual line-height
  // behavior is visible in the canvas Live Preview where text wraps.
  const previewStyle: React.CSSProperties = {
    fontFamily: `'${family}', system-ui, -apple-system, sans-serif`,
    fontWeight: weight,
    fontStyle: italic ? 'italic' : 'normal',
    letterSpacing: `${letterSpacing}em`,
  }

  return (
    <>
      {/* Live preview */}
      <div className='vk-fp-preview' style={previewStyle}>
        The quick brown fox
        <span className='vk-fp-preview-meta'>
          {family} · {weight}
          {italic ? ' italic' : ''} · {lineHeight.toFixed(2)} lh
          {letterSpacing !== 0 ? ` · ${letterSpacing.toFixed(2)}em ls` : ''}
        </span>
      </div>

      {/* Family */}
      <div className='vk-fp-field'>
        <span className='vk-fp-field-label'>Family</span>
        <select
          className='vk-fp-select'
          value={family}
          onChange={(e) => onChange({ family: e.target.value })}
        >
          {families.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Weight */}
      <div className='vk-fp-field'>
        <span className='vk-fp-field-label'>Weight</span>
        <div className='vk-fp-weights'>
          {supportedWeights.map((w) => (
            <button
              key={w}
              type='button'
              className={`vk-fp-weight ${w === weight ? 'is-active' : ''}`}
              onClick={() => onChange({ weight: w })}
              title={`Weight ${w}`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Italic */}
      <div className='vk-fp-field'>
        <label className={`vk-toggle ${italic ? 'is-on' : ''}`}>
          <input
            type='checkbox'
            checked={italic}
            onChange={() => onChange({ italic: !italic })}
          />
          <span className='vk-toggle-track'>
            <span className='vk-toggle-thumb' />
          </span>
          <span className='vk-toggle-text'>
            <span className='vk-toggle-label'>Italic</span>
            <span className='vk-toggle-sub'>Slanted style for emphasis</span>
          </span>
        </label>
      </div>

      {/* Line height */}
      <div className='vk-fp-field'>
        <div className='vk-fp-slider-head'>
          <span className='vk-fp-field-label'>Line height</span>
          <code className='vk-fp-slider-value'>{lineHeight.toFixed(2)}</code>
        </div>
        <input
          type='range'
          className='vk-fp-slider'
          min={1.0}
          max={2.2}
          step={0.05}
          value={lineHeight}
          onChange={(e) => onChange({ lineHeight: parseFloat(e.target.value) })}
        />
      </div>

      {/* Letter spacing */}
      <div className='vk-fp-field'>
        <div className='vk-fp-slider-head'>
          <span className='vk-fp-field-label'>Letter spacing</span>
          <code className='vk-fp-slider-value'>
            {letterSpacing.toFixed(2)}em
          </code>
        </div>
        <input
          type='range'
          className='vk-fp-slider'
          min={-0.05}
          max={0.2}
          step={0.01}
          value={letterSpacing}
          onChange={(e) =>
            onChange({ letterSpacing: parseFloat(e.target.value) })
          }
        />
      </div>
    </>
  )
}
