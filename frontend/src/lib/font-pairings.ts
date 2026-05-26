/**
 * Curated header + paragraph font pairings.
 *
 * Each entry is a tested combination users can apply with one click.
 * Applying a pairing changes ONLY the header and paragraph font families —
 * weight, italic, line-height, letter-spacing, and the type scale are all
 * left alone so the user's tuning isn't lost.
 *
 * Six tightly-curated picks, chosen for maximum variety so the user sees a
 * real spread of options at a glance.
 */

export type FontPairing = {
  id: string
  name: string
  description: string
  header: string
  body: string
}

export const PAIRINGS: FontPairing[] = [
  {
    id: 'linear',
    name: 'Linear',
    description: 'Modern, tight, dev-tool clean.',
    header: 'Inter',
    body: 'Inter',
  },
  {
    id: 'vibekit',
    name: 'Vibekit',
    description: 'Friendly geometric — matches VibeKit’s own brand.',
    header: 'Plus Jakarta Sans',
    body: 'Plus Jakarta Sans',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Playfair Display headlines, clean sans body.',
    header: 'Playfair Display',
    body: 'Source Sans 3',
  },
  {
    id: 'magazine',
    name: 'Magazine',
    description: 'All-serif pairing for long-form publications.',
    header: 'Playfair Display',
    body: 'Lora',
  },
  {
    id: 'modern-tech',
    name: 'Modern tech',
    description: 'Space Grotesk + Inter — current dev-tool aesthetic.',
    header: 'Space Grotesk',
    body: 'Inter',
  },
  {
    id: 'italic-flair',
    name: 'Italic flair',
    description: 'Instrument Serif italic, Inter for body.',
    header: 'Instrument Serif',
    body: 'Inter',
  },
]
