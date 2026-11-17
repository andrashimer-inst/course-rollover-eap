import { useState } from 'react'
import { Button, CloseButton, Heading, IconAnalyticsLine, Modal, Tabs, Text } from '@instructure/ui/v11_7'
import StatusPill from './StatusPill'
import type { ReadyStatus } from './reviewCopyData'
import { useSurfaceTokens } from './appTheme'

// The readiness criteria of the account, as the admin set them. View only: nothing here can be changed.
// The values are sample data.

// `rule` is the readiness rule that checks the setting, so the window can say if it was addressed.
type Setting = { title: string; about: string; on: boolean; details?: string[]; rule?: string }
type Area = { id: string; title: string; about: string; settings: Setting[] }

// What the pill of a criterion says: met as it is, resolved by your choices, on the to-do list, or still open.
export const PILL: Record<ReadyStatus, { label: string; color: 'success' | 'warning' }> = {
  pass: { label: 'Nothing found', color: 'success' },
  fixed: { label: 'Resolved', color: 'success' },
  later: { label: 'On your to-do list', color: 'warning' },
  open: { label: 'Needs attention', color: 'warning' },
}

export const CRITERIA_NAME = 'Basics: Syllabus is visible to students'
// Sample data: when the criteria were last checked against this course.
export const LAST_CHECK = 'Nov 14, 2026 at 9:42 AM'

export const CRITERIA: Area[] = [
  {
    id: 'general', title: 'General', about: 'Basic criteria settings',
    settings: [
      { rule: 'course-published', title: 'Course is published', about: 'Course must be published and visible to students', on: true },
      { rule: 'dates-set', title: 'Course start and end date set', about: 'Term dates are configured for the course', on: true },
      { rule: 'due-in-term', title: 'Published due dates fall within the course start and end dates', about: 'All assignments due dates fall within the course term', on: true },
    ],
  },
  {
    id: 'navigation', title: 'Navigation', about: 'Home page and navigation ordering settings',
    settings: [
      { title: 'Home page', about: 'Select all options that are acceptable as course Home page', on: false },
      {
        rule: 'navigation', title: 'Course Navigation Setup', about: 'Setup which items should be visible in the Courses navigation menu', on: true,
        details: ['Must be visible: Settings, Syllabus', 'Must be hidden: Search'],
      },
    ],
  },
  {
    id: 'content', title: 'Content', about: 'Course materials, pages and learning resources',
    settings: [
      { rule: 'announcements', title: 'Announcements', about: 'Course announcements are available', on: true, details: ['Minimum number of announcements: 1'] },
      { rule: 'files', title: 'Files', about: 'Course files section is configured', on: true, details: ['Minimum number of files: 1'] },
      { rule: 'modules', title: 'Modules', about: 'Course modules are available', on: true, details: ['Minimum number of modules: 1'] },
      { rule: 'pages', title: 'Pages', about: 'Course pages are available', on: true, details: ['Minimum number of pages: 1'] },
      { rule: 'syllabus', title: 'Syllabus', about: 'Syllabus is visible to students in the Course Navigation Menu', on: true, details: ['Minimum word count: 1'] },
    ],
  },
  {
    id: 'activities', title: 'Activities', about: 'Activities settings',
    settings: [
      { rule: 'assignments', title: 'Assignments', about: 'Assignments do not include Discussions or New Quizzes', on: true, details: ['Minimum number of assignments: 1'] },
      { rule: 'classic-quizzes', title: 'Classic Quizzes', about: 'Classic quizzes are available', on: true, details: ['Minimum number of classic quizzes: 1'] },
      { rule: 'new-quizzes', title: 'New Quizzes', about: 'New Quizzes are available', on: true, details: ['Minimum number of new quizzes: 1'] },
      { rule: 'discussions', title: 'Discussions', about: 'Discussions are available', on: true, details: ['Minimum number of discussions: 1'] },
      { rule: 'outcomes', title: 'Outcomes', about: 'An outcome has been created or imported into the course', on: true, details: ['Minimum number of outcomes: 1'] },
      { rule: 'rubrics', title: 'Rubrics', about: 'A rubric has been created in the course', on: true, details: ['Minimum number of rubrics: 1'] },
      { rule: 'gradebook', title: 'Canvas Gradebook is in use', about: 'At least one student has a current course score published in the Canvas Gradebook', on: true },
    ],
  },
  {
    id: 'compliance', title: 'Compliance', about: 'Accessibility settings',
    settings: [
      { rule: 'a11y-scan', title: 'Latest Accessibility Scan', about: 'Scanned by the Course Content Accessibility Checker', on: true, details: ['Scanned at least once (ever)'] },
      { rule: 'a11y-open', title: 'Open Accessibility Issues', about: 'Amount of total allowed accessibility issues', on: true, details: ['Maximum number of open accessibility issues: 1'] },
      { rule: 'a11y-critical', title: 'Accessibility Issues with Critical severity', about: 'Amount of allowed Critical severity accessibility issues', on: true, details: ['Maximum number of Critical severity issues: 1'] },
      { rule: 'a11y-high', title: 'Accessibility Issues with High severity', about: 'Amount of allowed High severity accessibility issues', on: true, details: ['Maximum number of High severity issues: 1'] },
      { rule: 'a11y-medium', title: 'Accessibility Issues with Medium severity', about: 'Amount of allowed Medium severity accessibility issues', on: true, details: ['Maximum number of Medium severity issues: 1'] },
    ],
  },
]

