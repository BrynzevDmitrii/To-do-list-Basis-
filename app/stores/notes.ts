import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Note } from '~/types/types'

const STORAGE_KEY = 'notes'

function readFromStorage(): Note[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Note[]) : []
  } catch {
    return []
  }
}

function writeToStorage(notes: Note[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>(readFromStorage())

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
