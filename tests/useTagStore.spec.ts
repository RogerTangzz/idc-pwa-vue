import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTagStore } from '../src/stores/useTagStore'

describe('useTagStore', () => {
  let store: ReturnType<typeof useTagStore>

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
    store = useTagStore()
  })

  it('adds a tag', () => {
    store.add({ name: 'network', description: 'net' })
    expect(store.list).toHaveLength(1)
    expect(store.list[0]).toMatchObject({ name: 'network', description: 'net' })
  })

  it('updates a tag', () => {
    store.add({ name: 'old', description: '' })
    const id = store.list[0].id
    store.update(id, { name: 'new' })
    expect(store.list[0]).toMatchObject({ name: 'new' })
  })

  it('removes a tag', () => {
    store.add({ name: 'a', description: '' })
    store.add({ name: 'b', description: '' })
    const id = store.list[0].id
    store.remove(id)
    expect(store.list).toHaveLength(1)
    expect(store.list[0].name).toBe('b')
  })

  it('filters tags by name', () => {
    store.add({ name: 'alpha', description: '' })
    store.add({ name: 'beta', description: '' })
    store.add({ name: 'alphabet', description: '' })
    const result = store.list.filter(t => t.name.includes('alpha'))
    expect(result.map(t => t.name)).toEqual(['alpha', 'alphabet'])
  })
})
