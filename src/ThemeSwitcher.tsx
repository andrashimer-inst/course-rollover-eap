import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent, ReactNode } from 'react'
import {
  ChevronDownInstUIIcon,
  ChevronUpInstUIIcon,
  IconButton,
  InstUISettingsProvider,
  RadioInput,
  RadioInputGroup,
  ScreenReaderContent,
  Text,
  View,
} from '@instructure/ui/v11_7'
import { THEMES } from './appTheme'
import type { ThemeKey } from './appTheme'

// The Theme overlay that sits on every design so all three themes can be checked. Drag the "Theme" title
// (or focus it and use the arrow keys) to move it. The chevron collapses it to the title alone.
// `children` adds page-specific controls under the theme buttons (the template's Layout options).
// It starts at the bottom left, so the utility panels on the right never cover it. Once the user has moved it, it
// stays where they put it.

type Props = {
  themeKey: ThemeKey
  onChange: (key: ThemeKey) => void
  children?: ReactNode
}

const STEP = 16

export default function ThemeSwitcher({ themeKey, onChange, children }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  const clamp = (left: number, top: number) => {
    const r = box.current?.getBoundingClientRect()
    const w = r?.width ?? 0
    const h = r?.height ?? 0
    return {
      left: Math.min(Math.max(0, left), Math.max(0, window.innerWidth - w)),
      top: Math.min(Math.max(0, top), Math.max(0, window.innerHeight - h)),
    }
  }

  // Keep a moved box inside the window when the window shrinks.
  useEffect(() => {
    const onResize = () => setPos((p) => (p ? clamp(p.left, p.top) : p))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const r = box.current?.getBoundingClientRect()
    if (!r) return
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current) setPos(clamp(e.clientX - drag.current.dx, e.clientY - drag.current.dy))
  }
  const onPointerUp = () => {
    drag.current = null
  }
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const move = { ArrowLeft: [-STEP, 0], ArrowRight: [STEP, 0], ArrowUp: [0, -STEP], ArrowDown: [0, STEP] }[e.key]
    const r = box.current?.getBoundingClientRect()
    if (!move || !r) return
    e.preventDefault()
    setPos(clamp(r.left + move[0], r.top + move[1]))
  }

  // The selected toggle is the Canvas blue in every theme (the toggle's own default is green).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canvas = (THEMES.legacy as any).newTheme
  const blue: string = canvas.sharedTokens(canvas.semantics(canvas.primitives)).background.brandColor

  return (
    <div
      ref={box}
      className="theme-switcher"
      style={{
        position: 'fixed',
        zIndex: 9999,
        '--theme-selected': blue,
        ...(pos
          ? { left: pos.left, top: pos.top }
          : { left: 16, bottom: 16 }),
      } as unknown as CSSProperties}
    >
      {/* The box looks the same in every theme: Legacy borrows the Light styling. */}
      <InstUISettingsProvider theme={themeKey === 'legacy' ? THEMES.light : THEMES[themeKey]}>
      <View as="div" background="primary" padding="small" borderWidth="small" borderRadius="medium" shadow="above">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div
            tabIndex={0}
            role="group"
            aria-label="Theme. Drag, or use the arrow keys, to move this box."
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
            style={{ cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
          >
            <Text weight="bold" size="medium">
              Theme
            </Text>
          </div>
          <IconButton
            screenReaderLabel={collapsed ? 'Expand theme box' : 'Collapse theme box'}
            size="small"
            withBackground={false}
            withBorder={false}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <ChevronUpInstUIIcon /> : <ChevronDownInstUIIcon />}
          </IconButton>
        </div>
        {!collapsed && (
          <>
            <div style={{ marginTop: 12 }}>
            <RadioInputGroup
              name="theme"
              description={<ScreenReaderContent>Theme</ScreenReaderContent>}
              variant="toggle"
              size="small"
              value={themeKey}
              onChange={(_e, value) => onChange(value as ThemeKey)}
            >
              {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
                <RadioInput key={key} value={key} label={key === 'legacy' ? 'Legacy' : key === 'light' ? 'Light' : 'Dark'} />
              ))}
            </RadioInputGroup>
            </div>
            {children}
          </>
        )}
      </View>
      </InstUISettingsProvider>
    </div>
  )
}
