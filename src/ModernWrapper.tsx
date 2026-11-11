import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  BellInstUIIcon,
  Breadcrumb,
  ExpandInstUIIcon,
  Heading,
  IconButton,
  IgniteaiLogoInstUIIcon,
  ListFilterInstUIIcon,
  ScreenReaderContent,
  SearchInstUIIcon,
  SimpleSelect,
  Text,
  TextInput,
} from '@instructure/ui/v11_7'
import GlobalNav from './GlobalNav'
import ContentTabList from './ContentTabList'
import { AiAgentPanel, CustomPanel, FiltersPanel, NotificationsPanel } from './UtilityPanels'
import { useSurfaceTokens } from './appTheme'
import type { DesktopWrapperProps } from './DesktopWrapper'

// The Light and Dark desktop wrapper, from the Figma "Wrapper (beta)" page (Wrapper guidelines,
// Layout examples, Dismiss and collapse behavior, Anatomy). One wrapper per page, never nested:
//   Global Nav (always) | Container: header area, then content row | Utility panel (user opened)
// The container has 32px padding. The main container is centered and 1100px wide at most, or fills
// the space when expanded. The content row holds an optional ContentTabList (300px), the content
// area (360px minimum) and an optional TrailingContentArea (300px), 24px apart. An open utility
// panel is a 420px column that takes width from the container; below 360px of content it covers
// the trailing area first, then the content.

type PanelKey = 'aiAgent' | 'notifications' | 'filtering'

const PANEL_LABEL: Record<PanelKey, string> = {
  aiAgent: 'AI assistant',
  notifications: 'Notifications',
  filtering: 'Filters',
}

