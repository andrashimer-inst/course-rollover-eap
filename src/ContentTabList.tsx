import { useEffect, useRef, useState } from 'react'
import {
  CheckInstUIIcon,
  Heading,
  IconButton,
  MenuInstUIIcon,
  Options,
  PanelLeftCloseInstUIIcon,
} from '@instructure/ui/v11_7'
import { useSurfaceTokens } from './appTheme'

// Figma "ContentTabList": the optional in-page navigation that sits left of the content area in the
// Light and Dark wrapper. A 300px card with a title, a collapse button and a list of anchor links
// (the current one is filled with a check). Minimized it shrinks to a 56px card with a menu button.
// Only for navigation inside one page. It is not a substitute for the Global Nav or for Tabs.

export type ContentTabListConfig = {
  title: string
  items: string[]
  // Which item is current at first.
  current?: string
  onSelect?: (item: string) => void
}

export default function ContentTabList({ title, items, current, onSelect }: ContentTabListConfig) {
  const t = useSurfaceTokens()
  const [open, setOpen] = useState(true)
  const [selected, setSelected] = useState(current ?? items[0])
  // Keep keyboard focus on the button that replaces the one just pressed.
  const showButton = useRef<HTMLElement | null>(null)
  const hideButton = useRef<HTMLElement | null>(null)
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    ;(open ? hideButton : showButton).current?.focus()
  }, [open])

  const card = {
    boxSizing: 'border-box',
    background: t.containerColor,
    padding: t.paddingCardSm,
    borderRadius: t.radiusCardSm,
    boxShadow: t.shadowResting,
    flexShrink: 0,
  } as const

  if (!open) {
    return (
      <div style={{ ...card, alignSelf: 'flex-start' }}>
        <IconButton
          screenReaderLabel="Show page navigation"
          withBackground={false}
          withBorder={false}
          onClick={() => setOpen(true)}
          aria-expanded={false}
          elementRef={(el) => {
            showButton.current = el as HTMLElement | null
          }}
        >
          <MenuInstUIIcon />
        </IconButton>
      </div>
    )
  }

  return (
    <nav aria-label="Page navigation" style={{ ...card, width: '18.75rem', alignSelf: 'stretch' }}>
      <div style={{ padding: t.paddingCardSm, display: 'flex', flexDirection: 'column', gap: t.space.md }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Heading level="h2" variant="titleCardRegular">
            {title}
          </Heading>
          <IconButton
            screenReaderLabel="Hide page navigation"
            withBackground={false}
            withBorder={false}
            onClick={() => setOpen(false)}
            aria-expanded
            elementRef={(el) => {
              hideButton.current = el as HTMLElement | null
            }}
          >
            <PanelLeftCloseInstUIIcon />
          </IconButton>
        </div>
        {/* A real list of links. Options only styles the rows, so each row gets its own Options. */}
        <ul className="content-tab-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {items.map((item) => {
            const isCurrent = item === selected
            return (
              <li key={item}>
                <Options role="presentation">
                  <Options.Item
                    href={`#${item.toLowerCase().replace(/\W+/g, '-')}`}
                    variant={isCurrent ? 'selected' : 'default'}
                    aria-current={isCurrent ? 'location' : undefined}
                    renderAfterLabel={isCurrent ? <CheckInstUIIcon size="lg" /> : undefined}
                    // Figma rows are 48px tall (a touch target); the default is 44px. Unselected rows have no fill, they sit on the card.
                    themeOverride={{ paddingVertical: '0.875rem', background: 'transparent' }}
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault()
                      setSelected(item)
                      onSelect?.(item)
                    }}
                  >
                    {item}
                  </Options.Item>
                </Options>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
