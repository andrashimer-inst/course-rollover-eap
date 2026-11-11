import { useCallback, useState } from 'react'
import { SOURCE_COURSES } from './courseListData'
import {
  Button,
  CloseButton,
  Flex,
  EyeInstUIIcon,
  Heading,
  IconButton,
  Link,
  Modal,
  ScreenReaderContent,
  SimpleSelect,
  Table,
  Text,
  Tooltip,
  View,
} from '@instructure/ui/v11_7'
import DesktopWrapper from './DesktopWrapper'
import FigmaAlert from './FigmaAlert'
import RolloverWizard from './RolloverWizard'
import type { WizardDraft } from './RolloverWizard'
import { SummaryView } from './CopySummaryView'
import StatusPill from './StatusPill'
import { useAppThemeKey, useSurfaceTokens } from './appTheme'
import type { CopySummary } from './rolloverData'
import { PREVIOUS_IMPORTS, UNDO_BLOCKED, newImport } from './sampleImports'
import type { ImportRow } from './sampleImports'
import { commentsForCopy } from './notebookData'
import type { Note } from './notebookData'

// Course Rollover: "Import Content" page, built on the template. Figma decides the design, the package
// decides what exists, new-theme (v2) components only, spacing from docs/spacing.md.
// Changes from the customer discovery (top 10 priorities):
//   starting a copy opens a review wizard first (comments, dates, links), then a summary of what was copied
//   copying over an existing copy asks for confirmation first
// Sample data only.

// Course menu (sample). Unpublished items are marked like in Canvas. Import Content lives under Settings.
const COURSE_NAV = [
  { label: 'Home' }, { label: 'Announcements', unpublished: true }, { label: 'Assignments' },
  { label: 'Discussions' }, { label: 'Grades' }, { label: 'People' },
  { label: 'Pages', unpublished: true }, { label: 'Files', unpublished: true }, { label: 'Syllabus' },
  { label: 'Outcomes', unpublished: true }, { label: 'Rubrics', unpublished: true },
  { label: 'Quizzes', unpublished: true }, { label: 'Modules', unpublished: true },
  { label: 'BigBlueButton' }, { label: 'Collaborations' }, { label: 'Grade Sync', unpublished: true },
  { label: 'Course Analytics' }, { label: 'Lucid (Whiteboard)' }, { label: 'Settings', current: true },
]
// The signed-in educator, as the global nav shows them.
const USER_NAME = 'User Name'
// The course the content is copied into.
const COURSE = { name: 'Cell Biology', items: COURSE_NAV }
const DESCRIPTION = 'Use the Import Content tool to migrate course materials from other sources into this course.'

const CONTENT_TYPES = ['Copy a Canvas course or learning objects', 'Canvas Course Export Package', 'Zip file', 'QTI .zip file']

// Tables sit directly on the page background, so every table part gets a transparent fill.
const noFill = { background: 'transparent' }

