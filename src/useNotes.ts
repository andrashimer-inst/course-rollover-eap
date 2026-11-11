import { useCallback, useMemo, useState } from 'react'
import { SEED_NOTES, suggestDecision } from './notebookData'
import type { Note } from './notebookData'

// The educator's notes, kept for the whole prototype so the page screens, the Notebook page and the
// copy wizard all see the same list.
export type NotesApi = {
  notes: Note[]
  add: (itemId: string, text: string, quote?: string) => void
  update: (id: string, text: string) => void
  remove: (id: string) => void
}

export function useNotes(): NotesApi {
  const [notes, setNotes] = useState<Note[]>(SEED_NOTES)
  const add = useCallback((itemId: string, text: string, quote?: string) => {
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    setNotes((all) => [
      ...all,
      { id: `n${Date.now()}`, itemId, quote, text, author: 'You, Instructor', date, decision: suggestDecision(text) },
    ])
  }, [])
  const update = useCallback((id: string, text: string) => {
    setNotes((all) => all.map((n) => (n.id === id ? { ...n, text, decision: suggestDecision(text) } : n)))
  }, [])
  const remove = useCallback((id: string) => setNotes((all) => all.filter((n) => n.id !== id)), [])
  return useMemo(() => ({ notes, add, update, remove }), [notes, add, update, remove])
}
