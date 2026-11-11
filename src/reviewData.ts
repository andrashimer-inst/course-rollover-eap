import { CONTENT_TYPES, CURRENT_MODULES, MODULE_ENTRIES } from './courseContentData'
import type { TypeId } from './courseContentData'
import { DESIGN_RULES } from './designCheckData'
import type { DesignRule } from './designCheckData'
import { withPulledIn } from './contentHelpers'
import type { Picked, Scope } from './contentHelpers'
import type { EducatorComment } from './rolloverData'

// Sample data for the "Learning object review" step. Everything here is made up.
// Each learning object that is copied is checked against the readiness criteria of the account and against the comments
// the teaching team left. Where something is found, the row says what and why, and the educator chooses what to do.

// bring: include it in the copy. fix: include it and put it on my to-do list. leave: leave it out of the copy.
export type Choice = 'bring' | 'fix' | 'leave'

export const CHOICE_LABEL: Record<Choice, string> = {
  bring: 'Include in copy',
  fix: 'Add to my to-do list',
  leave: 'Leave out of copy',
}
// The order of the dropdowns and of the bulk actions.
export const CHOICES: Choice[] = ['leave', 'fix', 'bring']

// What each choice is called on a row, when the usual wording does not fit.
export type ChoiceLabels = Partial<Record<Choice, string>>

export type Finding = { rule: DesignRule; detail: string }

export type ReviewRow = {
  id: string
  // An item with several findings has one row for each. The first row keeps the item's own id, the others add a number.
  itemId?: string
  extra?: boolean
  siblings?: string[]
  title: string
  kindLabel: string
  typeId: TypeId | 'course'
  group: string
  // Issues that touch the whole course, not one learning object. They are always listed.
  courseWide?: boolean
  // Choices that make sense for this row, and their wording. All three when not set.
  options?: Choice[]
  labels?: ChoiceLabels
  findings: Finding[]
  note?: EducatorComment
  // Rows with nothing found are done from the start and bring the item.
  hasSuggestion: boolean
}

const KIND_LABEL: Record<TypeId, string> = {
  settings: 'Settings',
  syllabus: 'Syllabus',
  modules: 'Module',
  assignments: 'Assignment',
  quizzes: 'Quiz',
  banks: 'Question bank',
  discussions: 'Discussion',
  pages: 'Page',
  announcements: 'Announcement',
  rubrics: 'Rubric',
  outcomes: 'Outcome',
  files: 'File',
  events: 'Calendar event',
}

// Where the check found something, by item id. The detail is why this item was flagged.
const HITS: Record<string, { rule: string; detail: string }[]> = {
  'assignments:5': [{ rule: 'assignments', detail: 'This assignment is still a draft, so students cannot see it.' }],
  'assignments:4': [
    { rule: 'assignments', detail: 'This assignment is still a draft, so students cannot see it.' },
    { rule: 'unused', detail: 'Only 2 students submitted it last term.' },
  ],
  'assignments:2': [
    { rule: 'a11y-medium', detail: 'The description uses light grey text on a white background.' },
    { rule: 'assignments', detail: 'This assignment is still a draft, so students cannot see it.' },
  ],
  'quizzes:2': [{ rule: 'classic-quizzes', detail: 'This quiz is unpublished.' }],
  'quizzes:3': [{ rule: 'unused', detail: 'This quiz was never published last term, so no student took it.' }],
  'discussions:2': [
    { rule: 'discussions', detail: 'This discussion is unpublished.' },
    { rule: 'a11y-medium', detail: 'The prompt uses light grey text that is hard to read.' },
  ],
  'discussions:3': [{ rule: 'unused', detail: 'No student posted in this discussion last term.' }],
  'pages:1': [
    { rule: 'pages', detail: 'This page is a draft, so students cannot open it.' },
    { rule: 'a11y-high', detail: '3 images on this page have no alt text.' },
  ],
  'pages:2': [{ rule: 'a11y-high', detail: '2 images on this page have no alt text.' }],
  'pages:4': [{ rule: 'a11y-high', detail: '4 images on this page have no alt text.' }],
  'announcements:1': [{ rule: 'announcements', detail: 'This announcement is a draft, so students will not see it.' }],
  'announcements:2': [
    { rule: 'unused', detail: 'This announcement is about a guest talk from last term, and no student opened it.' },
    { rule: 'announcements', detail: 'This announcement is a draft, so students will not see it.' },
  ],
  'announcements:3': [{ rule: 'unused', detail: 'It reminds students of a quiz date from last term, and no student opened it.' }],
  'announcements:4': [{ rule: 'unused', detail: 'The new office hours are already on the welcome page, and no student opened this notice.' }],
  'files:3': [{ rule: 'unused', detail: 'No student opened this file last term.' }],
  'files:5': [
    { rule: 'unused', detail: 'This 2023 file is in an old format, and no student opened it last term.' },
    { rule: 'a11y-high', detail: '5 images in these slides have no alt text.' },
  ],
  'files:6': [{ rule: 'a11y-high', detail: '6 images in these slides have no alt text.' }],
  'files:7': [{ rule: 'a11y-critical', detail: 'This 4 minute video has no captions or transcript.' }],
  'rubrics:2': [{ rule: 'rubrics', detail: 'This rubric is not attached to any assignment.' }],
  'events:2': [{ rule: 'unused', detail: 'The date is from last term and no student opened the event.' }],
  syllabus: [
    { rule: 'syllabus', detail: 'The syllabus has 38 words. Your account asks for at least 150.' },
    { rule: 'a11y-medium', detail: 'Two sections use light grey text that is hard to read.' },
  ],
}