export default function CourseRollover({
  notes = [],
  onNavigate,
}: {
  // The educator's notebook notes. They show up in the wizard's Review comments step.
  notes?: Note[]
  // A global nav item was chosen (for example Notebook in the Account menu or tray).
  onNavigate?: (label: string) => void
}) {
  const legacy = useAppThemeKey() === 'legacy'
  const t = useSurfaceTokens()
  const [contentType, setContentType] = useState(CONTENT_TYPES[0])
  const adjustDates = true
  const [imports, setImports] = useState<ImportRow[]>(() => [...PREVIOUS_IMPORTS])
  const [wizardOpen, setWizardOpen] = useState(false)
  // A copy saved with "Save and continue later". It is picked up again on the step it was left on.
  const [draft, setDraft] = useState<(WizardDraft & { savedAt: Date }) | null>(null)
  const [resume, setResume] = useState(false)
  // The import whose summary is open as a page. A copy is undone from its summary.
  const [viewing, setViewing] = useState<ImportRow | null>(null)
  // The window that asks before the whole copy is undone.
  const [confirmUndo, setConfirmUndo] = useState(false)
  const undo = (id: string) => setImports((list) => list.map((r) => (r.id === id ? { ...r, status: 'Undone' as const } : r)))

  const saved = draft ? SOURCE_COURSES.find((c) => c.name === draft.course) : undefined
  const isCourseCopy = contentType === CONTENT_TYPES[0]

  const commentsFor = useCallback((c: string) => commentsForCopy(c, notes), [notes])
  const handleDone = useCallback((summary: CopySummary) => {
    const row = newImport(summary)
    setImports((list) => [row, ...list])
    // When the copy is done the wizard closes and the summary opens as a page.
    setWizardOpen(false)
    setViewing(row)
  }, [])

  // The review and copy steps are a page of their own (a new level in the breadcrumb), not a dialog.
  if (wizardOpen) {
    return (
      <RolloverWizard
        courseNav={COURSE}
        onNavigate={onNavigate}
        commentsFor={commentsFor}
        adjustDates={adjustDates}
        onCancel={() => {
          // Abandoning the session also drops a saved copy it was started from.
          setWizardOpen(false)
          setResume(false)
          setDraft(null)
        }}
        onDone={(summary) => {
          setDraft(null)
          setResume(false)
          handleDone(summary)
        }}
        draft={resume ? draft : null}
        onSaveLater={(d) => {
          setDraft({ ...d, savedAt: new Date() })
          setResume(false)
          setWizardOpen(false)
        }}
      />
    )
  }

  // The summary of an earlier copy is a page of its own too, like the summary step of the wizard.
  if (viewing) {
    // The page title says how the copy went. An undone copy is read from the list, because the row kept here is the old one.
    const now = imports.find((r) => r.id === viewing.id) ?? viewing
    const wasUndone = now.status === 'Undone'
    const s = viewing.summary
    return (
      <DesktopWrapper
        pageTitle={s ? (wasUndone ? `${s.target} was set back to empty` : `${s.target} Spring 2027 is set up`) : 'Summary'}
        breadcrumb={['Courses', COURSE.name, 'Import Content']}
        onBreadcrumb={(crumb) => crumb === 'Import Content' && setViewing(null)}
        activeNav="Courses"
        course={COURSE}
        onNavigate={onNavigate}
        // The two actions sit under the page title, like the buttons of the wizard steps.
        actions={
          s ? (
            <>
              {!wasUndone && <Button color="primary">Open course</Button>}
              <Tooltip
                renderTip={
                  viewing.published
                    ? UNDO_BLOCKED
                    : `Removes everything this copy created. Your ${s.target} Spring 2027 course goes back to empty. Your choices are kept.`
                }
                placement="bottom start"
              >
                {/* A disabled button gets no hover, so the tooltip sits on a wrapper that can also take focus. */}
                <span tabIndex={0} style={{ display: 'inline-flex' }}>
                  <Button color="danger" interaction={wasUndone || viewing.published ? 'disabled' : 'enabled'} onClick={() => setConfirmUndo(true)}>
                    Undo the whole copy
                  </Button>
                </span>
              </Tooltip>
            </>
          ) : undefined
        }
        description={s ? (wasUndone ? 'The copy was undone. Your choices are kept.' : s.opens) : `What was copied from ${viewing.source} on ${viewing.date}.`}
        fullWidth
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {viewing.summary && (
            <SummaryView summary={viewing.summary} undone={wasUndone} />
          )}
          <div>
            <Button color="primary" onClick={() => setViewing(null)}>Done</Button>
          </div>
        </div>
        <Modal open={confirmUndo} onDismiss={() => setConfirmUndo(false)} size="small" label="Undo the whole copy" shouldCloseOnDocumentClick={false}>
          <Modal.Header>
            <CloseButton placement="end" offset="small" onClick={() => setConfirmUndo(false)} screenReaderLabel="Close" />
            <Heading level="h2">Undo the whole copy?</Heading>
          </Modal.Header>
          <Modal.Body>
            <Text as="p">
              This removes everything the copy created in {s?.target}. The course goes back to empty. Your choices are kept, so you can copy again.
            </Text>
          </Modal.Body>
          <Modal.Footer>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button onClick={() => setConfirmUndo(false)}>Cancel</Button>
              <Button color="danger" onClick={() => { setConfirmUndo(false); undo(viewing.id) }}>Yes, undo it</Button>
            </div>
          </Modal.Footer>
        </Modal>
      </DesktopWrapper>
    )
  }

  return (
    <DesktopWrapper
      pageTitle="Import Content"
      breadcrumb={['Courses', COURSE.name]}
      activeNav="Courses"
      // The wrapper draws the course menu: in the Courses sub navigation (Light and Dark) or as a
      // column beside the content (Legacy).
      course={COURSE}
      onNavigate={onNavigate}
      description={DESCRIPTION}
      fullWidth
    >
      <Flex direction="column" gap="gap.sections">
        <View as="div" maxWidth="47.5rem" display="block">
            <Flex direction="column" gap="gap.inputs.vertical">
              <SimpleSelect
                renderLabel="Select Content Type"
                value={contentType}
                onChange={(_e, { value }) => setContentType(String(value))}
              >
                {CONTENT_TYPES.map((t) => (
                  <SimpleSelect.Option key={t} id={t} value={t}>{t}</SimpleSelect.Option>
                ))}
              </SimpleSelect>

              {isCourseCopy && draft && (
                <FigmaAlert variant="info" type="inline">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <Text as="div" weight="bold">
                      {USER_NAME} saved a copy on {draft.savedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {draft.savedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </Text>
                    {saved && (
                      <Text as="div">
                        Course: {saved.name} · Short code: {saved.code} · SIS ID: {saved.sisId}
                      </Text>
                    )}
                    <Text as="div">On step {draft.step + 1} of 5. Nothing has been copied yet.</Text>
                  </div>
                </FigmaAlert>
              )}

              {isCourseCopy && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <Button color="primary" onClick={() => { setResume(draft !== null); setWizardOpen(true) }}>
                    {draft ? 'Continue copy' : 'Course copy wizard'}
                  </Button>
                  {draft && <Button onClick={() => setDraft(null)}>Discard saved copy</Button>}
                </div>
              )}
            </Flex>
        </View>

            <section
              aria-labelledby="content-imports"
              style={
                legacy
                  ? { borderTop: `${t.borderWidth} solid ${t.borderColor}`, paddingTop: t.space.xl, marginTop: `calc(${t.space.xl} * -1)` }
                  : { background: t.containerColor, borderRadius: t.radiusCardMd, boxShadow: t.shadowResting, padding: t.space.lg }
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
                  <Text as="div" weight="bold" size="large" id="content-imports">Content imports</Text>
                  <Text as="div" color="secondary">Content import files cannot be downloaded after 500 days.</Text>
                </div>
                <Table caption={() => 'Content imports'} themeOverride={noFill}>
                  <Table.Head themeOverride={noFill}>
                    <Table.Row themeOverride={noFill}>
                      <Table.ColHeader themeOverride={noFill} id="type" width="20%">Content Type</Table.ColHeader>
                      <Table.ColHeader themeOverride={noFill} id="source" width="22%">Source Link</Table.ColHeader>
                      <Table.ColHeader themeOverride={noFill} id="date" width="16%">Date Imported</Table.ColHeader>
                      <Table.ColHeader themeOverride={noFill} id="status" width="14%">Status</Table.ColHeader>
                      <Table.ColHeader themeOverride={noFill} id="progress" width="12%">Progress</Table.ColHeader>
                      <Table.ColHeader themeOverride={noFill} id="action" width="8%" textAlign="end"><ScreenReaderContent>Action</ScreenReaderContent></Table.ColHeader>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body themeOverride={noFill}>
                    {imports.map((row) => (
                      <Table.Row themeOverride={noFill} key={row.id}>
                        <Table.Cell themeOverride={noFill}>{row.type}</Table.Cell>
                        <Table.Cell themeOverride={noFill}>
                          <Link href="#" onClick={(e: { preventDefault: () => void }) => e.preventDefault()}>{row.source}</Link>
                        </Table.Cell>
                        <Table.Cell themeOverride={noFill}>{row.date}</Table.Cell>
                        <Table.Cell themeOverride={noFill}>
                          <StatusPill color={row.status === 'Completed' ? 'success' : row.status === 'Failed' ? 'error' : 'neutral'}>{row.status}</StatusPill>
                        </Table.Cell>
                        <Table.Cell themeOverride={noFill} />
                        <Table.Cell themeOverride={noFill} textAlign="end">
                          {row.summary && (
                            <IconButton color="secondary" size="small" screenReaderLabel={`View summary of ${row.source}`} onClick={() => setViewing(row)}>
                              <EyeInstUIIcon />
                            </IconButton>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </section>
      </Flex>

    </DesktopWrapper>
  )
}
