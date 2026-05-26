/**
 * Starter templates — curated themes users can fork as a starting point.
 *
 * Each entry is a fully-populated Theme (minus the `id`, which gets cleared
 * on load so the user's first Save creates a new theme on the server rather
 * than overwriting the template).
 *
 * Each palette is designed to evoke a specific real-world brand persona:
 *   Sunset Soda → warm editorial (Apartment Therapy, Magnolia)
 *   Workshop    → modern SaaS (Linear, Vercel)
 *   Editorial   → publishing gravitas (NYT, The New Yorker)
 *   Playful     → consumer-friendly (Mailchimp, Notion)
 *   Mono        → minimal designer portfolio (Pentagram)
 *   Verdant     → wellness/natural (Allbirds, Hims & Hers)
 *
 * To add a new template, append to STARTER_TEMPLATES.
 */

import type { Theme } from '../types/theme'

export const STARTER_TEMPLATES: Theme[] = [
  {
    name: 'Sunset Soda',
    description:
      'A warm, editorial palette for content sites and magazines.',
    colors: {
      neutral_light: '#FFF7ED',
      neutral_mid: '#8C7163',
      neutral_dark: '#1F1612',
      primary: '#C44536', // terracotta
      secondary: '#5C7548', // olive sage
      tertiary: '#D69E2E', // honey gold
      success: '#5C7548',
      warning: '#D69E2E',
      caution: '#E07856',
      danger: '#882F2A',
    },
    typography: {
      headerFont: 'Playfair Display',
      headerWeights: [700],
      headerLineHeight: 1.15,
      paragraphFont: 'Source Sans 3',
      paragraphWeights: [400],
      paragraphLineHeight: 1.65,
      base: 16,
      ratio: 1.25,
    },
    spacing: { borderRadius: 10 },
  },

  {
    name: 'Workshop',
    description:
      'Clean and confident — for SaaS apps, dashboards, and dev tools.',
    colors: {
      neutral_light: '#FCFCFD',
      neutral_mid: '#5E5E66',
      neutral_dark: '#0F0F12',
      primary: '#5E6AD2', // Linear-ish blurple
      secondary: '#14B8A6', // teal
      tertiary: '#F59E0B', // warm amber
      success: '#10B981',
      warning: '#F59E0B',
      caution: '#F97316',
      danger: '#DC2626',
    },
    typography: {
      headerFont: 'Inter',
      headerWeights: [600],
      headerLineHeight: 1.2,
      paragraphFont: 'Inter',
      paragraphWeights: [400],
      paragraphLineHeight: 1.6,
      base: 14,
      ratio: 1.2,
    },
    spacing: { borderRadius: 8 },
  },

  {
    name: 'Editorial',
    description:
      'Considered and serif-forward — for publications and long-form writing.',
    colors: {
      neutral_light: '#FAF6EE',
      neutral_mid: '#6B5F58',
      neutral_dark: '#1C140F',
      primary: '#8B2635', // wine
      secondary: '#3D5A47', // forest
      tertiary: '#C9A064', // gold leaf
      success: '#587A40',
      warning: '#B07A30',
      caution: '#BB4536',
      danger: '#5C0E15',
    },
    typography: {
      headerFont: 'Playfair Display',
      headerWeights: [700],
      headerLineHeight: 1.12,
      paragraphFont: 'Lora',
      paragraphWeights: [400],
      paragraphLineHeight: 1.7,
      base: 18,
      ratio: 1.333,
    },
    spacing: { borderRadius: 4 },
  },

  {
    name: 'Playful',
    description:
      'Joyful and confident — for consumer apps, creative tools, and brands with personality.',
    colors: {
      neutral_light: '#FFF6EC',
      neutral_mid: '#A88B7A',
      neutral_dark: '#241813',
      primary: '#F97316', // warm orange
      secondary: '#06B6D4', // cyan
      tertiary: '#FACC15', // sun yellow
      success: '#22C55E',
      warning: '#EAB308',
      caution: '#FB923C',
      danger: '#DC2626',
    },
    typography: {
      headerFont: 'DM Sans',
      headerWeights: [700],
      headerLineHeight: 1.18,
      paragraphFont: 'DM Sans',
      paragraphWeights: [400],
      paragraphLineHeight: 1.6,
      base: 16,
      ratio: 1.25,
    },
    spacing: { borderRadius: 16 },
  },

  {
    name: 'Mono',
    description:
      'Minimal and considered — newsprint-warm grays for editorial and portfolio work.',
    colors: {
      neutral_light: '#F7F5EF', // newsprint cream
      neutral_mid: '#5A574F',
      neutral_dark: '#0E0C09',
      primary: '#0E0C09', // near-black primary action
      secondary: '#3A382F',
      tertiary: '#8B877B',
      success: '#4D6840',
      warning: '#A07A2E',
      caution: '#B85C2E',
      danger: '#7D2F2A',
    },
    typography: {
      headerFont: 'JetBrains Mono',
      headerWeights: [700],
      headerLineHeight: 1.2,
      paragraphFont: 'Inter',
      paragraphWeights: [400],
      paragraphLineHeight: 1.6,
      base: 14,
      ratio: 1.2,
    },
    spacing: { borderRadius: 2 },
  },

  {
    name: 'Verdant',
    description:
      'Earthy and grounded — for wellness, sustainability, and outdoor brands.',
    colors: {
      neutral_light: '#F4EFDF', // sandstone
      neutral_mid: '#7A857A',
      neutral_dark: '#1B2E20',
      primary: '#2D6A4F', // deep forest
      secondary: '#95D5B2', // sage
      tertiary: '#C8763C', // warm rust
      success: '#588157',
      warning: '#D68C45',
      caution: '#BC6C25',
      danger: '#9D3838',
    },
    typography: {
      headerFont: 'Lora',
      headerWeights: [600],
      headerLineHeight: 1.18,
      paragraphFont: 'Lato',
      paragraphWeights: [400],
      paragraphLineHeight: 1.65,
      base: 16,
      ratio: 1.25,
    },
    spacing: { borderRadius: 12 },
  },
]
