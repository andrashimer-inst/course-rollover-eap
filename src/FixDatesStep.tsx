import { useState } from 'react'
import {
  DateInput,
  Button,
  CircleAlertInstUIIcon,
  CircleCheckInstUIIcon,
  IconAssignmentLine,
  IconEyeLine,
  RadioInput,
  RadioInputGroup,
  SimpleSelect,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@instructure/ui/v11_7'
import DatePickerButton from './DatePickerButton'
import PublishCards from './PublishCards'
import CoursePreviewModal from './CoursePreviewModal'
import type { PreviewSource } from './CoursePreviewModal'
import type { Opening } from './reviewCopyData'
import FigmaAlert from './FigmaAlert'
import StatusPill from './StatusPill'
import Pager from './Pager'
import { dateMetaFor, dateNoteFor } from './dateNote'
import type { Included } from './fixDatesData'
import { DATE_ITEMS, DEFAULT_TIME, FALL_END, FALL_START, NO_DATE_ITEMS, closedName, fmtShort, lastDayOf, localLabel, parseStart, rowInfo, startFor, timeOf, utcLabel, SUB_TIME } from './fixDatesData'
import type { DateMode, FixDatesState, NoDateChoice, SubInfo } from './fixDatesData'
import { useAppThemeKey, useSurfaceTokens } from './appTheme'

// Step 4 of the copy wizard: fix the dates. The teacher chooses how dates move to the new term, and each item that
// lands on a closed day (like Presidents' Day) gets a suggestion and a choice: move it before the
// holiday or after it. Items on a teaching day are done from the start, and any date can be changed by hand.

const noFill = { background: 'transparent' }

// What makes a day a non-teaching day, in plain words: a weekend day or a holiday.
const reasonOf = (closed: string) => {
  const day = closed.replace(/^a /, '')
  if (day === 'Saturday' || day === 'Sunday') return `${day}, a weekend day`
  return day === 'Spring break' ? 'Spring break, a term break' : `${day}, a bank holiday`
}

// The first day field and the fix-all dropdown are the same width, wide enough for the longest choice.
const FIELD_WIDTH = '21rem'
const PAGE_SIZE = 10
// Items become available at the start of the day, in UTC, unless the educator sets another time.
const FROM_TIME = '00:00'

const dateFieldProps = {
  screenReaderLabels: {
    calendarIcon: 'Open calendar',
    prevMonthButton: 'Previous month',
    nextMonthButton: 'Next month',
    datePickerDialog: 'Date picker',
    selectedLabel: 'Selected',
  },
  placeholder: 'Select a date',
  invalidDateErrorMessage: 'Enter a valid date',
}

const MODES: { id: DateMode; title: string; body: string }[] = [
  {
    id: 'calendar',
    title: 'Place on the Spring 2027 calendar',
    body: 'Each item keeps its week of term and weekday. Spring break is skipped.',
  },
  {
    id: 'keep',
    title: 'Keep the dates as they are',
    body: 'Items keep the dates of the old course. They are listed here and not checked.',
  },
  {
    id: 'clear',
    title: 'Clear dates and set them later',
    body: 'Items are copied without dates.',
  },
]

// The due time in UTC. Hovering or focusing it shows the same moment in the viewer's own time zone.
function TimeLabel({ date, time }: { date: Date; time: string }) {
  return (
    <Tooltip renderTip={`In your time zone: ${localLabel(date, time)}`} placement="top start">
      <span tabIndex={0} style={{ display: 'inline-block' }}>
        <Text size="small" color="secondary">{utcLabel(date, time)}</Text>
      </span>
    </Tooltip>
  )
}

// A date with its time on the same line: the day, then the time in UTC. The time shows the viewer's own zone on hover.
function DateLine({ date, time, bold = false }: { date: Date; time: string; bold?: boolean }) {
  const t = useSurfaceTokens()
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: t.space.sm }}>
      <Text weight={bold ? 'bold' : 'normal'}>{fmtShort(date)}</Text>
      <TimeLabel date={date} time={time} />
    </div>
  )
}

// One date of an item that has several (due, available from, until): a small label, then the content under it.
// Every line has the same height in every column, so the lines stay level.
function DateBlock({ label, first = false, children }: { label?: string; first?: boolean; children: React.ReactNode }) {
  const t = useSurfaceTokens()
  if (!label) return <>{children}</>
  return (
    <div style={{ minHeight: '3.5rem', marginTop: first ? 0 : t.space.sm }}>
      <Text as="div" size="small" color="secondary">{label}</Text>
      {children}
    </div>
  )
}

