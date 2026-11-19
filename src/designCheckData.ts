// The readiness criteria of the account, as the admin sets them on the Edit Criteria screens. Everything here is made up.
// There are five areas: General, Navigation, Content, Activities and Compliance. Each criterion is one rule.
// `level` says what a rule looks at: the whole course (one general item) or single learning objects (one row for each).

export type Dimension = 'General' | 'Navigation' | 'Content' | 'Activities' | 'Compliance' | 'Copy checks'

// The first five areas are the criteria of the account. "Copy checks" are the checks of the copy itself: links, unused items and dates.
export const DIMENSIONS: Dimension[] = ['General', 'Navigation', 'Content', 'Activities', 'Compliance', 'Copy checks']

// critical: red, students will notice. warning: orange, worth a look.
export type Severity = 'critical' | 'warning'

export type DesignRule = {
  id: string
  dimension: Dimension
  severity: Severity
  level: 'course' | 'object'
  title: string
  // Why it matters, shown under a finding.
  why: string
  // Rules that another step takes care of. They have no row in the review, and the check points to that step.
  handled?: string
}

export const DESIGN_RULES: DesignRule[] = [
  // General
  { id: 'course-published', dimension: 'General', severity: 'critical', level: 'course', title: 'Course is published.', why: 'Students can only see a course once it is published.', handled: 'Set when you choose the publish date in the last step.' },
  { id: 'dates-set', dimension: 'General', severity: 'critical', level: 'course', title: 'Course start and end dates are set.', why: 'The term dates tell students and the calendar when the course runs.', handled: 'Set in the Set dates step.' },
  { id: 'due-in-term', dimension: 'General', severity: 'critical', level: 'course', title: 'Published due dates fall within the course dates.', why: 'A due date outside the term is easy to miss and confuses the calendar.', handled: 'Set in the Set dates step.' },
  // Navigation
  { id: 'navigation', dimension: 'Navigation', severity: 'warning', level: 'course', title: 'Course menu shows Settings and Syllabus and hides Search.', why: 'Your account sets which items students see in the course menu.' },
  // Content
  { id: 'announcements', dimension: 'Content', severity: 'critical', level: 'object', title: 'At least 1 announcement is available.', why: 'Students cannot see an announcement that is still a draft.' },
  { id: 'files', dimension: 'Content', severity: 'critical', level: 'object', title: 'At least 1 file is available.', why: 'Students need the files the course points to.' },
  { id: 'modules', dimension: 'Content', severity: 'critical', level: 'object', title: 'At least 1 module is available.', why: 'Students cannot open a module that is still a draft.' },
  { id: 'pages', dimension: 'Content', severity: 'critical', level: 'object', title: 'At least 1 page is available.', why: 'Students cannot open a page that is still a draft.' },
  { id: 'syllabus', dimension: 'Content', severity: 'critical', level: 'object', title: 'Syllabus is visible and has at least 1 word.', why: 'An empty syllabus leaves students without the basics: grading, policies and dates.' },
  // Activities
  { id: 'assignments', dimension: 'Activities', severity: 'critical', level: 'object', title: 'At least 1 assignment is available.', why: 'Students cannot see or submit an assignment that is still a draft.' },
  { id: 'classic-quizzes', dimension: 'Activities', severity: 'critical', level: 'object', title: 'At least 1 classic quiz is available.', why: 'Students cannot take a quiz that is still a draft.' },
  { id: 'new-quizzes', dimension: 'Activities', severity: 'critical', level: 'object', title: 'At least 1 New Quiz is available.', why: 'Students cannot take a quiz that is still a draft.' },
  { id: 'discussions', dimension: 'Activities', severity: 'critical', level: 'object', title: 'At least 1 discussion is available.', why: 'Students cannot join a discussion that is still a draft.' },
  { id: 'outcomes', dimension: 'Activities', severity: 'warning', level: 'object', title: 'At least 1 outcome is in the course.', why: 'Outcomes let you and your students see progress toward the course goals.' },
  { id: 'rubrics', dimension: 'Activities', severity: 'warning', level: 'object', title: 'At least 1 rubric is in the course.', why: 'A rubric that is not attached never shows students how they are graded.' },
  { id: 'gradebook', dimension: 'Activities', severity: 'warning', level: 'course', title: 'Canvas Gradebook is in use.', why: 'Students see their scores in one place.' },
  // Compliance
  { id: 'a11y-scan', dimension: 'Compliance', severity: 'warning', level: 'course', title: 'Course was scanned for accessibility.', why: 'A scan finds the accessibility issues you cannot see by eye.' },
  { id: 'a11y-open', dimension: 'Compliance', severity: 'warning', level: 'course', title: 'No more than 1 open accessibility issue.', why: 'Fewer open issues means more students can use the course.' },
  { id: 'a11y-critical', dimension: 'Compliance', severity: 'critical', level: 'object', title: 'No more than 1 critical accessibility issue.', why: 'Captions let students who are deaf, hard of hearing or in a noisy room follow a video.' },
  { id: 'a11y-high', dimension: 'Compliance', severity: 'critical', level: 'object', title: 'No more than 1 high severity accessibility issue.', why: 'Alt text lets students who use a screen reader know what an image shows.' },
  { id: 'a11y-medium', dimension: 'Compliance', severity: 'warning', level: 'object', title: 'No more than 1 medium severity accessibility issue.', why: 'Enough contrast between text and background helps every student read the page.' },
  // Copy checks
  { id: 'links', dimension: 'Copy checks', severity: 'critical', level: 'course', title: 'Links between items open the right item.', why: 'A link that points to the old course shows students an error.' },
  { id: 'missing-links', dimension: 'Copy checks', severity: 'critical', level: 'course', title: 'Tool (LTI) links are linked again.', why: 'Canvas cannot copy the connection to an external tool, so each link needs to be linked again before students use it.' },
  { id: 'unused', dimension: 'Copy checks', severity: 'warning', level: 'object', title: 'Items not used last term are reviewed.', why: 'A shorter course is easier to find your way in, and unused items add clutter and things to maintain.' },
  { id: 'dates-teaching', dimension: 'Copy checks', severity: 'warning', level: 'course', title: 'Dates land on teaching days.', why: 'A date on a weekend or a holiday is easy to miss.', handled: 'Set in the Set dates step.' },
]