// `onRunCheck` adds the main action of the window: it closes the window and runs the check.
export default function CriteriaModal({ open, onClose, results, onRunCheck, running = false }: { open: boolean; onClose: () => void; results?: Record<string, ReadyStatus>; onRunCheck?: () => void; running?: boolean }) {
  const t = useSurfaceTokens()
  const [tab, setTab] = useState(0)
  return (
    <Modal open={open} onDismiss={onClose} size="large" label="Readiness criteria">
      <Modal.Header>
        <CloseButton placement="end" offset="small" onClick={onClose} screenReaderLabel="Close" />
        <Heading variant="titleSection" level="h2">Readiness criteria</Heading>
      </Modal.Header>
      <Modal.Body>
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.md }}>
          <Text as="div" color="secondary">How your account defines a course that is ready. Your admin sets these, so you can look at them but not change them.</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.xs }}>
            <Text as="div" size="small" color="secondary">Criteria name</Text>
            <Text as="div" weight="bold">{CRITERIA_NAME}</Text>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.xs }}>
            <Text as="div" size="small" color="secondary">Last check</Text>
            <Text as="div" weight="bold">{LAST_CHECK}</Text>
          </div>
          <Tabs onRequestTabChange={(_e, { index }) => setTab(index)}>
            {CRITERIA.map((a, i) => {
              const list = a.settings.filter((s) => s.on)
              return (
                <Tabs.Panel key={a.id} id={`criteria-${a.id}`} renderTitle={`${a.title} (${list.length})`} isSelected={tab === i} padding="general.spaceMd 0 0 0">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.md }}>
                    <Text as="div" color="secondary">{a.about}</Text>
                    {list.map((s) => (
                      <div key={s.title} style={{ display: 'flex', gap: t.space.md, paddingBlock: t.space.md, borderBlockStart: `${t.borderWidth} solid ${t.borderColor}` }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.xs, minWidth: 0 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: t.space.sm }}>
                            <Text weight="bold">{s.title}</Text>
                            {/* Every criterion says where it stands in this copy. */}
                            {s.rule && results?.[s.rule] && <StatusPill size="xs" color={PILL[results[s.rule]].color}>{PILL[results[s.rule]].label}</StatusPill>}
                          </div>
                          <Text as="div" color="secondary">{s.about}</Text>
                          {s.details?.map((d) => <Text key={d} as="div">{d}</Text>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </Tabs.Panel>
              )
            })}
          </Tabs>
        </div>
      </Modal.Body>
      {onRunCheck && (
        <Modal.Footer>
          <Button onClick={onClose} margin="0 small 0 0">Close</Button>
          <Button color="primary" renderIcon={<IconAnalyticsLine />} interaction={running ? 'disabled' : 'enabled'} onClick={() => { onClose(); onRunCheck() }}>
            {running ? 'Checking…' : 'Run check'}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  )
}
