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
  Modal,
  CloseButton,
  Heading,
  Tabs,
  Text,
  Tooltip,
  View,
} from '@instructure/ui/v11_7'
import { CONTENT_TYPES, CURRENT_MODULES, MODULE_ENTRIES, ORIGIN, PREVIEW_KINDS, PREVIEW_NOTE } from './courseContentData'
import { TYPE_ICON, countPicked, keys, pulledInBy, withPulledIn } from './contentHelpers'
import type { CopyMode, Picked, Scope } from './contentHelpers'
import type { ContentType, ModuleEntry } from './courseContentData'
import { currentMeta } from './dateNote'
import { RULE_LABEL, findingsOf } from './reviewData'
import FigmaAlert from './FigmaAlert'
import RadioWithContent from './RadioWithContent'
import SegmentedControl from './SegmentedControl'
import StatusPill from './StatusPill'
import { THEMES, useAppThemeKey, useSurfaceTokens } from './appTheme'

const MODULES = CONTENT_TYPES.find((c) => c.id === 'modules')!.items
// The list to tick from: the single things (no list under them) first, then the rest, each part in alphabetical order.
// One description for both views of the step 2 preview. It does not change with the choices.
const PREVIEW_DESCRIPTION = `The course as it will look after the copy. ${PREVIEW_NOTE}`

const SORTED_TYPES = [...CONTENT_TYPES].sort((a, b) => Number(a.items.length > 0) - Number(b.items.length > 0) || a.label.localeCompare(b.label))

// Step 2 of the copy wizard: content to copy. Two cards to choose from: the whole course, or part of it.
// "Part of it" opens a list of learning objects to tick. Whenever modules are copied, a preview shows how the course looks.

// An item of the preview, as the window that opens when it is clicked shows it.
// `noBody` is for items with no preview (quizzes and question banks): their window shows only what was found.
export type PreviewItem = { title: string; kind: string; meta?: string; where: string; origin: string; itemId?: string; noBody?: boolean; leftOut?: boolean }

// Only these can be opened from the preview, and they open view only, the way a student sees them.
// Quizzes and question banks have no preview.
const PREVIEW_TYPES = new Set(['pages', 'assignments', 'files', 'rubrics', 'discussions', 'announcements', 'outcomes', 'events', 'settings', 'syllabus'])

