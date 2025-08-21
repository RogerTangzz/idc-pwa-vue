import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '../src/stores/useNotificationStore'
import * as svc from '../src/services/notificationService'

// 简易 localStorage mock（每个用例独立）
function mockLocalStorage() {
  const storage: Record<string, string> = {}
  ;(globalThis as any).localStorage = {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => { storage[key] = value },
    removeItem: (key: string) => { delete storage[key] },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]) },
    key: (index: number) => Object.keys(storage)[index] || null,
    get length() { return Object.keys(storage).length }
  } as Storage
}

describe('useNotificationStore (service + fallback)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
    mockLocalStorage()
  })

  it('adds a notification via service and confirms via service', async () => {
    // service 成功：post/confirm 都返回对象
    vi.spyOn(svc, 'postNotification').mockResolvedValue({
      id: 101, title: 'hello', message: 'hello', createdAt: new Date().toISOString(),
      confirmed: false, confirmedCount: 0
    } as any)
    vi.spyOn(svc, 'confirmNotification').mockResolvedValue({
      id: 101, title: 'hello', message: 'hello', createdAt: new Date().toISOString(),
      confirmed: true, confirmedCount: 1
    } as any)

    const store = useNotificationStore()
    await store.add('hello')

    expect(store.list).toHaveLength(1)
    expect(store.list[0].title || store.list[0].message).toBe('hello')
    const id = store.list[0].id

    await store.confirm(id)
    expect(store.list[0].confirmed).toBe(true)
    expect(store.total).toBe(1)
    expect(store.confirmedCount).toBe(1)
    expect(store.unconfirmedCount).toBe(0)
  })

  it('add() falls back locally when service fails', async () => {
    vi.spyOn(svc, 'postNotification').mockRejectedValue(new Error('post fail'))

    const store = useNotificationStore()
    await store.add('oops') // 不抛错，走本地兜底

    expect(store.list).toHaveLength(1)
    expect(store.list[0].title || store.list[0].message).toBe('oops')
    // 失败不会中断 UI，error 允许为空
    // expect(store.error).toBeNull() // 可按需断言
  })

  it('confirm() falls back locally when service fails', async () => {
    vi.spyOn(svc, 'postNotification').mockResolvedValue({
      id: 1, title: 'a', message: 'a', createdAt: new Date().toISOString(),
      confirmed: false, confirmedCount: 0
    } as any)
    vi.spyOn(svc, 'confirmNotification').mockRejectedValue(new Error('confirm fail'))

    const store = useNotificationStore()
    await store.add('a')
    const id = store.list[0].id

    await store.confirm(id) // 不抛错，走本地兜底
    expect(store.list[0].confirmed).toBe(true)
    expect(store.confirmedCount).toBe(1)
    expect(store.unconfirmedCount).toBe(0)
  })

  it('load() uses service first, and falls back to localStorage when service fails', async () => {
    // 先往本地塞数据
    const seed = [
      { id: 7, title: '本地通知', createdAt: '2025-01-01T00:00:00.000Z', confirmed: 0 }
    ]
    localStorage.setItem('idc-notifications', JSON.stringify(seed))

    // service 失败 -> 触发本地回退
    vi.spyOn(svc, 'fetchNotifications').mockRejectedValue(new Error('fetch fail'))

    const store = useNotificationStore()
    await store.load()

    expect(store.list).toHaveLength(1)
    expect(store.list[0].title).toBe('本地通知')
    // 统计同步
    expect(store.total).toBe(1)
    expect(store.confirmedCount).toBe(0)
    expect(store.unconfirmedCount).toBe(1)
  })
})
