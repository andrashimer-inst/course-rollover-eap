import { CHOICE_LABEL, choiceOf } from './reviewData'
import type { Choice, ReviewRow } from './reviewData'
import type { HistoryEvent } from './rolloverData'

// Sample copy history for the summary. Everything here is made up. Newest first, like the real history will be.

// Several educators can work on the same copy, so the choices are spread over a few people. All names are made up.
export const EDUCATORS = ['A. Rivera', 'M. Chen', 'J. Okafor']
export const ADMIN = 'S. Patel (Admin)'
const CANVAS = 'Canvas, Automatic'
export const PEOPLE = [...EDUCATORS, ADMIN]

export function buildHistory(args: { rows: ReviewRow[]; choices: Record<string, Choice>; opens: string }): HistoryEvent[] {
  const { rows, choices, opens } = args
  const made = rows.filter((r) => !r.courseWide && !r.extra && choiceOf(r, choices) !== 'leave')
  const events: Omit<HistoryEvent, 'when'>[] = []

  events.push({ tag: 'Session', text: `Copy finished. The course stays unpublished until ${opens}.`, who: CANVAS })
  for (const r of [...made].reverse()) {
    events.push({ tag: 'Created', text: `${r.title} (${r.kindLabel}) created in ${r.group}`, who: CANVAS, link: 'Open' })
  }
  events.push(
    { tag: 'Automatic', text: 'Case study video: link swapped for this term’s version', who: CANVAS },
    { tag: 'Automatic', text: 'Publisher e-book: sent to S. Patel (Admin). The licence is not on the approved list', who: CANVAS },
    { tag: 'Automatic', text: 'Lab simulation tool: relinked to the new course', who: CANVAS },
    { tag: 'Automatic', text: 'Quiz tool: relinked to the new course', who: CANVAS },
  )
  events.push(
    { tag: 'Decision', text: 'Publisher e-book: licence approved for the new course', who: ADMIN },
    { tag: 'Session', text: 'Copy started', who: EDUCATORS[1] },
    { tag: 'Session', text: 'Dates checked and fixed', who: EDUCATORS[2] },
    { tag: 'Session', text: 'Learning object review finished', who: EDUCATORS[0] },
    { tag: 'Session', text: 'Copy wizard opened from Design Portfolio', who: EDUCATORS[0] },
  )
  let n = 0
  for (const r of rows) {
    const c = choiceOf(r, choices)
    if (!c) continue
    if (!r.hasSuggestion && c === 'bring') continue
    events.push({ tag: 'Decision', text: `${r.title}: ${CHOICE_LABEL[c]}`, who: EDUCATORS[n++ % EDUCATORS.length] })
  }

  // Spread the events over the minutes before now, newest first.
  const now = new Date()
  return events.map((e, i) => {
    const at = new Date(now.getTime() - Math.floor(i / 3) * 60_000)
    return {
      ...e,
      when: at.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
    }
  })
}