export default function FixDatesStep({
  included, preview, courseName, opening, setOpening, state, setState, todoCount, onToggleTodo,
}: {
  // The learning objects that are copied. The table lists the dates of these.
  included: Included
  // What the course preview shows: the same course as in the review step.
  preview: PreviewSource
  // When students see the course. It is set here, with the other dates.
  opening: Opening
  setOpening: (o: Opening) => void
  // The course the content comes from. Its first day is shown under the new first day.
  courseName: string
  state: FixDatesState
  setState: (s: FixDatesState) => void
  // The to-do list so far, which opens beside the page.
  todoCount: number
  onToggleTodo: () => void
}) {
  const t = useSurfaceTokens()
  const card = useAppThemeKey() !== 'legacy'
  const cardStyle = card
    ? { background: t.containerColor, borderRadius: t.radiusCardMd, boxShadow: t.shadowResting, padding: t.space.lg }
    : undefined

  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const infos = DATE_ITEMS.filter((item) => included(item.itemId)).map((item) => rowInfo(item, state))
  const keep = state.mode === 'keep'
  // Keeping and clearing both skip the date work: no fixing, no new dates, no items without a date.
  const clear = state.mode === 'clear' || keep
  // The items with no due date come after the dated ones. The table shows 10 rows a page.
  const noDated = clear ? [] : NO_DATE_ITEMS.filter((item) => included(item.itemId))
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil((infos.length + noDated.length) / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const from = (currentPage - 1) * PAGE_SIZE
  const pageInfos = infos.slice(from, from + PAGE_SIZE)
  const pageNoDate = noDated.slice(Math.max(0, from - infos.length), Math.max(0, from + PAGE_SIZE - infos.length))
  // Items still on a non-teaching day. A fixed item moves to a teaching day, so it no longer counts.
  const subsOf = infos.flatMap((r) => r.subs)
  const closedCount = infos.filter((r) => !clear && r.finalClosed !== null).length + subsOf.filter((x) => !clear && x.finalClosed !== null).length
  const open = [...infos.filter((r) => r.needsDecision && !r.choice), ...subsOf.filter((x) => x.needsDecision && !x.choice)]
  const dateCount = infos.length + subsOf.length
  // The check of one date on a row with several dates: one pill. What the day is sits in the tooltip.
  const compactCheck = (closed: string | null, finalClosed: string | null, byHand: boolean) => {
    if (clear) return keep ? null : <StatusPill size="sm" color="info">Set it later</StatusPill>
    const why = byHand && finalClosed && finalClosed !== closed ? `Your date is ${reasonOf(finalClosed)}.` : closed ? `${finalClosed ? 'Lands on' : 'Landed on'} ${reasonOf(closed)}.` : ''
    const pill = finalClosed ? <StatusPill size="sm" color="warning">Non-teaching day</StatusPill> : closed ? <StatusPill size="sm" color="success">Fixed</StatusPill> : <StatusPill size="sm" color="success">Teaching day</StatusPill>
    return why ? <Tooltip renderTip={why} placement="top"><span tabIndex={0} style={{ display: 'inline-block' }}>{pill}</span></Tooltip> : pill
  }
  const subTime = (sb: SubInfo) => (sb.choice?.choice === 'custom' ? state.times?.[sb.id] : undefined) ?? SUB_TIME[sb.key]
  // Items still on a non-teaching day. A fixed item moves to a teaching day, so it no longer counts.

  // The due time of an item. A time set by hand only counts for a date picked by hand.
  const timeFor = (item: { id: string; time?: string }, byHand: boolean) => (byHand ? state.times?.[item.id] : undefined) ?? timeOf(item)
  // Every item that lands on a non-teaching day follows this choice. "None selected" takes the choice back. Dates changed
  // by hand are left alone.
  const applyFixAll = (fixAll: '' | 'before' | 'after') => {
    const next = { ...state.rows }
    for (const r of infos) {
      if (!r.closed || next[r.item.id]?.choice === 'custom') continue
      if (fixAll === '') delete next[r.item.id]
      else next[r.item.id] = { choice: fixAll, custom: '' }
    }
    for (const sb of infos.flatMap((r) => r.subs)) {
      if (!sb.closed || next[sb.id]?.choice === 'custom') continue
      if (fixAll === '') delete next[sb.id]
      else next[sb.id] = { choice: fixAll, custom: '' }
    }
    setState({ ...state, fixAll, rows: next })
  }
  const setMode = (mode: DateMode) => setState({ ...state, mode, fixAll: '', rows: {} })

  // Fixes every item that is still on a non-teaching day in one go. It sits in the card of the way dates move.
  const fixAll = infos.some((r) => r.closed || r.subs.some((x) => x.closed)) ? (
    <div style={{ width: FIELD_WIDTH, maxWidth: '100%', flex: '0 0 auto' }}>
        <SimpleSelect
          renderLabel={<Text weight="bold">Fix non-teaching days</Text>}
          value={state.fixAll}
          onChange={(_e, { value }) => applyFixAll(value as '' | 'before' | 'after')}
        >
          {/* "None selected" is the base state. Going back to it takes the choice back for every item it moved. */}
          <SimpleSelect.Option id="fix-all-none" value="">None selected</SimpleSelect.Option>
          <SimpleSelect.Option id="fix-all-before" value="before">Move to the previous teaching day</SimpleSelect.Option>
          <SimpleSelect.Option id="fix-all-after" value="after">Move to the next teaching day</SimpleSelect.Option>
        </SimpleSelect>
    </div>
  ) : null

  // The first day of the course, in the card of the calendar placement.
  const startField = (
    <div style={{ width: FIELD_WIDTH, maxWidth: '100%', flex: '0 0 auto' }}>
          <DateInput
            {...dateFieldProps}
            width="100%"
            renderLabel={<Text weight="bold">First day of the course</Text>}
            value={state.startText}
            onChange={(_e, v) => setState({ ...state, startText: v, fixAll: '', rows: {} })}
            // The first day of the old course sits under the field, so the new day can be compared with it.
            messages={parseStart(state.startText) ? [{ type: 'hint', text: `${courseName ? `${courseName}, Fall 2026,` : 'Fall 2026'} started on ${FALL_START.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}` }] : [{ type: 'newError', text: 'Enter a valid date' }]}
          />
    </div>
  )

  // One card: a dropdown picks how the dates move, and what belongs to that choice shows under it.
  const current = MODES.find((m) => m.id === state.mode) ?? MODES[0]
  // The last day moves with the first day, day by day: the course keeps its length, so a first day one day later gives a last day one day later.
  const endOfCourse = (() => {
    const start = parseStart(state.startText)
    if (!start) return null
    const end = new Date(lastDayOf(state))
    end.setDate(end.getDate() + Math.round((start.getTime() - startFor(state.mode, state.startText).getTime()) / 86400000))
    return end
  })()
  const endDate = (
    <div style={{ width: FIELD_WIDTH, maxWidth: '100%', flex: '0 0 auto' }}>
      <TextInput
        renderLabel={<Text weight="bold">Last day of the course</Text>}
        interaction={card ? 'readonly' : 'disabled'}
        value={endOfCourse ? endOfCourse.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Enter a first day'}
        // The last day of the old course sits under the field, like the first day of the old course does under the first day.
        messages={[{ type: 'hint', text: `${courseName ? `${courseName}, Fall 2026,` : 'Fall 2026'} ended on ${FALL_END.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}` }]}
      />
    </div>
  )

  // The date check on each item of the course preview: where its due date lands in the new term.
  const [previewOpen, setPreviewOpen] = useState(false)
  const dateNote = dateNoteFor(state, included)

  const modeCard = (
    <div style={{ ...cardStyle, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: t.space.md, flex: 1 }}>
      <Text weight="bold" size="large">Date placement</Text>
      <RadioInputGroup
        name="date-mode"
        description={<Text weight="bold">Method</Text>}
        value={state.mode}
        onChange={(_e, value) => setMode(value as DateMode)}
      >
        {MODES.map((m) => (
          <RadioInput key={m.id} value={m.id} label={m.title} />
        ))}
      </RadioInputGroup>
      <Text as="div" color="secondary">{current.body}</Text>
      {state.mode === 'clear' && (
        <FigmaAlert variant="info" type="inline">
          All dates are cleared. Each item is listed on the course Settings page until you set a date.
        </FigmaAlert>
      )}
      {state.mode === 'calendar' && <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: t.space.xl }}>{startField}{endDate}</div>}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.xl }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: t.space.md }}>
          <Button renderIcon={<IconEyeLine />} onClick={() => setPreviewOpen(true)}>Course preview</Button>
          <Button renderIcon={<IconAssignmentLine />} onClick={onToggleTodo}>To-do list ({todoCount})</Button>
        </div>
        <CoursePreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} source={preview} noteFor={dateNote} metaFor={dateMetaFor(state, included)} />
        {/* The date placement and the course publishing are two cards side by side. On a narrow page they stack. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>{modeCard}</div>
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <PublishCards opening={opening} setOpening={setOpening} />
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.md }}>
        <style>{`
          .dates-table table { table-layout: fixed; width: 100%; }
          .dates-table th:nth-child(1) { width: 30%; }
          .dates-table th:nth-child(2), .dates-table th:nth-child(3), .dates-table th:nth-child(4) { width: 23.3333%; }
          .dates-keep th:nth-child(1) { width: 50%; }
          .dates-keep th:nth-child(2) { width: 50%; }
          .dates-clear th:nth-child(1) { width: 40%; }
          .dates-clear th:nth-child(2) { width: 25%; }
          .dates-clear th:nth-child(3) { width: 35%; }
        `}</style>
        <div className={keep ? 'dates-table dates-keep' : clear ? 'dates-table dates-clear' : 'dates-table'} style={cardStyle}>
          {/* The summary and the fix-all choice are part of the card. */}
          {/* Card title and description, with the spacing of the other cards. */}
          <div style={{ marginBottom: t.space.lg, display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
            <Text as="div" weight="bold" size="large">Dates</Text>
            <Text as="div" color="secondary" aria-live="polite">
              {clear
                ? keep ? `${dateCount} dates · kept as they are` : `${dateCount} dates cleared · set them after the copy`
                : `${dateCount} dates to review · ${closedCount === 0 ? 'all on teaching days' : `${closedCount} on a non-teaching day · ${open.length} still to fix`}`}
            </Text>
          </div>
          {/* Fixes every item on a non-teaching day in one go. It sits under the title and description of the Dates card. */}
          {!clear && fixAll && <div style={{ marginBottom: t.space.lg }}>{fixAll}</div>}
          <Table caption={() => 'Dates of the items to copy'} themeOverride={noFill}>
            <Table.Head themeOverride={noFill}>
              <Table.Row themeOverride={noFill}>
                <Table.ColHeader themeOverride={noFill} id="item">Item</Table.ColHeader>
                <Table.ColHeader themeOverride={noFill} id="fall">{keep ? 'Dates' : 'Previous dates'}</Table.ColHeader>
                {!keep && <Table.ColHeader themeOverride={noFill} id="check">Check</Table.ColHeader>}
                {!clear && <Table.ColHeader themeOverride={noFill} id="choice">New dates</Table.ColHeader>}
              </Table.Row>
            </Table.Head>
            <Table.Body themeOverride={noFill}>
              {pageInfos.map((r) => {
                return (
                  <Table.Row themeOverride={noFill} key={r.item.id}>
                    <Table.Cell themeOverride={noFill}>
                      <Text as="div" weight="bold">{r.item.title}</Text>
                      <Text as="div" size="small" color="secondary">{r.item.kind} · {r.item.module}</Text>
                    </Table.Cell>
                    <Table.Cell themeOverride={noFill}>
                      <DateBlock first label={r.item.kind === 'Event' ? 'Date' : 'Due'}><DateLine date={r.item.old} time={timeOf(r.item)} /></DateBlock>
                      {r.subs.map((sb) => (
                        <DateBlock key={sb.id} label={sb.label}><DateLine date={sb.old} time={SUB_TIME[sb.key]} /></DateBlock>
                      ))}
                    </Table.Cell>
                    {!keep && (
                    <Table.Cell themeOverride={noFill}>
                      <DateBlock first label={r.item.kind === 'Event' ? 'Date' : 'Due'}>
                      {compactCheck(r.closed, r.finalClosed, r.choice?.choice === 'custom')}
                      </DateBlock>
                      {r.subs.map((sb) => (
                        <DateBlock key={sb.id} label={sb.label}>{compactCheck(sb.closed, sb.finalClosed, sb.choice?.choice === 'custom')}</DateBlock>
                      ))}
                    </Table.Cell>
                    )}
                    {!clear && (
                      <Table.Cell themeOverride={noFill}>
                        <DateBlock first label={r.item.kind === 'Event' ? 'Date' : 'Due'}>
                        {/* The date the item ends up on. The calendar button changes it by hand. */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: t.space.sm }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {r.needsDecision && !r.choice ? (
                              <Text color="secondary">Not fixed yet</Text>
                            ) : (
                              <>
                                {r.final && <DateLine bold date={r.final} time={timeFor(r.item, r.choice?.choice === 'custom')} />}
                                {r.choice?.choice === 'custom' && (
                                  <Text as="div" size="small" color="secondary">Changed by you</Text>
                                )}
                              </>
                            )}
                          </div>
                          {/* A check mark when the date is fixed, an alert while it still lands on a non-teaching day. */}
                          {r.final && (
                            <Tooltip
                              renderTip={
                                r.finalClosed
                                  ? r.choice?.choice === 'custom'
                                    ? 'This date is on a non-teaching day.'
                                    : 'Not fixed yet. This date is on a non-teaching day.'
                                  : r.closed
                                    ? 'Fixed. The date moved to a teaching day.'
                                    : 'Nothing to fix. This date is on a teaching day.'
                              }
                              placement="top"
                            >
                              <span
                                tabIndex={0}
                                role="img"
                                aria-label={r.finalClosed ? 'Not fixed yet' : 'Fixed'}
                                style={{ display: 'inline-flex', paddingBlockStart: '0.25rem', color: r.finalClosed ? t.warningTextColor : t.successTextColor }}
                              >
                                {r.finalClosed ? <CircleAlertInstUIIcon /> : <CircleCheckInstUIIcon />}
                              </span>
                            </Tooltip>
                          )}
                          <DatePickerButton
                            value={iso(r.final ?? r.base)}
                            time={timeFor(r.item, r.choice?.choice === 'custom')}
                            label={`Change the date and time of ${r.item.title}`}
                            onPick={(d, time) => setState({ ...state, rows: { ...state.rows, [r.item.id]: { choice: 'custom', custom: d } }, times: { ...state.times, [r.item.id]: time } })}
                            canReset={r.choice?.choice === 'custom'}
                            onReset={() => {
                              const { [r.item.id]: _row, ...rows } = state.rows
                              const { [r.item.id]: _time, ...times } = state.times ?? {}
                              setState({ ...state, rows, times })
                            }}
                          />
                        </div>
                        </DateBlock>
                        {r.subs.map((sb) => (
                          <DateBlock key={sb.id} label={sb.label}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: t.space.sm }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                {sb.needsDecision && !sb.choice ? (
                                  <Text color="secondary">Not fixed yet</Text>
                                ) : (
                                  <>
                                    {sb.final && <DateLine bold date={sb.final} time={subTime(sb)} />}
                                    {sb.choice?.choice === 'custom' && <Text as="div" size="small" color="secondary">Changed by you</Text>}
                                  </>
                                )}
                              </div>
                              {/* A check mark when the date is fine or fixed, an alert while it still lands on a non-teaching day. */}
                              {sb.final && (
                                <Tooltip
                                  renderTip={sb.finalClosed ? (sb.choice?.choice === 'custom' ? 'This date is on a non-teaching day.' : 'Not fixed yet. This date is on a non-teaching day.') : sb.closed ? 'Fixed. The date moved to a teaching day.' : 'Nothing to fix. This date is on a teaching day.'}
                                  placement="top"
                                >
                                  <span
                                    tabIndex={0}
                                    role="img"
                                    aria-label={sb.finalClosed ? 'Not fixed yet' : 'Fixed'}
                                    style={{ display: 'inline-flex', paddingBlockStart: '0.25rem', color: sb.finalClosed ? t.warningTextColor : t.successTextColor }}
                                  >
                                    {sb.finalClosed ? <CircleAlertInstUIIcon /> : <CircleCheckInstUIIcon />}
                                  </span>
                                </Tooltip>
                              )}
                              <DatePickerButton
                                value={iso(sb.final ?? sb.base)}
                                time={subTime(sb)}
                                label={`Change the ${sb.label.toLowerCase()} date and time of ${r.item.title}`}
                                dateLabel={sb.key === 'showOn' ? 'New show date' : sb.key === 'hideOn' ? 'New hide date' : `New ${sb.label.toLowerCase()} date`}
                                onPick={(d, time) => setState({ ...state, rows: { ...state.rows, [sb.id]: { choice: 'custom', custom: d } }, times: { ...state.times, [sb.id]: time } })}
                                canReset={sb.choice?.choice === 'custom'}
                                onReset={() => {
                                  const { [sb.id]: _row, ...rows } = state.rows
                                  const { [sb.id]: _time, ...times } = state.times ?? {}
                                  setState({ ...state, rows, times })
                                }}
                              />
                            </div>
                          </DateBlock>
                        ))}
                      </Table.Cell>
                    )}
                  </Table.Row>
                )
              })}
              {/* Items with no due date: they stay empty, take the last day of the course, or get a date picked by hand. */}
              {!clear &&
                pageNoDate.map((item) => {
                  const pick: NoDateChoice = state.noDate[item.id] ?? 'empty'
                  const date = pick === 'empty' ? null : pick === 'last' ? lastDayOf(state) : new Date(`${pick}T12:00:00`)
                  return (
                    <Table.Row themeOverride={noFill} key={item.id}>
                      <Table.Cell themeOverride={noFill}>
                        <Text as="div" weight="bold">{item.title}</Text>
                        <Text as="div" size="small" color="secondary">{item.kind} · {item.module}</Text>
                      </Table.Cell>
                      <Table.Cell themeOverride={noFill}>No date</Table.Cell>
                      <Table.Cell themeOverride={noFill}>
                        <StatusPill size="sm" color="info">No due date</StatusPill>
                      </Table.Cell>
                      <Table.Cell themeOverride={noFill}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: t.space.sm }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {date ? (
                              <>
                                <DateLine bold date={date} time={state.times?.[item.id] ?? DEFAULT_TIME} />
                                {pick === 'last' && <Text as="div" size="small" color="secondary">Last day of the course</Text>}
                                {pick !== 'last' && <Text as="div" size="small" color="secondary">Set by you</Text>}
                                {date && closedName(date) && (
                                  <div style={{ marginTop: t.space.xs, display: 'flex', flexDirection: 'column', gap: t.space.xs, alignItems: 'flex-start' }}>
                                    <StatusPill size="xs" color="warning">Non-teaching day</StatusPill>
                                    <Text as="div" size="small" color="secondary">{reasonOf(closedName(date) as string)}</Text>
                                  </div>
                                )}
                              </>
                            ) : (
                              <Text color="secondary">No date</Text>
                            )}
                          </div>
                          <Tooltip renderTip={date ? (closedName(date) ? 'This date is on a non-teaching day.' : 'Dated. This item now has a due date.') : 'No date yet. Set one later, or pick a date.'} placement="top">
                            <span
                              tabIndex={0}
                              role="img"
                              aria-label={date ? (closedName(date) ? 'On a non-teaching day' : 'Dated') : 'No date yet'}
                              style={{ display: 'inline-flex', paddingBlockStart: '0.25rem', color: date && !closedName(date) ? t.successTextColor : t.warningTextColor }}
                            >
                              {date && !closedName(date) ? <CircleCheckInstUIIcon /> : <CircleAlertInstUIIcon />}
                            </span>
                          </Tooltip>
                          <DatePickerButton
                            value={iso(date ?? lastDayOf(state))}
                            time={state.times?.[item.id] ?? DEFAULT_TIME}
                            label={`Set the date and time of ${item.title}`}
                            onPick={(d, time) => setState({ ...state, noDate: { ...state.noDate, [item.id]: d }, times: { ...state.times, [item.id]: time } })}
                            canReset={pick !== 'empty'}
                            onReset={() => {
                              const { [item.id]: _pick, ...noDate } = state.noDate
                              const { [item.id]: _time, ...times } = state.times ?? {}
                              setState({ ...state, noDate, times })
                            }}
                          />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
            </Table.Body>
          </Table>
          <div style={{ marginTop: t.space.lg }}>
            <Pager label="Dates pages" page={currentPage} pageCount={pageCount} onPage={setPage} />
          </div>
        </div>
      </div>
    </div>
  )
}
