import { computed, ref } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'
import { useNoteDraft } from './useNoteDraft'

beforeEach(() => {
  window.localStorage.clear()
})

function makeDraft(overrides: { title?: string; todos?: { id: string; text: string; done: boolean }[] } = {}) {
  return { title: overrides.title ?? '', todos: overrides.todos ?? [] }
}

describe('useNoteDraft', () => {
  it('load() sets the baseline and no pending draft when storage is empty', () => {
    const id = computed(() => 'note-1')
    const draft = useNoteDraft(id)

    draft.load(makeDraft({ title: 'Hello' }))

    expect(draft.currentList.value).toEqual({ title: 'Hello', todos: [] })
    expect(draft.pendingDraft.value).toBeNull()
    expect(draft.hasChanges.value).toBe(false)
  })

  it('commit() persists a safety-net draft once there are changes', () => {
    const id = computed(() => 'note-1')
    const draft = useNoteDraft(id)
    draft.load(makeDraft({ title: 'Original' }))

    draft.currentList.value.title = 'Changed'
    draft.commit()

    expect(window.localStorage.getItem('draft:note-1')).not.toBeNull()
    expect(draft.hasChanges.value).toBe(true)
  })

  it('commit() clears the draft once the value matches the baseline again', () => {
    const id = computed(() => 'note-1')
    const draft = useNoteDraft(id)
    draft.load(makeDraft({ title: 'Original' }))

    draft.currentList.value.title = 'Changed'
    draft.commit()
    draft.currentList.value.title = 'Original'
    draft.commit()

    expect(window.localStorage.getItem('draft:note-1')).toBeNull()
  })

  it('a fresh load() detects a leftover draft that differs from the baseline', () => {
    const id = computed(() => 'note-1')

    const first = useNoteDraft(id)
    first.load(makeDraft({ title: 'Original' }))
    first.currentList.value.title = 'Unsaved edit'
    first.commit()

    // Simulate reopening the page: a new composable instance, same id.
    const second = useNoteDraft(id)
    second.load(makeDraft({ title: 'Original' }))

    expect(second.pendingDraft.value).toEqual({ title: 'Unsaved edit', todos: [] })
  })

  it('restoreDraft() applies the pending draft as the current value', () => {
    const id = computed(() => 'note-1')
    const first = useNoteDraft(id)
    first.load(makeDraft({ title: 'Original' }))
    first.currentList.value.title = 'Unsaved edit'
    first.commit()

    const second = useNoteDraft(id)
    second.load(makeDraft({ title: 'Original' }))
    second.restoreDraft()

    expect(second.currentList.value.title).toBe('Unsaved edit')
    expect(second.pendingDraft.value).toBeNull()
  })

  it('discardDraft() clears both the prompt and the stored draft', () => {
    const id = computed(() => 'note-1')
    const first = useNoteDraft(id)
    first.load(makeDraft({ title: 'Original' }))
    first.currentList.value.title = 'Unsaved edit'
    first.commit()

    const second = useNoteDraft(id)
    second.load(makeDraft({ title: 'Original' }))
    second.discardDraft()

    expect(second.pendingDraft.value).toBeNull()
    expect(window.localStorage.getItem('draft:note-1')).toBeNull()
  })

  it('commitSave() sets a new baseline, resets undo history, and clears the draft', () => {
    const id = computed(() => 'note-1')
    const draft = useNoteDraft(id)
    draft.load(makeDraft({ title: 'Original' }))
    draft.currentList.value.title = 'Edited'
    draft.commit()

    draft.commitSave({ title: 'Edited', todos: [] })

    expect(draft.hasChanges.value).toBe(false)
    expect(draft.canUndo.value).toBe(false)
    expect(window.localStorage.getItem('draft:note-1')).toBeNull()
  })

  it('discardChanges() reverts to the baseline and clears the draft', () => {
    const id = computed(() => 'note-1')
    const draft = useNoteDraft(id)
    draft.load(makeDraft({ title: 'Original' }))
    draft.currentList.value.title = 'Edited'
    draft.commit()

    draft.discardChanges()

    expect(draft.currentList.value.title).toBe('Original')
    expect(draft.hasChanges.value).toBe(false)
    expect(window.localStorage.getItem('draft:note-1')).toBeNull()
  })

  it('keeps drafts for different ids independent, tracking id reactively', () => {
    const currentId = ref('note-1')
    const id = computed(() => currentId.value)
    const draft = useNoteDraft(id)

    draft.load(makeDraft({ title: 'First note' }))
    draft.currentList.value.title = 'Edited first'
    draft.commit()

    currentId.value = 'note-2'
    draft.load(makeDraft({ title: 'Second note' }))
    draft.currentList.value.title = 'Edited second'
    draft.commit()

    expect(JSON.parse(window.localStorage.getItem('draft:note-1') ?? '{}').title).toBe('Edited first')
    expect(JSON.parse(window.localStorage.getItem('draft:note-2') ?? '{}').title).toBe('Edited second')
  })
})
