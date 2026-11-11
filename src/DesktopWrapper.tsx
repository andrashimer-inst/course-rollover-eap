import type { ReactNode } from 'react'
import { Checkbox, CheckboxGroup } from '@instructure/ui/v11_7'
import type { CourseNav, NavKey } from './GlobalNav'
import LegacyWrapper from './LegacyWrapper'
import ModernWrapper from './ModernWrapper'
import type { ContentTabListConfig } from './ContentTabList'
import type { TrayCourse } from './LegacyNav'
import { useAppThemeKey } from './appTheme'

// Desktop wrapper built only from InstUI components. Two layouts live behind this one component,
// chosen by the active theme:
//   Light and Dark: the Figma "Wrapper (beta)" layout, in `ModernWrapper.tsx`.
//   Legacy: the Canvas shell as it is today (nav with Courses tray, top bar with course menu toggle,
//           title row, side column, footer), in `LegacyWrapper.tsx`.
// Props are shared. Each layout ignores the options that belong to the other one.

export type DesktopWrapperProps = {
  pageTitle: string
  breadcrumb?: string[]
  // A level of the breadcrumb was clicked. Levels with no handler for them do nothing.
  onBreadcrumb?: (crumb: string) => void
  activeNav?: NavKey
  // The course the user is in. Light and Dark show its menu in the Courses sub navigation; Legacy
  // shows it as a secondary navigation column of blue links (drawn by the wrapper).
  course?: CourseNav
  // false: content is capped at the Figma max width (1100px). true: fills the space between panels.
  fullWidth?: boolean
  trailingContent?: ReactNode
  trailingLabel?: string
  // Pages with filterable content can offer the filtering panel.
  filterContent?: ReactNode
  children: ReactNode
  // Light and Dark only (the Figma wrapper). Legacy ignores these, except `actions`.
  description?: ReactNode // short page description under the title
  headerSlot?: ReactNode // custom content in the header, under the title
  actions?: ReactNode // the page's buttons. Light and Dark: a row under the header. Legacy: end of the title row.
  titleAction?: ReactNode // a button level with the page title, at the end of its row (all themes)
  tabs?: ReactNode // optional page tabs (Tabs)
  headerActions?: ReactNode // extra icon buttons in the header, next to AI agent, notifications and expand
  sidePanel?: { open: boolean; title: string; description: string; onClose: () => void; content: ReactNode } // a panel the page opens itself, in the utility panel slot (Light and Dark)
  showFilters?: boolean // search, order by and the button that opens the Filters panel
  contentTabList?: ContentTabListConfig // optional in-page navigation, left of the content
  // Legacy only (the Canvas shell). Light and Dark ignore these.
  barActions?: ReactNode // buttons at the end of the top bar, next to the breadcrumb
  courseList?: TrayCourse[] // courses in the Courses tray
  onNavigate?: (label: string) => void // a global nav item without a tray was chosen
  onOpenCourse?: (course: TrayCourse) => void // a course was chosen in the Courses tray
}

export function DemoFilters() {
  return (
    <CheckboxGroup name="category" description="Category" defaultValue={[]}>
      <Checkbox label="Science and Technology" value="sci" />
      <Checkbox label="Arts and Humanities" value="arts" />
      <Checkbox label="Business and Management" value="biz" />
      <Checkbox label="Health and Medicine" value="health" />
    </CheckboxGroup>
  )
}

export default function DesktopWrapper(props: DesktopWrapperProps) {
  const themeKey = useAppThemeKey()
  return themeKey === 'legacy' ? <LegacyWrapper {...props} /> : <ModernWrapper {...props} />
}
