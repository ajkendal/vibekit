import { useEffect } from 'react'

/**
 * Inject a `<style>` block that toggles italics on h1-h3 and p tags
 * inside the live preview area. Cheap way to apply the user's italic
 * preference globally without rewiring every consumer.
 */
export function useItalicStyle(headerItalic: boolean, paragraphItalic: boolean) {
  useEffect(() => {
    let style = document.getElementById('vk-italic-style') as
      | HTMLStyleElement
      | null
    if (!style) {
      style = document.createElement('style')
      style.id = 'vk-italic-style'
      document.head.appendChild(style)
    }
    const headerRule = headerItalic
      ? 'h1,h2,h3{font-style:italic;}'
      : 'h1,h2,h3{font-style:normal;}'
    const paraRule = paragraphItalic
      ? 'p{font-style:italic;}'
      : 'p{font-style:normal;}'
    style.textContent = `${headerRule}\n${paraRule}`
  }, [headerItalic, paragraphItalic])
}
