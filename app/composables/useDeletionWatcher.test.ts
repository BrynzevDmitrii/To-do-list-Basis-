import { computed, nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDeletionWatcher } from './useDeletionWatcher'
import { useNotesStore } from '~/stores/notes'
import { useToastStore } from '~/stores/toast'

beforeEach(() => {
  window.localStorage.clear()
  setActivePinia(createPinia())
})

describe('useDeletionWatcher', () => {
  it('starts with notFound false', () => {
    const id = computed(() => 'note-1')
    const isNew = computed(() => false)
    const isReady = ref(true)

    const watcher = useDeletionWatcher(id, isNew, isReady)

    expect(watcher.notFound.value).toBe(false)
  })

  it('markNotFound() sets notFound', () => {
    const id = computed(() => 'note-1')
    const isNew = computed(() => false)
    const isReady = ref(true)

    const watcher = useDeletionWatcher(id, isNew, isReady)
    watcher.markNotFound()

    expect(watcher.notFound.value).toBe(true)
  })

  it('reacts when the note is removed from the store by someone else', async () => {
    const notesStore = useNotesStore()
    notesStore.save({ id: 'note-1', title: 'A', todos: [], updatedAt: 1 })

    const id = computed(() => 'note-1')
    const isNew = computed(() => false)
    const isReady = ref(true)
    const watcher = useDeletionWatcher(id, isNew, isReady)

    notesStore.remove('note-1')
    await nextTick()

    expect(watcher.notFound.value).toBe(true)
  })

  it('shows a toast when the note disappears externally', async () => {
    const notesStore = useNotesStore()
    notesStore.save({ id: 'note-1', title: 'A', todos: [], updatedAt: 1 })

    const id = computed(() => 'note-1')
    const isNew = computed(() => false)
    const isReady = ref(true)
    useDeletionWatcher(id, isNew, isReady)

    notesStore.remove('note-1')
    await nextTick()

    const toastStore = useToastStore()
    expect(toastStore.toasts).toHaveLength(1)
    expect(toastStore.toasts[0]?.type).toBe('error')
  })

  it('does not flag notFound for its own delete after markSelfDelete()', async () => {
    const notesStore = useNotesStore()
    notesStore.save({ id: 'note-1', title: 'A', todos: [], updatedAt: 1 })

    const id = computed(() => 'note-1')
    const isNew = computed(() => false)
    const isReady = ref(true)
    const watcher = useDeletionWatcher(id, isNew, isReady)

    watcher.markSelfDelete()
    notesStore.remove('note-1')
    await nextTick()

    expect(watcher.notFound.value).toBe(false)
  })

  it('ignores store changes while not ready yet', async () => {
    const notesStore = useNotesStore()
    notesStore.save({ id: 'note-1', title: 'A', todos: [], updatedAt: 1 })

    const id = computed(() => 'note-1')
    const isNew = computed(() => false)
    const isReady = ref(false)
    const watcher = useDeletionWatcher(id, isNew, isReady)

    notesStore.remove('note-1')
    await nextTick()

    expect(watcher.notFound.value).toBe(false)
  })

  it('ignores store changes for a new (unsaved) note', async () => {
    const notesStore = useNotesStore()

    const id = computed(() => 'new')
    const isNew = computed(() => true)
    const isReady = ref(true)
    const watcher = useDeletionWatcher(id, isNew, isReady)

    notesStore.save({ id: 'unrelated', title: 'B', todos: [], updatedAt: 1 })
    notesStore.remove('unrelated')
    await nextTick()

    expect(watcher.notFound.value).toBe(false)
  })
})
