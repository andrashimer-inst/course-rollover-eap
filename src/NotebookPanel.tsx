import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Button,
  CloseButton,
  Heading,
  IconAddLine,
  IconEditLine,
  IconTrashLine,
  IconButton,
  Text,
  TextArea,
  Tray,
} from '@instructure/ui/v11_7'
import StatusPill from './StatusPill'
import { useSurfaceTokens } from './appTheme'
import type { CourseItem, Note } from './notebookData'

// The Notebook panel on a page or assignment. Students already have this panel (their notes are marked
// important or unclear). Educators get the same panel for their notes about the course.
//   - "Make note" on highlighted text adds a note about that text (the page opens the panel with a draft)
//   - "Make note for this page" is only for educators: a note about the whole page or assignment, no highlight
// Notes on this item are listed newest last. A note can be edited or deleted.

export type Draft = { quote?: string }

export function NoteCard({
  note,
  wholeLabel,
  onUpdate,
  onRemove,
  showItem,
  openLink,
}: {
  note: Note
  wholeLabel: string
  onUpdate: (id: string, text: string) => void
  onRemove: (id: string) => void
  // The Notebook page lists notes from many items, so it names the item above each note.
  showItem?: string
  openLink?: ReactNode
}) {
  const t = useSurfaceTokens()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(note.text)
  return (
    <li
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: t.space.md,
        padding: t.space.lg,
        background: t.containerColor,
        border: `${t.borderWidth} solid ${t.borderColor}`,
        borderRadius: t.radiusMd,
      }}
    >
      {showItem && <Text weight="bold">{showItem}</Text>}
      {note.quote ? (
        <blockquote
          style={{
            margin: 0,
            paddingInlineStart: t.space.md,
            borderInlineStart: `0.25rem solid ${t.borderColor}`,
          }}
        >
          <Text fontStyle="italic">“{note.quote}”</Text>
        </blockquote>
      ) : (
        <div>
          <StatusPill size="sm" color="info">
            {wholeLabel}
          </StatusPill>
        </div>
      )}
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.md }}>
          <TextArea label="Edit note" height="6rem" value={value} onChange={(e) => setValue(e.target.value)} />
          <div style={{ display: 'flex', gap: t.gapButtons }}>
            <Button
              color="primary"
              interaction={value.trim() ? 'enabled' : 'disabled'}
              onClick={() => {
                onUpdate(note.id, value.trim())
                setEditing(false)
              }}
            >
              Save
            </Button>
            <Button
              onClick={() => {
                setValue(note.text)
                setEditing(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Text as="p">{note.text}</Text>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t.space.md }}>
        <Text size="small" color="secondary">
          {note.author}, {note.date}
        </Text>
        {!editing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space.xs }}>
            {openLink}
            <IconButton
              screenReaderLabel="Edit note"
              size="small"
              withBackground={false}
              withBorder={false}
              onClick={() => setEditing(true)}
            >
              <IconEditLine />
            </IconButton>
            <IconButton
              screenReaderLabel="Delete note"
              size="small"
              withBackground={false}
              withBorder={false}
              onClick={() => onRemove(note.id)}
            >
              <IconTrashLine />
            </IconButton>
          </div>
        )}
      </div>
    </li>
  )
}

function DraftCard({
  draft,
  onSave,
  onCancel,
  wholeLabel,
}: {
  draft: Draft
  onSave: (text: string) => void
  onCancel: () => void
  wholeLabel: string
}) {
  const t = useSurfaceTokens()
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement | null>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return (
    <li
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: t.space.md,
        padding: t.space.lg,
        background: t.containerColor,
        border: `${t.borderWidth} solid ${t.borderColor}`,
        borderRadius: t.radiusMd,
      }}
    >
      {draft.quote ? (
        <blockquote
          style={{ margin: 0, paddingInlineStart: t.space.md, borderInlineStart: `0.25rem solid ${t.borderColor}` }}
        >
          <Text fontStyle="italic">“{draft.quote}”</Text>
        </blockquote>
      ) : (
        <div>
          <StatusPill size="sm" color="info">
            {wholeLabel}
          </StatusPill>
        </div>
      )}
      <TextArea
        label="Your note"
        height="6rem"
        placeholder="What should change next time?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        textareaRef={(el: HTMLTextAreaElement | null) => {
          ref.current = el
        }}
      />
      <div style={{ display: 'flex', gap: t.gapButtons }}>
        <Button color="primary" interaction={value.trim() ? 'enabled' : 'disabled'} onClick={() => onSave(value.trim())}>
          Save note
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </li>
  )
}

export default function NotebookPanel({
  open,
  item,
  notes,
  draft,
  onClose,
  onStartPageNote,
  onSaveDraft,
  onCancelDraft,
  onUpdate,
  onRemove,
}: {
  open: boolean
  item: CourseItem
  notes: Note[]
  draft: Draft | null
  onClose: () => void
  onStartPageNote: () => void
  onSaveDraft: (text: string) => void
  onCancelDraft: () => void
  onUpdate: (id: string, text: string) => void
  onRemove: (id: string) => void
}) {
  const t = useSurfaceTokens()
  const noun = item.kind === 'Pages' ? 'page' : 'assignment'
  const wholeLabel = item.kind === 'Pages' ? 'Whole page' : 'Whole assignment'
  return (
    <Tray
      label="Notebook"
      open={open}
      placement="end"
      size="small"
      onDismiss={onClose}
      shouldCloseOnDocumentClick={false}
      shouldContainFocus={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg, padding: t.space.lg }}>
        <CloseButton placement="end" offset="small" screenReaderLabel="Close notebook" onClick={onClose} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.xs }}>
          <Heading level="h2" variant="titleCardRegular">
            Notebook
          </Heading>
          <Text color="secondary">Notes on {item.title}</Text>
        </div>
        {/* Educators only: a note about the whole item, without highlighting any text. */}
        <Button
          renderIcon={<IconAddLine />}
          display="block"
          interaction={draft ? 'disabled' : 'enabled'}
          onClick={onStartPageNote}
        >
          Make note for this {noun}
        </Button>
        <Text size="small" color="secondary">
          Your notes show up in Review comments when you copy this course. To note one passage, highlight it and choose
          Make note.
        </Text>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
          {draft && <DraftCard draft={draft} wholeLabel={wholeLabel} onSave={onSaveDraft} onCancel={onCancelDraft} />}
          {notes.map((n) => (
            <NoteCard key={n.id} note={n} wholeLabel={wholeLabel} onUpdate={onUpdate} onRemove={onRemove} />
          ))}
        </ul>
        {notes.length === 0 && !draft && <Text color="secondary">No notes on this {noun} yet.</Text>}
      </div>
    </Tray>
  )
}
