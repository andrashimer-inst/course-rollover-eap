import { useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import {
  AccessibleContent,
  Avatar,
  Badge,
  CloseButton,
  Heading,
  IconAdminLine,
  IconCalendarMonthLine,
  IconCanvasLogoLine,
  IconClockLine,
  IconCoursesLine,
  IconDashboardLine,
  IconEportfolioLine,
  IconInboxLine,
  IconQuestionLine,
  Link,
  List,
  SideNavBar,
  Text,
  Tray,
} from '@instructure/ui/v11_7'
import { useSurfaceTokens } from './appTheme'
import { SAMPLE_COURSE_LIST } from './sampleCourse'
import type { NavKey } from './GlobalNav'

// Legacy global navigation (Canvas today): InstUI's SideNavBar. In the Legacy (canvas) theme it is a
// flush, full-height dark bar with stacked icon and label items, the page you are on shown as a white
// tab, and a toggle at the bottom that minimizes it. Courses opens a Tray (a panel that slides out
// next to the bar and covers the page, no dimming). Light and Dark use the floating card nav in
// `GlobalNav.tsx` instead.

export type TrayCourse = { name: string; code: string; term: string; published: boolean }

type Item = { label: string; key?: NavKey; icon: ReactNode; tray?: boolean }

const ITEMS: Item[] = [
  { label: 'Account', icon: <Avatar name="User Name" size="small" showBorder="always" /> },
  { label: 'Admin', icon: <IconAdminLine /> },
  { label: 'Dashboard', key: 'Dashboard', icon: <IconDashboardLine /> },
  { label: 'Courses', key: 'Courses', icon: <IconCoursesLine />, tray: true },
  { label: 'Calendar', key: 'Calendar', icon: <IconCalendarMonthLine /> },
  { label: 'Inbox', key: 'Inbox', icon: <IconInboxLine /> },
  { label: 'History', key: 'History', icon: <IconClockLine /> },
  { label: 'Portfolio', icon: <IconEportfolioLine /> },
  {
    label: 'Help',
    key: 'Help',
    icon: (
      <Badge
        count={10}
        variant="inverse"
        formatOutput={(count) => <AccessibleContent alt={`${count} unread`}>{count}</AccessibleContent>}
      >
        <IconQuestionLine />
      </Badge>
    ),
  },
]

export type LegacyNavProps = {
  activeNav: NavKey
  // Courses shown in the Courses tray. Sample data until a design passes its own.
  courseList?: TrayCourse[]
  // A bar item without a tray was chosen (receives its label, for example "Dashboard").
  onNavigate?: (label: string) => void
  // A course was chosen in the Courses tray.
  onOpenCourse?: (course: TrayCourse) => void
}

export default function LegacyNav({
  activeNav,
  courseList = SAMPLE_COURSE_LIST,
  onNavigate,
  onOpenCourse,
}: LegacyNavProps) {
  const [tray, setTray] = useState<string | null>(null)
  // The Tray is fixed to the window. A transformed box at the bar's right edge becomes its containing
  // block, so it opens next to the bar (and follows it when the bar is minimized).
  const [mount, setMount] = useState<HTMLElement | null>(null)
  const close = () => setTray(null)
  const t = useSurfaceTokens()
  // Line icons take their size from the font size around them. Canvas uses larger ones than the default.
  const sized = (icon: ReactNode, size: string) => <span style={{ display: 'flex', fontSize: size }}>{icon}</span>
  // Canvas items are a little tighter than the component default.
  const itemOverride = { contentPadding: '0.1875rem 0.375rem' }

  return (
    <div style={{ position: 'sticky', top: 0, height: '100vh', flexShrink: 0, zIndex: 10 }}>
      <SideNavBar
        label="Global navigation"
        toggleLabel={{ expandedLabel: 'Minimize global navigation', minimizedLabel: 'Expand global navigation' }}
        // Uncontrolled on purpose: this package version only hands its own state to the items, so a controlled
        // `minimized` prop would leave their labels showing.
      >
        <SideNavBar.Item
          icon={sized(<IconCanvasLogoLine />, '2.75rem')}
          // A plain text label (the item turns it into its accessible name and tooltip when minimized),
          // set to zero size so only the logo shows.
          label="Home"
          href="#"
          themeOverride={{ contentPadding: '1.5rem 0.375rem 1rem', fontSize: '0rem', lineHeight: '0rem' }}
          onClick={(e: MouseEvent) => {
            e.preventDefault()
            close()
            onNavigate?.('Home')
          }}
        />
        {ITEMS.map((item) => (
          <SideNavBar.Item
            key={item.label}
            icon={sized(item.icon, t.space.xl)}
            label={item.label}
            href="#"
            themeOverride={itemOverride}
            // While a tray is open its item is the current one, as in Canvas.
            selected={tray ? tray === item.label : item.key === activeNav}
            onClick={(e: MouseEvent) => {
              e.preventDefault()
              if (item.tray) {
                setTray((open) => (open === item.label ? null : item.label))
              } else {
                close()
                onNavigate?.(item.label)
              }
            }}
          />
        ))}
      </SideNavBar>

      {/* Clipped to the area right of the bar, so the tray slides out from behind the bar's edge instead of over it.
          Wide enough for the tray and its shadow. Clicks pass through to the page (see index.css). */}
      <div
        ref={setMount}
        className="legacy-tray-mount"
        style={{
          position: 'absolute',
          top: 0,
          left: '100%',
          width: '28rem',
          height: '100%',
          overflow: 'hidden',
          transform: 'translateZ(0)',
          pointerEvents: 'none',
        }}
      />
      <Tray
        label="Courses"
        open={tray === 'Courses'}
        onDismiss={close}
        placement="start"
        size="small"
        mountNode={mount}
        shouldCloseOnDocumentClick
        // Canvas' tray is a little wider than the small size.
        themeOverride={{ widthSm: '23rem' }}
      >
        <CoursesTray courses={courseList} onClose={close} onOpenCourse={onOpenCourse} />
      </Tray>
    </div>
  )
}

// The Courses tray: a title with a close button, a link to the full list, then the courses grouped by
// published state, each with its code and term.
function CoursesTray({
  courses,
  onClose,
  onOpenCourse,
}: {
  courses: TrayCourse[]
  onClose: () => void
  onOpenCourse?: (course: TrayCourse) => void
}) {
  const t = useSurfaceTokens()
  const separator = { borderTop: `${t.borderWidth} solid ${t.borderColor}` }
  const groups = [
    { title: 'Published courses', items: courses.filter((c) => c.published) },
    { title: 'Unpublished courses', items: courses.filter((c) => !c.published) },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
      <CloseButton placement="end" offset="small" screenReaderLabel="Close courses" onClick={onClose} />
      <Heading level="h2" variant="titleCardRegular">
        Courses
      </Heading>
      <div style={separator} />
      <Link href="#" variant="standalone" onClick={(e: { preventDefault: () => void }) => e.preventDefault()}>
        All courses
      </Link>
      <div style={separator} />
      {groups.map(
        (group) =>
          group.items.length > 0 && (
            <section key={group.title} style={{ display: 'flex', flexDirection: 'column', gap: t.space.md }}>
              <Heading level="h3" variant="titleCardMini">
                {group.title}
              </Heading>
              <List isUnstyled itemSpacing="small">
                {group.items.map((course) => (
                  <List.Item key={course.name}>
                    <Link
                      href="#"
                      variant="standalone"
                      onClick={(e: { preventDefault: () => void }) => {
                        e.preventDefault()
                        onClose()
                        onOpenCourse?.(course)
                      }}
                    >
                      {course.name}
                    </Link>
                    <div>
                      <Text variant="contentSmall" color="secondary">
                        {course.code}
                      </Text>
                    </div>
                    <div>
                      <Text variant="contentSmall" color="secondary">
                        Term: {course.term}
                      </Text>
                    </div>
                  </List.Item>
                ))}
              </List>
            </section>
          ),
      )}
      <Text as="p" variant="content">
        Pick a course to open it. Use All courses to choose which ones show up in this list.
      </Text>
    </div>
  )
}
