import { useTheme } from '../store/theme'

export default function BorderRadius() {
  const { theme, setTheme } = useTheme()

  const radius = theme.spacing?.borderRadius ?? 8

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseInt(e.target.value, 10)
    setTheme((prev) => ({
      ...prev,
      spacing: { ...(prev.spacing ?? {}), borderRadius: value },
    }))
  }

  return (
    <div className='vk-br-field'>
      <div className='vk-br-slider-head'>
        <span className='vk-br-field-label'>Radius</span>
        <code className='vk-br-value'>{radius}px</code>
      </div>
      <input
        type='range'
        className='vk-br-slider'
        min={0}
        max={25}
        step={1}
        value={radius}
        onChange={handleChange}
        aria-label='Border radius'
      />
      <div className='vk-br-scale'>
        <span>0</span>
        <span>12</span>
        <span>25</span>
      </div>
    </div>
  )
}
