import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Checkbox,
  IconArrowOpenDownSolid,
  IconArrowOpenEndSolid,
  IconAssignmentLine,
  IconButton,
  IconDiscussionLine,
  IconDocumentLine,
  IconFolderLine,
  IconQuizLine,
  Link,
  RadioInput,
  Modal,
  CloseButton,
  Heading,
  SimpleSelect,
  Text,
  Tooltip,
  View,
} from '@instructure/ui/v11_7'
import { CONTENT_TYPES, CURRENT_MODULES, MODULE_ENTRIES } from './courseContentData'
import { TYPE_ICON, countPicked, keys, pulledInBy, withPulledIn } from './contentHelpers'
import type { CopyMode, Picked, Scope } from './contentHelpers'
import type { ContentType, ModuleEntry } from './courseContentData'
import FigmaAlert from './FigmaAlert'
import SegmentedControl from './SegmentedControl'
import StatusPill from './StatusPill'
import { useAppThemeKey, useSurfaceTokens } from './appTheme'

const MODULES = CONTENT_TYPES.find((c) => c.id === 'modules')!.items
// The list to tick from: the single things (no list under them) first, then the rest, each part in alphabetical order.
// One description for both views of the step 2 preview. It does not change with the choices.
const PREVIEW_DESCRIPTION = 'The course as it will look after the copy.'

const SORTED_TYPES = [...CONTENT_TYPES].sort((a, b) => Number(a.items.length > 0) - Number(b.items.length > 0) || a.label.localeCompare(b.label))

// Step 2 of the copy wizard: content to copy. Two cards to choose from: the whole course, or part of it.
// "Part of it" opens a list of learning objects to tick. Whenever modules are copied, a preview shows how the course looks.

// An item of the preview, as the window that opens when it is clicked shows it.
export type PreviewItem = { title: string; kind: string; meta?: string; where: string; origin: string }

// Only these can be opened from the preview, and they open view only, the way a student sees them.
export const PREVIEW_KINDS = new Set(['Page', 'Assignment', 'Quiz', 'File'])
const PREVIEW_TYPES = new Set(['pages', 'assignments', 'quizzes', 'files'])

// The facts of an item from its line in the module, like "Oct 7 | 15 pts | Submit".
const factsOf = (meta?: string) => {
  const parts = (meta ?? '').split(' | ')
  return {
    due: parts.find((p) => /^[A-Z][a-z]{2} \d/.test(p)),
    points: parts.find((p) => /pts/.test(p)),
    how: parts.find((p) => /Submit|Score/.test(p)),
  }
}

const QUESTIONS = [
  { text: 'Which source is a primary source for this period?', options: ['A diary written at the time', 'A textbook published last year', 'A film made in 1990', 'A website summary'] },
  { text: 'What is the main reason the event changed the region?', options: ['Trade routes moved', 'The climate changed', 'A new language spread', 'The borders did not change'] },
  { text: 'Which claim does the evidence in the reading support best?', options: ['The first claim', 'The second claim', 'Neither claim', 'Both claims'] },
]

