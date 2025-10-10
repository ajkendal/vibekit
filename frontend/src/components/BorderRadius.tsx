import { useTheme } from '../store/theme'

export default function BorderRadius() {
  const { theme, setTheme } = useTheme()

  // Get current border radius value, default to 8px if not set
  const borderRadius = theme.spacing?.borderRadius ?? 8

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseInt(e.target.value, 10)
    setTheme((prev: any) => ({
      ...prev,
      spacing: {
        ...(prev.spacing || {}),
        borderRadius: value,
      },
    }))
  }

  return (
    <section className='card' style={{ marginTop: 16 }}>
      <strong>Border Radius</strong>

      <div style={{ marginTop: 12 }}>
        <label
          htmlFor='border-radius-slider'
          style={{
            display: 'block',
            marginBottom: 8,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Border Radius: {borderRadius}px
        </label>

        <input
          id='border-radius-slider'
          type='range'
          min='0'
          max='25'
          value={borderRadius}
          onChange={handleChange}
          style={{
            width: '100%',
            height: 6,
            borderRadius: 3,
            background: '#e5e7eb',
            outline: 'none',
            cursor: 'pointer',
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            color: '#6b7280',
            marginTop: 4,
          }}
        >
          <span>0px</span>
          <span>12px</span>
          <span>25px</span>
        </div>
      </div>

      {/* Preview samples */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
          Preview:
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              backgroundColor: theme.colors?.primary || '#2563eb',
              borderRadius: `${borderRadius}px`,
              transition: 'border-radius 0.2s ease',
            }}
          />
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: `${borderRadius}px`,
              fontSize: 14,
              transition: 'border-radius 0.2s ease',
            }}
          >
            Sample button
          </div>
        </div>
      </div>
    </section>
  )
}
