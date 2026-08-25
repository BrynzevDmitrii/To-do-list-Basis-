import { defineStore } from 'pinia'
import { ref, computed, onScopeDispose } from 'vue'
import { readJson, writeJson } from '~/utils/storage'
import type { Note, PersistedNotes } from '~/types/types'

const STORAGE_KEY = 'notes'
const SCHEMA_VERSION = 1

function readFromStorage(): Note[] {
  const parsed = readJson<PersistedNotes | Note[]>(STORAGE_KEY)
  if (!parsed) return []

  if (Array.isArray(parsed)) return parsed

  if (parsed.version === SCHEMA_VERSION) return parsed.notes

  return []
}

function writeToStorage(notes: Note[]) {
  const payload: PersistedNotes = { version: SCHEMA_VERSION, notes }
  writeJson(STORAGE_KEY, payload)
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>(readFromStorage())

  if (typeof window !== 'undefined') {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) notes.value = readFromStorage()
    }
    window.addEventListener('storage', onStorage)
    onScopeDispose(() => window.removeEventListener('storage', onStorage))
  }

  const sortedList = computed<Note[]>(() => [...notes.value].sort((a, b) => b.updatedAt - a.updatedAt))

  function getById(id: string): Note | undefined {
    return notes.value.find((note) => note.id === id)
  }

  function save(note: Note) {
    const index = notes.value.findIndex((n) => n.id === note.id)
    if (index === -1) notes.value.push(note)
    else notes.value[index] = note
    writeToStorage(notes.value)
  }

  function remove(id: string) {
    notes.value = notes.value.filter((note) => note.id !== id)
    writeToStorage(notes.value)
  }

  return { notes, sortedList, getById, save, remove }
})
