import { useState } from 'react'
import {
  Button,
  IconAddLine,
  IconAssignmentLine,
  IconButton,
  IconMoreLine,
  IconPublishSolid,
  IconQuizLine,
  IconSearchLine,
  Link,
  Text,
  TextInput,
} from '@instructure/ui/v11_7'
import DesktopWrapper from './DesktopWrapper'
import { ViewAsStudent } from './ItemActions'
import { NOTEBOOK_COURSE, courseMenu, itemsOf } from './notebookData'
import type { NotesApi } from './useNotes'
import { useAppThemeKey, useSurfaceTokens } from './appTheme'

// The All Assignments page of the course. It is where the Notebook flow starts: choose an assignment
// to open it, then use the Notebook there.

export default function AssignmentsList({
  api,
  onOpen,
  onNavigate,
  onSelectMenu,
}: {
  api: NotesApi
  onOpen: (id: string) => void
  onNavigate: (label: string) => void
  onSelectMenu: (label: string) => void
}) {
  const t = useSurfaceTokens()
  const legacy = useAppThemeKey() === 'legacy'
  const [query, setQuery] = useState('')
  const shown = itemsOf('Assignments').filter((i) => i.title.toLowerCase().includes(query.trim().toLowerCase()))
  const line = `${t.borderWidth} solid ${t.borderColor}`
  return (
    <DesktopWrapper
      pageTitle="Assignments"
      breadcrumb={[NOTEBOOK_COURSE]}
      activeNav="Courses"
      course={courseMenu(NOTEBOOK_COURSE, 'Assignments', onSelectMenu)}
      onNavigate={onNavigate}
      description="Open an assignment to read it and make notes for the next term."
      barActions={legacy ? <ViewAsStudent /> : undefined}
      actions={
        <>
          <Button renderIcon={<IconAddLine />}>Group</Button>
          <Button color="primary" renderIcon={<IconAddLine />}>
            Assignment
          </Button>
          <IconButton screenReaderLabel="More options">
            <IconMoreLine />
          </IconButton>
        </>
      }
      fullWidth
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.xl }}>
        <div style={{ maxWidth: '20rem' }}>
          <TextInput
            renderLabel="Search for assignments"
            placeholder="Search..."
            renderBeforeInput={<IconSearchLine />}
            value={query}
            onChange={(_e, value) => setQuery(value)}
          />
        </div>

        <section aria-label="Assignment Group" style={{ border: line, borderRadius: t.radiusMd, overflow: 'hidden' }}>
          <div style={{ padding: t.space.lg, borderBottom: line, background: t.containerColor }}>
            <Text weight="bold" size="large">
              Assignment Group
            </Text>
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {shown.map((item, index) => {
              const count = api.notes.filter((n) => n.itemId === item.id).length
              return (
                <li
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.space.lg,
                    padding: `${t.space.md} ${t.space.lg}`,
                    borderTop: index === 0 ? undefined : line,
                  }}
                >
                  <span style={{ display: 'flex', fontSize: t.space.xl }}>
                    {item.area === 'Quizzes' ? <IconQuizLine color="success" /> : <IconAssignmentLine color="success" />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <Link
                      href="#"
                      variant="standalone"
                      onClick={(e: { preventDefault: () => void }) => {
                        e.preventDefault()
                        onOpen(item.id)
                      }}
                    >
                      <Text weight="bold">{item.title}</Text>
                    </Link>
                    <Text size="small" color="secondary">
                      {item.details?.points} pts, due {item.details?.due}
                      {count > 0 && `, ${count} ${count === 1 ? 'note' : 'notes'}`}
                    </Text>
                  </div>
                  <span style={{ display: 'flex', fontSize: t.space.xl }}>
                    <IconPublishSolid color="success" />
                  </span>
                  <IconButton screenReaderLabel={`More options for ${item.title}`} withBackground={false} withBorder={false}>
                    <IconMoreLine />
                  </IconButton>
                </li>
              )
            })}
          </ul>
          {shown.length === 0 && (
            <div style={{ padding: t.space.lg }}>
              <Text color="secondary">No assignments match your search.</Text>
            </div>
          )}
        </section>
      </div>
    </DesktopWrapper>
  )
}
