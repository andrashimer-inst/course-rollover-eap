import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Button, Link, IconArrowOpenDownSolid, IconArrowOpenEndSolid, IconAssignmentLine, Tabs, Text } from '@instructure/ui/v11_7'
import StatusPill from './StatusPill'
import ReadinessLoading from './ReadinessLoading'
import { CoursePreview, ItemPreviewModal, PREVIEW_KINDS } from './ContentStep'
import type { PreviewItem } from './ContentStep'
import { dateNoteFor } from './dateNote'
import { CONTENT_TYPES, MODULE_ENTRIES } from './courseContentData'
import type { CopyMode, Picked, Scope } from './contentHelpers'
import { STATUS_LABEL, dimensionsOf, openingLabel, readiness } from './reviewCopyData'
import type { Opening } from './reviewCopyData'
import type { ReadyStatus } from './reviewCopyData'
import { choiceLabel, choiceOf, hiddenModules, itemIdOf } from './reviewData'
import type { Choice, DupeChoice, ReviewRow } from './reviewData'
import { DATE_ITEMS, rowInfo } from './fixDatesData'
import type { FixDatesState, Included } from './fixDatesData'
import { useAppThemeKey, useSurfaceTokens } from './appTheme'

// Step 5 of the copy wizard: review and copy. Before the copy runs, the teacher can run the course readiness check,
// see a final preview of the modules with a note on what the choices changed, and choose when students see the
// course. The copy itself starts from this step. The to-do list comes with the summary afterwards.

