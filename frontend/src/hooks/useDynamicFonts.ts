import { useEffect } from 'react'
import { gfParam } from '../lib/theme'

type Args = {
  headerFamily?: string
  headerWeight?: number
  headerItalic?: boolean
  paragraphFamily?: string
  paragraphWeight?: number
  paragraphItalic?: boolean
}

/**
 * Inject (or update) a single `<link>` element that loads the user's chosen
 * Google Fonts. Re-runs when any input changes; the link is reused, not
 * duplicated.
 */
export function useDynamicFonts({
  headerFamily,
  headerWeight = 400,
  headerItalic = false,
  paragraphFamily,
  paragraphWeight = 400,
  paragraphItalic = false,
}: Args) {
  useEffect(() => {
    const h = gfParam(headerFamily, [headerWeight], headerItalic)
    const p =
      paragraphFamily && paragraphFamily !== headerFamily
        ? gfParam(paragraphFamily, [paragraphWeight], paragraphItalic)
        : ''
    const fams = [h, p].filter(Boolean)
    if (!fams.length) return
    const href = `https://fonts.googleapis.com/css2?family=${fams.join(
      '&family='
    )}&display=swap`
    let link = document.getElementById('gf-dynamic') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.id = 'gf-dynamic'
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
    link.href = href
  }, [
    headerFamily,
    headerWeight,
    headerItalic,
    paragraphFamily,
    paragraphWeight,
    paragraphItalic,
  ])
}
