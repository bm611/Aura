import { HugeiconsIcon } from '@hugeicons/react'

/**
 * Shared icon wrapper for the app.
 *
 * Props:
 *   icon        — required Hugeicons data object (e.g. Sun01Icon)
 *   size        — px size (default 24)
 *   strokeWidth — stroke width (default 1.5)
 *   stroke      — alias for strokeWidth (backward-compat shim)
 *   color       — color string (default "currentColor")
 *   className   — extra CSS classes
 *   ...rest     — forwarded to the underlying <svg> element
 */
export default function Icon({ icon, size = 24, strokeWidth, stroke, color = 'currentColor', className = '', ...rest }) {
  const resolvedStrokeWidth = strokeWidth ?? stroke
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={resolvedStrokeWidth}
      color={color}
      className={className}
      {...rest}
    />
  )
}
