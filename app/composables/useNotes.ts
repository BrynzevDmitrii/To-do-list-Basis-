import type { Note } from '~/types/types'
const STORAGE_KEY = 'notes'

function readAll(): Note[] {
  try {
    const notes = window.localStorage.getItem(STORAGE_KEY)
    return notes ? (JSON.parse(notes) as Note[]) : []
  } catch {
    return []
  }
}

function writeAll(notes: Note[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export function useNotes() {
  function sortedlist(): Note[] {
    return readAll().sort((a, b) => b.updatedAt - a.updatedAt)
  }

  function getById(id: string): Note | undefined {
    return readAll().find((note) => note.id === id)
  }

  function save(note: Note) {
    const notes = readAll()
    const index = notes.findIndex((n) => n.id === note.id)
    if (index === -1) notes.push(note)
    else notes[index] = note
    writeAll(notes)
  }

  function remove(id: string) {
    writeAll(readAll().filter((note) => note.id !== id))
  }

  return { sortedlist, getById, save, remove }
}
