// Sample data for the copy wizard. Everything here is made up (names, dates, links).
// It follows the customer discovery priorities: review before the copy (educator comments),
// a date check with a preview, a link check, and a report of what was copied.

export type Decision = 'copy' | 'fix-later' | 'leave-out'

export const DECISION_LABEL: Record<Decision, string> = {
  copy: 'Copy as is',
  'fix-later': 'Copy, then fix',
  'leave-out': 'Leave out of the copy',
}

export type EducatorComment = {
  id: string
  area: 'Assignments' | 'Quizzes' | 'Pages' | 'Modules' | 'Files' | 'Discussions' | 'Gradebook'
  item: string
  text: string
  author: string
  term: string
  decision: Decision // the suggested decision, the educator can change it
}

const CODES: Record<string, string> = {
  'Design Portfolio': 'DES 310',
  'Biology 101': 'BIO 101',
  'Intro to Design': 'DES 110',
  'World History': 'HIS 120',
}

// Comments the previous teaching team left on the source course. The suggested decision follows the wording.
export function commentsFor(course: string): EducatorComment[] {
  const c = CODES[course] ?? 'Course'
  return [
    {
      id: 'c1',
      area: 'Assignments',
      item: `${c} Assignment 3: Reflection`,
      text: "The rubric doesn't match the new prompt. Update it before students see it.",
      author: 'Dana R., Instructor',
      term: 'Fall 2025',
      decision: 'fix-later',
    },
    {
      id: 'c2',
      area: 'Quizzes',
      item: `${c} Quiz 2`,
      text: 'Question 6 has the wrong answer key. Two students pointed it out. Check it before reuse.',
      author: 'Sam T., Teaching assistant',
      term: 'Fall 2025',
      decision: 'fix-later',
    },
    {
      id: 'c3',
      area: 'Pages',
      item: 'Week 5 overview',
      text: 'Mentions a guest speaker who is no longer visiting. Replace or remove that part.',
      author: 'Dana R., Instructor',
      term: 'Fall 2025',
      decision: 'fix-later',
    },
    {
      id: 'c4',
      area: 'Modules',
      item: 'Optional readings (archive)',
      text: 'Nobody opened these last term. Safe to leave out.',
      author: 'Priya K., Instructor',
      term: 'Fall 2025',
      decision: 'leave-out',
    },
    {
      id: 'c5',
      area: 'Files',
      item: 'Slides 2023 (old format)',
      text: "Replaced by the 2025 slides. Don't copy these.",
      author: 'Sam T., Teaching assistant',
      term: 'Fall 2025',
      decision: 'leave-out',
    },
    {
      id: 'c6',
      area: 'Discussions',
      item: 'Week 3 discussion',
      text: 'This worked well. Keep the prompt as it is.',
      author: 'Priya K., Instructor',
      term: 'Fall 2025',
      decision: 'copy',
    },
    {
      id: 'c7',
      area: 'Gradebook',
      item: 'Participation grading',
      text: "The weights didn't carry over last time. Check the gradebook after the copy.",
      author: 'Dana R., Instructor',
      term: 'Fall 2025',
      decision: 'fix-later',
    },
  ]
}

// ---- Dates ----------------------------------------------------------------------------------------
export type Deadline = { id: string; title: string; kind: string; old: Date }

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day)

export const OLD_TERM_START = d(2025, 8, 25)
export const NEW_TERM_START = d(2026, 8, 24)
export const NEW_TERM_END = d(2026, 12, 18)
// Days the college is closed in the new term (sample). The date check warns when a deadline lands on one.
export const HOLIDAYS = [d(2026, 9, 7), d(2026, 11, 26), d(2026, 11, 27)]

export const DEADLINES: Deadline[] = [
  { id: 'd1', title: 'Welcome discussion', kind: 'Discussion', old: d(2025, 9, 2) },
  { id: 'd2', title: 'Assignment 1: Reading response', kind: 'Assignment', old: d(2025, 9, 9) },
  { id: 'd3', title: 'Quiz 1', kind: 'Quiz', old: d(2025, 9, 16) },
  { id: 'd4', title: 'Project proposal', kind: 'Assignment', old: d(2025, 10, 7) },
  { id: 'd5', title: 'Midterm exam', kind: 'Quiz', old: d(2025, 10, 21) },
  { id: 'd6', title: 'Peer review', kind: 'Assignment', old: d(2025, 11, 4) },
  { id: 'd7', title: 'Guest lecture', kind: 'Calendar event', old: d(2025, 11, 27) },
  { id: 'd8', title: 'Final project', kind: 'Assignment', old: d(2025, 12, 9) },
  { id: 'd9', title: 'Course evaluation', kind: 'Calendar event', old: d(2025, 12, 13) },
]

