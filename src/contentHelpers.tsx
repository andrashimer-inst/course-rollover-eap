import type { ReactNode } from 'react'
import {
  IconAnnouncementLine,
  IconAssignmentLine,
  IconCalendarMonthLine,
  IconDiscussionLine,
  IconDocumentLine,
  IconFolderLine,
  IconModuleLine,
  IconOutcomesLine,
  IconQuestionLine,
  IconQuizLine,
  IconRubricLine,
  IconSettingsLine,
  IconSyllabusLine,
} from '@instructure/ui/v11_7'
import { CONTENT_TYPES, MODULE_ENTRIES } from './courseContentData'
import type { ContentType, TypeId } from './courseContentData'

// Shared by the "Select content" step and the loader.

export type Scope = 'whole' | 'part'
// Part of it: replace the current course, or merge into it.
export type CopyMode = 'replace' | 'merge'
export type Picked = Record<string, boolean>

export const TYPE_ICON: Record<TypeId, ReactNode> = {
  settings: <IconSettingsLine />,
  syllabus: <IconSyllabusLine />,
  modules: <IconModuleLine />,
  assignments: <IconAssignmentLine />,
  quizzes: <IconQuizLine />,
  banks: <IconQuestionLine />,
  discussions: <IconDiscussionLine />,
  pages: <IconDocumentLine />,
  announcements: <IconAnnouncementLine />,
  rubrics: <IconRubricLine />,
  outcomes: <IconOutcomesLine />,
  files: <IconFolderLine />,
  events: <IconCalendarMonthLine />,
}
// A single-thing type (settings, syllabus) is picked by its own id, a type with a list by the ids of its items.
export const keys = (type: ContentType) => (type.items.length ? type.items.map((i) => i.id) : [type.id])
export const countPicked = (type: ContentType, picked: Picked) => keys(type).filter((k) => picked[k]).length

// The types that are copied, in list order.
// A learning object that sits in a picked module is copied with it, so it counts as picked and can't be unticked.
// Returns the modules that pull each such item in, by item id.
export const pulledInBy = (picked: Picked): Record<string, string[]> => {
  const by: Record<string, string[]> = {}
  const modules = CONTENT_TYPES.find((c) => c.id === 'modules')!.items
  for (const m of modules) {
    if (!picked[m.id]) continue
    for (const e of MODULE_ENTRIES[m.id] ?? []) (by[e.itemId] ??= []).push(m.label)
  }
  return by
}
export const withPulledIn = (picked: Picked): Picked => ({
  ...picked,
  ...Object.fromEntries(Object.keys(pulledInBy(picked)).map((k) => [k, true])),
})

export const typesComing = (scope: Scope, picked: Picked) => {
  const eff = withPulledIn(picked)
  return CONTENT_TYPES.filter((c) => scope === 'whole' || countPicked(c, eff) > 0)
}

export const nothingPicked = (picked: Picked) => !Object.values(withPulledIn(picked)).some(Boolean)