// The facts of an item from its line in the module, like "Oct 7 | 15 pts | Submit".
const factsOf = (meta?: string) => {
  const parts = (meta ?? '').split(' | ')
  return {
    due: parts.find((p) => /^[A-Z][a-z]{2} \d/.test(p)),
    points: parts.find((p) => /pts/.test(p)),
    how: parts.find((p) => /Submit|Score/.test(p)),
  }
}

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

      {item.kind === 'Rubric' && (
        <div style={frame}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.xl }}>
            {fact('Points', '20 pts')}
            {fact('Criteria', '3')}
            {fact('Used by', 'Assignment 3: Reflection')}
          </div>
          {[
            { name: 'Evidence', text: 'Uses specific moments from the course to support each point.', levels: ['Full marks 8 pts', 'Partial 5 pts', 'No marks 0 pts'] },
            { name: 'Reflection', text: 'Explains what changed in your thinking and why.', levels: ['Full marks 8 pts', 'Partial 5 pts', 'No marks 0 pts'] },
            { name: 'Clarity', text: 'Writing is clear, organized and the right length.', levels: ['Full marks 4 pts', 'Partial 2 pts', 'No marks 0 pts'] },
          ].map((c) => (
            <div key={c.name} style={{ border: `${t.borderWidth} solid ${t.borderColor}`, borderRadius: t.radiusMd, overflow: 'hidden' }}>
              <div style={{ padding: t.space.md, background: t.pageColor }}>
                <Text as="div" weight="bold">{c.name}</Text>
                <Text as="div" size="small" color="secondary">{c.text}</Text>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                {c.levels.map((l) => (
                  <div key={l} style={{ padding: t.space.md, borderInlineStart: `${t.borderWidth} solid ${t.borderColor}` }}>
                    <Text size="small">{l}</Text>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {item.kind === 'Discussion' && (
        <div style={frame}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.xl }}>
            {fact('Type', item.title.includes('Week 3') ? 'Group discussion' : 'Discussion')}
            {fact('Replies', 'Students reply once, then to a classmate')}
          </div>
          <Text as="div">Share a short post about what stood out to you in this week's reading, then reply to at least one classmate. Keep your posts to a few sentences.</Text>
          <div style={{ border: `${t.borderWidth} solid ${t.borderColor}`, borderRadius: t.radiusMd, padding: t.space.md }}>
            <Text as="div" weight="bold">Maria Okafor</Text>
            <Text as="div" size="small" color="secondary">Posted Sep 2</Text>
            <Text as="div">I found the second reading easier to follow than the first. Did anyone else?</Text>
          </div>
        </div>
      )}

      {item.kind === 'Announcement' && (
        <div style={frame}>
          <Text as="div" size="small" color="secondary">Posted by your instructor</Text>
          <Text as="div">Welcome to the course. Please read the syllabus before our first session and bring your questions. Office hours are every Tuesday, online and in person.</Text>
          <Text as="div">See you soon.</Text>
        </div>
      )}

      {item.kind === 'Outcome' && (
        <div style={frame}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.xl }}>
            {fact('Mastery at', '3 pts')}
            {fact('Scale', 'Exceeds, Meets, Near, Below')}
          </div>
          <Text as="div">Students can show this outcome in their work. It is scored on the rubric of the assignments that are aligned to it.</Text>
          {[['Exceeds expectations', '4 pts'], ['Meets expectations', '3 pts'], ['Near expectations', '2 pts'], ['Below expectations', '1 pt']].map(([label, pts], n) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: t.space.md, borderTop: n ? `${t.borderWidth} solid ${t.borderColor}` : undefined }}>
              <Text>{label}</Text>
              <Text color="secondary">{pts}</Text>
            </div>
          ))}
        </div>
      )}

      {item.kind === 'Calendar event' && (
        <div style={frame}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.xl }}>
            {fact('Where', 'Room 214 and online')}
            {fact('Repeats', 'Does not repeat')}
          </div>
          <Text as="div">A session for the whole class. The date is set in the dates step.</Text>
        </div>
      )}

      {item.kind === 'Course Settings' && (
        <div style={frame}>
          {[
            ['Course name', 'Creative Writing Workshop'],
            ['Course code', 'ENG 240'],
            ['Term', 'Fall 2026'],
            ['Language', 'English'],
            ['Time zone', 'Eastern Time (US and Canada)'],
            ['Visibility', 'Only people in the course'],
            ['Grading scheme', 'Letter grades, A to F'],
            ['Late policy', '10% off for each late day'],
            ['Home page', 'Modules'],
            ['Course navigation', 'Home, Modules, Assignments, Quizzes, Syllabus, Grades'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: 'minmax(8rem, 12rem) 1fr', gap: t.space.md }}>
              <Text color="secondary">{label}</Text>
              <Text weight="bold">{value}</Text>
            </div>
          ))}
          <Text as="div" size="small" color="secondary">The term and the dates are set again in the dates step.</Text>
        </div>
      )}

      {item.kind === 'Syllabus' && (
        <div style={frame}>
          <Heading level="h3" variant="titleSection">Creative Writing Workshop</Heading>
          <Text as="div">A workshop for writing short fiction and essays. Each week you read one text, write a short response and give feedback to a classmate.</Text>
          <Text as="div" weight="bold">How you are graded</Text>
          <ul style={{ margin: 0, paddingInlineStart: '1.25rem', display: 'flex', flexDirection: 'column', gap: t.space.xs }}>
            <li><Text>Reading responses: 30%</Text></li>
            <li><Text>Quizzes: 20%</Text></li>
            <li><Text>Project proposal and reflection: 20%</Text></li>
            <li><Text>Final portfolio: 30%</Text></li>
          </ul>
          <Text as="div" weight="bold">Course schedule</Text>
          <div style={{ border: `${t.borderWidth} solid ${t.borderColor}`, borderRadius: t.radiusMd, overflow: 'hidden' }}>
            {[['Week 1', 'Reading and responses'], ['Week 2', 'Project proposal'], ['Week 3', 'Reflection and review']].map(([w, topic], n) => (
              <div key={w} style={{ display: 'grid', gridTemplateColumns: '6rem 1fr', gap: t.space.md, padding: t.space.md, borderTop: n ? `${t.borderWidth} solid ${t.borderColor}` : undefined }}>
                <Text weight="bold">{w}</Text>
                <Text>{topic}</Text>
              </div>
            ))}
          </div>
          <Text as="div" weight="bold">Where to find help</Text>
          <Text as="div">Ask in the course discussion first. Office hours are every Tuesday, online and in person.</Text>
        </div>
      )}
    </div>
  )
}

