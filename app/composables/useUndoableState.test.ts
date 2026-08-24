import { describe, expect, it } from 'vitest'
import { useUndoableState } from './useUndoableState'

interface Draft {
  title: string
  count: number
}

describe('useUndoableState', () => {
  it('starts with the initial value and no history to undo/redo', () => {
    const { currentList, canUndo, canRedo } = useUndoableState<Draft>({ title: '', count: 0 })

    expect(currentList.value).toEqual({ title: '', count: 0 })
    expect(canUndo.value).toBe(false)
    expect(canRedo.value).toBe(false)
  })

  it('commit() records a new history step and enables undo', () => {
    const { currentList, commit, canUndo } = useUndoableState<Draft>({ title: '', count: 0 })

    currentList.value.count = 1
    commit()

    expect(canUndo.value).toBe(true)
  })

  it('undo() reverts to the previous committed snapshot', () => {
    const { currentList, commit, undo } = useUndoableState<Draft>({ title: '', count: 0 })

    currentList.value.count = 1
    commit()
    currentList.value.count = 2
    commit()

    undo()

    expect(currentList.value.count).toBe(1)
  })

  it('undo() is a no-op when already at the earliest step', () => {
    const { currentList, undo, canUndo } = useUndoableState<Draft>({ title: '', count: 0 })

    undo()

    expect(canUndo.value).toBe(false)
    expect(currentList.value.count).toBe(0)
  })

  it('redo() re-applies a step that was undone', () => {
    const { currentList, commit, undo, redo } = useUndoableState<Draft>({ title: '', count: 0 })

    currentList.value.count = 1
    commit()
    undo()
    redo()

    expect(currentList.value.count).toBe(1)
  })

  it('redo() is a no-op when already at the latest step', () => {
    const { currentList, redo, canRedo } = useUndoableState<Draft>({ title: '', count: 0 })

    redo()

    expect(canRedo.value).toBe(false)
    expect(currentList.value.count).toBe(0)
  })

  it('a new commit() after undo() discards the redo branch', () => {
    const { currentList, commit, undo, redo, canRedo } = useUndoableState<Draft>({ title: '', count: 0 })

    currentList.value.count = 1
    commit()
    currentList.value.count = 2
    commit()

    undo() // back to count = 1, redo branch holds count = 2

    currentList.value.count = 99
    commit() // should discard the count = 2 branch

    expect(canRedo.value).toBe(false)

    redo() // no-op, nothing to redo
    expect(currentList.value.count).toBe(99)
  })

  it('reset() replaces the value and clears all history', () => {
    const { currentList, commit, reset, canUndo, canRedo } = useUndoableState<Draft>({ title: '', count: 0 })

    currentList.value.count = 1
    commit()
    currentList.value.count = 2
    commit()

    reset({ title: 'fresh', count: 42 })

    expect(currentList.value).toEqual({ title: 'fresh', count: 42 })
    expect(canUndo.value).toBe(false)
    expect(canRedo.value).toBe(false)
  })

  it('mutating the returned currentList does not retroactively change past history snapshots', () => {
    const { currentList, commit, undo } = useUndoableState<Draft>({ title: '', count: 0 })

    currentList.value.count = 1
    commit()

    // Mutate after commit without committing again
    currentList.value.count = 999

    undo()

    // Undo should restore the committed snapshot (0), not be affected by the later mutation
    expect(currentList.value.count).toBe(0)
  })
})