const rule = (id: string) => DESIGN_RULES.find((r) => r.id === id)!

const sameItem = (comment: string, title: string) => comment === title || comment.endsWith(` ${title}`)

// The rows that are copied, in the order of the course. Items in a module sit under that module.
export function buildRows(scope: Scope, picked: Picked, comments: EducatorComment[]): ReviewRow[] {
  const eff = withPulledIn(picked)
  const moduleOf: Record<string, string> = {}
  const modules = CONTENT_TYPES.find((c) => c.id === 'modules')!.items
  for (const m of modules) for (const e of MODULE_ENTRIES[m.id] ?? []) moduleOf[e.itemId] ??= m.label

  const rows: ReviewRow[] = []
  for (const type of CONTENT_TYPES) {
    // Modules are not reviewed one by one: only a module with a finding gets a row, at the top of its own group.
    const items = type.id === 'modules' ? type.items.filter((m) => HITS[m.id]) : type.items.length ? type.items : [{ id: type.id, label: type.label }]
    for (const item of items) {
      if (scope === 'part' && !eff[item.id]) continue
      const all = (HITS[item.id] ?? []).map((h) => ({ rule: rule(h.rule), detail: h.detail }))
      const note = comments.find((c) => sameItem(c.item, item.label))
      // An item with several findings gets a row for each, so every finding has its own choice. The item is listed again for each one.
      const parts = all.length > 1 ? all.map((f) => [f]) : [all]
      const ids = parts.map((_, n) => (n === 0 ? item.id : `${item.id}#${n + 1}`))
      parts.forEach((findings, n) => {
        const rowNote = n === 0 ? note : undefined
        rows.push({
          id: ids[n],
          itemId: item.id,
          extra: n > 0,
          siblings: ids,
          title: item.label,
          kindLabel: KIND_LABEL[type.id],
          typeId: type.id,
          group: type.id === 'modules' ? item.label : moduleOf[item.id] ?? (type.id === 'settings' || type.id === 'syllabus' ? 'Course' : type.label),
          findings,
          note: rowNote,
          hasSuggestion: findings.length > 0 || !!rowNote,
        })
      })
    }
  }
  rows.push(...COURSE_ROWS.map((c) => courseRow(c)))
  // Group order: the whole course first, then modules in course order, then the rest in the order they were found.
  const order = ['Whole course', ...modules.map((m) => m.label), 'Course']
  const rank = (g: string) => (order.includes(g) ? order.indexOf(g) : order.length)
  return rows
    .map((r, i) => ({ r, i }))
    .sort((a, b) => rank(a.r.group) - rank(b.r.group) || a.i - b.i)
    .map((x) => x.r)
}

