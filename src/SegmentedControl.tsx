import { useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { useAppThemeKey, THEMES } from './appTheme'

// SegmentedControl: pick one option out of a few that are always visible, in one bar.
//
// The Figma library has it ("instUI segmentedControl": style text, icon or text + icon, size sm, md or lg, disabled).
// The InstUI package (11.7.8) does not, so this is built from plain buttons that use the theme's own
// SegmentedControl tokens. Colors, sizes, radii and the shadow come from the theme, so Legacy, Light and Dark all work.
// It is one tab stop. The arrow keys move between the options, and the options are radios for screen readers.
//
//   <SegmentedControl
//     label="View"                     // what the group is, read by screen readers
//     value={view} onChange={setView}
//     size="md"                        // 'sm' | 'md' | 'lg' (default 'md')
//     options={[
//       { value: 'list', label: 'List', icon: <ListInstUIIcon /> },   // text + icon
//       { value: 'grid', label: 'Grid' },                              // text only
//       { value: 'cal', icon: <CalendarInstUIIcon />, screenReaderLabel: 'Calendar' }, // icon only
//     ]}
//   />

export type SegmentedOption = {
  value: string
  // Text of the option. Leave it out for an icon-only option and give `screenReaderLabel`.
  label?: string
  icon?: ReactNode
  screenReaderLabel?: string
  disabled?: boolean
}

type Size = 'sm' | 'md' | 'lg'

// A token can be a plain value, or { value, modify: { type: 'alpha', value } } for a transparent color.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const color = (token: any): string => {
  if (typeof token === 'string') return token
  const alpha = token?.modify?.type === 'alpha' ? Math.round(token.modify.value * 100) : 100
  return `color-mix(in srgb, ${color(token.value)} ${alpha}%, transparent)`
}

export default function SegmentedControl({
  label,
  options,
  value,
  onChange,
  size = 'md',
  disabled = false,
}: {
  label: string
  options: SegmentedOption[]
  value: string
  onChange: (value: string) => void
  size?: Size
  disabled?: boolean
}) {
  const themeKey = useAppThemeKey()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nt = (THEMES[themeKey] as any).newTheme
  const semantic = nt.semantics(nt.primitives)
  const c = nt.components.SegmentedControl(semantic, nt.sharedTokens(semantic))
  const S = size === 'sm' ? 'Sm' : size === 'lg' ? 'Lg' : 'Md'
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const shadow = Object.values(c.selectedItemShadow as Record<string, { x: string; y: string; blur: string; spread: string; color: string }>)
    .map((s) => `${s.x} ${s.y} ${s.blur} ${s.spread} ${s.color}`)
    .join(', ')

  const enabled = options.map((o, i) => (o.disabled || disabled ? -1 : i)).filter((i) => i >= 0)
  const selectedIndex = options.findIndex((o) => o.value === value)
  // The selected option is the tab stop. If it is disabled or none is selected, the first enabled one is.
  const stop = enabled.includes(selectedIndex) ? selectedIndex : enabled[0]

  const move = (from: number, step: number) => {
    const at = enabled.indexOf(from)
    const next = enabled[(at + step + enabled.length) % enabled.length]
    refs.current[next]?.focus()
    onChange(options[next].value)
  }
  const onKeyDown = (e: KeyboardEvent, i: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') move(i, 1)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') move(i, -1)
    else if (e.key === 'Home') move(enabled[enabled.length - 1], 1)
    else if (e.key === 'End') move(enabled[0], -1)
    else return
    e.preventDefault()
  }

  const text = (on: boolean) =>
    disabled ? c.unselectedItemTextDisabledColor : on ? c.selectedItemTextColor : c.unselectedItemTextColor

  return (
    <>
      <style>{`
        .segmented-item { transition: background-color 0.15s; }
        .segmented-item:not(:disabled):not([aria-checked="true"]):hover { background: ${color(c.unselectedItemBackgroundHoverColor)} !important; }
        .segmented-item:not(:disabled):not([aria-checked="true"]):active { background: ${color(c.unselectedItemBackgroundActiveColor)} !important; }
        .segmented-item:focus-visible { outline: 2px solid ${semantic.color.stroke.info}; outline-offset: 2px; }
      `}</style>
      <div
        role="radiogroup"
        aria-label={label}
        aria-disabled={disabled || undefined}
        style={{
          display: 'inline-flex',
          // In a narrow space the options wrap onto a second row, so the bar never runs past its container.
          flexWrap: 'wrap',
          gap: c.trackGap,
          padding: c.trackPadding,
          borderRadius: c.TrackBorderRadius,
          background: disabled ? c.trackBackgroundDisabledColor : color(c.trackBackgroundColor),
          fontFamily: c.fontFamily,
          width: 'fit-content',
          // Legacy has no disabled colors in its tokens, so it is dimmed instead.
          opacity: disabled && !c.trackBackgroundDisabledColor ? 0.5 : undefined,
          maxWidth: '100%',
        }}
      >
        {options.map((o, i) => {
          const on = o.value === value
          const off = disabled || !!o.disabled
          return (
            <button
              key={o.value}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="radio"
              className="segmented-item"
              aria-checked={on}
              aria-label={o.label ? undefined : o.screenReaderLabel}
              disabled={off}
              tabIndex={i === stop ? 0 : -1}
              onClick={() => onChange(o.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: c[`itemGap${S}`],
                height: c[`height${S}`],
                minWidth: o.label ? undefined : c[`height${S}`],
                padding: o.label ? `0 ${c[`itemPaddingHorizontal${S}`]}` : 0,
                border: 0,
                borderRadius: c.itemBorderRadius,
                background: on ? (disabled ? c.selectedItemBackgroundDisabledColor : c.selectedItemBackgroundColor) : 'transparent',
                color: on && off ? c.selectedItemTextDisabledColor : text(on),
                boxShadow: on && !disabled ? shadow : undefined,
                fontFamily: 'inherit',
                fontSize: c[`fontSize${S}`],
                fontWeight: c.fontWeight,
                lineHeight: c.lineHeight,
                whiteSpace: 'nowrap',
                cursor: off ? 'not-allowed' : 'pointer',
              }}
            >
              {o.icon}
              {o.label}
            </button>
          )
        })}
      </div>
    </>
  )
}
