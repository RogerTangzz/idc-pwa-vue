import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useOrderStore } from '../src/stores/useOrderStore'

// Test that new orders record createdAt in local time

describe('useOrderStore', () => {
  let store: ReturnType<typeof useOrderStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    const storage: Record<string, string> = {}
    ;(globalThis as any).localStorage = {
      getItem: (key: string) => (key in storage ? storage[key] : null),
      setItem: (key: string, value: string) => { storage[key] = value },
      removeItem: (key: string) => { delete storage[key] },
      clear: () => { Object.keys(storage).forEach(k => delete storage[k]) },
      key: (index: number) => Object.keys(storage)[index] || null,
      get length() { return Object.keys(storage).length }
    } as Storage
    store = useOrderStore()
    vi.useFakeTimers().setSystemTime(new Date('2025-05-01T12:34:56Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('records createdAt as local time', () => {
    store.add({ title: 'order', priority: '中', reporter: 'alice', status: '新建' })
    const expected = new Date().toLocaleString()
    expect(store.list[0].createdAt).toBe(expected)
  })
})
