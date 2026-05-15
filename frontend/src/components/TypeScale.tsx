import { useTheme } from '../store/theme'

const BASE_SIZES = [12, 14, 16, 18]

const RATIOS: { value: number; label: string }[] = [
  { value: 1.125, label: 'Minor 2nd' },
  { value: 1.2, label: 'Minor 3rd' },
  { value: 1.25, label: 'Major 3rd' },
  { value: 1.333, label: 'Perfect 4th' },
  { value: 1.5, label: 'Perfect 5th' },
]

/** Steps of the modular scale we render in the preview, from biggest to smallest. */
const PREVIEW_STEPS: { exp: number; label: string }[] = [
  { exp: 3, label: 'Display · H1' },
  { exp: 2, label: 'H2' },
  { exp: 1, label: 'H3' },
  { exp: 0, label: 'Body' },
  { exp: -1, label: 'Caption' },
]

export default function TypeScale() {
  const { theme, setTheme } = useTheme()
  const base = theme.typography?.base ?? 16
  const ratio = theme.typography?.ratio ?? 1.25

  function update(patch: { base?: number; ratio?: number }) {
    setTheme((prev) => ({
      ...prev,
      typography: { ...(prev.typography ?? {}), ...patch },
    }))
  }

  return (
    <>
      <div className='vk-ts-field'>
        <span className='vk-ts-field-label'>Base size</span>
        <div className='vk-ts-pills'>
          {BASE_SIZES.map((s) => (
            <button
              key={s}
              type='button'
              className={`vk-ts-pill ${s === base ? 'is-active' : ''}`}
              onClick={() => update({ base: s })}
            >
              {s}px
            </button>
          ))}
        </div>
      </div>

      <div className='vk-ts-field'>
        <span className='vk-ts-field-label'>Scale ratio</span>
        <div className='vk-ts-pills'>
          {RATIOS.map((r) => (
            <button
              key={r.value}
              type='button'
              className={`vk-ts-pill ${
                Math.abs(r.value - ratio) < 0.005 ? 'is-active' : ''
              }`}
              onClick={() => update({ ratio: r.value })}
            >
              {r.label}
              <span className='vk-ts-pill-sub'>{r.value.toFixed(3)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className='vk-ts-field'>
        <span className='vk-ts-field-label'>Preview</span>
        <div className='vk-ts-preview'>
          {PREVIEW_STEPS.map(({ exp, label }) => {
            const size = Math.round(base * Math.pow(ratio, exp) * 10) / 10
            return (
              <div key={exp} className='vk-ts-preview-row'>
                <span
                  className='vk-ts-preview-sample'
                  style={{ fontSize: `${size}px`, lineHeight: 1.15 }}
                >
                  Aa
                </span>
                <span className='vk-ts-preview-label'>{label}</span>
                <code className='vk-ts-preview-size'>{size}px</code>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
