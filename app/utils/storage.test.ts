import { beforeEach, describe, expect, it } from 'vitest'
import { readJson, writeJson, removeItem } from './storage'

interface Payload {
  count: number
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('readJson / writeJson / removeItem', () => {
  it('readJson() returns null when the key is missing', () => {
    expect(readJson<Payload>('missing')).toBeNull()
  })

  it('writeJson() then readJson() round-trips the value', () => {
    writeJson('key', { count: 5 })

    expect(readJson<Payload>('key')).toEqual({ count: 5 })
  })

  it('readJson() gracefully returns null for invalid JSON', () => {
    window.localStorage.setItem('key', '{not valid json')

    expect(readJson<Payload>('key')).toBeNull()
  })

  it('removeItem() deletes the stored value', () => {
    writeJson('key', { count: 5 })

    removeItem('key')

    expect(readJson<Payload>('key')).toBeNull()
  })
})
