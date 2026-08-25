import { ref, computed, type ComputedRef } from 'vue'
import { useUndoableState } from './useUndoableState'
import { useDraft } from './useDraft'
import type { NoteDraft } from '~/types/types'

export function useNoteDraft(id: ComputedRef<string>) {
  const { currentList, commit, undo, redo, reset, canUndo, canRedo } = useUndoableState<NoteDraft>({
    title: '',
    todos: []
  })

  const draftStorage = computed(() => useDraft<NoteDraft>(id.value))

  const originalDraft = ref<NoteDraft>({ title: '', todos: [] })
  const pendingDraft = ref<NoteDraft | null>(null)

  const hasChanges = computed(() => JSON.stringify(currentList.value) !== JSON.stringify(originalDraft.value))

  function persistDraft() {
    if (hasChanges.value) draftStorage.value.write(currentList.value)
    else draftStorage.value.clear()
  }

  function commitAndSaveDraft() {
    commit()
    persistDraft()
  }

  function undoAndSaveDraft() {
    undo()
    persistDraft()
  }

  function redoAndSaveDraft() {
    redo()
    persistDraft()
  }

  /** Sets the baseline (loaded note, or the empty default for a new one) and
   *  checks for a leftover draft from before an accidental reload. */
  function load(baseline: NoteDraft) {
    originalDraft.value = baseline
    reset(baseline)

    const draft = draftStorage.value.read()
    if (draft && JSON.stringify(draft) !== JSON.stringify(currentList.value)) {
      pendingDraft.value = draft
    }
  }

  function restoreDraft() {
    if (pendingDraft.value) reset(pendingDraft.value)
    pendingDraft.value = null
  }

  function discardDraft() {
    pendingDraft.value = null
    draftStorage.value.clear()
  }

  /** After a successful save: the saved note becomes the new baseline, undo/redo
   *  history resets, and the safety-net draft is no longer needed. */
  function commitSave(saved: NoteDraft) {
    originalDraft.value = saved
    reset(saved)
    draftStorage.value.clear()
  }

  /** On cancel/leave: revert to the last known baseline and drop the draft. */
  function discardChanges() {
    reset(originalDraft.value)
    draftStorage.value.clear()
  }

  return {
    currentList,
    canUndo,
    canRedo,
    hasChanges,
    pendingDraft,
    commit: commitAndSaveDraft,
    undo: undoAndSaveDraft,
    redo: redoAndSaveDraft,
    load,
    restoreDraft,
    discardDraft,
    commitSave,
    discardChanges
  }
}