export default function ModernWrapper({
  pageTitle,
  breadcrumb = [],
  onBreadcrumb,
  activeNav = 'Dashboard',
  course,
  onNavigate,
  headerActions,
  fullWidth = false,
  description,
  headerSlot,
  actions,
  titleAction,
  tabs,
  showFilters = false,
  contentTabList,
  trailingContent,
  trailingLabel = 'Details',
  filterContent,
  sidePanel,
  children,
}: DesktopWrapperProps) {
  const t = useSurfaceTokens()
  const [ownPanel, setPanel] = useState<PanelKey | null>(null)
  // A panel the page opens (like a to-do list) takes the slot of the built-in panels while it is open.
  const sideOpen = !!sidePanel?.open
  const panel: PanelKey | 'side' | null = sideOpen ? 'side' : ownPanel
  // The "expand" button in the header lets the user switch between the readable column and full width.
  // A change of the page's `fullWidth` prop starts over from the prop.
  const [widthChoice, setWidthChoice] = useState<{ base: boolean; value: boolean } | null>(null)
  const expanded = widthChoice && widthChoice.base === fullWidth ? widthChoice.value : fullWidth

  // One panel at a time. Focus moves into the panel when it opens and back to the button when it closes.
  const trigger = useRef<HTMLElement | null>(null)
  const panelEl = useRef<HTMLElement | null>(null)
  const toggle = (key: PanelKey, el: HTMLElement | null) => {
    trigger.current = el
    if (sideOpen) sidePanel?.onClose()
    setPanel((p) => (p === key ? null : key))
  }
  const opener = (key: PanelKey) => (e: { currentTarget: object }) => toggle(key, e.currentTarget as HTMLElement)
  const close = () => setPanel(null)
  useEffect(() => {
    if (panel) panelEl.current?.focus()
    else trigger.current?.focus()
  }, [panel])
  // Tell the page how wide the open panel is, so the theme switcher can move out of its way.
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--wrapper-panel-width', panel ? '26.25rem' : '0px')
    return () => {
      root.style.removeProperty('--wrapper-panel-width')
    }
  }, [panel])

  const column: CSSProperties = { display: 'flex', flexDirection: 'column' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.pageColor, color: t.textColor, fontFamily: t.fontFamily }}>
      <a
        className="skip-link"
        href="#main-content"
        style={{ '--skip-bg': t.containerColor, '--skip-fg': t.textColor } as CSSProperties}
      >
        Skip to main content
      </a>
      <GlobalNav activeNav={activeNav} course={course} onNavigate={onNavigate} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
        {/* Container: 32px padding around the main container */}
        {/* The container never gets narrower than its header (640px plus padding). When an open panel needs
            more room than is left, it floats over the container instead of squeezing or cutting it. */}
        <div style={{ ...column, flex: 1, minWidth: '44rem', boxSizing: 'border-box', padding: t.space.xxl }}>
          <div
            style={{
              ...column,
              flex: 1,
              width: '100%',
              gap: t.space.xxl,
              maxWidth: expanded ? 'none' : 1100,
              margin: '0 auto',
            }}
          >
            {/* Header area (always): breadcrumb and global actions, title, description, then the
                optional custom slot, actions, tabs and filtering row, 24px apart */}
            <div style={{ ...column, gap: t.space.xl, minWidth: 640 }}>
              <div style={{ ...column, gap: t.space.sm }}>
                <div style={{ ...column, gap: t.space.sm }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      minHeight: '2.5rem',
                      gap: t.space.xl,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Breadcrumb label="You are here:">
                        {breadcrumb.map((crumb) => (
                          <Breadcrumb.Link
                    key={crumb}
                    href="#"
                    onClick={(e: { preventDefault: () => void }) => {
                      e.preventDefault()
                      onBreadcrumb?.(crumb)
                    }}
                  >
                            {crumb}
                          </Breadcrumb.Link>
                        ))}
                        <Breadcrumb.Link>{pageTitle}</Breadcrumb.Link>
                      </Breadcrumb>
                    </div>
                    {/* Global actions: AI agent and notifications open a utility panel */}
                    <div style={{ display: 'flex', gap: t.gapButtons }}>
                      {headerActions}
                      <IconButton
                        color="ai-primary"
                        screenReaderLabel={PANEL_LABEL.aiAgent}
                        aria-expanded={panel === 'aiAgent'}
                        onClick={opener('aiAgent')}
                      >
                        <IgniteaiLogoInstUIIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        screenReaderLabel={PANEL_LABEL.notifications}
                        aria-expanded={panel === 'notifications'}
                        onClick={opener('notifications')}
                      >
                        <BellInstUIIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        screenReaderLabel={expanded ? 'Use readable content width' : 'Expand content to full width'}
                        aria-pressed={expanded}
                        onClick={() => setWidthChoice({ base: fullWidth, value: !expanded })}
                      >
                        <ExpandInstUIIcon />
                      </IconButton>
                    </div>
                  </div>
                  <div style={{ ...column, gap: t.space.xs }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t.space.md }}>
                      <Heading level="h1" variant="titlePageDesktop">
                        {pageTitle}
                      </Heading>
                      {titleAction}
                    </div>
                    {description && (
                      <Text as="div" variant="descriptionPage" color="secondary">
                        {description}
                      </Text>
                    )}
                  </div>
                </div>
                {headerSlot}
              </div>

              {actions && <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.gapButtons }}>{actions}</div>}
              {tabs}
              {showFilters && (
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: t.gapInputs }}>
                  <div style={{ width: '18.75rem' }}>
                    <TextInput
                      renderLabel={<ScreenReaderContent>Search</ScreenReaderContent>}
                      placeholder="Search..."
                      type="search"
                      renderBeforeInput={<SearchInstUIIcon />}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: t.gapInputs }}>
                    <div style={{ width: '12.5rem' }}>
                      <SimpleSelect
                        renderLabel={<ScreenReaderContent>Order by</ScreenReaderContent>}
                        placeholder="Order by"
                        defaultValue=""
                      >
                        <SimpleSelect.Option id="name" value="name">
                          Name
                        </SimpleSelect.Option>
                        <SimpleSelect.Option id="date" value="date">
                          Date
                        </SimpleSelect.Option>
                        <SimpleSelect.Option id="status" value="status">
                          Status
                        </SimpleSelect.Option>
                      </SimpleSelect>
                    </div>
                    <IconButton
                      color="secondary"
                      screenReaderLabel={PANEL_LABEL.filtering}
                      aria-expanded={panel === 'filtering'}
                      onClick={opener('filtering')}
                    >
                      <ListFilterInstUIIcon />
                    </IconButton>
                  </div>
                </div>
              )}
            </div>

            {/* Content row: ContentTabList | content area | TrailingContentArea. The row fills the
                page down to the bottom padding, and the two side areas are as tall as the row. */}
            <div style={{ display: 'flex', flex: 1, alignItems: 'stretch', gap: t.gapCards }}>
              {contentTabList && <ContentTabList {...contentTabList} />}
              <main id="main-content" tabIndex={-1} style={{ flex: 1, minWidth: '22.5rem', outline: 'none' }}>
                {children}
              </main>
              {trailingContent && (
                <aside aria-label={trailingLabel} style={{ display: 'grid', gridTemplateRows: '1fr', width: '18.75rem', flexShrink: 0 }}>
                  {trailingContent}
                </aside>
              )}
            </div>
          </div>
        </div>

        {/* Utility panel: a 420px card column fixed to the right edge, with a 12px margin. The spacer beside
            the container reserves its width and gives it back when the window is too narrow. */}
        {panel && <div aria-hidden style={{ width: '26.25rem', flexShrink: 1, minWidth: 0 }} />}
        {panel && (
          <aside
            ref={panelEl}
            tabIndex={-1}
            aria-label={panel === 'side' ? sidePanel!.title : PANEL_LABEL[panel]}
            style={{
              width: '26.25rem',
              maxWidth: '100vw',
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100vh',
              boxSizing: 'border-box',
              padding: t.space.md,
              outline: 'none',
            }}
          >
            {panel === 'side' && (
              <CustomPanel title={sidePanel!.title} description={sidePanel!.description} onClose={sidePanel!.onClose}>
                {sidePanel!.content}
              </CustomPanel>
            )}
            {panel === 'aiAgent' && <AiAgentPanel onClose={close} />}
            {panel === 'notifications' && <NotificationsPanel onClose={close} />}
            {panel === 'filtering' && <FiltersPanel onClose={close}>{filterContent}</FiltersPanel>}
          </aside>
        )}
      </div>
    </div>
  )
}
