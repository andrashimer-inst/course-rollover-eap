// Sample courses the educator can copy from in the wizard's first step. Everything here is made up.

export type TimeKind = 'Last used' | 'Concluded' | 'Last updated'

export type SourceCourse = {
  name: string
  code: string
  // The ID from the student information system, shown to tell similar courses apart.
  sisId: string
  // The sub-account the course belongs to.
  subAccount: string
  // "You" for the signed-in educator, otherwise the names of the other teachers.
  teachers: string[]
  students: number
  timeKind: TimeKind
  date: string
  // When the course readiness check last ran on this course. Missing when it never ran.
  readinessCheckedOn?: string
}

export const TIME_KINDS: TimeKind[] = ['Last used', 'Concluded', 'Last updated']

const RAW_COURSES: Omit<SourceCourse, 'sisId' | 'readinessCheckedOn' | 'subAccount'>[] = [
  { name: 'Design Portfolio', code: 'DES 310', teachers: ['You'], students: 28, timeKind: 'Last used', date: 'Oct 6, 2025' },
  { name: 'Biology 101', code: 'BIO 101', teachers: ['Maria Okafor'], students: 112, timeKind: 'Concluded', date: 'Dec 19, 2025' },
  { name: 'Intro to Design', code: 'DES 110', teachers: ['You', 'Dana Reyes'], students: 36, timeKind: 'Last updated', date: 'Nov 2, 2025' },
  { name: 'World History', code: 'HIS 120', teachers: ['Tomas Lindgren'], students: 64, timeKind: 'Concluded', date: 'May 15, 2025' },
  { name: 'Statistics for Designers', code: 'STA 210', teachers: ['You'], students: 19, timeKind: 'Concluded', date: 'May 16, 2025' },
  { name: 'Typography Studio', code: 'DES 220', teachers: ['Dana Reyes', 'Sam Tran'], students: 24, timeKind: 'Last used', date: 'Sep 28, 2025' },
  { name: 'Research Methods', code: 'RES 301', teachers: ['Priya Nair'], students: 47, timeKind: 'Last updated', date: 'Aug 30, 2025' },
  { name: 'Creative Writing Workshop', code: 'ENG 240', teachers: ['You'], students: 15, timeKind: 'Last used', date: 'Oct 20, 2025' },
  { name: 'Organic Chemistry I', code: 'CHE 201', teachers: ['Maria Okafor', 'Ben Hartley'], students: 138, timeKind: 'Concluded', date: 'Dec 12, 2024' },
  { name: 'Introduction to Python', code: 'CS 101', teachers: ['You'], students: 92, timeKind: 'Last used', date: 'Oct 14, 2025' },
  { name: 'Art History Survey', code: 'ART 150', teachers: ['Priya Nair'], students: 53, timeKind: 'Last updated', date: 'Jul 8, 2025' },
  { name: 'Microeconomics', code: 'ECO 210', teachers: ['Tomas Lindgren'], students: 71, timeKind: 'Concluded', date: 'May 14, 2025' },
  { name: 'User Research Lab', code: 'DES 330', teachers: ['You', 'Sam Tran'], students: 21, timeKind: 'Last used', date: 'Oct 3, 2025' },
  { name: 'Environmental Science', code: 'ENV 105', teachers: ['Ben Hartley'], students: 84, timeKind: 'Last updated', date: 'Sep 2, 2025' },
  { name: 'Linear Algebra', code: 'MAT 220', teachers: ['Priya Nair'], students: 66, timeKind: 'Concluded', date: 'May 13, 2025' },
  { name: 'Interaction Design Studio', code: 'DES 340', teachers: ['You', 'Dana Reyes'], students: 22, timeKind: 'Last used', date: 'Oct 9, 2025' },
  { name: 'Intro to Sociology', code: 'SOC 101', teachers: ['Ben Hartley'], students: 104, timeKind: 'Concluded', date: 'Dec 17, 2024' },
  { name: 'Data Visualization', code: 'CS 245', teachers: ['You'], students: 38, timeKind: 'Last updated', date: 'Sep 18, 2025' },
  { name: 'Physics for Engineers', code: 'PHY 150', teachers: ['Maria Okafor'], students: 121, timeKind: 'Concluded', date: 'May 12, 2025' },
  { name: 'Public Speaking', code: 'COM 110', teachers: ['Sam Tran'], students: 29, timeKind: 'Last used', date: 'Oct 1, 2025' },
  { name: 'Accessibility in Practice', code: 'DES 410', teachers: ['You', 'Sam Tran'], students: 17, timeKind: 'Last used', date: 'Oct 22, 2025' },
  { name: 'Modern Poetry', code: 'ENG 310', teachers: ['Tomas Lindgren'], students: 18, timeKind: 'Last updated', date: 'Aug 11, 2025' },
  { name: 'Marketing Principles', code: 'BUS 120', teachers: ['Priya Nair'], students: 88, timeKind: 'Concluded', date: 'Dec 18, 2024' },
  { name: 'Machine Learning Basics', code: 'CS 330', teachers: ['You'], students: 57, timeKind: 'Last used', date: 'Oct 16, 2025' },
  { name: 'World Geography', code: 'GEO 105', teachers: ['Ben Hartley'], students: 73, timeKind: 'Concluded', date: 'May 16, 2025' },
  { name: 'Design Systems', code: 'DES 450', teachers: ['Dana Reyes'], students: 26, timeKind: 'Last updated', date: 'Oct 12, 2025' },
  { name: 'Intro to Psychology', code: 'PSY 101', teachers: ['Maria Okafor', 'Priya Nair'], students: 146, timeKind: 'Concluded', date: 'Dec 20, 2024' },
  { name: 'Music Theory', code: 'MUS 130', teachers: ['You'], students: 31, timeKind: 'Last used', date: 'Sep 30, 2025' },
  { name: 'Project Management', code: 'BUS 260', teachers: ['Tomas Lindgren'], students: 49, timeKind: 'Last updated', date: 'Jul 21, 2025' },
  { name: 'Human Anatomy', code: 'BIO 210', teachers: ['Maria Okafor'], students: 95, timeKind: 'Concluded', date: 'May 15, 2025' },
  { name: 'Film Studies', code: 'FIL 200', teachers: ['Sam Tran'], students: 34, timeKind: 'Last used', date: 'Oct 7, 2025' },
  { name: 'Academic Writing', code: 'ENG 101', teachers: ['You', 'Ben Hartley'], students: 110, timeKind: 'Last used', date: 'Oct 24, 2025' },
  { name: 'Sustainable Cities', code: 'ENV 320', teachers: ['Dana Reyes'], students: 41, timeKind: 'Last updated', date: 'Sep 9, 2025' },
  { name: 'Calculus II', code: 'MAT 160', teachers: ['Priya Nair'], students: 77, timeKind: 'Concluded', date: 'May 14, 2025' },
  { name: 'Ethics in Technology', code: 'PHI 240', teachers: ['You'], students: 45, timeKind: 'Last updated', date: 'Oct 4, 2025' },
  { name: 'Spanish for Beginners', code: 'SPA 101', teachers: ['Tomas Lindgren'], students: 62, timeKind: 'Concluded', date: 'Dec 16, 2024' },
]