// Issues that affect the whole course. Each one is a row with a choice, like a learning object.
const COURSE_ROWS: { id: string; title: string; rule: string; detail: string }[] = [
  { id: 'course:menu', title: 'Course menu', rule: 'navigation', detail: 'The course menu shows 19 items. Students use about nine of them.' },
  { id: 'course:links', title: 'Broken links', rule: 'links', detail: '6 links between items point to the previous course and show an error: Assignment 1, the reading list page, the submission guide page (2 links), the case study page and the welcome announcement.' },
  { id: 'course:missing-links', title: 'Missing links', rule: 'missing-links', detail: '3 links open external tools (Panopto video, Lucid whiteboard and Turnitin) that Canvas cannot connect during the copy. They need to be linked again after the copy.' },
  { id: 'course:alt', title: 'Images without alt text', rule: 'a11y-high', detail: '14 images on 6 pages have no alt text.' },
  { id: 'course:contrast', title: 'Text that is hard to read', rule: 'a11y-medium', detail: '8 pages use text colors that are hard to read on the page background.' },
  { id: 'course:scan', title: 'Accessibility scan', rule: 'a11y-scan', detail: 'This course was never scanned with the Course Content Accessibility Checker.' },
]

function courseRow(c: (typeof COURSE_ROWS)[number]): ReviewRow {
  return {
    id: c.id,
    title: c.title,
    kindLabel: 'Whole course',
    typeId: 'course',
    group: 'Whole course',
    courseWide: true,
    findings: [{ rule: rule(c.rule), detail: c.detail }],
    hasSuggestion: true,
  }
}

export const choiceLabel = (row: ReviewRow, c: Choice) => row.labels?.[c] ?? CHOICE_LABEL[c]

// Leaving out is for the whole item: if any row of the item is left out, all its rows are.
export const choiceOf = (row: ReviewRow, choices: Record<string, Choice>): Choice | undefined =>
  row.siblings?.some((id) => choices[id] === 'leave') ? 'leave' : choices[row.id] ?? (row.hasSuggestion ? undefined : 'bring')

// The id of the learning object a row is about. Rows of one item share it.
export const itemIdOf = (row: ReviewRow) => row.itemId ?? row.id

// ---- Modules that exist in both courses --------------------------------------------------------------
// Merging brings modules next to the ones already in the course. These pairs look like the same module twice.
export type DupeChoice = 'both' | 'current' | 'new'
export type DupePair = { id: string; current: string; incoming: string; why: string }

export const DUPE_LABEL: Record<DupeChoice, string> = {
  both: 'Keep both',
  current: 'Keep the current one',
  new: 'Keep the new one',
}

export const DUPES: DupePair[] = [
  {
    id: 'week2',
    current: 'current:2',
    incoming: 'modules:3',
    why: 'Both courses have a module named “Week 2: Project proposal”.',
  },
  {
    id: 'welcome',
    current: 'current:1',
    incoming: 'modules:1',
    why: '“Getting started” and “Welcome to the course” both open the course with a welcome page and tools.',
  },
]

// The modules to leave out of the preview, from the choices made on the pairs.
export function hiddenModules(dupes: Record<string, DupeChoice>): Set<string> {
  const hide = new Set<string>()
  for (const d of DUPES) {
    if (dupes[d.id] === 'current') hide.add(d.incoming)
    if (dupes[d.id] === 'new') hide.add(d.current)
  }
  return hide
}

export const CURRENT_LABEL = (id: string) => CURRENT_MODULES.find((m) => m.id === id)?.label ?? ''

// What the pill says for each rule: the problem in a few words, not how serious it is.
export const RULE_LABEL: Record<string, string> = {
  announcements: 'Not published',
  assignments: 'Not published',
  'classic-quizzes': 'Not published',
  'new-quizzes': 'Not published',
  discussions: 'Not published',
  pages: 'Not published',
  modules: 'Not published',
  syllabus: 'Syllabus too short',
  unused: 'Unused last term',
  links: 'Broken link',
  'missing-links': 'Needs relinking',
  navigation: 'Crowded menu',
  rubrics: 'Rubric not attached',
  'a11y-scan': 'Not scanned',
  'a11y-critical': 'Missing captions',
  'a11y-high': 'Missing alt text',
  'a11y-medium': 'Hard to read',
}

// The same for what the teaching team wrote, by comment id.
export const NOTE_LABEL: Record<string, string> = {
  c1: 'Outdated rubric',
  c2: 'Wrong answer key',
  c3: 'Outdated mention',
  c4: 'Never opened last term',
  c5: 'Replaced by a newer file',
  c6: 'Worked well last term',
}
