import { ColorPicker, Typography } from 'antd'
import { useTheme } from '../store/theme'
import { useColorNames } from '../hooks/useColorNames'
import styles from '../styles/ColorControls.module.scss'

const { Text } = Typography

const COLOR_GROUPS = {
  neutrals: [
    { key: 'neutral_light', label: 'Neutral - Light', def: '#ffffff' },
    { key: 'neutral_mid', label: 'Neutral - Mid', def: '#6b7280' },
    { key: 'neutral_dark', label: 'Neutral - Dark', def: '#000000' },
  ],
  theme: [
    { key: 'primary', label: 'Primary', def: '#2563eb' },
    { key: 'secondary', label: 'Secondary', def: '#3b82f6' },
    { key: 'tertiary', label: 'Tertiary', def: '#9333ea' },
  ],
  status: [
    { key: 'danger', label: 'Danger', def: '#ef4444' },
    { key: 'warning', label: 'Warning', def: '#f59e0b' },
    { key: 'caution', label: 'Caution', def: '#f97316' },
    { key: 'success', label: 'Success', def: '#10b981' },
  ],
}

export default function ColorControls() {
  const { theme, setTheme } = useTheme() as {
    theme: any
    setTheme: (u: any) => void
  }
  const c = theme?.colors || {}
  const { colorNames, loading } = useColorNames(c)

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

  const renderColorField = (colorField: (typeof COLOR_GROUPS.neutrals)[0]) => {
    const hex = (c as any)[colorField.key] || colorField.def
    const colorName = colorNames[colorField.key]

    return (
      <div key={colorField.key} className={styles.colorField}>
        <Text strong className={styles.colorLabel}>
          {colorField.label}:
        </Text>
        <div className={styles.colorPickerContainer}>
          <ColorPicker
            value={hex}
            format='hex'
            disabledAlpha
            showText={true}
            onChange={(color) =>
              updateColor(colorField.key, color.toHexString())
            }
          />
          {colorName && <Text className={styles.colorName}>{colorName}</Text>}
          {loading && !colorName && (
            <Text className={styles.colorNameLoading}>Loading...</Text>
          )}
        </div>
      </div>
    )
  }

  return (
    <section className='card'>
      <strong className={styles.colorPalette}>Color Palette</strong>

      <div className={styles.gridContainer}>
        <div className={styles.colorGroup}>
          <Text className={styles.groupLabel}>Neutrals</Text>
          {COLOR_GROUPS.neutrals.map((colorField) =>
            renderColorField(colorField)
          )}
        </div>
        <div className={styles.colorGroup}>
          <Text className={styles.groupLabel}>Theme</Text>
          {COLOR_GROUPS.theme.map((colorField) => renderColorField(colorField))}
        </div>
        <div className={styles.colorGroup}>
          <Text className={styles.groupLabel}>Status</Text>
          {COLOR_GROUPS.status.map((colorField) =>
            renderColorField(colorField)
          )}
        </div>
      </div>
    </section>
  )
}
