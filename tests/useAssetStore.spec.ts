import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAssetStore } from '../src/stores/useAssetStore'

const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

describe('useAssetStore', () => {
  let store: ReturnType<typeof useAssetStore>

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
    store = useAssetStore()
  })

  it('add creates asset and auto-increments id', () => {
    const saveSpy = vi.spyOn(store, 'save')
    store.add({ name: 'Laptop' })
    store.add({ name: 'Monitor' })
    expect(store.list.map(a => a.id)).toEqual([1, 2])
    expect(saveSpy).toHaveBeenCalledTimes(2)
  })

  it('borrow updates status and logs', () => {
    store.add({ name: 'Camera' })
    const id = store.list[0].id
    const saveSpy = vi.spyOn(store, 'save')
    store.borrow(id, 'Alice')
    const asset = store.list[0]
    expect(asset.status).toBe('borrowed')
    expect(asset.borrower).toBe('Alice')
    expect(asset.logs).toHaveLength(1)
    expect(asset.logs[0]).toMatchObject({ action: 'borrow', user: 'Alice' })
    expect(asset.logs[0].date).toMatch(isoRegex)
    expect(saveSpy).toHaveBeenCalledTimes(1)
  })

  it('returnAsset clears borrow info and records return time', () => {
    store.add({ name: 'Tablet' })
    const id = store.list[0].id
    store.borrow(id, 'Bob')
    const saveSpy = vi.spyOn(store, 'save')
    store.returnAsset(id)
    const asset = store.list[0]
    expect(asset.status).toBe('available')
    expect(asset.borrower).toBeUndefined()
    expect(asset.borrowedAt).toBeUndefined()
    expect(asset.returnedAt).toMatch(isoRegex)
    expect(asset.logs.at(-1)).toMatchObject({ action: 'return' })
    expect(saveSpy).toHaveBeenCalledTimes(1)
  })

  it('search filters by keyword', () => {
    store.add({ name: 'Laptop' })
    store.add({ name: 'Server Rack' })
    const results = store.search('lap')
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Laptop')
  })
})

