import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '../src/stores/useNotificationStore'
import * as api from '../src/services/notifications'

describe('useNotificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('adds a notification', async () => {
    vi.spyOn(api, 'createNotification').mockResolvedValue()
    const store = useNotificationStore()
    await store.add('hello')
    expect(store.list).toHaveLength(1)
    expect(store.list[0].message).toBe('hello')
  })

  it('handles create failure', async () => {
    vi.spyOn(api, 'createNotification').mockRejectedValue(new Error('fail'))
    const store = useNotificationStore()
    await expect(store.add('oops')).rejects.toThrow()
    expect(store.list).toHaveLength(0)
  })

  it('confirms notification and tracks stats', async () => {
    vi.spyOn(api, 'createNotification').mockResolvedValue()
    vi.spyOn(api, 'confirmNotification').mockResolvedValue()
    const store = useNotificationStore()
    await store.add('a')
    await store.add('b')
    const id = store.list[0].id
    await store.confirm(id)
    expect(store.confirmedCount).toBe(1)
    expect(store.unconfirmedCount).toBe(1)
  })

  it('handles confirm failure', async () => {
    vi.spyOn(api, 'createNotification').mockResolvedValue()
    vi.spyOn(api, 'confirmNotification').mockRejectedValue(new Error('fail'))
    const store = useNotificationStore()
    await store.add('a')
    const id = store.list[0].id
    await expect(store.confirm(id)).rejects.toThrow()
    expect(store.list[0].confirmed).toBe(false)
  })
})
