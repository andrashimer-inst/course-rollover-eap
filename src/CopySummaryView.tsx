import { useState } from 'react'
import { Button, IconEmailLine, IconExportLine, IconSearchLine, Link, Metric, ScreenReaderContent, SimpleSelect, Table, Tabs, Text, TextInput } from '@instructure/ui/v11_7'
import AdminHelpModal from './AdminHelpModal'
import AutoSelect from './AutoSelect'
import Pager from './Pager'
import FigmaAlert from './FigmaAlert'
import StatusPill from './StatusPill'
import { PEOPLE } from './copyHistory'
import { TODO_GROUPS, exportTodo, failedTodo, groupTodo, tagOf } from './reviewCopyData'
import type { CopySummary, HistoryEvent } from './rolloverData'
import { useAppThemeKey, useSurfaceTokens } from './appTheme'

// The summary after the copy: how it went (items created, dates placed, what was not copied), what the teacher can
// still do (bring an item now, undo the whole copy), the copy history and the to-do list to keep.

const noFill = { background: 'transparent' }

const TAG_COLOR: Record<HistoryEvent['tag'], 'neutral' | 'info' | 'success' | 'ai'> = {
  Session: 'neutral',
  Created: 'success',
  Decision: 'info',
  Automatic: 'neutral',
}

// The history can be filtered by the kind of entry or by the person who did it.
const TYPE_FILTERS = [['all', 'All types'], ['Decision', 'Decisions'], ['Created', 'Created'], ['Automatic', 'Automatic'], ['Session', 'Session']] as const
const PERSON_FILTERS = [['all', 'All users'], ...PEOPLE.map((p) => [p, p] as const)] as const

