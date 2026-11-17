import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Button, IconAssignmentLine, IconInfoLine, Tabs, Text } from '@instructure/ui/v11_7'
import StatusPill from './StatusPill'
import ReadinessLoading from './ReadinessLoading'
import { CoursePreview, ItemPreviewModal, ObjectsPreview } from './ContentStep'
import type { PreviewItem } from './ContentStep'
import CriteriaModal from './CriteriaModal'
import { dateMetaFor, dateNoteFor } from './dateNote'
import { CONTENT_TYPES } from './courseContentData'
import { withPulledIn } from './contentHelpers'
import type { CopyMode, Picked, Scope } from './contentHelpers'
import { dimensionsOf, readiness } from './reviewCopyData'
import type { Opening } from './reviewCopyData'
import { choiceLabel, choiceOf, hiddenModules } from './reviewData'
import type { Choice, DupeChoice, ReviewRow } from './reviewData'
import type { FixDatesState, Included } from './fixDatesData'
import { useAppThemeKey, useSurfaceTokens } from './appTheme'

// Step 5 of the copy wizard: review and copy. Before the copy runs, the teacher can run the course readiness check,
// see a final preview of the modules with a note on what the choices changed, and choose when students see the
// course. The copy itself starts from this step. The to-do list comes with the summary afterwards.

const MODULES = CONTENT_TYPES.find((c) => c.id === 'modules')!.items

export default function ReviewAndCopyStep({
  included, rows, choices, scope, mode, picked, dupes, dates, readyRan, setReadyRan, todoCount, onToggleTodo,
}: {
  rows: ReviewRow[]
  choices: Record<string, Choice>
  scope: Scope
  mode: CopyMode
  picked: Picked
  dupes: Record<string, DupeChoice>
  dates: FixDatesState
  // The learning objects that are copied. Only their dates count.
  included: Included
  readyRan: boolean
  setReadyRan: (v: boolean) => void
  opening: Opening
  // The to-do list so far, which opens beside the page.
  todoCount: number
  onToggleTodo: () => void
}) {
  const t = useSurfaceTokens()
  const card = useAppThemeKey() !== 'legacy'
  const cardStyle = card
    ? { background: t.containerColor, borderRadius: t.radiusCardMd, boxShadow: t.shadowResting, padding: t.space.lg }
    : undefined

  // The course preview window.
  const [viewTab, setViewTab] = useState(0)
  const [openItem, setOpenItem] = useState<PreviewItem | null>(null)
  const [criteriaOpen, setCriteriaOpen] = useState(false)
  const ready = useMemo(() => readiness(rows, choices), [rows, choices])
  const groups = useMemo(() => dimensionsOf(ready), [ready])

  // The readiness check goes through one area at a time. It can take a while, so each area shows its own progress.
  const [running, setRunning] = useState(false)
  const run = () => {
    setReadyRan(false)
    setRunning(true)
  }

  // The check starts by itself when the step opens, unless it already ran.
  useEffect(() => {
    if (!readyRan) run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const moduleIds = scope === 'whole' ? MODULES.map((m) => m.id) : MODULES.filter((m) => picked[m.id]).map((m) => m.id)
  const merging = scope === 'part' && mode === 'merge'

  // Each item of the preview shows what was chosen for it in the review, and how its date checks out.
  const dateNote = dateNoteFor(dates, included)
  const noteFor = (itemId: string): ReactNode => {
    const row = rows.find((r) => r.id === itemId)
    const c = row ? choiceOf(row, choices) : undefined
    const date = dateNote(itemId)
    if (!(row && c) && !date) return null
    return (
      <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: t.space.sm, justifyContent: 'flex-end' }}>
        {row && c && (
          <StatusPill size="xs" color={c === 'fix' ? 'warning' : c === 'leave' ? 'neutral' : 'success'}>
            {choiceLabel(row, c)}
          </StatusPill>
        )}
        {date}
      </span>
    )
  }


  const hidden = hiddenModules(dupes)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.xxl }}>
      <div style={cardStyle}>
        {/* Card title and description, with the criteria, the check and the to-do list at the end of the row. */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.md, alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
            <Text as="div" weight="bold" size="large">Course preview</Text>
            <Text as="div" color="secondary">The course as it will look after the copy, with your choices, the dates and the readiness check.</Text>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: t.space.md }}>
            <Button renderIcon={<IconInfoLine />} onClick={() => setCriteriaOpen(true)}>Criteria</Button>
            <span aria-hidden="true" style={{ alignSelf: 'stretch', width: t.borderWidth, minHeight: '2rem', background: t.textColor }} />
            <Button renderIcon={<IconAssignmentLine />} onClick={onToggleTodo}>To-do list ({todoCount})</Button>
          </div>
        </div>
        <div style={{ marginTop: t.space.lg }}>
          {running ? (
            <ReadinessLoading areas={groups.map((g) => g.dimension)} onDone={() => { setRunning(false); setReadyRan(true) }} />
          ) : (
            <Tabs onRequestTabChange={(_e, { index }) => setViewTab(index)}>
              <Tabs.Panel id="final-modules" renderTitle="Modules" variant="secondary" isSelected={viewTab === 0} padding="general.spaceMd 0 0 0">
                <CoursePreview bare moduleIds={moduleIds} keepCurrent={merging} highlightNew hidden={hidden} noteFor={noteFor} metaFor={dateMetaFor(dates, included)} onOpenItem={setOpenItem} />
              </Tabs.Panel>
              <Tabs.Panel id="final-objects" renderTitle="Learning objects" variant="secondary" isSelected={viewTab === 1} padding="general.spaceMd 0 0 0">
                <ObjectsPreview bare scope={scope} picked={withPulledIn(picked)} keepCurrent={merging} noteFor={noteFor} onOpenItem={setOpenItem} />
              </Tabs.Panel>
            </Tabs>
          )}
        </div>
      </div>
      <CriteriaModal open={criteriaOpen} onClose={() => setCriteriaOpen(false)} onRunCheck={run} running={running} results={Object.fromEntries(readiness(rows, choices).map((x) => [x.rule.id, x.status]))} />
      <ItemPreviewModal item={openItem} onClose={() => setOpenItem(null)} />
    </div>
  )
}
