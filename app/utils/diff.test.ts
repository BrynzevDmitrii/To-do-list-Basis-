import { describe, expect, it } from 'vitest'
import { diff, applyPatch } from './diff'
import type { JsonValue } from '~/types/types'

describe('diff / applyPatch', () => {
  it('returns "same" for identical values', () => {
    expect(diff('a', 'a')).toEqual({ type: 'same' })
    expect(diff({ a: 1 }, { a: 1 })).toEqual({ type: 'same' })
  })

  it('diffs primitives as a full "set"', () => {
    const patch = diff('a', 'b')
    expect(patch).toEqual({ type: 'set', value: 'b' })
  })

  it('diffs an object to only include the changed key', () => {
    const before = { title: 'A', count: 1 }
    const after = { title: 'A', count: 2 }

    const patch = diff(before, after)

    expect(patch).toEqual({ type: 'object', changes: { count: { type: 'set', value: 2 } } })
  })

  it('round-trips an object field change via applyPatch', () => {
    const before = { title: 'A', count: 1 }
    const after = { title: 'A', count: 2 }

    const patch = diff(before, after)
    const result = applyPatch(before as JsonValue, patch)

    expect(result).toEqual(after)
  })

  it('diffs an array item change to only that index', () => {
    const before = [{ id: '1', done: false }, { id: '2', done: false }]
    const after = [{ id: '1', done: true }, { id: '2', done: false }]

    const patch = diff(before, after)

    expect(patch).toEqual({
      type: 'array',
      length: 2,
      changes: { 0: { type: 'object', changes: { done: { type: 'set', value: true } } } }
    })
  })

  it('round-trips an array item change via applyPatch', () => {
    const before = [{ id: '1', done: false }, { id: '2', done: false }]
    const after = [{ id: '1', done: true }, { id: '2', done: false }]

    const patch = diff(before, after)
    const result = applyPatch(before as JsonValue, patch)

    expect(result).toEqual(after)
  })

  it('round-trips an appended array item', () => {
    const before = [{ id: '1' }]
    const after = [{ id: '1' }, { id: '2' }]

    const patch = diff(before, after)
    const result = applyPatch(before as JsonValue, patch)

    expect(result).toEqual(after)
  })

  it('round-trips a removed array item', () => {
    const before = [{ id: '1' }, { id: '2' }]
    const after = [{ id: '1' }]

    const patch = diff(before, after)
    const result = applyPatch(before as JsonValue, patch)

    expect(result).toEqual(after)
  })

  it('round-trips reversibly: diff(after, before) undoes diff(before, after)', () => {
    const before = { title: 'A', todos: [{ id: '1', text: 'x', done: false }] }
    const after = { title: 'B', todos: [{ id: '1', text: 'x', done: true }, { id: '2', text: '', done: false }] }

    const redoPatch = diff(before, after)
    const undoPatch = diff(after, before)

    expect(applyPatch(before as JsonValue, redoPatch)).toEqual(after)
    expect(applyPatch(after as JsonValue, undoPatch)).toEqual(before)
  })

  it('produces a patch far smaller than the full object for a single-field change', () => {
    const bigTodos = Array.from({ length: 100 }, (_, i) => ({ id: `id-${i}`, text: `todo ${i}`, done: false }))
    const before = { title: 'Shopping list', todos: bigTodos }
    const after = { title: 'Shopping list', todos: bigTodos.map((t, i) => (i === 0 ? { ...t, done: true } : t)) }

    const patch = diff(before, after)

    expect(JSON.stringify(patch).length).toBeLessThan(JSON.stringify(after).length / 10)
  })
})
