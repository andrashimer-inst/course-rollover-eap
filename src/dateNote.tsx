import type { ReactNode } from 'react'
import StatusPill from './StatusPill'
import { DATE_ITEMS, NO_DATE_ITEMS, SUB_TIME, fmtShort, rowInfo, timeOf } from './fixDatesData'
import type { FixDatesState, Included } from './fixDatesData'

// The date check of one item, as a small pill: where its due date lands in the new term. It is shown on the items of the
// course preview in the dates step and in the last step. Items with no date, and pages or files, show nothing but "No due date".
export function dateNoteFor(state: FixDatesState, included: Included) {
  const infos = DATE_ITEMS.filter((i) => included(i.itemId)).map((i) => rowInfo(i, state))
  return (itemId: string): ReactNode => {
    const mine = infos.filter((r) => r.item.itemId === itemId)
    if (mine.length === 0) return NO_DATE_ITEMS.some((n) => n.itemId === itemId && included(n.itemId)) ? <StatusPill size="xs" color="info">No due date</StatusPill> : null
    if (state.mode === 'keep') return null
    if (state.mode === 'clear') return <StatusPill size="xs" color="info">Set it later</StatusPill>
    if (mine.some((r) => r.finalClosed)) return <StatusPill size="xs" color="warning">Non-teaching day</StatusPill>
    return mine.some((r) => r.closed) ? <StatusPill size="xs" color="success">Fixed</StatusPill> : <StatusPill size="xs" color="success">Teaching day</StatusPill>
  }
}

// The dates of an item in the course preview, the way Canvas shows them under an item: a bold label and the date, with the
// available-from and until dates beside the due date. They replace the old date in the item's own line. An item with several
// rows (sections, groups) gets one line for each.
export function currentMeta(meta: string): ReactNode {
  const segs = meta.split(' | ')
  const due = segs.find((seg) => /^[A-Z][a-z]{2} \d+$/.test(seg))
  if (!due) return meta
  const other = segs.filter((seg) => seg !== due)
  return (
    <>
      {other.length > 0 && <span style={{ display: 'block' }}>{other.join(' | ')}</span>}
      <span style={{ display: 'block' }}><strong>Due</strong> {due} at 11:59 PM</span>
    </>
  )
}

export function dateMetaFor(state: FixDatesState, included: Included) {
  const infos = DATE_ITEMS.filter((i) => included(i.itemId)).map((i) => rowInfo(i, state))
  const day = (d: Date, time: string) => `${fmtShort(d)} at ${time}`
  return (itemId: string, meta: string): ReactNode => {
    const mine = infos.filter((r) => r.item.itemId === itemId)
    // Items already in the course keep their dates. The copy does not move them. Their date shows the same way as the others.
    if (mine.length === 0 && itemId.startsWith('current:')) return currentMeta(meta)
    if (mine.length === 0) return meta
    // What the line says besides the old date, like the points.
    const rest = meta.split(' | ').filter((seg) => !/^[A-Z][a-z]{2} \d+$/.test(seg))
    const lines = mine.map((r) => {
      const byHand = (id: string) => state.times?.[id]
      const parts: ReactNode[] = []
      if (state.mode !== 'clear') {
        const from = r.subs.find((x) => x.key === 'from')
        const until = r.subs.find((x) => x.key === 'until')
        if (from?.final) parts.push(<span key="from"><strong>Available from</strong> {day(from.final, byHand(from.id) ?? SUB_TIME.from)}</span>)
        if (r.final) parts.push(<span key="due"><strong>Due</strong> {day(r.final, (r.choice?.choice === 'custom' ? byHand(r.item.id) : undefined) ?? timeOf(r.item))}</span>)
        if (until?.final) parts.push(<span key="until"><strong>Available until</strong> {day(until.final, byHand(until.id) ?? SUB_TIME.until)}</span>)
        const show = r.subs.find((x) => x.key === 'showOn')
        const hide = r.subs.find((x) => x.key === 'hideOn')
        if (show?.final) parts.push(<span key="show"><strong>Show on</strong> {day(show.final, byHand(show.id) ?? SUB_TIME.showOn)}</span>)
        if (hide?.final) parts.push(<span key="hide"><strong>Hide on</strong> {day(hide.final, byHand(hide.id) ?? SUB_TIME.hideOn)}</span>)
      }
      const group = r.item.kind.split(' · ')[1]
      return { id: r.item.id, group, parts }
    })
    // The points and the other facts come first, and the dates are on a line of their own below them.
    return (
      <>
        {rest.length > 0 && <span style={{ display: 'block' }}>{rest.join(' | ')}</span>}
        {lines.map((l, i) => (
          <span key={l.id} style={{ display: 'block' }}>
            {mine.length > 1 && <strong>{l.group ?? `Section ${i + 1}`}: </strong>}
            {l.parts.length ? l.parts.flatMap((p, k) => (k === 0 ? [p] : [' | ', p])) : 'No dates'}
          </span>
        ))}
      </>
    )
  }
}
