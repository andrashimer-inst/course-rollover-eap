import { FAILED_ITEMS } from './rolloverData'
import type { CopySummary, HistoryEvent } from './rolloverData'
import { buildRows, choiceOf } from './reviewData'
import type { Choice } from './reviewData'
import { INITIAL_OPENING, buildTodo, failedTodo, openingLabel } from './reviewCopyData'
import { buildHistory } from './copyHistory'
import { DATE_ITEMS, INITIAL_DATES } from './fixDatesData'

// Earlier imports of the course, for the Content imports table. Everything here is made up.
// `published`: the course was already open to students after the copy, and Canvas cannot undo a copy then.

export type ImportRow = {
  id: string
  type: string
  source: string
  date: string
  status: 'Completed' | 'Failed' | 'Undone'
  published: boolean
  summary?: CopySummary
}

// An earlier copy has the same long lists as a copy made just now: the copy history, the to-do list and what was not
// copied are built from the same review rows and the same choices, so they look like the real thing.
function summaryOf(course: string, when: string, created: number, published: boolean, choices: Record<string, Choice>): CopySummary {
  const rows = buildRows('whole', {}, [])
  const opens = published ? `The course was published on ${when}.` : openingLabel(INITIAL_OPENING)
  const left = rows.filter((r) => !r.extra && !r.courseWide && choiceOf(r, choices) === 'leave')
  const stamp = (e: HistoryEvent) => ({ ...e, when })
  return {
    course,
    target: 'Cell Biology',
    when,
    opens: published ? opens : `The course publishes on ${opens}.`,
    stats: { created, relinked: 3, sentToAdmin: 1, datesPlaced: DATE_ITEMS.length },
    came: [],
    failed: FAILED_ITEMS.map(({ item, reason, fix }) => ({ item, reason, fix })),
    notCame: [
      ...left.map((r) => ({ item: r.title, reason: 'you chose to leave it out of the copy', kind: 'left-out' as const })),
      { item: 'Student submissions and grades', reason: 'Canvas never copies these.', kind: 'canvas' as const },
      { item: 'Enrollments and groups', reason: 'Add people to the new course.', kind: 'canvas' as const },
      { item: 'Feature options', reason: 'Turn them on again in Settings.', kind: 'canvas' as const },
    ],
    todo: [
      ...FAILED_ITEMS.map(failedTodo),
      ...buildTodo({ rows, choices, dates: INITIAL_DATES, comments: [], opening: INITIAL_OPENING }),
    ],
    history: buildHistory({ rows, choices, opens: published ? when : openingLabel(INITIAL_OPENING) }).map(stamp),
    datesShifted: DATE_ITEMS.length,
    datesEdited: 0,
  }
}

export const PREVIOUS_IMPORTS: ImportRow[] = [
  // The newest earlier copy: the course has not opened to students yet, so it can still be undone.
  { id: 'i1', type: 'Course Copy', source: 'Design Portfolio', date: 'Sep 30 at 4:58am', status: 'Completed', published: false, summary: summaryOf('Design Portfolio', 'Sep 30 at 4:58am', 33, false, { 'assignments:4': 'leave', 'pages:1': 'fix', 'pages:1#2': 'fix', syllabus: 'fix', 'syllabus#2': 'fix', 'files:7': 'fix' }) },
  { id: 'i2', type: 'Canvas Course Export Package', source: 'biology-101-export.imscc', date: 'Sep 12 at 9:14am', status: 'Completed', published: true },
  { id: 'i3', type: 'Course Copy', source: 'Intro to Design', date: 'Aug 14 at 2:31pm', status: 'Completed', published: true, summary: summaryOf('Intro to Design', 'Aug 14 at 2:31pm', 28, true, { 'quizzes:3': 'leave', 'files:5': 'leave', 'announcements:2': 'leave', 'files:7': 'fix', 'pages:4': 'fix', 'pages:4#2': 'fix' }) },
  { id: 'i4', type: 'Zip file', source: 'week-3-materials.zip', date: 'Aug 2 at 11:06am', status: 'Completed', published: true },
  { id: 'i5', type: 'QTI .zip file', source: 'quiz-bank-2025.zip', date: 'Jul 21 at 10:40am', status: 'Failed', published: false },
]

export const newImport = (summary: CopySummary): ImportRow => ({
  id: `new-${summary.when}-${summary.course}`,
  type: 'Course Copy',
  source: summary.course,
  date: 'Just now',
  status: 'Completed',
  // A copy made just now has not opened to students yet, so it can still be undone.
  published: false,
  summary,
})

export const UNDO_BLOCKED = 'The course is published, so this copy cannot be undone.'
