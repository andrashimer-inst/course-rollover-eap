import { useState } from 'react'
import type { CSSProperties } from 'react'
import {
  Breadcrumb,
  Heading,
  IconButton,
  IconHamburgerLine,
  IconInstructureLogoLine,
  Link,
  Text,
} from '@instructure/ui/v11_7'
import GlobalNav from './GlobalNav'
import LegacyCourseMenu from './LegacyCourseMenu'
import { useSurfaceTokens } from './appTheme'
import type { DesktopWrapperProps } from './DesktopWrapper'

// The Legacy desktop wrapper: the Canvas shell as it is today (three screens of the main flow:
// a plain page, the Courses tray open, a course page).
//   Global nav (dark bar, Courses tray)  |  top bar: course menu toggle, breadcrumb, actions
//   Course menu (course pages only)      |  title row (title left, actions right), content, side column
//   Footer
// The page is flat on white: no cards, no utility panels. Light and Dark use `ModernWrapper` instead.

const FOOTER_LINKS = ['Privacy Policy', 'Cookie Notice', 'Acceptable Use Policy']

export default function LegacyWrapper({
  pageTitle,
  description,
  breadcrumb = [],
  onBreadcrumb,
  activeNav = 'Dashboard',
  course,
  fullWidth = false,
  actions,
  titleAction,
  barActions,
  trailingContent,
  trailingLabel = 'Details',
  courseList,
  onNavigate,
  onOpenCourse,
  children,
}: DesktopWrapperProps) {
  const t = useSurfaceTokens()
  const [menuOpen, setMenuOpen] = useState(true)
  const separator = `${t.borderWidth} solid ${t.borderColor}`
  const showBar = Boolean(course) || breadcrumb.length > 0
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
      <GlobalNav activeNav={activeNav} courseList={courseList} onNavigate={onNavigate} onOpenCourse={onOpenCourse} />

      <div style={{ ...column, flex: 1, minWidth: 0 }}>
        {/* Top bar: course menu toggle, breadcrumb, then page-level actions at the end */}
        {showBar && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.space.lg,
              padding: `${t.space.lg} 0`,
              margin: `0 ${t.space.xxl}`,
              borderBottom: separator,
            }}
          >
            {course && (
              <IconButton
                screenReaderLabel={menuOpen ? 'Hide course navigation' : 'Show course navigation'}
                withBackground={false}
                withBorder={false}
                color="primary"
                aria-expanded={menuOpen}
                aria-controls="course-navigation"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <IconHamburgerLine />
              </IconButton>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Breadcrumb label="You are here:" size="large">
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
            {barActions && <div style={{ display: 'flex', gap: t.gapButtons }}>{barActions}</div>}
          </div>
        )}

        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {course && menuOpen && <LegacyCourseMenu course={course} id="course-navigation" />}

          <div style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: `${t.space.xl} ${t.space.xxl} ${t.space.xxl}` }}>
            <div style={{ display: 'flex', justifyContent: fullWidth ? 'stretch' : 'center', gap: `calc(${t.space.xxl} * 1.5)` }}>
              <div style={{ flex: 1, minWidth: 0, maxWidth: fullWidth ? undefined : 1100 }}>
                {/* Title row: the title, then the page's actions at the end. Plain pages draw a line under it. */}
                <header
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: t.space.xl,
                    paddingBottom: t.space.md,
                    borderBottom: course ? undefined : separator,
                  }}
                >
                  {/* The title, then the description 4px under it (Figma header spacing). */}
                  <div style={{ ...column, gap: t.space.xs, minWidth: 0 }}>
                    <Heading level="h1" variant="titlePageMobile">{pageTitle}</Heading>
                    {description && <Text as="div" variant="descriptionPage">{description}</Text>}
                  </div>
                  {(actions || titleAction) && <div style={{ display: 'flex', alignItems: 'center', gap: t.gapButtons }}>{actions}{titleAction}</div>}
                </header>
                <main id="main-content" tabIndex={-1} style={{ marginTop: t.space.xl, outline: 'none' }}>
                  {children}
                </main>
              </div>

              {/* Side column: plain content on the page, no card */}
              {trailingContent && (
                <aside aria-label={trailingLabel} style={{ width: '15.5rem', flexShrink: 0 }}>
                  {trailingContent}
                </aside>
              )}
            </div>
          </div>
        </div>

        <footer
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: t.space.lg,
            padding: `${t.space.lg} 0`,
            margin: `0 ${t.space.xl}`,
            borderTop: separator,
          }}
        >
          {/* The package has the Instructure mark but no wordmark, so the name is set as text beside it. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space.sm }}>
            <span style={{ display: 'flex', fontSize: t.space.xl }}>
              <IconInstructureLogoLine />
            </span>
            <Text weight="bold" letterSpacing="expanded" transform="uppercase" color="brand">
              Instructure
            </Text>
          </div>
          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.lg, listStyle: 'none', margin: 0, padding: 0 }}>
            {FOOTER_LINKS.map((label) => (
              <li key={label}>
                <Link
                  href="#"
                  variant="standalone"
                  onClick={(e: { preventDefault: () => void }) => e.preventDefault()}
                  themeOverride={{ textColor: t.textColor, textHoverColor: t.textColor }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </div>
  )
}
