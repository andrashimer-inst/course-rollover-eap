import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Button,
  Checkbox,
  CircleCheckInstUIIcon,
  IconArrowOpenDownSolid,
  IconArrowOpenUpSolid,
  IconArrowOpenEndSolid,
  ScreenReaderContent,
  SimpleSelect,
  Tooltip,
  Table,
  Tabs,
  IconAssignmentLine,
  IconEmailLine,
  Metric,
  Text,
  View,
} from '@instructure/ui/v11_7'
import StatusPill from './StatusPill'
import ReadinessLoading from './ReadinessLoading'
import { dimensionsOf, readiness } from './reviewCopyData'
import AdminHelpModal from './AdminHelpModal'
import type { TodoItem } from './rolloverData'
import CoursePreviewModal from './CoursePreviewModal'
import { CONTENT_TYPES, MODULE_ENTRIES } from './courseContentData'
import type { Picked, Scope, CopyMode } from './contentHelpers'
import { CHOICES, CHOICE_LABEL, NOTE_LABEL, RULE_LABEL, choiceLabel, choiceOf, hiddenModules, itemIdOf } from './reviewData'
import type { Choice, DupeChoice, ReviewRow } from './reviewData'
import { useAppThemeKey, useSurfaceTokens } from './appTheme'

// Step 3 of the copy wizard: review every learning object that is copied. Each row says what the readiness check
// and the teaching team found, and lets the educator choose what to do with it: include it, leave it out, or add it
// to the to-do list. Rows with nothing found are done from the start and are included. Picking something marks the row
// done, and it can be changed at any time. Ticking rows opens bulk actions.

const noFill = { background: 'transparent' }
type Filter = 'all' | 'suggestion' | 'todo' | 'done'
const FILTERS: [Filter, string][] = [
  ['all', 'All items'],
  ['suggestion', 'Has a finding'],
  ['todo', 'Still to decide'],
  ['done', 'Action taken'],
]

const MODULES = CONTENT_TYPES.find((c) => c.id === 'modules')!.items

