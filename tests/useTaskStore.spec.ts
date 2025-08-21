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

  it('schedules next task for completed recurring items', () => {
    const due = new Date('2025-08-01T08:00:00Z').toISOString()
    store.add({ title: 'rec', status: '已完成', recurrence: '每日', dueDate: due })
    expect(store.list).toHaveLength(2)
    const nextDue = new Date('2025-08-02T08:00:00Z').toISOString()
    const next = store.list.find(t => t.dueDate === nextDue)
    expect(next).toBeTruthy()
    expect(next?.status).toBe('新建')
  })

  it('avoids duplicate scheduled tasks', () => {
    const due = new Date('2025-09-01T08:00:00Z').toISOString()
    store.add({ title: 'dup', status: '已完成', recurrence: '每日', dueDate: due })
    // call scheduleNext again to simulate repeated completion
    store.scheduleNext(store.list[0])
    const nextDue = new Date('2025-09-02T08:00:00Z').toISOString()
    const occurrences = store.list.filter(t => t.dueDate === nextDue)
    expect(occurrences.length).toBe(1)
  })
})

