import { useEffect, useState } from 'react'

// Cache for API responses to avoid excessive calls
const colorNameCache = new Map<string, string>()

// Default names for common colors
const DEFAULT_COLOR_NAMES: Record<string, string> = {
  ffffff: 'White',
  '000000': 'Black',
  ff0000: 'Red',
  '00ff00': 'Lime',
  '0000ff': 'Blue',
  ffff00: 'Yellow',
  ff00ff: 'Magenta',
  '00ffff': 'Cyan',
  '808080': 'Gray',
  c0c0c0: 'Silver',
  '800000': 'Maroon',
  '008000': 'Green',
  '000080': 'Navy',
}

export function useColorNames(colors: Record<string, string>) {
  const [colorNames, setColorNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Helper function to get color name (default, cache, or API)
  const getColorName = async (hex: string): Promise<string> => {
    const cleanHex = hex.replace('#', '').toLowerCase()

    // Check default names first
    if (DEFAULT_COLOR_NAMES[cleanHex]) {
      return DEFAULT_COLOR_NAMES[cleanHex]
    }

    // Check cache
    if (colorNameCache.has(cleanHex)) {
      return colorNameCache.get(cleanHex) || ''
    }

    // Fetch from API
    try {
      await new Promise((resolve) => setTimeout(resolve, 150)) // Rate limiting

      const response = await fetch(
        `https://www.thecolorapi.com/id?hex=${cleanHex}`,
        { signal: AbortSignal.timeout(3000) }
      )

      const name = response.ok ? (await response.json())?.name?.value || '' : ''
      colorNameCache.set(cleanHex, name)
      return name
    } catch (error) {
      console.log(`Failed to fetch color name for ${hex}:`, error)
      colorNameCache.set(cleanHex, '')
      return ''
    }
  }

  useEffect(() => {
    const fetchAllColorNames = async () => {
      setLoading(true)
      const newColorNames: Record<string, string> = {}

      // Get valid hex colors
      const validColors = Object.entries(colors).filter(([_, hex]) =>
        hex?.match(/^#[0-9a-f]{6}$/i)
      )

      // Fetch names for all colors
      for (const [key, hex] of validColors) {
        newColorNames[key] = await getColorName(hex)
      }

      setColorNames(newColorNames)
      setLoading(false)
    }

    if (Object.keys(colors).length > 0) {
      fetchAllColorNames()
    }
  }, [colors])

  return { colorNames, loading }
}