// The item as it looks in the course, read only. There is nothing to edit or submit. It is used in the window of step 2
// and inside the course preview of step 3.
export function ItemPreviewBody({ item }: { item: PreviewItem }) {
  const t = useSurfaceTokens()
  const facts = factsOf(item.meta)
  const frame = { border: `${t.borderWidth} solid ${t.borderColor}`, borderRadius: t.radiusMd, padding: t.space.lg, display: 'flex', flexDirection: 'column' as const, gap: t.space.lg }
  const fact = (label: string, value?: string) =>
    value ? (
      <div>
        <Text as="div" size="small" color="secondary">{label}</Text>
        <Text as="div" weight="bold">{value}</Text>
      </div>
    ) : null
  const isVideo = /\.mp4$/i.test(item.title)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
      {item.kind === 'Assignment' && (
        <div style={frame}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.xl }}>
            {fact('Due', facts.due ? `${facts.due} at 11:59 PM` : 'Set in the dates step')}
            {fact('Points', facts.points ?? '10 pts')}
            {fact('Submitting', facts.how === 'Submit' || !facts.how ? 'A file upload' : facts.how)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.md }}>
            <Text as="div">For this assignment, each student works alone to research a topic and communicate the findings in a short written response.</Text>
            <Text as="div">The main objectives are to communicate clear and accurate information in an engaging manner for an audience of your peers.</Text>
            <Text as="div" weight="bold">Notes:</Text>
            <ul style={{ margin: 0, paddingInlineStart: '1.25rem', display: 'flex', flexDirection: 'column', gap: t.space.xs }}>
              <li><Text>The work is graded on accuracy, rigor, clarity and how well it engages the reader.</Text></li>
              <li><Text>Length is not graded. Say what you need to say and stop.</Text></li>
              <li><Text>Late work loses 10% a day.</Text></li>
            </ul>
            <Text as="div">Good luck!</Text>
          </div>
        </div>
      )}

      {item.kind === 'Page' && (
        <div style={frame}>
          <Heading level="h3" variant="titleSection">{item.title}</Heading>
          <Text as="div">
            The following sections are the plan for the first weeks of the course. You may{' '}
            <Link as="button" onClick={() => {}}>sign up for a study group</Link>. Your group edits this page to add details for each heading.
          </Text>
          <Text as="div">The first section is completed as an example. Be sure that you give the text of each item, and then describe it clearly and briefly, with a reference for your information.</Text>
          <Text as="div" weight="bold">Where to find help</Text>
          <Text as="div">Ask in the course discussion first. Office hours are every Tuesday, online and in person.</Text>
        </div>
      )}

      {item.kind === 'Quiz' && (
        <div style={frame}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.xl }}>
            {fact('Points', facts.points ?? '8 pts')}
            {fact('Due', facts.due ? `${facts.due} at 11:59 PM` : undefined)}
            {fact('Time limit', '30 minutes')}
            {fact('Attempts', '1')}
          </div>
          <div>
            <Text as="div" weight="bold">Instructions</Text>
            <Text as="div">Please answer the following questions about the reading. You can leave and come back until you submit.</Text>
          </div>
          {QUESTIONS.map((q, n) => (
            <div key={q.text} style={{ border: `${t.borderWidth} solid ${t.borderColor}`, borderRadius: t.radiusMd, overflow: 'hidden' }}>
              <div style={{ padding: t.space.md, background: t.pageColor, display: 'flex', justifyContent: 'space-between' }}>
                <Text weight="bold">Question {n + 1}</Text>
                <Text color="secondary">2 pts</Text>
              </div>
              <div style={{ padding: t.space.md, display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
                <Text as="div">{q.text}</Text>
                {q.options.map((o) => (
                  <RadioInput key={o} name={`q${n}`} value={o} label={o} disabled checked={false} onChange={() => {}} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {item.kind === 'File' && (
        <div style={frame}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space.md }}>
            <span style={{ display: 'inline-flex' }}><IconFolderLine /></span>
            <div>
              <Text as="div" weight="bold">{item.title}</Text>
              <Text as="div" size="small" color="secondary">{isVideo ? 'Video · 4 min · 48 MB' : /\.pdf$/i.test(item.title) ? 'PDF · 6 pages · 1.2 MB' : 'Document · 340 KB'}</Text>
            </div>
          </div>
          {isVideo ? (
            <div style={{ background: t.pageColor, borderRadius: t.radiusMd, aspectRatio: '16 / 9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: t.space.sm }}>
              <Text size="x-large">▶</Text>
              <Text color="secondary">Video preview</Text>
            </div>
          ) : (
            <div style={{ background: t.pageColor, borderRadius: t.radiusMd, padding: t.space.lg, display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: t.containerColor, boxShadow: t.shadowResting, width: '22rem', maxWidth: '100%', aspectRatio: '8.5 / 11', padding: t.space.xl, display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
                <Text weight="bold" size="large">{item.title.replace(/\.[a-z0-9]+$/i, '')}</Text>
                {[100, 92, 96, 70, 100, 88, 94, 60].map((w, n) => (
                  <div key={n} style={{ height: '0.5rem', width: `${w}%`, background: t.borderColor, borderRadius: '0.25rem' }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ItemPreviewModal({ item, onClose }: { item: PreviewItem | null; onClose: () => void }) {
  return (
    <Modal open={!!item} onDismiss={onClose} size="large" label={item ? `Preview of ${item.title}` : 'Preview'}>
      <Modal.Header>
        <CloseButton placement="end" offset="small" onClick={onClose} screenReaderLabel="Close" />
        <Heading variant="titleSection" level="h2">{item?.title}</Heading>
      </Modal.Header>
      <Modal.Body>{item && <ItemPreviewBody item={item} />}</Modal.Body>
    </Modal>
  )
}

// The name of one item of each type, for the preview window.
const TYPE_NAME: Record<string, string> = { assignments: 'Assignment', quizzes: 'Quiz', banks: 'Question bank', discussions: 'Discussion', pages: 'Page', announcements: 'Announcement', rubrics: 'Rubric', outcomes: 'Outcome', files: 'File', events: 'Calendar event' }

const KIND_NAME: Record<ModuleEntry['kind'], string> = { assignment: 'Assignment', quiz: 'Quiz', page: 'Page', discussion: 'Discussion', file: 'File' }

const KIND_ICON: Record<ModuleEntry['kind'], ReactNode> = {
  assignment: <IconAssignmentLine />,
  quiz: <IconQuizLine />,
  page: <IconDocumentLine />,
  discussion: <IconDiscussionLine />,
  file: <IconFolderLine />,
}


export default function ContentStep({
  scope, setScope, picked: chosen, setPicked, mode, setMode, hidden,
}: {
  scope: Scope | null
  setScope: (s: Scope) => void
  picked: Picked
  setPicked: (p: Picked) => void
  mode: CopyMode
  setMode: (m: CopyMode) => void
  hidden?: Set<string>
}) {
  const t = useSurfaceTokens()
  // The item of the preview that was clicked. It opens in a window.
  const [openItem, setOpenItem] = useState<PreviewItem | null>(null)
  // `chosen` is what was ticked. `picked` adds the learning objects that come with a ticked module.
  const picked = withPulledIn(chosen)
  const pulled = pulledInBy(chosen)
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [previewTab, setPreviewTab] = useState(0)

  const setKeys = (ks: string[], on: boolean) => setPicked({ ...chosen, ...Object.fromEntries(ks.map((k) => [k, on])) })
  const allKeys = CONTENT_TYPES.flatMap(keys)
  const allCount = allKeys.filter((k) => picked[k]).length
  const itemCount = allKeys.filter((k) => picked[k] && !k.startsWith('modules:')).length

  const comingModules = scope === 'whole' ? MODULES : MODULES.filter((m) => picked[m.id])
  const keepCurrent = scope === 'part' && mode === 'merge'
  const viewSelect = (
    <SimpleSelect
      renderLabel={<Text weight="bold">View</Text>}
      value={String(previewTab)}
      onChange={(_e, { value }) => setPreviewTab(Number(value))}
    >
      <SimpleSelect.Option id="view-modules" value="0">Modules</SimpleSelect.Option>
      <SimpleSelect.Option id="view-objects" value="1">Learning objects</SimpleSelect.Option>
    </SimpleSelect>
  )

  // One card: a dropdown picks the whole course or part of it, and what belongs to that choice shows under it.
  const partText = SORTED_TYPES.map((c) => c.label).join(', ') + '.'
  const scopeCard = (
    <div
      style={{
        boxSizing: 'border-box',
        padding: t.space.lg,
        borderRadius: t.radiusCardMd,
        background: t.containerColor,
        boxShadow: t.shadowResting,
        display: 'flex',
        flexDirection: 'column',
        gap: t.space.md,
      }}
    >
      <Text weight="bold" size="large">Content to copy</Text>
      <SimpleSelect
        renderLabel={<Text weight="bold">Copy</Text>}
        placeholder="Choose what to copy"
        value={scope ?? ''}
        onChange={(_e, { value }) => setScope(value as Scope)}
      >
        <SimpleSelect.Option id="scope-whole" value="whole">The whole course</SimpleSelect.Option>
        <SimpleSelect.Option id="scope-part" value="part">Part of it</SimpleSelect.Option>
      </SimpleSelect>
      {scope === 'whole' && (
        <>
          <Text as="div" color="secondary">{`${MODULES.length} modules and all learning objects.`}</Text>
          <FigmaAlert variant="warning" type="inline">
            Copying the whole course replaces the content copied here before. Content you added yourself stays in the course.
          </FigmaAlert>
        </>
      )}
      {scope === 'part' && (
        <>
          <Text as="div" color="secondary">{partText}</Text>
          <div>
            <SegmentedControl
              label="How should it be copied?"
              value={mode}
              onChange={(v) => setMode(v as CopyMode)}
              options={[
                { value: 'merge', label: 'Add to the current content' },
                { value: 'replace', label: 'Replace the copied content' },
              ]}
            />
            <div style={{ marginTop: t.space.sm }}>
              <Text as="div" size="small" color="secondary">
                {mode === 'replace'
                  ? 'Replaces what an earlier copy added. Content you added yourself stays.'
                  : 'Keeps everything that is in the course now, including earlier copies.'}
              </Text>
            </div>
          </div>
        </>
      )}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.xl }}>
      {scopeCard}

      {/* The list to tick from and the preview of the course sit side by side. On a narrow page they stack. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: t.space.xl }}>
      {scope === 'part' && (
        <div style={{ flex: '1 1 24rem', minWidth: 0, display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
          <div
            style={{
              background: t.containerColor,
              borderRadius: t.radiusCardMd,
              boxShadow: t.shadowResting,
              padding: t.space.lg,
            }}
          >
            <div style={{ marginBottom: t.space.md, display: 'flex', flexDirection: 'column', gap: t.space.xs }}>
              <Text weight="bold" size="large">Choose the learning objects to copy</Text>
              {/* The same count as the first card in step 3: modules hold items, so they are not counted themselves. */}
              <Text as="div" color="secondary" aria-live="polite">{itemCount} {itemCount === 1 ? 'item' : 'items'} in the copy</Text>
            </div>
            <Checkbox
              label="Select all"
              checked={allCount === allKeys.length}
              indeterminate={allCount > 0 && allCount < allKeys.length}
              onChange={() => setKeys(allKeys, allCount < allKeys.length)}
            />
            {SORTED_TYPES.map((type) => {
              const ks = keys(type)
              const n = countPicked(type, picked)
              const expanded = !!open[type.id]
              return (
                <div key={type.id} style={{ borderTop: `${t.borderWidth} solid ${t.borderColor}`, marginTop: t.space.sm, paddingTop: t.space.sm }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: t.space.sm }}>
                    <span style={{ width: '2rem', flexShrink: 0 }}>
                      {type.items.length > 0 && (
                        <IconButton
                          size="small"
                          withBackground={false}
                          withBorder={false}
                          screenReaderLabel={`${expanded ? 'Hide' : 'Show'} ${type.label}`}
                          aria-expanded={expanded}
                          onClick={() => setOpen({ ...open, [type.id]: !expanded })}
                        >
                          {expanded ? <IconArrowOpenDownSolid /> : <IconArrowOpenEndSolid />}
                        </IconButton>
                      )}
                    </span>
                    <Checkbox
                      label={
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: t.space.sm }}>
                          {TYPE_ICON[type.id]}
                          {type.label}
                          {type.items.length > 0 && ` (${type.items.length})`}
                        </span>
                      }
                      checked={n === ks.length}
                      indeterminate={n > 0 && n < ks.length}
                      onChange={() => setKeys(ks, n < ks.length)}
                    />
                  </div>
                  {expanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm, padding: `${t.space.sm} 0 ${t.space.sm} 4.5rem` }}>
                      {type.items.map((item) => {
                        const from = pulled[item.id]
                        const box = (
                          <Checkbox
                            label={<span style={{ display: 'inline-flex', alignItems: 'center', gap: t.space.sm }}>{TYPE_ICON[type.id]}{item.label}</span>}
                            checked={!!picked[item.id]}
                            disabled={!!from}
                            onChange={() => setKeys([item.id], !picked[item.id])}
                          />
                        )
                        // A disabled box gets no hover, so the tooltip sits on a wrapper that can also take focus.
                        return from ? (
                          <Tooltip
                            key={item.id}
                            renderTip={`Part of ${from.map((n) => `“${n}”`).join(' and ')}, so it is copied with the module. To leave it out, untick the module.`}
                            placement="top start"
                          >
                            <span tabIndex={0} style={{ display: 'inline-block', width: 'fit-content' }}>{box}</span>
                          </Tooltip>
                        ) : (
                          <div key={item.id}>{box}</div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {scope && (
        <div style={{ flex: '1 1 24rem', minWidth: 0 }}>
          {/* Two ways to look at the same copy, chosen with the dropdown inside the card: by module, or by learning object. */}
          {previewTab === 0 ? (
            <CoursePreview moduleIds={comingModules.map((m) => m.id)} keepCurrent={keepCurrent} highlightNew hidden={hidden} description={PREVIEW_DESCRIPTION} headerExtra={viewSelect} onOpenItem={setOpenItem} />
          ) : (
            <ObjectsPreview scope={scope} picked={picked} keepCurrent={keepCurrent} description={PREVIEW_DESCRIPTION} headerExtra={viewSelect} onOpenItem={setOpenItem} />
          )}
        </div>
      )}
      </div>
      <ItemPreviewModal item={openItem} onClose={() => setOpenItem(null)} />
    </div>
  )
}

const KIND_TYPE: Record<ModuleEntry['kind'], string> = { assignment: 'assignments', quiz: 'quizzes', page: 'pages', discussion: 'discussions', file: 'files' }

// The same copy, listed by learning object instead of by module. Each type is a group. Every row says where it comes from.
export function ObjectsPreview({ scope, picked, keepCurrent, description = '', headerExtra, bare = false, noteFor, onOpenItem }: { scope: Scope; picked: Picked; keepCurrent: boolean; description?: string; headerExtra?: ReactNode; bare?: boolean; noteFor?: (itemId: string) => ReactNode; onOpenItem?: (item: PreviewItem) => void }) {
  const t = useSurfaceTokens()
  const legacy = useAppThemeKey() === 'legacy'
  const groups = SORTED_TYPES.filter((type) => type.id !== 'modules').map((type) => {
    const coming = (type.items.length ? type.items : [{ id: type.id, label: type.label }])
      .filter((i) => scope === 'whole' || picked[i.id])
      .map((i) => ({ id: i.id, label: i.label, origin: 'New' }))
    const existing = CURRENT_MODULES
      .filter((m) => keepCurrent || m.source === 'manual')
      .flatMap((m) => m.entries.filter((e) => KIND_TYPE[e.kind] === type.id).map((e) => ({ id: e.itemId, label: e.title, origin: m.source === 'manual' ? 'Added manually' : 'Copied before' })))
    return { type, rows: [...existing, ...coming] }
  }).filter((g) => g.rows.length > 0)
  // Where an item sits: the module that holds it, or nowhere when it is copied on its own.
  const openRow = (type: ContentType, r: { id: string; label: string; origin: string }) => {
    const module = [...CURRENT_MODULES.map((m) => ({ id: m.id, label: m.label, entries: m.entries })), ...MODULES.map((m) => ({ id: m.id, label: m.label, entries: MODULE_ENTRIES[m.id] ?? [] }))].find((m) => m.entries.some((e) => e.itemId === r.id))
    onOpenItem?.({ title: r.label, kind: TYPE_NAME[type.id] ?? type.label, where: module?.label ?? 'Not in a module', origin: r.origin })
  }
  const heading = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
      <Text as="div" weight="bold" size="large">Preview</Text>
      <Text as="div" color="secondary">
        {description}
      </Text>
      {headerExtra}
    </div>
  )
  return (
    <section
      aria-label="Preview"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: t.space.lg,
        background: legacy || bare ? undefined : t.containerColor,
        borderRadius: legacy || bare ? undefined : t.radiusCardMd,
        boxShadow: legacy || bare ? undefined : t.shadowResting,
        padding: legacy || bare ? undefined : t.space.lg,
      }}
    >
      {!bare && heading}
      {groups.length === 0 && <Text as="p" color="secondary">No learning objects are selected yet.</Text>}
      {groups.map(({ type, rows }) => (
        <div key={type.id} style={{ border: `${t.borderWidth} solid ${t.borderColor}`, borderRadius: legacy ? undefined : t.radiusMd, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space.sm, padding: t.space.md, background: legacy ? 'transparent' : t.pageColor, color: t.textColor }}>
            <span aria-hidden="true" style={{ display: 'inline-flex' }}>{TYPE_ICON[type.id]}</span>
            <Text weight="bold">{type.label}</Text>
            <Text size="small" color="secondary">({rows.length})</Text>
          </div>
          {rows.map((r) => (
            <div
              key={r.id}
              onClick={onOpenItem && PREVIEW_TYPES.has(type.id) ? () => openRow(type, r) : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: t.space.md, padding: t.space.md, borderTop: `${t.borderWidth} solid ${t.borderColor}`, cursor: onOpenItem && PREVIEW_TYPES.has(type.id) ? 'pointer' : undefined }}
            >
              <span style={{ flex: 1, minWidth: 0 }}>
                <Text as="div">{onOpenItem && PREVIEW_TYPES.has(type.id) ? <Link as="button" onClick={() => openRow(type, r)}>{r.label}</Link> : r.label}</Text>
              </span>
              {noteFor?.(r.id)}
              <StatusPill size="xs" color={r.origin === 'New' ? 'info' : 'neutral'}>{r.origin}</StatusPill>
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}

// How the course looks with the modules that are copied: grey module bars with their items under them.
export function CoursePreview({
  moduleIds, keepCurrent, highlightNew, hidden, hiddenItems, noteFor, title, titleSize = 'large', description, headerExtra, bare = false, onOpenItem,
}: {
  moduleIds: string[]
  keepCurrent: boolean
  highlightNew: boolean
  // Modules left out because the educator kept only one of two similar modules.
  hidden?: Set<string>
  // Items left out of the copy are not shown, and an item can carry a note (like an AI fix).
  hiddenItems?: Set<string>
  noteFor?: (itemId: string) => ReactNode
  // `false` leaves the title out and keeps the description.
  title?: string | false
  // The size of the title. Step 2 uses the size of the card title beside it.
  titleSize?: 'medium' | 'large'
  // Replaces the default description (how many modules are copied and what they do to the course).
  description?: ReactNode
  // Something under the description inside the card, like the step 2 view switch.
  headerExtra?: ReactNode
  // No card, title or description: just the modules, for use inside a window.
  bare?: boolean
  // When set, each item can be clicked to look at it.
  onOpenItem?: (item: PreviewItem) => void
}) {
  const t = useSurfaceTokens()
  const legacy = useAppThemeKey() === 'legacy'
  // Each module opens and closes like an accordion. They start open.
  const [closed, setClosed] = useState<Record<string, boolean>>({})
  const toggleModule = (id: string) => setClosed({ ...closed, [id]: !closed[id] })
  // The basic icon color, the same as the text. No green.
  const iconColor = { color: t.textColor }
  const coming = MODULES.filter((m) => moduleIds.includes(m.id)).map((m) => ({ id: m.id, label: m.label, entries: MODULE_ENTRIES[m.id], isNew: true, source: 'new' as string }))
  // Content added by hand always stays. Content from an earlier copy stays only when the new copy is added to it.
  const current = CURRENT_MODULES.filter((m) => keepCurrent || m.source === 'manual').map((m) => ({ ...m, isNew: false }))
  // Names are kept as they are, so two modules can have the same name.
  const list = [...current, ...coming].filter((m) => !hidden?.has(m.id))
  // Card title and description: a small gap between them, like the Card component in Figma.
  const heading = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
      {title !== false && <Text as="div" weight="bold" size={titleSize} id="course-preview">{title ?? 'Preview'}</Text>}
      <Text as="div" color="secondary">
        {description ?? <>{moduleIds.length} of {MODULES.length} modules will be copied.</>}
      </Text>
      {headerExtra}
    </div>
  )
  return (
    <section aria-labelledby={bare ? undefined : 'course-preview'} aria-label={bare ? 'Course preview' : undefined} style={{ display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
      {/* In Light and Dark the title sits inside the card. Legacy has no card, so it stays above the list. */}
      {legacy && !bare && heading}
      <style>{`.module-toggle:focus-visible { outline: 0.125rem solid currentColor; outline-offset: -0.25rem; }`}</style>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: t.space.lg,
          background: legacy || bare ? undefined : t.containerColor,
          borderRadius: legacy || bare ? undefined : t.radiusCardMd,
          boxShadow: legacy || bare ? undefined : t.shadowResting,
          padding: legacy || bare ? undefined : t.space.lg,
        }}
      >
        {!legacy && !bare && heading}
        {list.map((m) => (
          <div
            key={m.id}
            style={{
              border: `${t.borderWidth} solid ${t.borderColor}`,
              borderRadius: legacy ? undefined : t.radiusMd,
              overflow: 'hidden',
            }}
          >
            {/* Modules that are copied get a blue bar. Modules already in the course keep the light grey bar. */}
            {/* Modules that are copied get a blue bar. Modules already in the course keep the light grey bar. */}
            <View as="div" background={legacy && !(m.isNew && highlightNew) ? 'secondary' : undefined}>
              <button
                type="button"
                className="module-toggle"
                aria-expanded={!closed[m.id]}
                onClick={() => toggleModule(m.id)}
                style={{
                  all: 'unset',
                  boxSizing: 'border-box',
                  width: '100%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.space.sm,
                  padding: t.space.md,
                  ...(m.isNew && highlightNew
                    ? { background: t.linkColor, color: t.onColor }
                    : { background: legacy ? 'transparent' : t.pageColor, color: t.textColor }),
                }}
              >
                <span aria-hidden="true" style={{ display: 'inline-flex' }}>
                  {closed[m.id] ? <IconArrowOpenEndSolid /> : <IconArrowOpenDownSolid />}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <Text weight="bold" color={m.isNew && highlightNew ? 'primary-inverse' : undefined}>{m.label}</Text>
                </span>
                {/* Each module says where it comes from: the new copy, an earlier copy, or added by hand. */}
                <Text size="small" color={m.isNew && highlightNew ? 'primary-inverse' : 'secondary'}>
                  {m.isNew ? 'New' : m.source === 'manual' ? 'Added manually' : 'Copied before'}
                </Text>
              </button>
            </View>
            {!closed[m.id] && m.entries.filter((e) => !hiddenItems?.has(e.itemId)).map((e) => (
              <div
                key={e.itemId}
                onClick={onOpenItem && PREVIEW_KINDS.has(KIND_NAME[e.kind]) ? () => onOpenItem({ title: e.title, kind: KIND_NAME[e.kind], meta: e.meta, where: m.label, origin: m.isNew ? 'New' : m.source === 'manual' ? 'Added manually' : 'Copied before' }) : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.space.md,
                  padding: t.space.md,
                  borderTop: `${t.borderWidth} solid ${t.borderColor}`,
                  cursor: onOpenItem && PREVIEW_KINDS.has(KIND_NAME[e.kind]) ? 'pointer' : undefined,
                }}
              >
                <span style={{ ...iconColor, display: 'inline-flex' }}>{KIND_ICON[e.kind]}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <Text as="div" weight="bold">
                    {/* A link, so the item can be opened with the keyboard as well. */}
                    {onOpenItem && PREVIEW_KINDS.has(KIND_NAME[e.kind]) ? <Link as="button" onClick={() => onOpenItem({ title: e.title, kind: KIND_NAME[e.kind], meta: e.meta, where: m.label, origin: m.isNew ? 'New' : m.source === 'manual' ? 'Added manually' : 'Copied before' })}>{e.title}</Link> : e.title}
                  </Text>
                  <Text as="div" size="small" color="secondary">{e.meta}</Text>
                </span>
                {noteFor?.(e.itemId)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