// Courses the readiness check has run on, and when. The others have never been checked.
const CHECKED: Record<string, string> = {
  'Design Portfolio': 'Oct 7, 2025',
  'Intro to Design': 'Nov 3, 2025',
  'Typography Studio': 'Sep 29, 2025',
  'Creative Writing Workshop': 'Oct 21, 2025',
  'Introduction to Python': 'Oct 15, 2025',
  'User Research Lab': 'Oct 4, 2025',
  'Interaction Design Studio': 'Oct 10, 2025',
  'Machine Learning Basics': 'Oct 17, 2025',
  'Academic Writing': 'Oct 25, 2025',
  'Design Systems': 'Oct 13, 2025',
  'Accessibility in Practice': 'Oct 23, 2025',
  'Biology 101': 'Dec 20, 2025',
}

export const SUB_ACCOUNTS = [
  'College of Arts and Design',
  'School of Business',
  'School of Humanities and Social Sciences',
  'School of Science and Engineering',
]

// The sub-account follows the subject in the short code.
const SUB_ACCOUNT_OF: Record<string, string> = {
  DES: SUB_ACCOUNTS[0], ART: SUB_ACCOUNTS[0], FIL: SUB_ACCOUNTS[0], MUS: SUB_ACCOUNTS[0], STA: SUB_ACCOUNTS[0],
  BUS: SUB_ACCOUNTS[1], ECO: SUB_ACCOUNTS[1],
  ENG: SUB_ACCOUNTS[2], HIS: SUB_ACCOUNTS[2], SOC: SUB_ACCOUNTS[2], PSY: SUB_ACCOUNTS[2], PHI: SUB_ACCOUNTS[2], SPA: SUB_ACCOUNTS[2], COM: SUB_ACCOUNTS[2], RES: SUB_ACCOUNTS[2],
  BIO: SUB_ACCOUNTS[3], CHE: SUB_ACCOUNTS[3], PHY: SUB_ACCOUNTS[3], MAT: SUB_ACCOUNTS[3], ENV: SUB_ACCOUNTS[3], GEO: SUB_ACCOUNTS[3], CS: SUB_ACCOUNTS[3],
}

export const SOURCE_COURSES: SourceCourse[] = RAW_COURSES.map((c, i) => ({
  ...c,
  sisId: `SIS-${2025100 + i * 7 + 3}`,
  readinessCheckedOn: CHECKED[c.name],
  subAccount: SUB_ACCOUNT_OF[c.code.split(' ')[0]],
}))
