import { IconOffLine, Link, ScreenReaderContent } from '@instructure/ui/v11_7'
import type { CourseNav } from './GlobalNav'
import { useSurfaceTokens } from './appTheme'

// Legacy secondary navigation: the course menu as a column of plain blue links, with an eye icon on
// unpublished items (Canvas today). The page you are on is dark text with a bar at its start edge.
// Light and Dark show this menu in the Courses sub navigation of the global nav instead (see GlobalNav).
export default function LegacyCourseMenu({ course, id }: { course: CourseNav; id?: string }) {
  const t = useSurfaceTokens()
  return (
    <nav
      id={id}
      aria-label="Course navigation"
      style={{
        width: '13rem',
        flexShrink: 0,
        boxSizing: 'border-box',
        padding: `${t.space.xl} 0 ${t.space.xxl} ${t.space.xxl}`,
      }}
    >
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {course.items.map((item) => (
          <li
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: t.space.sm,
              // Canvas rows are about 38px tall
              padding: `0.6875rem ${t.space.sm}`,
              borderInlineStart: `0.125rem solid ${item.current ? t.textColor : 'transparent'}`,
            }}
          >
            <Link
              href="#"
              variant="standalone"
              aria-current={item.current ? 'page' : undefined}
              onClick={(e: { preventDefault: () => void }) => {
                e.preventDefault()
                course.onSelect?.(item.label)
              }}
              themeOverride={
                item.current ? { textColor: t.textColor, textHoverColor: t.textColor, fontWeight: 700 } : undefined
              }
            >
              {item.label}
            </Link>
            {item.unpublished && (
              <>
                <IconOffLine color="secondary" />
                <ScreenReaderContent>Unpublished</ScreenReaderContent>
              </>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