export default function LearningObjectReview({
  rows, choices, setChoices, scope, mode, picked, dupes, todo, onToggleTodo,
}: {
  rows: ReviewRow[]
  choices: Record<string, Choice>
  setChoices: (c: Record<string, Choice>) => void
  // The to-do list so far, from the choices made.
  todo: TodoItem[]
  onToggleTodo: () => void
  scope: Scope
  mode: CopyMode
  picked: Picked
  dupes: Record<string, DupeChoice>
}) {
  const t = useSurfaceTokens()
  // Light and Dark put the table on a card. Legacy stays flat on the page.
  const legacy = useAppThemeKey() === 'legacy'
  const card = !legacy
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const selected = selectedRows
  // One message to the admin about the whole review, and whether it was sent.
  const [helpOpen, setHelpOpen] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  // Module bars open and close like an accordion. They start open.
  const [closedGroups, setClosedGroups] = useState<string[]>([])
  const toggleGroup = (g: string) => setClosedGroups(closedGroups.includes(g) ? closedGroups.filter((x) => x !== g) : [...closedGroups, g])

  const done = (r: ReviewRow) => choiceOf(r, choices) !== undefined
  const [tab, setTab] = useState(0)
  const [checking, setChecking] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  // The action picked in the bulk bar. It is only applied to the ticked rows when the educator chooses Apply.
  const [bulk, setBulk] = useState<Choice | ''>('')
  // The bulk bar always opens on "Select action": when no row is ticked any more, the action picked is forgotten.
  const setSelected = (ids: string[]) => {
    setSelectedRows(ids)
    if (ids.length === 0) setBulk('')
  }
  // Learning objects inside a module, and those that are copied on their own. The course preview only shows modules,
  // so the ones on their own are reviewed in a card of their own and do not change the preview.
  const inModule = new Set([...Object.values(MODULE_ENTRIES).flatMap((es) => es.map((e) => e.itemId)), ...MODULES.map((m) => m.id)])
  // The filter counts only the items of the tab that is open.
  const tabRows = rows.filter((r) =>
    tab === 0 ? !r.courseWide && inModule.has(itemIdOf(r)) : tab === 1 ? !r.courseWide && !inModule.has(itemIdOf(r)) : !!r.courseWide,
  )
  const counts = {
    all: tabRows.length,
    suggestion: tabRows.filter((r) => r.hasSuggestion).length,
    todo: tabRows.filter((r) => !done(r)).length,
    done: tabRows.filter(done).length,
  }
  const shown = rows.filter((r) => filter === 'all' || (filter === 'suggestion' && r.hasSuggestion) || (filter === 'todo' && !done(r)) || (filter === 'done' && done(r)))
  const groupsOf = (list: ReviewRow[]) => [...new Set(list.map((r) => r.group))]
  const wholeRows = shown.filter((r) => r.courseWide)
  const moduleRows = shown.filter((r) => !r.courseWide && inModule.has(itemIdOf(r)))
  const standaloneRows = shown.filter((r) => !r.courseWide && !inModule.has(itemIdOf(r)))

  // Items that will come over: every learning object that is not left out. The course-wide issues are not items.
  const comeOver = rows.filter((r) => !r.courseWide && !r.extra && r.typeId !== 'modules' && choiceOf(r, choices) !== 'leave').length

  // A choice only applies to a row that offers it (course-wide rows have no "leave out").
  const allowed = (r: ReviewRow, c: Choice) => (r.options ? r.options.includes(c) : true)
  const targetOf = (r: ReviewRow, c: Choice): Choice | undefined => (allowed(r, c) ? c : undefined)
  // The ticked rows an action would still change. Rows that already have that choice are not counted.
  const pending = (c: Choice) => rows.filter((r) => selected.includes(r.id) && targetOf(r, c) !== undefined && choiceOf(r, choices) !== c).length
  const run = (c: Choice) => {
    const next = { ...choices }
    for (const r of rows) if (selected.includes(r.id) && targetOf(r, c)) next[r.id] = c
    setChoices(next)
  }

  const toggle = (id: string) => setSelected(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])

  const merging = scope === 'part' && mode === 'merge'
  // What was chosen for an item, as a small pill. Items still to decide show nothing.
  const previewNote = (itemId: string) => {
    const r = rows.find((x) => x.id === itemId)
    const c = r ? choiceOf(r, choices) : undefined
    return r && c ? (
      <StatusPill size="xs" color={c === 'fix' ? 'warning' : c === 'leave' ? 'error' : 'success'}>
        {choiceLabel(r, c)}
      </StatusPill>
    ) : null
  }
  const moduleIds = scope === 'whole' ? MODULES.map((m) => m.id) : MODULES.filter((m) => picked[m.id]).map((m) => m.id)

  // A chosen field gets a check mark next to it. The whole row is highlighted by the table styles below.
  const chooser = (label: string, value: string | undefined, options: { id: string; label: string }[], onPick: (id: string) => void, canClear: boolean, help?: ReactNode) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: t.space.sm,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <SimpleSelect
          renderLabel={<ScreenReaderContent>{label}</ScreenReaderContent>}
          placeholder="Select an action"
          value={value ?? ''}
          onChange={(_e, { value: v }) => onPick(String(v))}
        >
          {/* The hint stays in the list, so a choice can be taken back. Rows that need no decision have nothing to take back. */}
          {(!value || canClear) && <SimpleSelect.Option id={`${label}-none`} value="">Select an action</SimpleSelect.Option>}
          {options.map((o) => (
            <SimpleSelect.Option key={o.id} id={`${label}-${o.id}`} value={o.id}>{o.label}</SimpleSelect.Option>
          ))}
        </SimpleSelect>
      </div>
      {help !== undefined && <span style={{ width: '2rem', flexShrink: 0, display: 'inline-flex' }}>{help}</span>}
      <span style={{ width: '1.5rem', flexShrink: 0, color: t.successTextColor, display: 'inline-flex' }}>
        {value && (
          <Tooltip
            renderTip={canClear ? 'Already reviewed. You can change it.' : 'Nothing to decide. It is copied unchanged.'}
            placement="top"
          >
            <span role="img" aria-label="Done" tabIndex={0} style={{ display: 'inline-flex' }}><CircleCheckInstUIIcon /></span>
          </Tooltip>
        )}
      </span>
    </div>
  )

  // The bulk action for the ticked rows. It shows above the table of the open tab.
  const bulkBar = (label: string) =>
    selected.length > 0 ? (
          <div
            role="region"
            aria-label={label}
            style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.sm, alignItems: 'center', padding: t.space.md, borderRadius: t.radiusCardSm, background: t.containerColor, boxShadow: t.shadowResting }}
          >
            <Text weight="bold">{selected.length} selected</Text>
            <div style={{ width: '16rem', maxWidth: '100%' }}>
              <SimpleSelect
                renderLabel={<ScreenReaderContent>Bulk action</ScreenReaderContent>}
                placeholder="Select action"
                value={bulk}
                onChange={(_e, { value }) => setBulk(String(value) as Choice | '')}
              >
                {/* The empty option keeps the field on "Select action", so no real choice looks picked before it is. */}
                <SimpleSelect.Option id="bulk-none" value="">Select action</SimpleSelect.Option>
                {CHOICES.map((c) => (
                  <SimpleSelect.Option key={c} id={`bulk-${c}`} value={c} isDisabled={pending(c) === 0}>{`${CHOICE_LABEL[c]} (${pending(c)})`}</SimpleSelect.Option>
                ))}
              </SimpleSelect>
            </div>
            <Button size="small" color="primary" interaction={bulk && pending(bulk) > 0 ? 'enabled' : 'disabled'} onClick={() => { if (bulk) { run(bulk); setBulk('') } }}>
              Apply
            </Button>
            <Button size="small" color="secondary" onClick={() => { setSelected([]); setBulk('') }}>Clear selection</Button>
          </div>
    ) : null

  // The table of one card. The whole course and the modules each get a card of their own.
  const reviewTable = (subset: ReviewRow[], caption: string, title?: string, showTitle = true) => {
    const allSel = subset.length > 0 && subset.every((r) => selected.includes(r.id))
    const someSel = subset.some((r) => selected.includes(r.id))
    return (
      <div
          className="review-table"
          style={
            card
              ? { background: t.containerColor, borderRadius: t.radiusCardMd, boxShadow: t.shadowResting, padding: t.space.lg }
              : undefined
          }
        >
        {title && (
          <div style={{ marginBottom: t.space.md, minHeight: '2rem', display: 'flex', flexWrap: 'wrap', gap: t.space.md, alignItems: 'center', justifyContent: 'space-between' }}>
            {showTitle ? <Text weight="bold" size="large">{title}</Text> : <span />}
            {/* Opens or closes every group bar of this card at once. */}
            {(() => {
              const groups = groupsOf(subset).filter((g) => g !== 'Whole course')
              if (groups.length === 0) return null
              const allClosed = groups.length > 0 && groups.every((g) => closedGroups.includes(g))
              return (
                <Button
                  size="small"
                  renderIcon={allClosed ? <IconArrowOpenDownSolid /> : <IconArrowOpenUpSolid />}
                  onClick={() => setClosedGroups(allClosed ? closedGroups.filter((g) => !groups.includes(g)) : [...new Set([...closedGroups, ...groups])])}
                >
                  {allClosed ? 'Expand all' : 'Collapse all'}
                </Button>
              )
            })()}
          </div>
        )}
        <Table caption={() => caption} themeOverride={noFill}>
          <Table.Head themeOverride={noFill}>
            <Table.Row themeOverride={noFill}>
              <Table.ColHeader themeOverride={noFill} id="pick">
                <Checkbox
                  label={<ScreenReaderContent>Select all shown items</ScreenReaderContent>}
                  checked={allSel}
                  indeterminate={!allSel && someSel}
                  onChange={() => setSelected(allSel ? selected.filter((s) => !subset.some((r) => r.id === s)) : [...new Set([...selected, ...subset.map((r) => r.id)])])}
                />
              </Table.ColHeader>
              <Table.ColHeader themeOverride={noFill} id="item">Item</Table.ColHeader>
              <Table.ColHeader themeOverride={noFill} id="suggestion">Finding</Table.ColHeader>
              <Table.ColHeader themeOverride={noFill} id="choice">Action</Table.ColHeader>
            </Table.Row>
          </Table.Head>
          <Table.Body themeOverride={noFill}>
            {subset.length === 0 && (
              <Table.Row themeOverride={noFill}>
                <Table.Cell themeOverride={noFill} colSpan={4}>No items match this filter.</Table.Cell>
              </Table.Row>
            )}
            {groupsOf(subset).flatMap((g) => {
              const inGroup = subset.filter((r) => r.group === g)
              const all = rows.filter((r) => r.group === g && r.typeId !== 'modules' && (g === 'Whole course' || !r.extra))
              const coming = all.filter((r) => !r.extra && choiceOf(r, choices) !== 'leave').length
              // The group bar is for the learning items (modules and types). The general items have no bar.
              const bar = g !== 'Whole course'
              return [
                bar && <Table.Row themeOverride={noFill} key={`g-${g}`} data-group="true">
                  <Table.Cell themeOverride={noFill} colSpan={4}>
                    {/* The same module bar as the course preview: light grey, a caret, and it opens and closes the group. */}
                    <View as="div" background={legacy ? 'secondary' : undefined}>
                      <button
                        type="button"
                        aria-expanded={!closedGroups.includes(g)}
                        onClick={() => toggleGroup(g)}
                        style={{
                          all: 'unset',
                          boxSizing: 'border-box',
                          width: '100%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: t.space.sm,
                          padding: t.space.md,
                          background: legacy ? 'transparent' : t.pageColor,
                          color: t.textColor,
                        }}
                      >
                        <span aria-hidden="true" style={{ display: 'inline-flex' }}>
                          {closedGroups.includes(g) ? <IconArrowOpenEndSolid /> : <IconArrowOpenDownSolid />}
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}><Text weight="bold">{g}</Text></span>
                        <Text color="secondary">{g === 'Whole course' ? `${all.length} issues across the course` : `${coming} of ${all.length} items will be copied`}</Text>
                      </button>
                    </View>
                  </Table.Cell>
                </Table.Row>,
                ...(bar && closedGroups.includes(g) ? [] : inGroup).map((r) => {
                  const choice = choiceOf(r, choices)
                  return (
                    <Table.Row themeOverride={noFill} key={r.id}>
                      <Table.Cell themeOverride={noFill}>
                        <Checkbox
                          label={<ScreenReaderContent>{`Select ${r.title}`}</ScreenReaderContent>}
                          checked={selected.includes(r.id)}
                          onChange={() => toggle(r.id)}
                        />
                      </Table.Cell>
                      <Table.Cell themeOverride={noFill}>
                        <Text as="div" weight="bold">{r.title}</Text>
                        <Text as="div" size="small" color="secondary">{r.kindLabel}</Text>
                        {r.note && (
                          <Text as="div" size="small" color="primary">
                            Your team’s note: {r.note.text}
                          </Text>
                        )}
                      </Table.Cell>
                      <Table.Cell themeOverride={noFill}>
                        {!r.hasSuggestion ? (
                          <>
                            <Text as="div" weight="bold">Nothing found</Text>
                            <Text as="div" color="secondary">It is copied as it is.</Text>
                          </>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.md }}>
                            {r.findings.map((f) => (
                              <div key={f.rule.id + f.detail}>
                                <StatusPill size="sm" color={f.rule.severity === 'critical' ? 'error' : 'warning'}>
                                  {RULE_LABEL[f.rule.id] ?? f.rule.title}
                                </StatusPill>
                                <Text as="div">{f.detail}</Text>
                              </div>
                            ))}
                            {r.findings.length === 0 && r.note && (
                              <div>
                                <StatusPill size="sm" color={r.note.decision === 'copy' ? 'success' : 'warning'}>
                                  {NOTE_LABEL[r.note.id] ?? 'Flagged by your team'}
                                </StatusPill>
                                <Text as="div">{r.note.author} left a note about this last term.</Text>
                              </div>
                            )}
                          </div>
                        )}
                      </Table.Cell>
                      <Table.Cell themeOverride={noFill}>
                        {chooser(
                          `Choice for ${r.title}`,
                          choice,
                          (r.options ?? CHOICES).map((c) => ({ id: c, label: choiceLabel(r, c) })),
                          (id) => {
                            if (id !== '') setChoices({ ...choices, [r.id]: id as Choice })
                            else {
                              const { [r.id]: _taken, ...rest } = choices
                              setChoices(rest)
                            }
                          },
                          r.hasSuggestion,
                        )}
                      </Table.Cell>
                    </Table.Row>
                  )
                }),
              ]
            })}
          </Table.Body>
        </Table>
        </div>
    )
  }

  // The filter, under the tabs.
  const filterRow = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.md, alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ width: '16rem', maxWidth: '100%' }}>
          <SimpleSelect
            renderLabel={<ScreenReaderContent>Show</ScreenReaderContent>}
            value={filter}
            onChange={(_e, { value }) => setFilter(String(value) as Filter)}
          >
            {FILTERS.map(([id, label]) => (
              <SimpleSelect.Option key={id} id={`filter-${id}`} value={id}>{`${label} (${counts[id]})`}</SimpleSelect.Option>
            ))}
          </SimpleSelect>
        </div>
      {/* The check, preview, message and to-do buttons at the end of the row, under the tabs. */}
      <div style={{ marginInlineStart: 'auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: t.space.md }}>
        {messageSent && <StatusPill size="sm" color="success">Message sent to your admin</StatusPill>}
        <Button onClick={() => setChecking(true)}>Check</Button>
        <Button onClick={() => setPreviewOpen(true)}>Course preview</Button>
        <Button renderIcon={<IconEmailLine />} onClick={() => setHelpOpen(true)}>Message admin</Button>
        <Button renderIcon={<IconAssignmentLine />} onClick={onToggleTodo}>To-do list ({todo.length})</Button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
      {/* Running the readiness check shows the same loading as the wait after step 2. */}
      {checking && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg, padding: `${t.space.xl} 0` }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
            <Text as="div" weight="bold" size="large">Course readiness check</Text>
            <Text as="div" color="secondary">The check goes through the readiness criteria of your account.</Text>
          </div>
          <ReadinessLoading areas={dimensionsOf(readiness(rows, choices)).map((g) => g.dimension)} onDone={() => setChecking(false)} />
        </div>
      )}
      {!checking && (<>
      {/* The tally as small dashboard cards, so the numbers are easy to see at a glance. */}
      <div aria-live="polite" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))', gap: t.space.md }}>
        {([
          [comeOver, 'Items in the copy'],
          [rows.filter((r) => !done(r)).length, 'Findings to review'],
          [rows.filter((r) => !r.courseWide && !r.extra && r.typeId !== 'modules' && choiceOf(r, choices) === 'leave').length, 'Items left out'],
        ] as const).map(([value, label]) => (
          <div
            key={label}
            style={{
              background: t.containerColor,
              borderRadius: t.radiusCardMd,
              boxShadow: card ? t.shadowResting : undefined,
              border: card ? undefined : `${t.borderWidth} solid ${t.borderColor}`,
              padding: t.space.md,
            }}
          >
            <Metric textAlign="start" renderLabel={<Text size="medium">{label}</Text>} renderValue={String(value)} />
          </div>
        ))}
      </div>



      {/* A module bar fills the whole row, so its cell has no padding. */}
      <style>{`
        .review-table th:first-child, .review-table tr:not([data-group="true"]) td:first-child { width: 2.25rem; min-width: 0; max-width: 2.25rem; padding-inline-end: 0; }
        .review-table th:nth-child(2), .review-table tr:not([data-group="true"]) td:nth-child(2) { padding-inline-start: 0.5rem; }
        .review-table th:first-child > div, .review-table tr:not([data-group="true"]) td:first-child > div { width: 1.5rem; }
        .review-table table { table-layout: fixed; width: 100%; }
        .review-table th:nth-child(2) { width: 24%; }
        .review-table th:nth-child(3) { width: 48%; }
        .review-table th:nth-child(4) { width: 28%; }
        .review-table tr[data-group="true"] td { padding: 0; }
      `}</style>
      <Tabs onRequestTabChange={(_e, { index }) => {
        // Ticks belong to the tab they were made in, so switching tabs clears them and hides the bulk actions.
        setTab(index)
        setSelected([])
        setBulk('')
        // The filter is for the tab it was set in, so every tab starts on all items.
        setFilter('all')
      }}>
        <Tabs.Panel id="tab-modules" renderTitle="Modules" isSelected={tab === 0} padding="general.spaceMd 0 0 0">
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
            {filterRow}
            {bulkBar('Bulk actions')}
          {moduleRows.length > 0 ? reviewTable(moduleRows, 'Learning objects in modules', 'Modules') : <Text as="p">No items in modules match this filter.</Text>}
          </div>
        </Tabs.Panel>
        <Tabs.Panel id="tab-objects" renderTitle="Learning objects" isSelected={tab === 1} padding="general.spaceMd 0 0 0">
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
            {filterRow}
            {bulkBar('Bulk actions')}
          {/* This tab lists what you chose on the previous page that is copied without a module. */}
          {standaloneRows.length > 0 ? (
            reviewTable(standaloneRows, 'Learning objects copied on their own', 'Learning objects')
          ) : (
            <div
              style={card ? { background: t.containerColor, borderRadius: t.radiusCardMd, boxShadow: t.shadowResting, padding: t.space.lg } : undefined}
            >
              <div style={{ marginBottom: t.space.sm }}>
                <Text weight="bold" size="large">Learning objects</Text>
              </div>
              <Text as="p" color="secondary">
                {rows.some((r) => !r.courseWide && !inModule.has(itemIdOf(r)))
                  ? 'No items here match this filter.'
                  : 'No learning objects are copied on their own. Select items outside modules on the previous page, like a quiz or a file, and they are reviewed here.'}
              </Text>
            </div>
          )}
          </div>
        </Tabs.Panel>
        <Tabs.Panel id="tab-course" renderTitle="General items" isSelected={tab === 2} padding="general.spaceMd 0 0 0">
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
            {filterRow}
            {bulkBar('Bulk actions')}
          {wholeRows.length > 0 ? reviewTable(wholeRows, 'Issues that affect the whole course', 'General items') : <Text as="p">No items match this filter.</Text>}
          </div>
        </Tabs.Panel>
      </Tabs>
      </>)}
      {/* The course as it will look after the copy, with the choice made for each item. */}
      <CoursePreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} source={{ moduleIds, keepCurrent: merging, hidden: hiddenModules(dupes), scope, picked }} noteFor={previewNote} />
      <AdminHelpModal open={helpOpen} items={(rows.filter((r) => r.hasSuggestion && !done(r)).length ? rows.filter((r) => r.hasSuggestion && !done(r)) : rows.filter((r) => r.hasSuggestion)).map((r) => ({ title: r.title, detail: r.findings.map((f) => f.detail).join(' ') || r.note?.text || '' }))} onClose={() => setHelpOpen(false)} onSend={() => setMessageSent(true)} />
    </div>
  )
}

