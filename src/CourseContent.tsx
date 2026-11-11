import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Button, IconAddLine, IconNoteLine, IconSearchLine, Link, Menu, Table, Text } from '@instructure/ui/v11_7'
import DesktopWrapper from './DesktopWrapper'
import { ItemButtons, NotebookButton, ViewAsStudent } from './ItemActions'
import NotebookPanel from './NotebookPanel'
import type { Draft } from './NotebookPanel'
import { NOTEBOOK_COURSE, courseMenu, itemById, itemsOf } from './notebookData'
import type { ItemKind } from './notebookData'
import type { NotesApi } from './useNotes'
import { useAppThemeKey, useSurfaceTokens } from './appTheme'

// A page or an assignment of the course, seen by the educator. The Notebook is here too (students had it
// already): highlight text and choose "Make note", or open the Notebook and make a note for the whole item.

type Popup = { quote: string; x: number; y: number }

// Text with the passages that have a note marked, so the educator sees where notes are.
function Marked({ text, quotes }: { text: string; quotes: string[] }) {
  const ranges = quotes
    .map((q) => ({ start: text.indexOf(q), len: q.length }))
    .filter((r) => r.start >= 0)
    .sort((a, b) => a.start - b.start)
  const parts: ReactNode[] = []
  let at = 0
  for (const r of ranges) {
    if (r.start < at) continue
    if (r.start > at) parts.push(text.slice(at, r.start))
    parts.push(
      <mark
        key={r.start}
        style={{
          color: 'inherit',
          background: 'color-mix(in srgb, currentColor 14%, transparent)',
          borderBottom: '0.125rem dotted currentColor',
        }}
      >
        {text.slice(r.start, r.start + r.len)}
      </mark>,
    )
    at = r.start + r.len
  }
  parts.push(text.slice(at))
  return <>{parts}</>
}

