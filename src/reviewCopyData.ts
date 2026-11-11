import { DESIGN_RULES, DIMENSIONS } from './designCheckData'
import type { DesignRule, Dimension } from './designCheckData'
import { CONTENT_TYPES } from './courseContentData'
import { RULE_LABEL, choiceOf } from './reviewData'
import type { Choice, ReviewRow } from './reviewData'
import { DATE_ITEMS, NO_DATE_ITEMS, all, rowInfo, fmtShort } from './fixDatesData'
import type { Included } from './fixDatesData'
import type { FixDatesState } from './fixDatesData'
import type { EducatorComment, TodoItem } from './rolloverData'

// Sample logic for the "Review and copy" step. Everything here is made up.
// The readiness check goes through the criteria of the account and looks at what was decided in the learning object
// review. The to-do list gathers what is left for the teacher to do by hand.

// pass: nothing found. fixed: left out, or set in another step. later: on the to-do list. open: copied as it is.
export type ReadyStatus = 'pass' | 'fixed' | 'later' | 'open'

export type ReadyRule = { rule: DesignRule; status: ReadyStatus; note: string }

export const STATUS_LABEL: Record<ReadyStatus, string> = {
  pass: 'Ready',
  fixed: 'Handled',
  later: 'On your to-do list',
  open: 'Copied as it is',
}

// How each rule stands with the choices made so far.
export function readiness(rows: ReviewRow[], choices: Record<string, Choice>): ReadyRule[] {
  const out: ReadyRule[] = []
  for (const rule of DESIGN_RULES) {
    if (rule.handled) {
      out.push({ rule, status: 'fixed', note: rule.handled })
      continue
    }
    const hit = rows.filter((r) => r.findings.some((f) => f.rule.id === rule.id))
    if (hit.length === 0) {
      out.push({ rule, status: 'pass', note: 'Nothing to change.' })
      continue
    }
    const kept = hit.filter((r) => choiceOf(r, choices) !== 'leave')
    const onList = kept.filter((r) => choiceOf(r, choices) === 'fix')
    const name = (list: ReviewRow[]) => (list.length === 1 ? list[0].title : `${list.length} items`)
    if (kept.length === 0) out.push({ rule, status: 'fixed', note: `${name(hit)} left out of the copy.` })
    else if (onList.length > 0) out.push({ rule, status: 'later', note: `${onList.map((r) => r.title).join(', ')} on your to-do list.` })
    else out.push({ rule, status: 'open', note: `${name(kept.filter((r) => !onList.includes(r)))} copied as it is.` })
  }
  return out
}

export const dimensionsOf = (list: ReadyRule[]) =>
  DIMENSIONS.map((d: Dimension) => ({ dimension: d, rules: list.filter((x) => x.rule.dimension === d) })).filter((d) => d.rules.length > 0)

// ---- The to-do list ----

export const TODO_GROUPS = [
  'Fix after the copy',
  'Do it yourself',
  'Set the dates',
  'Check after the copy',
] as const

