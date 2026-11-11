import { CloseButton, Heading, Text, Tray } from '@instructure/ui/v11_7'
import StatusPill from './StatusPill'
import { TODO_GROUPS, groupTodo, tagOf } from './reviewCopyData'
import type { TodoItem } from './rolloverData'
import { useSurfaceTokens } from './appTheme'

// The to-do list so far. It is the same list as on the summary page after the copy, without the details column, and it
// grows and shrinks as the educator makes choices. In Light and Dark it is a utility panel of the wrapper: it sits
// beside the content and pushes it, like the notifications panel. Legacy has no panels, so it is a tray there.

export const todoTitle = (todo: TodoItem[]) => `To-do list (${todo.length})`
export const TODO_DESCRIPTION = 'What is left for you to do by hand. It changes as you make choices.'

export function TodoList({ todo }: { todo: TodoItem[] }) {
  const t = useSurfaceTokens()
  if (todo.length === 0) return <Text>Nothing to do so far.</Text>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.xl }}>
      {TODO_GROUPS.map((g) => {
        const items = todo.filter((x) => x.group === g)
        if (items.length === 0) return null
        return (
          <section key={g} aria-label={g} style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
            <Heading level="h3" variant="titleCardRegular">
              {g} ({items.length})
            </Heading>
            {/* Rows like a table, but a plain list: a line between the rows, no bullets, no indent. */}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderBlockStart: `${t.borderWidth} solid ${t.borderColor}` }}>
              {/* An item with more than one problem is one entry: its problems, then where it is, once. */}
              {groupTodo(items).map((grp, i) => (
                <li key={i} style={{ padding: `${t.space.sm} 0`, borderBlockEnd: `${t.borderWidth} solid ${t.borderColor}` }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
                    {grp.entries.map((x, n) => (
                      <div key={n}>
                        {tagOf(x) && <div style={{ marginBottom: t.space.xs }}><StatusPill size="xs" color={tagOf(x)!.tone}>{tagOf(x)!.tag}</StatusPill></div>}
                        <Text as="div">{x.title}</Text>
                        {/* Entries about one part of the course share the line below. The others say what to do themselves. */}
                        {!grp.content && x.detail && <Text as="div" size="small" color="secondary">{x.detail}</Text>}
                      </div>
                    ))}
                  </div>
                  {grp.content && <Text as="div" size="small" color="secondary">{grp.content}</Text>}
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

// Legacy only.
export default function TodoTray({ open, todo, onClose }: { open: boolean; todo: TodoItem[]; onClose: () => void }) {
  const t = useSurfaceTokens()
  return (
    <Tray label="To-do list" open={open} onDismiss={onClose} placement="end" size="small" shouldCloseOnDocumentClick>
      <div style={{ padding: t.space.lg, display: 'flex', flexDirection: 'column', gap: t.space.md }}>
        <div style={{ position: 'relative', paddingInlineEnd: '2.5rem' }}>
          <CloseButton placement="end" offset="none" onClick={onClose} screenReaderLabel="Close the to-do list" />
          <Heading level="h2" variant="titleSection">{todoTitle(todo)}</Heading>
          <Text color="secondary">{TODO_DESCRIPTION}</Text>
        </div>
        <TodoList todo={todo} />
      </div>
    </Tray>
  )
}