export default function CourseContent({
  kind,
  itemId,
  onItemChange,
  api,
  onNavigate,
  onSelectMenu,
}: {
  kind: ItemKind
  itemId: string
  onItemChange: (id: string) => void
  api: NotesApi
  onNavigate: (label: string) => void
  onSelectMenu: (label: string) => void
}) {
  const t = useSurfaceTokens()
  const legacy = useAppThemeKey() === 'legacy'
  const items = itemsOf(kind)
  const item = itemById(itemId) ?? items[0]
  const itemNotes = api.notes.filter((n) => n.itemId === item.id)
  const [panelOpen, setPanelOpen] = useState(false)
  // A draft belongs to the item it was started on, so it is ignored when another item is shown.
  const [draftState, setDraft] = useState<(Draft & { itemId: string }) | null>(null)
  const draft = draftState?.itemId === item.id ? draftState : null
  const [popup, setPopup] = useState<Popup | null>(null)
  const article = useRef<HTMLElement | null>(null)

  // The "Make note" popup follows a text selection inside the article and goes away when it is cleared.
  const readSelection = () => {
    const sel = window.getSelection()
    const text = sel?.toString().replace(/\s+/g, ' ').trim()
    if (!sel || !text || sel.rangeCount === 0 || !article.current?.contains(sel.anchorNode)) {
      setPopup(null)
      return
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect()
    setPopup({ quote: text, x: rect.left, y: rect.bottom + 8 })
  }
  useEffect(() => {
    const hide = () => setPopup(null)
    window.addEventListener('scroll', hide, true)
    return () => window.removeEventListener('scroll', hide, true)
  }, [])

  const makeNote = () => {
    if (!popup) return
    setDraft({ itemId: item.id, quote: popup.quote })
    setPanelOpen(true)
    setPopup(null)
    window.getSelection()?.removeAllRanges()
  }

  const course = courseMenu(NOTEBOOK_COURSE, kind, onSelectMenu)
  const isPage = kind === 'Pages'
  const toggle = () => setPanelOpen((o) => !o)
  const notebook = <NotebookButton onClick={toggle} pressed={panelOpen} />
  const noFill = { background: 'transparent' }

  return (
    <DesktopWrapper
      pageTitle={item.title}
      breadcrumb={isPage ? [NOTEBOOK_COURSE, 'Pages'] : [NOTEBOOK_COURSE, 'Assignments']}
      activeNav="Courses"
      course={course}
      onNavigate={onNavigate}
      description={`Highlight text to make a note, or open the Notebook for a note on the whole ${isPage ? 'page' : 'assignment'}.`}
      // Legacy: the Notebook sits in the top bar at the far right, with View as Student. Light and Dark: in the
      // header with the other icons.
      barActions={
        legacy ? (
          <>
            {notebook}
            <ViewAsStudent />
          </>
        ) : undefined
      }
      headerActions={legacy ? undefined : notebook}
      actions={<ItemButtons frontPage={isPage && item.id === 'week5'} />}
      trailingContent={
        isPage ? undefined : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.md }}>
            <Text weight="bold" size="large">
              Related Items
            </Text>
            <Link href="#" variant="standalone" onClick={(e: { preventDefault: () => void }) => e.preventDefault()}>
              SpeedGrader
            </Link>
          </div>
        )
      }
      trailingLabel="Related Items"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.xl, maxWidth: '47.5rem' }}>
        {isPage && (
          <div>
            <Menu
              label="All pages"
              trigger={<Button>View All Pages</Button>}
              onSelect={(_e, value) => {
                setPopup(null)
                onItemChange(String(value))
              }}
            >
              {items.map((i) => (
                <Menu.Item key={i.id} value={i.id}>
                  {i.title}
                </Menu.Item>
              ))}
            </Menu>
          </div>
        )}

        <article
          ref={article}
          onMouseUp={readSelection}
          onKeyUp={readSelection}
          style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}
        >
          {item.body.map((paragraph) => (
            <Text as="p" key={paragraph}>
              <Marked text={paragraph} quotes={itemNotes.flatMap((n) => (n.quote ? [n.quote] : []))} />
            </Text>
          ))}
        </article>

        {item.details && (
          <>
            <dl
              style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: `${t.space.sm} ${t.space.xl}`, margin: 0 }}
            >
              {Object.entries({ Points: item.details.points, Submitting: item.details.submitting }).map(([label, value]) => (
                <div key={label} style={{ display: 'contents' }}>
                  <dt>
                    <Text weight="bold">{label}</Text>
                  </dt>
                  <dd style={{ margin: 0 }}>
                    <Text>{value}</Text>
                  </dd>
                </div>
              ))}
            </dl>
            <Table caption={() => 'Due dates'} themeOverride={noFill}>
              <Table.Head themeOverride={noFill}>
                <Table.Row themeOverride={noFill}>
                  <Table.ColHeader themeOverride={noFill} id="due">Due</Table.ColHeader>
                  <Table.ColHeader themeOverride={noFill} id="for">For</Table.ColHeader>
                  <Table.ColHeader themeOverride={noFill} id="from">Available from</Table.ColHeader>
                  <Table.ColHeader themeOverride={noFill} id="until">Until</Table.ColHeader>
                </Table.Row>
              </Table.Head>
              <Table.Body themeOverride={noFill}>
                <Table.Row themeOverride={noFill}>
                  <Table.Cell themeOverride={noFill}>{item.details.due}</Table.Cell>
                  <Table.Cell themeOverride={noFill}>Everyone</Table.Cell>
                  <Table.Cell themeOverride={noFill}>-</Table.Cell>
                  <Table.Cell themeOverride={noFill}>-</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
            {item.area === 'Assignments' && (
              <div style={{ display: 'flex', gap: t.gapButtons }}>
                <Button renderIcon={<IconAddLine />}>Create Rubric</Button>
                <Button renderIcon={<IconSearchLine />}>Find Rubric</Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Shown next to the selected text. Students see "Mark important" and "Mark unclear" here, educators see one choice. */}
      {popup && (
        <div
          role="menu"
          aria-label="Selected text"
          onMouseDown={(e) => e.preventDefault()}
          style={{
            position: 'fixed',
            left: popup.x,
            top: popup.y,
            zIndex: 9999,
            padding: t.space.xs,
            background: t.containerColor,
            border: `${t.borderWidth} solid ${t.borderColor}`,
            borderRadius: t.radiusMd,
            boxShadow: t.shadowRaised,
          }}
        >
          <Button withBackground={false} renderIcon={<IconNoteLine />} onClick={makeNote}>
            Make note
          </Button>
        </div>
      )}

      <NotebookPanel
        open={panelOpen}
        item={item}
        notes={itemNotes}
        draft={draft}
        onClose={() => {
          setPanelOpen(false)
          setDraft(null)
        }}
        onStartPageNote={() => setDraft({ itemId: item.id })}
        onSaveDraft={(text) => {
          api.add(item.id, text, draft?.quote)
          setDraft(null)
        }}
        onCancelDraft={() => setDraft(null)}
        onUpdate={api.update}
        onRemove={api.remove}
      />
    </DesktopWrapper>
  )
}

