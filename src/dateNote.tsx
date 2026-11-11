import type { ReactNode } from 'react'
import StatusPill from './StatusPill'
import { DATE_ITEMS, NO_DATE_ITEMS, rowInfo } from './fixDatesData'
import type { FixDatesState, Included } from './fixDatesData'

// The date check of one item, as a small pill: where its due date lands in the new term. It is shown on the items of the
// course preview in the dates step and in the last step. Items with no date, and pages or files, show nothing but "No due date".
export function dateNoteFor(state: FixDatesState, included: Included) {
  const infos = DATE_ITEMS.filter((i) => included(i.itemId)).map((i) => rowInfo(i, state))
  return (itemId: string): ReactNode => {
    const mine = infos.filter((r) => r.item.itemId === itemId)
    if (mine.length === 0) return NO_DATE_ITEMS.some((n) => n.itemId === itemId && included(n.itemId)) ? <StatusPill size="xs" color="info">No due date</StatusPill> : null
    if (state.mode === 'clear') return <StatusPill size="xs" color="info">Set it later</StatusPill>
    if (mine.some((r) => r.finalClosed)) return <StatusPill size="xs" color="warning">Non-teaching day</StatusPill>
    return mine.some((r) => r.closed) ? <StatusPill size="xs" color="success">Fixed</StatusPill> : <StatusPill size="xs" color="success">Teaching day</StatusPill>
  }
}