// What the check found on the item, above its preview: a pill and what needs to be fixed, for each finding.
export function ItemProblems({ itemId }: { itemId?: string }) {
  const t = useSurfaceTokens()
  const found = findingsOf(itemId)
  if (found.length === 0) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.md, marginBlockEnd: t.space.lg }}>
      <Text as="div" weight="bold">What needs to be fixed</Text>
      {found.map((f, n) => (
        <div key={n} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: t.space.sm }}>
          <StatusPill size="sm" color={f.rule.severity === 'critical' ? 'error' : 'warning'}>{RULE_LABEL[f.rule.id] ?? f.rule.title}</StatusPill>
          <Text>{f.detail}</Text>
        </div>
      ))}
    </div>
  )
}

// In the previews from step 3 on, an item with findings has a link at the end of its row: the number of findings. It opens
// the same window as the item, which lists them above the preview. An item with no preview opens a window with only the findings.
function FindingsLink({ itemId, onOpen }: { itemId: string; onOpen: () => void }) {
  const n = findingsOf(itemId).length
  if (n === 0) return null
  return (
    <span onClick={(e) => e.stopPropagation()} style={{ flex: '0 0 auto' }}>
      <Text weight="normal"><Link as="button" variant="inline" size="small" themeOverride={{ fontWeight: 400 }} onClick={onOpen}>{`${n} ${n === 1 ? 'finding' : 'findings'}`}</Link></Text>
    </span>
  )
}

// The window of an item. It opens from the previews and from the to-do list, so the problems show wherever it opens.
export function ItemPreviewModal({ item, onClose }: { item: PreviewItem | null; onClose: () => void }) {
  return (
    <Modal open={!!item} onDismiss={onClose} size="large" label={item ? `Preview of ${item.title}` : 'Preview'}>
      <Modal.Header>
        <CloseButton placement="end" offset="small" onClick={onClose} screenReaderLabel="Close" />
        <Heading variant="titleSection" level="h2">{item?.title}</Heading>
      </Modal.Header>
      <Modal.Body>
        {item && <ItemProblems itemId={item.itemId} />}
        {item && !item.noBody && <ItemPreviewBody item={item} />}
      </Modal.Body>
    </Modal>
  )
}

