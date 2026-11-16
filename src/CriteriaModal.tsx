import { useState } from 'react'
import { CloseButton, Heading, Modal, Tabs, Text } from '@instructure/ui/v11_7'
import { useSurfaceTokens } from './appTheme'

// The readiness criteria of the account, as the admin set them. View only: nothing here can be changed.
// The values are sample data.

type Setting = { title: string; about: string; on: boolean; details?: string[] }
type Area = { id: string; title: string; about: string; settings: Setting[] }

export const CRITERIA_NAME = 'Basics: Syllabus is visible to students'

export const CRITERIA: Area[] = [
  {
    id: 'general', title: 'General', about: 'Basic criteria settings',
    settings: [
      { title: 'Course is published', about: 'Course must be published and visible to students', on: true },
      { title: 'Course start and end date set', about: 'Term dates are configured for the course', on: true },
      { title: 'Published due dates fall within the course start and end dates', about: 'All assignments due dates fall within the course term', on: true },
    ],
  },
  {
    id: 'navigation', title: 'Navigation', about: 'Home page and navigation ordering settings',
    settings: [
      { title: 'Home page', about: 'Select all options that are acceptable as course Home page', on: false },
      {
        title: 'Course Navigation Setup', about: 'Setup which items should be visible in the Courses navigation menu', on: true,
        details: ['Must be visible: Settings, Syllabus', 'Must be hidden: Search'],
      },
    ],
  },
  {
    id: 'content', title: 'Content', about: 'Course materials, pages and learning resources',
    settings: [
      { title: 'Announcements', about: 'Course announcements are available', on: true, details: ['Minimum number of announcements: 1'] },
      { title: 'Files', about: 'Course files section is configured', on: true, details: ['Minimum number of files: 1'] },
      { title: 'Modules', about: 'Course modules are available', on: true, details: ['Minimum number of modules: 1'] },
      { title: 'Pages', about: 'Course pages are available', on: true, details: ['Minimum number of pages: 1'] },
      { title: 'Syllabus', about: 'Syllabus is visible to students in the Course Navigation Menu', on: true, details: ['Minimum word count: 1'] },
    ],
  },
  {
    id: 'activities', title: 'Activities', about: 'Activities settings',
    settings: [
      { title: 'Assignments', about: 'Assignments do not include Discussions or New Quizzes', on: true, details: ['Minimum number of assignments: 1'] },
      { title: 'Classic Quizzes', about: 'Classic quizzes are available', on: true, details: ['Minimum number of classic quizzes: 1'] },
      { title: 'New Quizzes', about: 'New Quizzes are available', on: true, details: ['Minimum number of new quizzes: 1'] },
      { title: 'Discussions', about: 'Discussions are available', on: true, details: ['Minimum number of discussions: 1'] },
      { title: 'Outcomes', about: 'An outcome has been created or imported into the course', on: true, details: ['Minimum number of outcomes: 1'] },
      { title: 'Rubrics', about: 'A rubric has been created in the course', on: true, details: ['Minimum number of rubrics: 1'] },
      { title: 'Canvas Gradebook is in use', about: 'At least one student has a current course score published in the Canvas Gradebook', on: true },
    ],
  },
  {
    id: 'compliance', title: 'Compliance', about: 'Accessibility settings',
    settings: [
      { title: 'Latest Accessibility Scan', about: 'Scanned by the Course Content Accessibility Checker', on: true, details: ['Scanned at least once (ever)'] },
      { title: 'Open Accessibility Issues', about: 'Amount of total allowed accessibility issues', on: true, details: ['Maximum number of open accessibility issues: 1'] },
      { title: 'Accessibility Issues with Critical severity', about: 'Amount of allowed Critical severity accessibility issues', on: true, details: ['Maximum number of Critical severity issues: 1'] },
      { title: 'Accessibility Issues with High severity', about: 'Amount of allowed High severity accessibility issues', on: true, details: ['Maximum number of High severity issues: 1'] },
      { title: 'Accessibility Issues with Medium severity', about: 'Amount of allowed Medium severity accessibility issues', on: true, details: ['Maximum number of Medium severity issues: 1'] },
    ],
  },
]

export default function CriteriaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
                          <Text as="div" weight="bold">{s.title}</Text>
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
    </Modal>
  )
}