const STATUS_PILL: Record<ReadyStatus, 'success' | 'warning' | 'error'> = {
  pass: 'success',
  fixed: 'success',
  later: 'warning',
  open: 'warning',
}

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

  const [tab, setTab] = useState(0)
  // The secondary tabs of the course preview: modules, or learning objects.
  const [previewTab, setPreviewTab] = useState(0)
  // The item that was clicked in the preview. It opens in a window, view only.
  const [openItem, setOpenItem] = useState<PreviewItem | null>(null)
  // The groups of the learning objects tab open and close like an accordion. They start open.
  const [closedGroups, setClosedGroups] = useState<string[]>([])
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

  // Each item shows the decision made for it in the review, the same pills as in the learning object review.
  // The learning objects copied on their own (not in a module), grouped by type, with the decisions made for each.
  const inModule = new Set([...Object.values(MODULE_ENTRIES).flatMap((es) => es.map((e) => e.itemId)), ...MODULES.map((m) => m.id)])
  const pillColor = (c: Choice) => (c === 'fix' ? 'warning' : c === 'leave' ? 'error' : 'success') as 'warning' | 'error' | 'success'
  const objectItems = [...new Set(rows.filter((r) => !r.courseWide && !inModule.has(itemIdOf(r))).map((r) => itemIdOf(r)))].map((id) => {
    const own = rows.filter((r) => itemIdOf(r) === id)
    const first = own[0]
    const decisions = own
      .map((r) => choiceOf(r, choices))
      .filter((c): c is Choice => c !== undefined)
      .filter((c, n, all) => all.indexOf(c) === n)
      .map((c) => ({ label: choiceLabel(first, c), color: pillColor(c) }))
    return { id, title: first.title, kind: first.kindLabel, group: first.group, decisions, left: decisions.some((d) => d.color === 'error') }
  })
  const objectCopied = objectItems.filter((i) => !i.left).length
  const objectGroups = [...new Set(objectItems.map((i) => i.group))].map((g) => [g, objectItems.filter((i) => i.group === g)] as const)

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
          <StatusPill size="xs" color={c === 'fix' ? 'warning' : c === 'leave' ? 'error' : 'success'}>
            {choiceLabel(row, c)}
          </StatusPill>
        )}
        {date}
      </span>
    )
  }


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.xxl }}>
      <Tabs onRequestTabChange={(_e, { index }) => setTab(index)}>
        <Tabs.Panel id="tab-ready" renderTitle="Overview and course readiness" isSelected={tab === 0} padding="general.spaceXl 0 0 0">
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
            <div style={cardStyle}>
              {/* Card title and description, with the to-do list button at the end of the row. */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.md, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
                  <Text as="div" weight="bold" size="large">Copy overview</Text>
                  <Text as="div" color="secondary">A summary of the choices you made in this copy.</Text>
                </div>
                <Button renderIcon={<IconAssignmentLine />} onClick={onToggleTodo}>To-do list ({todoCount})</Button>
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
              <Button color={readyRan ? 'secondary' : 'primary'} interaction={running ? 'disabled' : 'enabled'} onClick={run}>
                {running ? 'Checking…' : readyRan ? 'Check' : 'Run readiness check'}
              </Button>
            </div>
            <div style={{ marginTop: t.space.lg }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
                {running && (
                  <ReadinessLoading areas={groups.map((g) => g.dimension)} onDone={() => { setRunning(false); setReadyRan(true) }} />
                )}
                {readyRan && !running && (
                  <div>
                    {groups.map((g) => (
                      <div key={g.dimension} style={{ marginTop: t.space.lg }}>
                        <div style={{ background: t.pageColor, padding: t.space.md }}>
                          <Text weight="bold">{g.dimension}</Text>
                        </div>
                        {g.rules.map((x) => (
                          <div
                            key={x.rule.id}
                            style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.md, alignItems: 'center', justifyContent: 'space-between', padding: t.space.md, borderTop: `${t.borderWidth} solid ${t.borderColor}` }}
                          >
                            <div style={{ flex: '1 1 20rem', minWidth: 0 }}>
                              <Text as="div" weight="bold">{x.rule.title}</Text>
                              <Text as="div" color="secondary">{x.note}</Text>
                            </div>
                            <StatusPill size="sm" color={STATUS_PILL[x.status]}>{STATUS_LABEL[x.status]}</StatusPill>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                {!running && !readyRan && (
                  <Text color="secondary">Run the readiness check to see whether the course is ready for students, based on the choices you made. The check is optional.</Text>
                )}
              </div>
            </div>
          </div>
          </div>
        </Tabs.Panel>
        <Tabs.Panel id="tab-final" renderTitle="Course preview" isSelected={tab === 1} padding="general.spaceXl 0 0 0">
          {/* Two ways to look at the copy: by module, or by learning object. */}
          <Tabs variant="secondary" onRequestTabChange={(_e, { index }) => setPreviewTab(index)}>
            <Tabs.Panel id="preview-modules" renderTitle="Modules" variant="secondary" isSelected={previewTab === 0} padding="general.spaceLg 0 0 0">
            <CoursePreview
              title="Modules"
              moduleIds={moduleIds}
              keepCurrent={merging}
              highlightNew
              hidden={hiddenModules(dupes)}
              noteFor={noteFor}
              onOpenItem={setOpenItem}
            />
            </Tabs.Panel>
            <Tabs.Panel id="preview-objects" renderTitle="Learning objects" variant="secondary" isSelected={previewTab === 1} padding="general.spaceLg 0 0 0">
            <div style={cardStyle}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.md, alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
                  <Text as="div" weight="bold" size="large">Learning objects</Text>
                  <Text as="div" color="secondary">
                    {objectCopied} of {objectItems.length} learning objects will be copied.
                  </Text>
                </div>
                </div>
              {objectGroups.length === 0 ? (
                <Text as="p" color="secondary">No learning objects are copied on their own.</Text>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg, marginTop: t.space.lg }}>
                  {objectGroups.map(([group, list]) => {
                    const closed = closedGroups.includes(group)
                    return (
                      <div key={group} style={{ border: `${t.borderWidth} solid ${t.borderColor}`, borderRadius: t.radiusMd, overflow: 'hidden' }}>
                        <button
                          type="button"
                          aria-expanded={!closed}
                          onClick={() => setClosedGroups(closed ? closedGroups.filter((g) => g !== group) : [...closedGroups, group])}
                          style={{ all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: t.space.sm, padding: t.space.md, background: t.pageColor, color: t.textColor }}
                        >
                          <span aria-hidden="true" style={{ display: 'inline-flex' }}>
                            {closed ? <IconArrowOpenEndSolid /> : <IconArrowOpenDownSolid />}
                          </span>
                          <span style={{ flex: 1, minWidth: 0 }}><Text weight="bold">{group}</Text></span>
                          <Text size="small" color="secondary">{list.filter((i) => !i.left).length} of {list.length} items will be copied</Text>
                        </button>
                        {!closed &&
                          list.map((i) => (
                            <div
                              key={i.id}
                              onClick={PREVIEW_KINDS.has(i.kind) ? () => setOpenItem({ title: i.title, kind: i.kind, where: 'Not in a module', origin: 'New' }) : undefined}
                              style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.md, alignItems: 'center', justifyContent: 'space-between', padding: t.space.md, borderTop: `${t.borderWidth} solid ${t.borderColor}`, cursor: PREVIEW_KINDS.has(i.kind) ? 'pointer' : undefined }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <Text as="div" weight="bold">
                                  {/* Pages, assignments, quizzes and files can be looked at. The rest stay as text. */}
                                  {PREVIEW_KINDS.has(i.kind) ? <Link as="button" onClick={() => setOpenItem({ title: i.title, kind: i.kind, where: 'Not in a module', origin: 'New' })}>{i.title}</Link> : i.title}
                                </Text>
                                <Text as="div" size="small" color="secondary">{i.kind}</Text>
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.sm }}>
                                {i.decisions.map((d) => (
                                  <StatusPill key={d.label} size="xs" color={d.color}>{d.label}</StatusPill>
                                ))}
                                {dateNote(i.id)}
                              </div>
                            </div>
                          ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            </Tabs.Panel>
          </Tabs>
        </Tabs.Panel>
      </Tabs>
      <ItemPreviewModal item={openItem} onClose={() => setOpenItem(null)} />
    </div>
  )
}
