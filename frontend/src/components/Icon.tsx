import type { CSSProperties } from 'react'
import { ICON_PATHS, type IconName } from '../lib/icons'

type Props = {
  name: IconName
  size?: number
  strokeWidth?: number
  style?: CSSProperties
}

export function Icon({ name, size = 16, strokeWidth = 2, style }: Props) {
  const path = ICON_PATHS[name]
  if (!path) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
      aria-hidden
    >
      <path d={path} />
    </svg>
  )
}