// When students see the course.
// `date` is YYYY-MM-DD and `time` is HH:MM in the viewer's own time zone, the day and time the course publishes.
export type Opening = { mode: 'open' | 'self'; hold: boolean; date: string; time: string }
export const INITIAL_OPENING: Opening = { mode: 'open', hold: true, date: '2027-01-19', time: '08:00' }
// The publish day and time as text, like "Tue, Jan 19 at 8:00 AM".
export function openingLabel(o: Opening): string {
  const [y, m, d] = o.date.split('-').map(Number)
  const [h, min] = o.time.split(':').map(Number)
  const day = new Date(y, m - 1, d, h, min)
  if (Number.isNaN(day.getTime())) return 'the chosen date'
  return `${day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${day.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

export function buildTodo(args: {
  rows: ReviewRow[]
  choices: Record<string, Choice>
  dates: FixDatesState
  comments: EducatorComment[]
  opening: Opening
  // The learning objects that are copied. Date entries are only for those.
  included?: Included
}): TodoItem[] {
  const { rows, choices, dates, comments, opening, included = all } = args
  const dated = DATE_ITEMS.filter((i) => included(i.itemId))
  const undated = NO_DATE_ITEMS.filter((i) => included(i.itemId))
  const todo: TodoItem[] = []

  // Every item the educator chose to add to the to-do list is one entry, so the list grows with each choice.
  // The title is the finding. The details say where to find it: the item, and the module it is in. An item can appear
  // more than once when it has more than one finding.
  const moduleNames = CONTENT_TYPES.find((c) => c.id === 'modules')!.items.map((m) => m.label)
  for (const r of rows) {
    if (choiceOf(r, choices) !== 'fix') continue
    const where = r.courseWide ? 'Whole course' : `${r.title} (${r.kindLabel})${moduleNames.includes(r.group) ? `, in ${r.group}` : ''}`
    // One entry for each finding of the item. The summary and the side panel list the item once, with its findings under it.
    for (const f of r.findings.length ? r.findings : [undefined]) {
      todo.push({ group: 'Fix after the copy', title: f ? f.detail : r.note?.text ?? 'Added to the to-do list.', detail: where, content: where, tag: f ? RULE_LABEL[f.rule.id] ?? f.rule.title : 'Team note', tone: f?.rule.severity === 'critical' ? 'error' : 'warning' })
    }
  }

  // Comments about parts of the course the review does not list, like the gradebook.
  for (const c of comments.filter((c) => c.area === 'Gradebook')) {
    todo.push({ group: 'Do it yourself', title: c.text, detail: `${c.item} (${c.area})`, content: `${c.item} (${c.area})`, tag: c.area, tone: 'info' })
  }

  if (dates.mode === 'clear') {
    todo.push({ group: 'Set the dates', tag: 'No dates', tone: 'info', title: 'Set the dates of all items', detail: `${dated.length} items are copied with no date. They are listed on the course Settings page.` })
  } else {
    for (const item of dated) {
      const info = rowInfo(item, dates)
      if (info.finalClosed) todo.push({ group: 'Set the dates', tag: 'Non-teaching day', tone: 'warning', title: `Still on ${fmtShort(info.final ?? info.base)}. Choose a new date.`, detail: `${item.title} (${item.kind}), in ${item.module}`, content: `${item.title} (${item.kind}), in ${item.module}` })
    }
    // Items with no due date that were left empty are for the teacher to date later.
    for (const item of undated) {
      if ((dates.noDate[item.id] ?? 'empty') === 'empty') todo.push({ group: 'Set the dates', tag: 'No due date', tone: 'info', title: 'Set one when you are ready.', detail: `${item.title} (${item.kind}), in ${item.module}`, content: `${item.title} (${item.kind}), in ${item.module}` })
    }
  }

  if (opening.mode === 'self') {
    todo.push({ group: 'Check after the copy', tag: 'Publish', tone: 'neutral', title: 'Publish the course', detail: 'You chose to publish it manually. The course stays unpublished until you do.' })
  }
  todo.push(
    { group: 'Check after the copy', tag: 'Check', tone: 'neutral', title: 'Quiz settings, gradebook and publish state', detail: 'Copying does not publish anything. Check them before students arrive.' },
    { group: 'Check after the copy', tag: 'Check', tone: 'neutral', title: 'Enrollments and groups', detail: 'Canvas never copies people. Add them to the new course.' },
    { group: 'Check after the copy', tag: 'Check', tone: 'neutral', title: 'Feature options', detail: 'Turn them on again in Settings.' },
  )
  return todo
}

// Download the to-do list as a file the teacher keeps.
export function exportTodo(todo: TodoItem[], course: string) {
  const rows = [['Group', 'To do', 'Details'], ...todo.map((t) => [t.group, t.title, t.detail])]
  const csv = rows.map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `to-do-after-copying-${course.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// The pill of a to-do entry. An entry without its own tag (one from an older copy) gets one from its group.
const GROUP_TAG: Record<string, { tag: string; tone: NonNullable<TodoItem['tone']> }> = {
  'Fix after the copy': { tag: 'To fix', tone: 'warning' },
  'Do it yourself': { tag: 'To do', tone: 'info' },
  'Set the dates': { tag: 'Date', tone: 'info' },
  'Check after the copy': { tag: 'Check', tone: 'neutral' },
}
export const tagOf = (x: TodoItem): { tag: string; tone: NonNullable<TodoItem['tone']> } | null =>
  x.tag ? { tag: x.tag, tone: x.tone ?? 'neutral' } : GROUP_TAG[x.group] ?? null

// The entries of one group, with the ones about the same part of the course together. An item with two problems is listed
// once, with both problems under it. Entries with no content stay on their own.
export function groupTodo(items: TodoItem[]): { content?: string; entries: TodoItem[] }[] {
  const out: { content?: string; entries: TodoItem[] }[] = []
  for (const x of items) {
    const same = x.content ? out.find((g) => g.content === x.content) : undefined
    if (same) same.entries.push(x)
    else out.push({ content: x.content, entries: [x] })
  }
  return out
}

// A copy that failed for one item: the reason is the text, and the fix is in the details.
export const failedTodo = (f: { item: string; reason: string; fix: string }): TodoItem => ({
  group: 'Fix after the copy', tag: 'Copy failed', tone: 'error', title: f.reason, detail: f.fix, content: f.item,
})
