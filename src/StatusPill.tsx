import type { ReactNode } from 'react'
import { THEMES, useAppThemeKey } from './appTheme'

// Figma "Pill": a static status label (never removable, no hover or focus). The package Pill only builds
// the small size and ignores the Figma fill colors and padding, so this draws the Figma pill from the
// same theme tokens (Light and Dark: tinted fill, regular text; Legacy: outline, bold text).
//   size  xs 20px, sm 24px, md 28px, lg 32px tall
//   color neutral (inactive), info (active, pending), warning (needs attention), success (complete), error (failed)
// Keep the label to one or two words and pick the color by meaning (docs/components.md).

type Size = 'xs' | 'sm' | 'md' | 'lg'
type Color = 'neutral' | 'info' | 'warning' | 'success' | 'error' | 'ai'

// A token is a color, or { value, modify: { value } } for a color with transparency.
function cssColor(token: unknown): string {
  const t = token as { value: string; modify?: { value: number } }
  if (typeof token === 'string') return token
  if (t.modify && /^#[0-9a-f]{6}$/i.test(t.value)) {
    const n = parseInt(t.value.slice(1), 16)
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${t.modify.value})`
  }
  return t.value
}

export default function StatusPill({
  children,
  color = 'neutral',
  size = 'md',
  icon,
}: {
  children: ReactNode
  color?: Color
  size?: Size
  // An icon before the label. It takes the pill's text color and size.
  icon?: ReactNode
}) {
  const key = useAppThemeKey()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nt = (THEMES[key] as any).newTheme
  const semantic = nt.semantics(nt.primitives)
  const p = nt.components.Pill(semantic, nt.sharedTokens(semantic))

  const by = {
    xs: { height: p.heightXSmall, padX: p.paddingHorizontal, font: p.textFontSize, gap: p.gapIconLabel },
    sm: { height: p.height, padX: p.paddingHorizontal, font: p.textFontSize, gap: p.gapIconLabel },
    md: { height: p.heightMedium, padX: p.paddingHorizontalMedium, font: p.textFontSizeMedium, gap: p.gapIconLabelMedium },
    lg: { height: p.heightLarge, padX: p.paddingHorizontalLarge, font: p.textFontSizeLarge, gap: p.gapIconLabelLarge },
  }[size]
  const prefix = color === 'neutral' || color === 'ai' ? 'base' : color
  let text = cssColor(p[`${prefix}TextColor`])
  let border = cssColor(p[`${prefix}BorderColor`])
  let background = cssColor(color === 'neutral' || color === 'ai' ? p.neutralBackgroundColor : p[`${color}BackgroundColor`])
  // The Light error pill is a solid red block with white text, which looks out of place beside the tinted
  // warning, success and info pills. In Light it gets the same tinted look from the error tokens.
  // AI features get the purple of the AI colors (the pill has no AI color of its own).
  if (color === 'ai') {
    const purple = cssColor(semantic.color.background.aiTopGradient)
    text = cssColor(semantic.color.text.aiColor)
    border = key === 'legacy' ? purple : `color-mix(in srgb, ${purple} 40%, transparent)`
    background = key === 'legacy' ? background : `color-mix(in srgb, ${purple} 16%, transparent)`
  }
  if (key === 'light' && color === 'error') {
    const red = cssColor(semantic.color.background.error)
    background = `color-mix(in srgb, ${red} 14%, transparent)`
    border = `color-mix(in srgb, ${red} 30%, transparent)`
    text = cssColor(semantic.color.text.error)
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: by.gap,
        boxSizing: 'border-box',
        minHeight: by.height,
        // The vertical padding keeps the text off the edge even when the label wraps to a taller box.
        padding: `${p.paddingVertical} ${by.padX}`,
        borderRadius: p.borderRadius,
        border: `${p.borderWidth} ${p.borderStyle ?? 'solid'} ${border}`,
        background,
        color: text,
        fontFamily: p.fontFamily,
        fontSize: by.font,
        fontWeight: p.textFontWeight,
        lineHeight: 1.25,
        whiteSpace: 'nowrap',
      }}
    >
      {icon && <span style={{ display: 'flex', fontSize: by.font }}>{icon}</span>}
      {children}
    </span>
  )
}