function exportHistory(list: HistoryEvent[], course: string) {
  const rows = [['Date and time', 'Type', 'Activity', 'User'], ...list.map((h) => [h.when, h.tag, h.text, h.who])]
  const csv = rows.map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `copy-history-${course.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function SummaryView({
  summary, undone: wasUndone = false,
}: {
  summary: CopySummary
  undone?: boolean
}) {
  const t = useSurfaceTokens()
  const card = useAppThemeKey() !== 'legacy'
  const cardStyle = card
    ? { background: t.containerColor, borderRadius: t.radiusCardMd, boxShadow: t.shadowResting, padding: t.space.lg }
    : { borderTop: `${t.borderWidth} solid ${t.borderColor}`, paddingTop: t.space.lg }

  // Bringing an item now is shown here: the item leaves the list and counts as created.
  const [brought, setBrought] = useState<string[]>([])
  const undone = wasUndone
  // The history is filtered by the type of entry and by the person, separately.
  const [typeFilter, setTypeFilter] = useState('all')
  const [personFilter, setPersonFilter] = useState('all')
  const [tab, setTab] = useState(0)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  // The to-do list sent to the educator by message, in the same window as the message to the admin in the learning object review.
  const [helpOpen, setHelpOpen] = useState(false)

  // What was not copied. A failure is an error, not a decision, so it has a red pill and is on the to-do list.
  type NotCopied = { item: string; reason: string; kind: 'failed' | 'left-out' | 'canvas' | 'attention'; canBring: boolean }
  const notCopied: NotCopied[] = [
    ...summary.failed.map((f) => ({ item: f.item, reason: f.reason, kind: 'failed' as const, canBring: false })),
    ...summary.notCame.map((n) => ({ item: n.item, reason: n.reason, kind: n.kind, canBring: n.kind === 'left-out' })),
  ].filter((n) => !brought.includes(n.item))
  const NOT_COPIED_PILL: Record<NotCopied['kind'], { label: string; color: 'error' | 'info' | 'neutral' | 'warning' }> = {
    failed: { label: 'Failed', color: 'error' },
    'left-out': { label: 'Left out', color: 'info' },
    canvas: { label: 'Not copied by Canvas', color: 'neutral' },
    attention: { label: 'Needs attention', color: 'warning' },
  }
  // Every failure is on the to-do list, also on copies where the list did not have it yet.
  // The failures are rebuilt from the list of failed items, so one entry never shows twice, whichever way it was saved.
  const todoAll = [
    ...summary.todo.filter((x) => x.tag !== 'Copy failed' && !x.title.startsWith('Copy failed:')),
    ...summary.failed.map(failedTodo),
  ]

  const history = summary.history
    .filter((h) => typeFilter === 'all' || h.tag === typeFilter)
    .filter((h) => personFilter === 'all' || h.who === personFilter)
    .filter((h) => !query.trim() || `${h.when} ${h.tag} ${h.text} ${h.who}`.toLowerCase().includes(query.trim().toLowerCase()))
  // The history shows 20 entries a page. Searching or filtering starts again on the first page.
  const PAGE_SIZE = 20
  const pageCount = Math.max(1, Math.ceil(history.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageRows = history.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const pager = <Pager label="Copy history pages" page={currentPage} pageCount={pageCount} onPage={setPage} />
  const stills = todoAll.length
  const created = summary.stats.created + brought.length


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.xl }}>
      <section aria-labelledby="set-up" style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
        {!undone && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))', gap: t.space.lg }}>
            {[
              [created, 'Items copied'],
              [summary.stats.relinked, 'Tools relinked'],
              [summary.stats.sentToAdmin, 'Sent to admin'],
              [summary.stats.datesPlaced, 'Dates updated'],
              [notCopied.length, 'Not copied'],
              [stills, 'Open to-do items'],
            ].map(([value, label]) => (
              <div
                key={label}
                style={{
                  background: t.containerColor,
                  borderRadius: t.radiusCardMd,
                  boxShadow: card ? t.shadowResting : undefined,
                  border: card ? undefined : `${t.borderWidth} solid ${t.borderColor}`,
                  padding: t.space.lg,
                }}
              >
                <Metric textAlign="start" renderLabel={<Text size="medium">{label}</Text>} renderValue={String(value)} />
              </div>
            ))}
          </div>
        )}
      </section>

      {undone && (
        <FigmaAlert variant="info" type="inline">
          The copy from {summary.course} was removed. You can start the copy again from the beginning.
        </FigmaAlert>
      )}

      {!undone ? (
        <Tabs onRequestTabChange={(_e, { index }) => setTab(index)}>
          <Tabs.Panel id="tab-not-copied" renderTitle={`Not copied (${notCopied.length})`} isSelected={tab === 0} padding="general.spaceXl 0 0 0">
            <section aria-label="Not copied" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
                <Text as="div" weight="bold" size="large">Not copied</Text>
                <Text as="div" color="secondary">
                  {notCopied.length === 0
                    ? 'Everything you chose was copied.'
                    : 'These items were not copied. Items that failed are on your to-do list so you can fix them.'}
                </Text>
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {notCopied.map((n) => (
                  <li key={n.item} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: t.space.md, padding: `${t.space.md} 0`, borderTop: `${t.borderWidth} solid ${t.borderColor}` }}>
                    <span style={{ flex: '1 1 18rem', minWidth: 0 }}>
                      <Text as="div" weight="bold">{n.item}</Text>
                      <Text as="div" color="secondary">{n.reason}</Text>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: t.space.md }}>
                      {n.canBring && (
                        <Link as="button" onClick={() => setBrought([...brought, n.item])}>
                          Copy it now<ScreenReaderContent>: {n.item}</ScreenReaderContent>
                        </Link>
                      )}
                      <StatusPill size="sm" color={NOT_COPIED_PILL[n.kind].color}>{NOT_COPIED_PILL[n.kind].label}</StatusPill>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </Tabs.Panel>
          <Tabs.Panel id="tab-todo" renderTitle={`To-do list (${todoAll.length})`} isSelected={tab === 1} padding="general.spaceXl 0 0 0">
            <section aria-label="To-do list" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.md, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
                  <Text as="div" weight="bold" size="large">To-do list</Text>
                  <Text as="div" color="secondary">Actions that still need your attention after the copy. Export the list to keep it.</Text>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.sm }}>
                  {/* In the real product this adds the items to the Canvas calendar. Nothing happens in the prototype. */}
                  <Button>Add to calendar</Button>
                  <Button renderIcon={<IconEmailLine />} onClick={() => setHelpOpen(true)}>Email the list</Button>
                  <Button renderIcon={<IconExportLine />} onClick={() => exportTodo(todoAll, summary.course)}>
                    Export to-do list
                  </Button>
                </div>
              </div>
              <Table caption={() => 'To-do list after the copy'} themeOverride={noFill}>
                <Table.Head themeOverride={noFill}>
                  <Table.Row themeOverride={noFill}>
                    <Table.ColHeader themeOverride={noFill} id="todo-content" width="30%">Learning object</Table.ColHeader>
                    <Table.ColHeader themeOverride={noFill} id="todo-item" width="40%">To do</Table.ColHeader>
                    <Table.ColHeader themeOverride={noFill} id="todo-detail">Details</Table.ColHeader>
                  </Table.Row>
                </Table.Head>
                <Table.Body themeOverride={noFill}>
                  {TODO_GROUPS.flatMap((g) => {
                    const items = todoAll.filter((x) => x.group === g)
                    if (items.length === 0) return []
                    return [
                      <Table.Row themeOverride={noFill} key={`g-${g}`}>
                        <Table.Cell themeOverride={noFill}><Text weight="bold">{g} ({items.length})</Text></Table.Cell>
                        <Table.Cell themeOverride={noFill} />
                        <Table.Cell themeOverride={noFill} />
                      </Table.Row>,
                      // An item with more than one problem is one row: its name once, and each problem under "To do".
                      ...groupTodo(items).map((grp, i) => (
                        <Table.Row themeOverride={noFill} key={`${g}-${i}`}>
                          <Table.Cell themeOverride={noFill}>
                            {/* A link to the item in the course. It does not go anywhere in the prototype. */}
                            {grp.content ? (
                              // The item and the module it is in are two links: "Energy essay (Assignment), in Module 4: Energy".
                              grp.content.split(', in ').map((part, n) => (
                                <span key={part}>
                                  {n > 0 && ', in '}
                                  <Link as="button" onClick={() => {}}>{part}</Link>
                                </span>
                              ))
                            ) : (
                              <Text color="secondary">None</Text>
                            )}
                          </Table.Cell>
                          <Table.Cell themeOverride={noFill}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.md }}>
                              {grp.entries.map((x, n) => (
                                <div key={n}>
                                  {/* The pill says what kind of thing it is, the same pills as in the review. */}
                                  {tagOf(x) && <div style={{ marginBottom: t.space.xs }}><StatusPill size="sm" color={tagOf(x)!.tone}>{tagOf(x)!.tag}</StatusPill></div>}
                                  {x.title}
                                  {grp.entries.length > 1 && x.detail !== x.content && <Text as="div" size="small" color="secondary">{x.detail}</Text>}
                                </div>
                              ))}
                            </div>
                          </Table.Cell>
                          {/* The location is already in the first column, so details only show when it says something else, like how to fix a failed item. */}
                          <Table.Cell themeOverride={noFill}>{grp.entries.length === 1 && grp.entries[0].detail !== grp.content ? grp.entries[0].detail : ''}</Table.Cell>
                        </Table.Row>
                      )),
                    ]
                  })}
                </Table.Body>
              </Table>
            </section>
          </Tabs.Panel>
          <Tabs.Panel id="tab-history" renderTitle={`Copy history (${summary.history.length})`} isSelected={tab === 2} padding="general.spaceXl 0 0 0">
      <section aria-labelledby="history" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
          <Text as="div" weight="bold" size="large" id="history">Copy history</Text>
          <Text as="div" color="secondary">A record of this copy. Visible to everyone on the course and your admin.</Text>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.md, alignItems: 'flex-end' }}>
          <div style={{ width: '20rem', maxWidth: '100%' }}>
            <TextInput
              renderLabel={<Text weight="bold">Search history</Text>}
              placeholder="Activity, type or user"
              renderBeforeInput={<IconSearchLine />}
              value={query}
              onChange={(_e, value) => { setQuery(value); setPage(1) }}
            />
          </div>
          <div style={{ width: '12rem', maxWidth: '100%' }}>
            <SimpleSelect
              renderLabel={<Text weight="bold">Type</Text>}
              value={typeFilter}
              onChange={(_e, { value }) => { setTypeFilter(String(value)); setPage(1) }}
            >
              {TYPE_FILTERS.map(([id, label]) => (
                <SimpleSelect.Option key={id} id={`history-type-${id}`} value={id}>{label}</SimpleSelect.Option>
              ))}
            </SimpleSelect>
          </div>
          <div style={{ width: '14rem', maxWidth: '100%' }}>
            <AutoSelect
              label="User"
              assistiveText="Type to find a user. Use the up and down arrow keys to choose."
              noMatch="No user matches"
              options={PERSON_FILTERS.map(([id, label]) => ({ id, label }))}
              value={personFilter}
              onChange={(id) => { setPersonFilter(id); setPage(1) }}
            />
          </div>
          <div style={{ marginInlineStart: 'auto' }}>
            <Button renderIcon={<IconExportLine />} onClick={() => exportHistory(history, summary.course)}>
              Export history
            </Button>
          </div>
        </div>
        <Table caption={() => 'Copy history'} themeOverride={noFill}>
          <Table.Head themeOverride={noFill}>
            <Table.Row themeOverride={noFill}>
              <Table.ColHeader themeOverride={noFill} id="h-when" width="20%">Date and time</Table.ColHeader>
              <Table.ColHeader themeOverride={noFill} id="h-type" width="12%">Type</Table.ColHeader>
              <Table.ColHeader themeOverride={noFill} id="h-what">Activity</Table.ColHeader>
              <Table.ColHeader themeOverride={noFill} id="h-who" width="20%">User</Table.ColHeader>
            </Table.Row>
          </Table.Head>
          <Table.Body themeOverride={noFill}>
            {history.length === 0 && (
              <Table.Row themeOverride={noFill}>
                <Table.Cell themeOverride={noFill} colSpan={4}>No history entries match.</Table.Cell>
              </Table.Row>
            )}
            {pageRows.map((h, i) => (
              <Table.Row themeOverride={noFill} key={`${h.when}-${i}`}>
                <Table.Cell themeOverride={noFill}>{h.when}</Table.Cell>
                <Table.Cell themeOverride={noFill}><StatusPill size="xs" color={TAG_COLOR[h.tag]}>{h.tag}</StatusPill></Table.Cell>
                <Table.Cell themeOverride={noFill}>{h.text}</Table.Cell>
                <Table.Cell themeOverride={noFill}>{h.who}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        {pager}
      </section>
          </Tabs.Panel>
        </Tabs>
      ) : (
      <section aria-labelledby="history" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
          <Text as="div" weight="bold" size="large" id="history">Copy history</Text>
          <Text as="div" color="secondary">A record of this copy. Visible to everyone on the course and your admin.</Text>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.md, alignItems: 'flex-end' }}>
          <div style={{ width: '20rem', maxWidth: '100%' }}>
            <TextInput
              renderLabel={<Text weight="bold">Search history</Text>}
              placeholder="Activity, type or user"
              renderBeforeInput={<IconSearchLine />}
              value={query}
              onChange={(_e, value) => { setQuery(value); setPage(1) }}
            />
          </div>
          <div style={{ width: '12rem', maxWidth: '100%' }}>
            <SimpleSelect
              renderLabel={<Text weight="bold">Type</Text>}
              value={typeFilter}
              onChange={(_e, { value }) => { setTypeFilter(String(value)); setPage(1) }}
            >
              {TYPE_FILTERS.map(([id, label]) => (
                <SimpleSelect.Option key={id} id={`history-type-${id}`} value={id}>{label}</SimpleSelect.Option>
              ))}
            </SimpleSelect>
          </div>
          <div style={{ width: '14rem', maxWidth: '100%' }}>
            <AutoSelect
              label="User"
              assistiveText="Type to find a user. Use the up and down arrow keys to choose."
              noMatch="No user matches"
              options={PERSON_FILTERS.map(([id, label]) => ({ id, label }))}
              value={personFilter}
              onChange={(id) => { setPersonFilter(id); setPage(1) }}
            />
          </div>
          <div style={{ marginInlineStart: 'auto' }}>
            <Button renderIcon={<IconExportLine />} onClick={() => exportHistory(history, summary.course)}>
              Export history
            </Button>
          </div>
        </div>
        <Table caption={() => 'Copy history'} themeOverride={noFill}>
          <Table.Head themeOverride={noFill}>
            <Table.Row themeOverride={noFill}>
              <Table.ColHeader themeOverride={noFill} id="h-when" width="20%">Date and time</Table.ColHeader>
              <Table.ColHeader themeOverride={noFill} id="h-type" width="12%">Type</Table.ColHeader>
              <Table.ColHeader themeOverride={noFill} id="h-what">Activity</Table.ColHeader>
              <Table.ColHeader themeOverride={noFill} id="h-who" width="20%">User</Table.ColHeader>
            </Table.Row>
          </Table.Head>
          <Table.Body themeOverride={noFill}>
            {history.length === 0 && (
              <Table.Row themeOverride={noFill}>
                <Table.Cell themeOverride={noFill} colSpan={4}>No history entries match.</Table.Cell>
              </Table.Row>
            )}
            {pageRows.map((h, i) => (
              <Table.Row themeOverride={noFill} key={`${h.when}-${i}`}>
                <Table.Cell themeOverride={noFill}>{h.when}</Table.Cell>
                <Table.Cell themeOverride={noFill}><StatusPill size="xs" color={TAG_COLOR[h.tag]}>{h.tag}</StatusPill></Table.Cell>
                <Table.Cell themeOverride={noFill}>{h.text}</Table.Cell>
                <Table.Cell themeOverride={noFill}>{h.who}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        {pager}
      </section>
      )}

      <AdminHelpModal
        open={helpOpen}
        items={todoAll.map((x) => ({ title: x.title, detail: x.detail }))}
        draft={{ to: 'Me', subject: `To do after copying ${summary.course}`, message: (list) => `Hi,\n\nHere is what is left to do after copying ${summary.course}:\n\n${list}\n\nThank you` }}
        onClose={() => setHelpOpen(false)}
        onSend={() => {}}
      />
    </div>
  )
}
