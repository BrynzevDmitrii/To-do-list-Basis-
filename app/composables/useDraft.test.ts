import { beforeEach, describe, expect, it } from 'vitest'
import { useDraft } from './useDraft'
import type { Draft } from '~/types/types'



beforeEach(() => {
  window.localStorage.clear()
})

describe('useDraft', () => {
  it('read() returns null when no draft has been written', () => {
    const draft = useDraft<Draft>('note-1')

    expect(draft.read()).toBeNull()
  })

  it('write() then read() round-trips the value', () => {
    const draft = useDraft<Draft>('note-1')

    draft.write({ title: 'Hello', count: 3 })

    expect(draft.read()).toEqual({ title: 'Hello', count: 3 })
  })

  it('keeps drafts for different ids independent', () => {
    const draftA = useDraft<Draft>('note-a')
    const draftB = useDraft<Draft>('note-b')

    draftA.write({ title: 'A', count: 1 })
    draftB.write({ title: 'B', count: 2 })

    expect(draftA.read()).toEqual({ title: 'A', count: 1 })
    expect(draftB.read()).toEqual({ title: 'B', count: 2 })
  })

  it('clear() removes the draft', () => {
    const draft = useDraft<Draft>('note-1')
    draft.write({ title: 'Hello', count: 3 })

    draft.clear()

    expect(draft.read()).toBeNull()
  })

  it('gracefully returns null when stored value is invalid JSON', () => {
    window.localStorage.setItem('draft:note-1', '{not valid json')
    const draft = useDraft<Draft>('note-1')

    expect(draft.read()).toBeNull()
  })
})
