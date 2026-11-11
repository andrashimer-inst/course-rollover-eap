import type { CourseNav } from './GlobalNav'
import type { TrayCourse } from './LegacyNav'

// Sample courses for the Legacy Courses tray. Sample data only. A design passes its own `courseList`.
export const SAMPLE_COURSE_LIST: TrayCourse[] = [
  { name: 'CS101: Intro to Computer Science', code: 'CS101-FA26', term: 'Fall 2026', published: true },
  { name: 'ENG1: College Writing', code: 'ENG1-FA26', term: 'Fall 2026', published: true },
  { name: 'CALC2: Advanced Calculus', code: 'CALC2-FA26', term: 'Fall 2026', published: false },
  { name: 'HIST101: World History', code: 'HIST101-SP27', term: 'Spring 2027', published: false },
]

// Sample course menu (Home, Announcements, ...). Unpublished items get an eye icon, like in Canvas.
// Sample data only. A design passes its own `course` to DesktopWrapper.
export const SAMPLE_COURSE: CourseNav = {
  name: 'Rollover',
  items: [
    { label: 'Home', current: true }, { label: 'Announcements', unpublished: true },
    { label: 'Assignments' }, { label: 'Discussions' }, { label: 'Grades' }, { label: 'People' },
    { label: 'Pages', unpublished: true }, { label: 'Files', unpublished: true },
    { label: 'Syllabus' }, { label: 'Outcomes', unpublished: true },
    { label: 'Rubrics', unpublished: true }, { label: 'Quizzes', unpublished: true },
    { label: 'Modules', unpublished: true }, { label: 'BigBlueButton' }, { label: 'Collaborations' },
    { label: 'Grade Sync', unpublished: true }, { label: 'Course Analytics' },
    { label: 'Lucid (Whiteboard)' }, { label: 'Settings' },
  ],
}
