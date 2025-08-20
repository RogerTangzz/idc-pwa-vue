import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore } from '../src/stores/useTaskStore'

const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

describe('useTaskStore', () => {
  let store: ReturnType<typeof useTaskStore>

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
    store = useTaskStore()
  })

  it('adds a task', () => {
    const due = new Date('2025-05-01T10:30:00Z').toISOString()
    store.add({ title: 'task', status: '新建', dueDate: due })
    expect(store.list).toHaveLength(1)
    expect(store.list[0]).toMatchObject({ title: 'task', status: '新建', dueDate: due })
  })

  it('updates a task', () => {
    store.add({ title: 'old', status: '新建' })
    const id = store.list[0].id
    const newDue = new Date('2025-06-01T11:30:00Z').toISOString()
    store.update(id, { title: 'new', status: '处理中', dueDate: newDue })
    expect(store.list[0]).toMatchObject({ title: 'new', status: '处理中', dueDate: newDue })
  })

  it('removes a task', () => {
    store.add({ title: 'a', status: '新建' })
    store.add({ title: 'b', status: '新建' })
    const id = store.list[0].id
    store.remove(id)
    expect(store.list).toHaveLength(1)
    expect(store.list[0].title).toBe('b')
  })

  it('stores dueDate as ISO string', () => {
    const due = new Date('2025-07-01T12:00:00Z').toISOString()
    store.add({ title: 'date test', status: '新建', dueDate: due })
    expect(store.list[0].dueDate).toMatch(isoRegex)
  })
})

