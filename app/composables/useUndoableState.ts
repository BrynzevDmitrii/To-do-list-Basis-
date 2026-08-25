import { ref, computed, type Ref } from 'vue'
import { clone } from '~/utils/clone'
import { diff, applyPatch } from '~/utils/diff'
import type { HistoryStep, JsonValue } from '~/types/types'

const MAX_HISTORY_STEPS = 50

export function useUndoableState<T>(initial: T) {
  const currentList = ref(clone(initial)) as Ref<T>
  const steps = ref<HistoryStep[]>([]) as Ref<HistoryStep[]>
  const pointer = ref(0)
  let lastCommitted = clone(initial) as T

  function commit() {
    const before = lastCommitted
    const after = clone(currentList.value) as T

    const redoPatch = diff(before as unknown as JsonValue, after as unknown as JsonValue)
    if (redoPatch.type === 'same') return

    const undoPatch = diff(after as unknown as JsonValue, before as unknown as JsonValue)

    steps.value = steps.value.slice(0, pointer.value)
    steps.value.push({ undo: undoPatch, redo: redoPatch })
    pointer.value = steps.value.length

    if (steps.value.length > MAX_HISTORY_STEPS) {
      steps.value.shift()
      pointer.value -= 1
    }

    lastCommitted = after
  }

  function undo() {
    if (pointer.value === 0) return
    const step = steps.value[pointer.value - 1]
    if (!step) return

    currentList.value = applyPatch(lastCommitted as unknown as JsonValue, step.undo) as T
    lastCommitted = clone(currentList.value) as T
    pointer.value -= 1
  }

  function redo() {
    if (pointer.value >= steps.value.length) return
    const step = steps.value[pointer.value]
    if (!step) return

    currentList.value = applyPatch(lastCommitted as unknown as JsonValue, step.redo) as T
    lastCommitted = clone(currentList.value) as T
    pointer.value += 1
  }

  function reset(newInitial: T) {
    currentList.value = clone(newInitial)
    lastCommitted = clone(newInitial) as T
    steps.value = []
    pointer.value = 0
  }

  const canUndo = computed(() => pointer.value > 0)
  const canRedo = computed(() => pointer.value < steps.value.length)

  return { currentList, commit, undo, redo, reset, canUndo, canRedo }
}
