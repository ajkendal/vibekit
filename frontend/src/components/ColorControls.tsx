import { useTheme } from '../store/theme'
import ContrastChecker from './ContrastChecker'

export default function ColorControls() {
  const { theme, setTheme } = useTheme()
  const C = theme.colors
  const set = (k: keyof typeof C, v: string) =>
    setTheme((t) => ({ ...t, colors: { ...t.colors, [k]: v } }))

  const keys: Array<keyof typeof C> = [
    'neutral_light',
    'neutral_dark',
    'primary',
    'secondary',
    'tertiary',
    'danger',
    'warning',
    'caution',
    'success',
  ]

  return (
    <div className='card'>
      <strong>Colors</strong>
      <div className='row'>
        {keys.map((k) => (
          <label key={k} style={{ display: 'grid', gap: 4 }}>
            <span style={{ textTransform: 'capitalize' }}>
              {k.replace('_', ' ')}
            </span>
            <input
              type='color'
              value={(C as any)[k] || '#000000'}
              onChange={(e) => set(k, e.target.value)}
            />
            <input
              value={(C as any)[k] || ''}
              onChange={(e) => set(k, e.target.value)}
            />
          </label>
        ))}
      </div>
      <ContrastChecker />
    </div>
  )
}
