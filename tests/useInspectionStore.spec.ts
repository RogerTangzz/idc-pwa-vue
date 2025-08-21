import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useInspectionStore } from '../src/stores/useInspectionStore'

describe('useInspectionStore', () => {
  let store: ReturnType<typeof useInspectionStore>
  let storage: Record<string, string>

  beforeEach(() => {
    setActivePinia(createPinia())
    storage = {}
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
    store = useInspectionStore()
  })

  it('adds an inspection', () => {
    store.add({ title: 'Inspect HVAC', date: '2025-06-01T00:00:00Z' })
    expect(store.list).toHaveLength(1)
    expect(store.list[0].title).toBe('Inspect HVAC')
  })

  it('updates an inspection', () => {
    store.add({ title: 'old', date: '2025-06-01T00:00:00Z' })
    const id = store.list[0].id
    store.update(id, { title: 'new' })
    expect(store.list[0].title).toBe('new')
  })

  it('removes an inspection', () => {
    store.add({ title: 'remove me', date: '2025-06-01T00:00:00Z' })
    const id = store.list[0].id
    store.remove(id)
    expect(store.list).toHaveLength(0)
  })

  it('handles invalid stored JSON', () => {
    localStorage.setItem('idc-inspections', '{bad json')
    expect(() => store.load()).not.toThrow()
    expect(store.list).toHaveLength(0)
  })

  it('handles storage failures gracefully', () => {
    localStorage.setItem = () => {
      throw new Error('fail')
    }
    expect(() => store.add({ title: 'will fail', date: '2025-06-01T00:00:00Z' })).not.toThrow()
  })
})