export const fmtDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
export const parseDate = (text: string): Date | null => {
  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) || text.trim() === '' ? null : parsed
}
export const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
export const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86_400_000)
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

// What is wrong with a new date, if anything.
export function checkDate(date: Date | null): string | null {
  if (!date) return 'Not a date'
  if (date.getDay() === 0 || date.getDay() === 6) return 'Weekend'
  if (HOLIDAYS.some((h) => sameDay(h, date))) return 'Holiday'
  if (date < NEW_TERM_START || date > NEW_TERM_END) return 'Outside the term'
  return null
}

// ---- Links ----------------------------------------------------------------------------------------
export type LinkAction = 'fix' | 'remove' | 'later'

export type BrokenLink = {
  id: string
  label: string
  where: string
  problem: string
  kind: 'old-course' | 'external' | 'tool' | 'missing'
  suggestion?: string // a replacement Canvas can propose
}

export const LINK_ACTION_LABEL: Record<LinkAction, string> = {
  fix: 'Replace the link',
  remove: 'Remove the link',
  later: 'Leave it, fix later',
}

export const BROKEN_LINKS: BrokenLink[] = [
  { id: 'l1', label: 'Syllabus', where: 'Module 1 overview', problem: 'Points to the old course', kind: 'old-course', suggestion: '/courses/rollover/pages/syllabus' },
  { id: 'l2', label: 'Peer review form', where: 'Assignment 4', problem: 'Points to the old course', kind: 'old-course', suggestion: '/courses/rollover/assignments/peer-review' },
  { id: 'l3', label: 'Reading list', where: 'Week 2 page', problem: 'Page not found (404)', kind: 'external' },
  { id: 'l4', label: 'Lab simulation', where: 'Module 3', problem: 'Tool is not installed in this course', kind: 'tool' },
  { id: 'l5', label: 'Intro lecture video', where: 'Welcome page', problem: 'Recording has expired', kind: 'missing' },
  { id: 'l6', label: 'Data set (CSV)', where: 'Project brief', problem: 'File was deleted', kind: 'missing' },
]

// ---- What was copied ------------------------------------------------------------------------------------
export const COPIED_COUNTS: { type: string; count: number }[] = [
  { type: 'Modules', count: 8 },
  { type: 'Assignments', count: 14 },
  { type: 'Quizzes', count: 5 },
  { type: 'Pages', count: 22 },
  { type: 'Discussions', count: 6 },
  { type: 'Announcements', count: 3 },
  { type: 'Rubrics', count: 4 },
  { type: 'Files', count: 41 },
  { type: 'Calendar events', count: 9 },
]

// The area of a comment maps to a content type, so leaving an item out lowers that count.
export const AREA_TO_TYPE: Record<string, string> = {
  Assignments: 'Assignments',
  Quizzes: 'Quizzes',
  Pages: 'Pages',
  Modules: 'Modules',
  Files: 'Files',
  Discussions: 'Discussions',
}

// Items the copy tried and could not finish (sample). They are not in the "copied" counts.
export const FAILED_ITEMS: { item: string; type: string; reason: string; fix: string }[] = [
  { item: 'Quiz 4 question bank', type: 'Quizzes', reason: 'The copy timed out after 14 of 60 questions.', fix: 'Copy the quiz again on its own.' },
  { item: 'Week 6 lecture recording', type: 'Files', reason: 'The file is 1.2 GB, which is over the 500 MB limit.', fix: 'Upload a smaller version.' },
  { item: 'Peer feedback thread', type: 'Discussions', reason: 'It points to a student reply that no longer exists.', fix: 'Create the thread again.' },
  { item: 'Final project rubric', type: 'Rubrics', reason: 'The rubric is shared with a course you cannot access.', fix: 'Ask the course owner to share it.' },
]

// `content` is the part of the course the entry is about, for example an item and the module it is in. The summary shows it as a link.
// `tag` is the short label shown as a pill before the text, and `tone` is its color.
export type TodoItem = { group: string; title: string; detail: string; content?: string; tag?: string; tone?: 'error' | 'warning' | 'info' | 'neutral' }

// One line of the copy history on the summary. Decisions are what the teacher chose, the rest is what Canvas did.
export type HistoryEvent = {
  when: string
  tag: 'Session' | 'Created' | 'Decision' | 'Automatic'
  text: string
  who: string
  link?: string
}

export type CopySummary = {
  course: string
  // The course the content was copied into.
  target: string
  when: string
  // When students see the course, in words.
  opens: string
  stats: { created: number; relinked: number; sentToAdmin: number; datesPlaced: number }
  came: { type: string; count: number; changed: boolean }[]
  failed: { item: string; reason: string; fix: string }[]
  notCame: { item: string; reason: string; kind: 'left-out' | 'canvas' | 'attention' }[]
  todo: TodoItem[]
  history: HistoryEvent[]
  datesShifted: number
  datesEdited: number
}
