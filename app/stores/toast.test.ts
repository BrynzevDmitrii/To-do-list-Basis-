import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useToastStore } from './toast'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useToastStore', () => {
  it('starts with no toasts', () => {
    const store = useToastStore()

    expect(store.toasts).toEqual([])
  })

  it('show() adds a toast with the given text and default type', () => {
    const store = useToastStore()

    store.show('Saved')

    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0]?.text).toBe('Saved')
    expect(store.toasts[0]?.type).toBe('success')
  })

  it('show() accepts an explicit type', () => {
    const store = useToastStore()

    store.show('Something broke', 'error')

    expect(store.toasts[0]?.type).toBe('error')
  })

  it('remove() removes only the targeted toast', () => {
    const store = useToastStore()
    store.show('First')
    store.show('Second')
    const [first, second] = store.toasts

    store.remove(first!.id)

    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0]?.id).toBe(second!.id)
  })

  it('auto-dismisses a toast after its duration elapses', () => {
    const store = useToastStore()

    store.show('Temporary', 'success', 1000)
    expect(store.toasts).toHaveLength(1)

    vi.advanceTimersByTime(1000)

    expect(store.toasts).toHaveLength(0)
  })
})
