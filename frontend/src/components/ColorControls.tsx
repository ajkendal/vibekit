import { ColorPicker } from 'antd'
import { useTheme } from '../store/theme'
import { useColorNames } from '../hooks/useColorNames'
import type { ColorKey } from '../types/theme'

type Field = { key: ColorKey; label: string; def: string }

const COLOR_GROUPS: { name: string; fields: Field[] }[] = [
  {
    name: 'Neutrals',
    fields: [
      { key: 'neutral_light', label: 'Light', def: '#ffffff' },
      { key: 'neutral_mid', label: 'Mid', def: '#6b7280' },
      { key: 'neutral_dark', label: 'Dark', def: '#000000' },
    ],
  },
  {
    name: 'Brand',
    fields: [
      { key: 'primary', label: 'Primary', def: '#2563eb' },
      { key: 'secondary', label: 'Secondary', def: '#3b82f6' },
      { key: 'tertiary', label: 'Tertiary', def: '#9333ea' },
    ],
  },
  {
    name: 'Status',
    fields: [
      { key: 'success', label: 'Success', def: '#10b981' },
      { key: 'warning', label: 'Warning', def: '#f59e0b' },
      { key: 'caution', label: 'Caution', def: '#f97316' },
      { key: 'danger', label: 'Danger', def: '#ef4444' },
    ],
  },
]

export default function ColorControls() {
  const { theme, setTheme } = useTheme()
  const colors = theme.colors ?? {}
  const colorMap = colors as Record<string, string>
  const { colorNames, loading } = useColorNames(colorMap)

  function updateColor(key: ColorKey, hex: string) {
    let val = hex.trim().toLowerCase()
    if (!val.startsWith('#') && /^[0-9a-f]{6}$/i.test(val)) val = `#${val}`
    if (!/^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(val)) return
    setTheme((prev) => ({
      ...prev,
      colors: { ...(prev.colors ?? {}), [key]: val },
    }))
  }

  return (
    <>
      {COLOR_GROUPS.map((group) => (
        <div key={group.name} className='vk-token-group'>
          <div className='vk-token-group-label'>{group.name}</div>
          {group.fields.map((field) => {
            const hex = colors[field.key] ?? field.def
            const colorName = colorNames[field.key]
            const showLoading = loading && !colorName
            return (
              <ColorPicker
                key={field.key}
                value={hex}
                format='hex'
                disabledAlpha
                onChange={(c) => updateColor(field.key, c.toHexString())}
              >
                <button type='button' className='vk-color-row'>
                  <div
                    className='vk-color-swatch'
                    style={{ background: hex }}
                  />
                  <div className='vk-color-meta'>
                    <span className='vk-color-token-name'>{field.label}</span>
                    <span
                      className={`vk-color-name-secondary ${
                        showLoading ? 'is-loading' : ''
                      }`}
                    >
                      {showLoading ? '…' : colorName || ' '}
                    </span>
                  </div>
                  <code className='vk-color-hex'>{hex}</code>
                </button>
              </ColorPicker>
            )
          })}
        </div>
      ))}
    </>
  )
}