// The name of one item of each type, for the preview window.
const TYPE_NAME: Record<string, string> = { assignments: 'Assignment', quizzes: 'Quiz', banks: 'Question bank', discussions: 'Discussion', pages: 'Page', announcements: 'Announcement', rubrics: 'Rubric', settings: 'Course Settings', syllabus: 'Syllabus', outcomes: 'Outcome', files: 'File', events: 'Calendar event' }

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
  // Legacy is flat: the sections stand apart by white space, not by cards.
  const legacy = useAppThemeKey() === 'legacy'
  const sectionGap = legacy ? t.space.xxl : t.space.xl
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
  // With the whole course, every learning object is copied.
  const wholeCount = allKeys.filter((k) => !k.startsWith('modules:')).length

  const comingModules = scope === 'whole' ? MODULES : MODULES.filter((m) => picked[m.id])
  const keepCurrent = scope === 'part' && mode === 'merge'
  // Two ways to look at the same copy, as secondary tabs inside the card: by module, or by learning object. The list under the card follows the tab.
  const viewSelect = (
    <Tabs variant="secondary" onRequestTabChange={(_e, { index }) => setPreviewTab(index)}>
      <Tabs.Panel id="view-modules" renderTitle="Modules" variant="secondary" isSelected={previewTab === 0} padding="0">{null}</Tabs.Panel>
      <Tabs.Panel id="view-objects" renderTitle="Learning objects" variant="secondary" isSelected={previewTab === 1} padding="0">{null}</Tabs.Panel>
    </Tabs>
  )

  // One card: radio buttons pick the whole course or part of it, and what belongs to that choice shows under it.
  const partText = SORTED_TYPES.map((c) => c.label).join(', ') + '.'
  const scopeCard = (
    <div
      style={{
        boxSizing: 'border-box',
        padding: legacy ? 0 : t.space.lg,
        borderRadius: legacy ? undefined : t.radiusCardMd,
        background: legacy ? undefined : t.containerColor,
        boxShadow: legacy ? undefined : t.shadowResting,
        display: 'flex',
        flexDirection: 'column',
        gap: t.space.md,
      }}
    >
      <Text weight="bold" size="large">Content to copy</Text>
      <RadioWithContent
        name="content-scope"
        legend="Copy"
        value={scope ?? ''}
        onChange={(value) => setScope(value as Scope)}
        choices={[
          {
            value: 'whole',
            label: 'The whole course',
            content: (
              <>
                <Text as="div" color="secondary">{`${wholeCount} ${wholeCount === 1 ? 'item' : 'items'} will be copied.`}</Text>
                <FigmaAlert variant="warning" type="inline">
                  Copying the whole course replaces the content copied here before. Content you added yourself stays in the course.
                </FigmaAlert>
              </>
            ),
          },
          {
            value: 'part',
            label: 'Part of it',
            content: (
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
            ),
          },
        ]}
      />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>
      {scopeCard}

      {/* The list to tick from and the preview of the course sit side by side. On a narrow page they stack. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: sectionGap }}>
      {scope === 'part' && (
        <div style={{ flex: '1 1 24rem', minWidth: 0, display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
          <div
            style={{
              background: legacy ? undefined : t.containerColor,
              borderRadius: legacy ? undefined : t.radiusCardMd,
              boxShadow: legacy ? undefined : t.shadowResting,
              padding: legacy ? 0 : t.space.lg,
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

// The colors of the origin of an item. "This copy" uses the InstUI inverse pair (background.inverse with text.inverse: dark slate with
// white text in Light, light grey with near black text in Dark). On a module bar its pill swaps the two so it stands out. "Earlier copy" is
// link blue with white text and "In course" is the light grey. The module bars and the pills of the learning objects use the same colors.
function useThisCopyColors() {
  const themeKey = useAppThemeKey()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nt = (THEMES[themeKey] as any).newTheme
  const semantic = nt.semantics(nt.primitives)
  const bar = semantic.color.background.inverse as string
  const text = semantic.color.text.inverse as string
  return { bar, text, pill: { background: text, text: bar } }
}

// The same copy, listed by learning object instead of by module. Each type is a group. Every row says where it comes from.
export function ObjectsPreview({ scope, picked, keepCurrent, description = '', headerExtra, bare = false, showFindings = false, leftOut, noteFor, onOpenItem }: { scope: Scope; picked: Picked; keepCurrent: boolean; description?: string; headerExtra?: ReactNode; bare?: boolean; showFindings?: boolean; leftOut?: (itemId: string) => boolean; noteFor?: (itemId: string) => ReactNode; onOpenItem?: (item: PreviewItem) => void }) {
  const t = useSurfaceTokens()
  const legacy = useAppThemeKey() === 'legacy'
  const thisCopy = useThisCopyColors()
  const groups = SORTED_TYPES.filter((type) => type.id !== 'modules').map((type) => {
    const coming = (type.items.length ? type.items : [{ id: type.id, label: type.label }])
      .filter((i) => scope === 'whole' || picked[i.id])
      .map((i) => ({ id: i.id, label: i.label, origin: ORIGIN.incoming }))
    const existing = CURRENT_MODULES
      .filter((m) => keepCurrent || m.source === 'manual')
      .flatMap((m) => m.entries.filter((e) => KIND_TYPE[e.kind] === type.id).map((e) => ({ id: e.itemId, label: e.title, origin: m.source === 'manual' ? ORIGIN.manual : ORIGIN.earlier })))
    return { type, rows: [...existing, ...coming] }
  }).filter((g) => g.rows.length > 0)
  // Where an item sits: the module that holds it, or nowhere when it is copied on its own.
  const openRow = (type: ContentType, r: { id: string; label: string; origin: string }) => {
    const module = [...CURRENT_MODULES.map((m) => ({ id: m.id, label: m.label, entries: m.entries })), ...MODULES.map((m) => ({ id: m.id, label: m.label, entries: MODULE_ENTRIES[m.id] ?? [] }))].find((m) => m.entries.some((e) => e.itemId === r.id))
    onOpenItem?.({ itemId: r.id, title: r.label, kind: TYPE_NAME[type.id] ?? type.label, where: module?.label ?? 'Not in a module', origin: r.origin, noBody: !PREVIEW_TYPES.has(type.id), leftOut: leftOut?.(r.id) })
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
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: t.space.sm }}>
                <Text as="div">{onOpenItem && PREVIEW_TYPES.has(type.id) ? <Link as="button" onClick={() => openRow(type, r)}>{r.label}</Link> : r.label}</Text>
                <StatusPill
                  size="xs"
                  color={r.origin === ORIGIN.earlier ? 'info' : 'neutral'}
                  colors={r.origin === ORIGIN.incoming ? { ...thisCopy.pill, border: thisCopy.bar } : undefined}
                >
                  {r.origin}
                </StatusPill>
              </span>
              {showFindings && onOpenItem && <FindingsLink itemId={r.id} onOpen={() => openRow(type, r)} />}
              {noteFor?.(r.id)}
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}

// How the course looks with the modules that are copied: grey module bars with their items under them.
export function CoursePreview({
  moduleIds, keepCurrent, highlightNew, hidden, hiddenItems, noteFor, metaFor, title, titleSize = 'large', description, headerExtra, bare = false, showFindings = false, leftOut, onOpenItem,
}: {
  moduleIds: string[]
  keepCurrent: boolean
  highlightNew: boolean
  // Modules left out because the educator kept only one of two similar modules.
  hidden?: Set<string>
  // Items left out of the copy are not shown, and an item can carry a note (like an AI fix).
  hiddenItems?: Set<string>
  noteFor?: (itemId: string) => ReactNode
  // Changes the line under an item, like showing the new dates instead of the old one.
  metaFor?: (itemId: string, meta: string) => ReactNode
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
  // From step 3 on: an item with findings gets a link with their number, which opens its window.
  showFindings?: boolean
  leftOut?: (itemId: string) => boolean
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
  const thisCopy = useThisCopyColors()
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
        {description ?? <>{moduleIds.length} of {MODULES.length} modules will be copied.{onOpenItem ? ` ${PREVIEW_NOTE}` : ''}</>}
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
                  // New modules get the inverse bar, modules from an earlier copy the blue bar, modules in the course the grey one.
                  ...(m.isNew && highlightNew
                    ? { background: thisCopy.bar, color: thisCopy.text }
                    : !m.isNew && m.source !== 'manual'
                      ? { background: t.linkColor, color: t.onColor }
                      : { background: legacy ? 'transparent' : t.pageColor, color: t.textColor }),
                }}
              >
                <span aria-hidden="true" style={{ display: 'inline-flex' }}>
                  {closed[m.id] ? <IconArrowOpenEndSolid /> : <IconArrowOpenDownSolid />}
                </span>
                <Text weight="bold" color={(m.isNew && highlightNew) || (!m.isNew && m.source !== 'manual') ? 'inherit' : undefined}>{m.label}</Text>
                {/* Each module says where it comes from, as a pill next to its name. On the blue bar the pill is white. */}
                <StatusPill size="xs" color="neutral" colors={m.isNew && highlightNew ? thisCopy.pill : !m.isNew && m.source !== 'manual' ? { background: t.onColor, text: t.linkColor } : undefined}>
                  {m.isNew ? ORIGIN.incoming : m.source === 'manual' ? ORIGIN.manual : ORIGIN.earlier}
                </StatusPill>
                <span style={{ flex: 1 }} />
              </button>
            </View>
            {!closed[m.id] && m.entries.filter((e) => !hiddenItems?.has(e.itemId)).map((e) => (
              <div
                key={e.itemId}
                onClick={onOpenItem && PREVIEW_KINDS.has(KIND_NAME[e.kind]) ? () => onOpenItem({ itemId: e.itemId, title: e.title, kind: KIND_NAME[e.kind], meta: e.meta, where: m.label, origin: m.isNew ? ORIGIN.incoming : m.source === 'manual' ? ORIGIN.manual : ORIGIN.earlier, leftOut: leftOut?.(e.itemId) }) : undefined}
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
                    {onOpenItem && PREVIEW_KINDS.has(KIND_NAME[e.kind]) ? <Link as="button" onClick={() => onOpenItem({ itemId: e.itemId, title: e.title, kind: KIND_NAME[e.kind], meta: e.meta, where: m.label, origin: m.isNew ? ORIGIN.incoming : m.source === 'manual' ? ORIGIN.manual : ORIGIN.earlier, leftOut: leftOut?.(e.itemId) })}>{e.title}</Link> : e.title}
                  </Text>
                  <Text as="div" size="small" color="secondary">{metaFor ? metaFor(e.itemId, e.meta) : e.itemId.startsWith('current:') ? currentMeta(e.meta) : e.meta}</Text>
                </span>
                {showFindings && onOpenItem && (
                  <FindingsLink
                    itemId={e.itemId}
                    onOpen={() => onOpenItem({ itemId: e.itemId, title: e.title, kind: KIND_NAME[e.kind], meta: e.meta, where: m.label, origin: m.isNew ? ORIGIN.incoming : m.source === 'manual' ? ORIGIN.manual : ORIGIN.earlier, noBody: !PREVIEW_KINDS.has(KIND_NAME[e.kind]), leftOut: leftOut?.(e.itemId) })}
                  />
                )}
                {noteFor?.(e.itemId)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
