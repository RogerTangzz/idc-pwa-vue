import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '../src/stores/useNotificationStore'

describe('useNotificationStore', () => {
  let store: ReturnType<typeof useNotificationStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    const storage: Record<string, string> = {}
    ;(globalThis as any).localStorage = {
      getItem: (key: string) => (key in storage ? storage[key] : null),
      setItem: (key: string, value: string) => {
        storage[key] = value
      },
      removeItem: (key: string) => {
        delete storage[key]
      },
      clear: () => {
        Object.keys(storage).forEach(k => delete storage[k])
      },
      key: (index: number) => Object.keys(storage)[index] || null,
      get length() {
        return Object.keys(storage).length
      }
    } as Storage
    store = useNotificationStore()
  })

  it('adds and confirms notifications', async () => {
    await store.add('hello')
    expect(store.list).toHaveLength(1)
    const id = store.list[0].id
    await store.confirm(id)
    expect(store.list[0].confirmed).toBe(true)
  })

  it('handles errors', async () => {
    await store.confirm(123)
    expect(store.error).toBeTruthy()
  })
})
