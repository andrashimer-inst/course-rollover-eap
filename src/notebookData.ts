import { commentsFor } from './rolloverData'
import type { Decision, EducatorComment } from './rolloverData'
import type { CourseNav } from './GlobalNav'

// Sample data for the educator Notebook. Everything here is made up.
// The notebook belongs to the course the notes are about. This prototype uses one course, "Design Portfolio",
// the same course the copy wizard reads its comments from. Notes made here show up in the wizard's
// "Review comments" step, so what the educator writes while teaching is there when the course is copied.

export const NOTEBOOK_COURSE = 'Design Portfolio'
const CODE = 'DES 310'

export type ItemKind = 'Pages' | 'Assignments'

export type CourseItem = {
  id: string
  kind: ItemKind
  // The wizard groups its comments by area. A quiz sits in the Assignments list, as in Canvas.
  area: EducatorComment['area']
  title: string
  // Paragraphs of the page or assignment. A note on selected text quotes a piece of one paragraph.
  body: string[]
  // Assignments only: the details table under the description.
  details?: { points: string; submitting: string; due: string }
}

export const COURSE_ITEMS: CourseItem[] = [
  {
    id: 'week5',
    kind: 'Pages',
    area: 'Pages',
    title: 'Week 5 overview',
    body: [
      'This week we look at how designers present their work to a client. You will read two short case studies and start your own portfolio outline.',
      'On Thursday we welcome a guest speaker from the Design Studio, who will talk about how they run portfolio reviews. Come with one question you want to ask.',
      'By Friday, post your outline to the course discussion board and comment on at least two classmates’ outlines.',
    ],
  },
  {
    id: 'welcome',
    kind: 'Pages',
    area: 'Pages',
    title: 'Course welcome',
    body: [
      'Welcome to the course. Over the term you will build a portfolio of four projects and present one of them to the class.',
      'Office hours are on Tuesdays from 2 to 4 pm in the studio, and by appointment on other days.',
    ],
  },
  {
    id: 'a1',
    kind: 'Assignments',
    area: 'Assignments',
    title: `${CODE} Assignment 1: Reading response`,
    body: [
      'Read the two case studies from week 1 and write a short response of 300 words. Say which one you found more convincing and why.',
    ],
    details: { points: '10', submitting: 'A text entry', due: 'Sep 9 at 11:59pm' },
  },
  {
    id: 'a2',
    kind: 'Assignments',
    area: 'Assignments',
    title: `${CODE} Project proposal`,
    body: [
      'Describe the project you plan to build for your portfolio. Include the audience, the main goal and the tools you expect to use.',
      'Keep it to one page. You can change the plan later, but tell me when you do.',
    ],
    details: { points: '15', submitting: 'A file upload', due: 'Oct 7 at 11:59pm' },
  },
  {
    id: 'a3',
    kind: 'Assignments',
    area: 'Assignments',
    title: `${CODE} Assignment 3: Reflection`,
    body: [
      'Write a reflection of 500 to 700 words about the project you just finished. Describe the problem, the choices you made and what you would change.',
      'Use the rubric below to check your work before you submit. Upload a PDF or a Word file.',
    ],
    details: { points: '20', submitting: 'A file upload', due: 'Oct 14 at 11:59pm' },
  },
  {
    id: 'q1',
    kind: 'Assignments',
    area: 'Quizzes',
    title: `${CODE} Quiz 1`,
    body: ['This quiz covers the readings from weeks 1 and 2. You have 20 minutes and two attempts.'],
    details: { points: '8', submitting: 'Nothing, taken in Canvas', due: 'Sep 16 at 11:59pm' },
  },
  {
    id: 'q2',
    kind: 'Assignments',
    area: 'Quizzes',
    title: `${CODE} Quiz 2`,
    body: [
      'This quiz covers the readings from weeks 3 and 4. You have 30 minutes and one attempt.',
      'Question 6: Which file format keeps layers editable when you share a design with a teammate?',
    ],
    details: { points: '10', submitting: 'Nothing, taken in Canvas', due: 'Oct 21 at 11:59pm' },
  },
]

export const itemsOf = (kind: ItemKind) => COURSE_ITEMS.filter((i) => i.kind === kind)
export const itemById = (id: string) => COURSE_ITEMS.find((i) => i.id === id)

export type Note = {
  id: string
  itemId: string
  quote?: string // the highlighted text. No quote means the note is about the whole page or assignment.
  text: string
  author: string
  date: string
  decision: Decision // what the copy wizard suggests for this item
}

// The comments the teaching team already left (the same ones the wizard shows), placed on the pages and
// assignments they are about. The ids match, so the wizard shows each of them once.
const SEED_PLACE: Record<string, { itemId: string; quote?: string }> = {
  c1: { itemId: 'a3' },
  c2: { itemId: 'q2', quote: 'Question 6' },
  c3: { itemId: 'week5', quote: 'a guest speaker from the Design Studio' },
}

const SEED_IDS = new Set(Object.keys(SEED_PLACE))

export const SEED_NOTES: Note[] = commentsFor(NOTEBOOK_COURSE)
  .filter((c) => SEED_PLACE[c.id])
  .map((c) => ({
    id: c.id,
    ...SEED_PLACE[c.id],
    text: c.text,
    author: c.author,
    date: 'Oct 6, 2025',
    decision: c.decision,
  }))

// Suggest what to do with an item from the wording of a note, the same idea the wizard uses for its own comments.
export function suggestDecision(text: string): Decision {
  const t = text.toLowerCase()
  if (/(leave out|don.t copy|do not copy|remove it|delete)/.test(t)) return 'leave-out'
  if (/(works well|worked well|keep as is|keep it as it is|no changes)/.test(t)) return 'copy'
  return 'fix-later'
}

// The wizard's comment list gets the notes as comments on the same items.
export function notesAsComments(notes: Note[]): EducatorComment[] {
  return notes.flatMap((n) => {
    const item = itemById(n.itemId)
    if (!item) return []
    return [
      {
        id: n.id,
        area: item.area,
        item: item.title,
        text: n.quote && !SEED_IDS.has(n.id) ? `${n.text} (on “${n.quote}”)` : n.text,
        author: n.author,
        term: n.date.endsWith('2025') ? 'Fall 2025' : 'This term',
        decision: n.decision,
      },
    ]
  })
}

// The course menu of the notebook course. `current` marks where the user is, `onSelect` makes the links work.
const MENU = [
  'Home', 'Announcements', 'Assignments', 'Discussions', 'Grades', 'People', 'Pages', 'Files', 'Syllabus',
  'Outcomes', 'Rubrics', 'Quizzes', 'Modules', 'BigBlueButton', 'Collaborations', 'Grade Sync',
  'Course Analytics', 'Lucid (Whiteboard)', 'Settings',
]
const UNPUBLISHED = ['Announcements', 'Pages', 'Files', 'Outcomes', 'Rubrics', 'Quizzes', 'Modules', 'Grade Sync']

export function courseMenu(name: string, current: string, onSelect: (label: string) => void): CourseNav {
  return {
    name,
    onSelect,
    items: MENU.map((label) => ({ label, current: label === current, unpublished: UNPUBLISHED.includes(label) })),
  }
}

// The comments the copy wizard shows for a source course. For the notebook course they are the team's
// other comments plus every note from the notebook (the seed comments live in the notebook as notes).
export function commentsForCopy(course: string, notes: Note[]): EducatorComment[] {
  if (course !== NOTEBOOK_COURSE) return commentsFor(course)
  return [...commentsFor(course).filter((c) => !SEED_IDS.has(c.id)), ...notesAsComments(notes)]
}
