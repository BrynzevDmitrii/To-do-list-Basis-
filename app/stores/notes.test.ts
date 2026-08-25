import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useNotesStore } from './notes'
import type { Note } from '~/types/types'

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: overrides.id ?? 'id-1',
    title: overrides.title ?? 'Title',
    todos: overrides.todos ?? [],
    updatedAt: overrides.updatedAt ?? 1000
  }
}

beforeEach(() => {
  window.localStorage.clear()
  setActivePinia(createPinia())
})

describe('useNotesStore', () => {
  it('starts empty when storage is empty', () => {
    const store = useNotesStore()

    expect(store.sortedList).toEqual([])
  })

  it('loads existing notes from localStorage on creation', () => {
    window.localStorage.setItem('notes', JSON.stringify([makeNote({ id: 'a' })]))

    const store = useNotesStore()

    expect(store.sortedList).toHaveLength(1)
    expect(store.getById('a')?.id).toBe('a')
  })

  it('save() adds a new note that can be found by getById()', () => {
    const store = useNotesStore()
    const note = makeNote({ id: 'a' })

    store.save(note)

    expect(store.getById('a')).toEqual(note)
  })

  it('save() persists to localStorage tagged with the schema version', () => {
    const store = useNotesStore()
    store.save(makeNote({ id: 'a' }))

    const raw = window.localStorage.getItem('notes')
    const persisted = JSON.parse(raw ?? '{}') as { version: number; notes: Note[] }

    expect(persisted.version).toBe(1)
    expect(persisted.notes).toHaveLength(1)
    expect(persisted.notes[0]?.id).toBe('a')
  })

  it('still reads legacy data stored as a bare array with no version wrapper', () => {
    window.localStorage.setItem('notes', JSON.stringify([makeNote({ id: 'legacy' })]))

    const store = useNotesStore()

    expect(store.getById('legacy')?.id).toBe('legacy')
  })

  it('starts empty when the stored schema version is unrecognized', () => {
    window.localStorage.setItem('notes', JSON.stringify({ version: 999, notes: [makeNote({ id: 'a' })] }))

    const store = useNotesStore()

    expect(store.sortedList).toEqual([])
  })

  it('save() updates an existing note in place instead of duplicating it', () => {
    const store = useNotesStore()
    store.save(makeNote({ id: 'a', title: 'Original', updatedAt: 1 }))
    store.save(makeNote({ id: 'a', title: 'Updated', updatedAt: 2 }))

    expect(store.sortedList).toHaveLength(1)
    expect(store.getById('a')?.title).toBe('Updated')
  })

  it('sortedList orders notes by updatedAt descending', () => {
    const store = useNotesStore()
    store.save(makeNote({ id: 'old', updatedAt: 1 }))
    store.save(makeNote({ id: 'new', updatedAt: 2 }))
    store.save(makeNote({ id: 'newest', updatedAt: 3 }))

    expect(store.sortedList.map((note) => note.id)).toEqual(['newest', 'new', 'old'])
  })

  it('getById() returns undefined for an id that does not exist', () => {
    const store = useNotesStore()

    expect(store.getById('missing')).toBeUndefined()
  })

  it('remove() deletes only the targeted note', () => {
    const store = useNotesStore()
    store.save(makeNote({ id: 'a' }))
    store.save(makeNote({ id: 'b' }))

    store.remove('a')

    expect(store.sortedList.map((note) => note.id)).toEqual(['b'])
  })

  it('remove() persists the deletion to localStorage', () => {
    const store = useNotesStore()
    store.save(makeNote({ id: 'a' }))
    store.remove('a')

    const raw = window.localStorage.getItem('notes')
    const persisted = JSON.parse(raw ?? '{}') as { notes: Note[] }
    expect(persisted.notes).toEqual([])
  })

  it('gracefully starts empty when localStorage contains invalid JSON', () => {
    window.localStorage.setItem('notes', '{not valid json')

    const store = useNotesStore()

    expect(store.sortedList).toEqual([])
  })

  it('picks up changes written by another tab via the storage event', () => {
    const store = useNotesStore()
    store.save(makeNote({ id: 'a' }))

    // Simulate another tab deleting note "a" and writing the result back to localStorage.
    window.localStorage.setItem('notes', JSON.stringify({ version: 1, notes: [] }))
    window.dispatchEvent(new StorageEvent('storage', { key: 'notes' }))

    expect(store.getById('a')).toBeUndefined()
  })

  it('ignores storage events for unrelated keys', () => {
    const store = useNotesStore()
    store.save(makeNote({ id: 'a' }))

    window.dispatchEvent(new StorageEvent('storage', { key: 'something-else' }))

    expect(store.getById('a')).toBeDefined()
  })
})
