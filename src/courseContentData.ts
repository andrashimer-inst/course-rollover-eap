// Sample content of the course being copied, for the wizard's "Select content" step. Everything here is made up.

export type TypeId =
  | 'settings' | 'syllabus' | 'modules' | 'assignments' | 'quizzes' | 'banks'
  | 'discussions' | 'pages' | 'announcements' | 'rubrics' | 'outcomes' | 'files' | 'events'

export type ContentItem = { id: string; label: string }
export type ContentType = { id: TypeId; label: string; items: ContentItem[] }

const list = (type: TypeId, labels: string[]): ContentItem[] =>
  labels.map((label, i) => ({ id: `${type}:${i + 1}`, label }))

// Course Settings and Syllabus Body are single things, so they have no list under them.
export const CONTENT_TYPES: ContentType[] = [
  { id: 'settings', label: 'Course Settings', items: [] },
  { id: 'syllabus', label: 'Syllabus Body', items: [] },
  {
    id: 'modules',
    label: 'Modules',
    items: list('modules', ['Welcome to the course', 'Week 1: Reading and responses', 'Week 2: Project proposal', 'Week 3: Reflection and review']),
  },
  {
    id: 'assignments',
    label: 'Assignments',
    items: list('assignments', ['Assignment 1: Reading response', 'Project proposal', 'Assignment 3: Reflection', 'Peer review', 'Final portfolio']),
  },
  { id: 'quizzes', label: 'Quizzes', items: list('quizzes', ['Quiz 1', 'Quiz 2', 'Quiz 3']) },
  { id: 'banks', label: 'Question Banks', items: list('banks', ['Readings, weeks 1 to 4']) },
  { id: 'discussions', label: 'Discussion Topics', items: list('discussions', ['Introduce yourself', 'Week 3 discussion', 'Outline feedback']) },
  { id: 'pages', label: 'Pages', items: list('pages', ['Course welcome', 'Week 5 overview', 'How to submit your work', 'Portfolio guide']) },
  { id: 'announcements', label: 'Announcements', items: list('announcements', ['Welcome', 'Guest speaker', 'Quiz 2 reminder', 'Office hours moved']) },
  { id: 'rubrics', label: 'Rubrics', items: list('rubrics', ['Reflection rubric', 'Presentation rubric']) },
  { id: 'outcomes', label: 'Outcomes', items: list('outcomes', ['Outcome 1: Analyze a case study', 'Outcome 2: Reflect on your own work', 'Outcome 3: Present a project to a client']) },
  { id: 'files', label: 'Files', items: list('files', ['Syllabus.pdf', 'Case study 1.pdf', 'Case study 2.pdf', 'Outline template.docx', 'Slides 2023 (old format)', 'Slides week 2.pptx', 'Lab safety video.mp4']) },
  { id: 'events', label: 'Calendar Events', items: list('events', ['Guest speaker', 'Portfolio review day', 'Office hours', 'Final presentations']) },
]

export type ModuleEntry = { itemId: string; title: string; kind: 'assignment' | 'quiz' | 'page' | 'discussion' | 'file'; meta: string }

// What each module holds. The keys match the module item ids above.
export const MODULE_ENTRIES: Record<string, ModuleEntry[]> = {
  'modules:1': [
    { itemId: 'pages:1', title: 'Course welcome', kind: 'page', meta: 'Page' },
    { itemId: 'discussions:1', title: 'Introduce yourself', kind: 'discussion', meta: 'Contribute' },
    { itemId: 'files:1', title: 'Syllabus.pdf', kind: 'file', meta: 'File' },
  ],
  'modules:2': [
    { itemId: 'files:2', title: 'Case study 1.pdf', kind: 'file', meta: 'File' },
    { itemId: 'files:7', title: 'Lab safety video.mp4', kind: 'file', meta: 'Video, 4 min' },
    { itemId: 'assignments:1', title: 'Assignment 1: Reading response', kind: 'assignment', meta: 'Sep 9 | 10 pts | Submit' },
    { itemId: 'quizzes:1', title: 'Quiz 1', kind: 'quiz', meta: 'Sep 16 | 8 pts | Score at least 5' },
  ],
  'modules:3': [
    { itemId: 'assignments:2', title: 'Project proposal', kind: 'assignment', meta: 'Oct 7 | 15 pts | Submit' },
    { itemId: 'discussions:2', title: 'Week 3 discussion', kind: 'discussion', meta: 'Contribute' },
    { itemId: 'files:4', title: 'Outline template.docx', kind: 'file', meta: 'File' },
  ],
  'modules:4': [
    { itemId: 'pages:2', title: 'Week 5 overview', kind: 'page', meta: 'Mark done' },
    { itemId: 'assignments:3', title: 'Assignment 3: Reflection', kind: 'assignment', meta: 'Oct 14 | 20 pts | Score at least 15' },
    { itemId: 'quizzes:2', title: 'Quiz 2', kind: 'quiz', meta: 'Oct 21 | 10 pts' },
  ],
}

// Modules already in the course that is being copied into (the one you are working in).
// "Week 2: Project proposal" has the same name as a module in the source course on purpose: copies keep their names.
// `source` says where it came from: added by hand in this course, or copied here by an earlier copy. A new copy never replaces what was added by hand.
export const CURRENT_MODULES: { id: string; label: string; source: 'manual' | 'copied'; entries: ModuleEntry[] }[] = [
  {
    id: 'current:1',
    label: 'Getting started',
    source: 'manual',
    entries: [
      { itemId: 'current:1', title: 'Welcome announcement', kind: 'page', meta: 'Page' },
      { itemId: 'current:2', title: 'Tools you will use', kind: 'page', meta: 'Page' },
    ],
  },
  {
    id: 'current:2',
    label: 'Week 2: Project proposal',
    source: 'manual',
    entries: [
      { itemId: 'current:3', title: 'Proposal guidelines', kind: 'page', meta: 'Page' },
      { itemId: 'current:4', title: 'Proposal draft', kind: 'assignment', meta: 'Oct 12 | 15 pts | Submit' },
    ],
  },
  {
    id: 'current:3',
    label: 'Resources',
    source: 'copied',
    entries: [{ itemId: 'current:5', title: 'Reading list.pdf', kind: 'file', meta: 'File' }],
  },
]
