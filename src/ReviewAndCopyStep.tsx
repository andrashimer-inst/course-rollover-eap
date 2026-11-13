import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Button, IconAssignmentLine, IconAnalyticsLine, IconEyeLine, Text } from '@instructure/ui/v11_7'
import StatusPill from './StatusPill'
import ReadinessLoading from './ReadinessLoading'
import ReadinessResults from './ReadinessResults'
import CoursePreviewModal from './CoursePreviewModal'
import { dateNoteFor } from './dateNote'
import { CONTENT_TYPES } from './courseContentData'
import type { CopyMode, Picked, Scope } from './contentHelpers'
import { dimensionsOf, openingLabel, readiness } from './reviewCopyData'
import type { Opening } from './reviewCopyData'
import { choiceLabel, choiceOf, hiddenModules } from './reviewData'
import type { Choice, DupeChoice, ReviewRow } from './reviewData'
import { DATE_ITEMS, rowInfo } from './fixDatesData'
import type { FixDatesState, Included } from './fixDatesData'
import { useAppThemeKey, useSurfaceTokens } from './appTheme'

// Step 5 of the copy wizard: review and copy. Before the copy runs, the teacher can run the course readiness check,
// see a final preview of the modules with a note on what the choices changed, and choose when students see the
// course. The copy itself starts from this step. The to-do list comes with the summary afterwards.

const MODULES = CONTENT_TYPES.find((c) => c.id === 'modules')!.items

export default function ReviewAndCopyStep({
  included, rows, choices, scope, mode, picked, dupes, dates, readyRan, setReadyRan, opening, todoCount, onToggleTodo,
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
  const [previewOpen, setPreviewOpen] = useState(false)
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


  // What the choices of steps 2 and 3 changed, for the notes and the preview.
  const leftOut = rows.filter((r) => !r.extra && !r.courseWide && choiceOf(r, choices) === 'leave')
  const fixLater = rows.filter((r) => choiceOf(r, choices) === 'fix')
  const moduleIds = scope === 'whole' ? MODULES.map((m) => m.id) : MODULES.filter((m) => picked[m.id]).map((m) => m.id)
  const merging = scope === 'part' && mode === 'merge'
  const movedDates = DATE_ITEMS.filter((item) => included(item.itemId)).filter((item) => {
    const info = rowInfo(item, dates)
    return info.final && info.final.toDateString() !== info.base.toDateString()
  }).length

  // A summary of the choices made, one line for each area.
  const changes: string[] = [
    scope === 'whole'
      ? `Scope: the whole course (${MODULES.length} modules and all learning objects). It replaces the content copied here before. Content you added yourself stays.`
      : `Scope: ${moduleIds.length} of ${MODULES.length} modules. ${merging ? 'They are added to the content in the course now.' : 'They replace the content copied here before. Content you added yourself stays.'}`,
    leftOut.length ? `Left out: ${leftOut.length} ${leftOut.length === 1 ? 'item' : 'items'} (${leftOut.map((r) => r.title).join(', ')}).` : 'Left out: nothing.',
    fixLater.length ? `On your to-do list: ${fixLater.length} ${fixLater.length === 1 ? 'item' : 'items'}.` : 'On your to-do list: nothing from the review.',
    dates.mode === 'clear'
      ? 'Dates: cleared. Set them after the copy.'
      : `Dates: moved to the new term${movedDates ? `, ${movedDates} changed by you` : ''}.`,
    opening.mode === 'open'
      ? `Publishing: ${openingLabel(opening)}${opening.hold ? ', unless a required check still fails that day' : ''}.`
      : 'Publishing: manual. The course stays unpublished until you publish it.',
  ]

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


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.xxl }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
            <div style={cardStyle}>
              {/* Card title and description, with the to-do list button at the end of the row. */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.md, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
                  <Text as="div" weight="bold" size="large">Copy overview</Text>
                  <Text as="div" color="secondary">A summary of the choices you made in this copy.</Text>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.md }}>
                  <Button renderIcon={<IconEyeLine />} onClick={() => setPreviewOpen(true)}>Course preview</Button>
                  <Button renderIcon={<IconAssignmentLine />} onClick={onToggleTodo}>To-do list ({todoCount})</Button>
                </div>
              </div>
              <ul style={{ margin: `${t.space.lg} 0 0`, paddingInlineStart: '1.25rem' }}>
                {changes.map((c) => (
                  <li key={c}><Text>{c}</Text></li>
                ))}
              </ul>
            </div>
          <div style={cardStyle}>
            {/* Card title and description, with the run button at the end of the row. */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.md, alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
                <Text as="div" weight="bold" size="large">Course readiness check</Text>
                <Text as="div" color="secondary">The check goes through the readiness criteria of your account and your choices in the review.</Text>
              </div>
              <Button color={readyRan ? 'secondary' : 'primary'} renderIcon={<IconAnalyticsLine />} interaction={running ? 'disabled' : 'enabled'} onClick={run}>
                {running ? 'Checking…' : 'Run check'}
              </Button>
            </div>
            <div style={{ marginTop: t.space.lg }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
                {running && (
                  <ReadinessLoading areas={groups.map((g) => g.dimension)} onDone={() => { setRunning(false); setReadyRan(true) }} />
                )}
                {readyRan && !running && (
                  <ReadinessResults groups={groups.map((g) => ({ dimension: g.dimension, rules: g.rules.map((x) => ({ title: x.rule.title, status: x.status, note: x.note })) }))} />
                )}
                {!running && !readyRan && (
                  <Text color="secondary">Run the readiness check to see whether the course is ready for students, based on the choices you made. The check is optional.</Text>
                )}
              </div>
            </div>
          </div>
          </div>
      <CoursePreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} source={{ moduleIds, keepCurrent: merging, hidden: hiddenModules(dupes), scope, picked }} noteFor={noteFor} />
    </div>
  )
}
