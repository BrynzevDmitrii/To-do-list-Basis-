import { clone } from '~/utils/clone'

export function useUndoableState<T>(initial: T) {
  const state = ref(clone(initial)) as Ref<T>
  const history = ref([clone(initial)]) as Ref<T[]>
  const pointer = ref(0)

  function commit() {
    history.value = history.value.slice(0, pointer.value + 1)
    history.value.push(clone(state.value))
    pointer.value = history.value.length - 1
  }

  function undo() {
    if (pointer.value === 0) return
    const snapshot = history.value[pointer.value - 1]
    if (!snapshot) return
    pointer.value -= 1
    state.value = clone(snapshot)
  }

  function redo() {
    if (pointer.value >= history.value.length - 1) return
    const snapshot = history.value[pointer.value + 1]
    if (!snapshot) return
    pointer.value += 1
    state.value = clone(snapshot)
  }

  function reset(newInitial: T) {
    state.value = clone(newInitial)
    history.value = [clone(newInitial)]
    pointer.value = 0
  }

  const canUndo = computed(() => pointer.value > 0)
  const canRedo = computed(() => pointer.value < history.value.length - 1)

  return { state, commit, undo, redo, reset, canUndo, canRedo }
}
