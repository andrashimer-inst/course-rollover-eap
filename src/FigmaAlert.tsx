import type { ReactNode } from 'react'
import {
  Alert,
  IconButton,
  IconCheckMarkLine,
  IconInfoLine,
  IconNoLine,
  IconWarningLine,
  IconXLine,
  ScreenReaderContent,
} from '@instructure/ui/v11_7'
import { THEMES, shadowCss, useAppThemeKey } from './appTheme'

// Alert as designed in Figma for the new themes (Light, Dark).
// The package Alert (v2) puts the new colors into the old layout (icon box with a divider),
// so this component draws the Figma layout instead. It reads every color, radius and shadow
// from the active theme's own Alert tokens, so nothing is hard-coded. In the Legacy theme the
// package Alert is already the Figma legacy design, so it is used as is.

type Variant = 'info' | 'success' | 'warning' | 'error'

export type FigmaAlertProps = {
  variant?: Variant
  // floating = solid color, shadow, for page-level messages. inline = tinted, for use inside content.
  type?: 'floating' | 'inline'
  dismissible?: boolean
  onDismiss?: () => void
  closeLabel?: string
  // Optional buttons shown under the message (at most one primary and one secondary).
  actions?: ReactNode
  children: ReactNode
}

const ICONS: Record<Variant, ReactNode> = {
  info: <IconInfoLine />,
  success: <IconCheckMarkLine />,
  warning: <IconWarningLine />,
  error: <IconNoLine />,
}

const LABELS: Record<Variant, string> = {
  info: 'Information:',
  success: 'Success:',
  warning: 'Warning:',
  error: 'Error:',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveTokens(theme: any) {
  const nt = theme.newTheme
  const semantic = nt.semantics(nt.primitives)
  const alert = nt.components.Alert(semantic)
  const shadow = nt.sharedTokens(semantic).boxShadow.elevation4
  return { alert, text: semantic.color.text, shadow }
}

// Turns a token (a color, or { value, modify: alpha }) into a CSS color.
function cssColor(token: unknown): string {
  if (typeof token === 'string') return token
  const t = token as { value: string; modify?: { value: number } }
  if (t.modify && /^#[0-9a-f]{6}$/i.test(t.value)) {
    const n = parseInt(t.value.slice(1), 16)
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${t.modify.value})`
  }
  return t.value
}

const KEY: Record<Variant, string> = { info: 'info', success: 'success', warning: 'warning', error: 'danger' }

export default function FigmaAlert({
  variant = 'info',
  type = 'floating',
  dismissible = false,
  onDismiss,
  closeLabel = 'Close alert',
  actions,
  children,
}: FigmaAlertProps) {
  const themeKey = useAppThemeKey()

  if (themeKey === 'legacy') {
    return (
      <Alert
        variant={variant}
        hasShadow={type === 'floating'}
        margin="0"
        renderCloseButtonLabel={dismissible ? closeLabel : undefined}
        onDismiss={onDismiss}
      >
        {children}
      </Alert>
    )
  }

  const { alert, text, shadow } = resolveTokens(THEMES[themeKey])
  const k = KEY[variant]
  const floating = type === 'floating'
  // Figma: floating warning keeps dark/base text; the other floating alerts use text on color.
  const onColor = floating && variant !== 'warning'
  const textColor = onColor ? text.onColor : text.base
  const iconColor = floating ? textColor : text[variant]
  const background = cssColor(alert[floating ? `${k}Background` : `${k}BackgroundInline`])
  const border = cssColor(alert[floating ? `${k}BorderColor` : `${k}BorderColorInline`])
  const boxShadow = floating ? shadowCss(shadow) : undefined

  return (
    <div
      role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        boxSizing: 'border-box',
        overflow: 'hidden',
        background,
        color: textColor,
        border: `${alert.borderWidth} solid ${border}`,
        borderRadius: alert.borderRadius,
        boxShadow,
        fontFamily: alert.contentFontFamily,
        fontSize: alert.contentFontSize,
        fontWeight: alert.contentFontWeight,
        lineHeight: alert.contentLineHeight,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          color: iconColor,
          padding: `${alert.iconPaddingVertical} ${alert.iconPaddingRight} ${alert.iconPaddingVertical} ${alert.iconPaddingLeft}`,
        }}
      >
        {ICONS[variant]}
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          padding: `${alert.contentPaddingVertical} ${alert.contentPaddingHorizontal}`,
        }}
      >
        <div>
          <ScreenReaderContent>{LABELS[variant]}</ScreenReaderContent>
          {children}
        </div>
        {actions && <div style={{ display: 'flex', gap: '0.75rem' }}>{actions}</div>}
      </div>
      {dismissible && (
        <div style={{ padding: `${alert.closeButtonMarginTop} ${alert.closeButtonMarginRight} 0 0` }}>
          <IconButton
            size="small"
            withBackground={false}
            withBorder={false}
            color={onColor ? 'primary-inverse' : 'primary'}
            screenReaderLabel={closeLabel}
            onClick={onDismiss}
          >
            <IconXLine />
          </IconButton>
        </div>
      )}
    </div>
  )
}
