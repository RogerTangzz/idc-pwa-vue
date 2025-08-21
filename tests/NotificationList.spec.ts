import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import NotificationList from '../src/views/NotificationList.vue'
import * as svc from '../src/services/notificationService'

describe('NotificationList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('creates and confirms notification', async () => {
    vi.spyOn(svc, 'postNotification').mockResolvedValue({
      id: 1,
      message: 'hi',
      confirmed: false,
      confirmedCount: 0
    } as any)
    vi.spyOn(svc, 'confirmNotification').mockResolvedValue({
      id: 1,
      message: 'hi',
      confirmed: true,
      confirmedCount: 1
    } as any)
    const wrapper = mount(NotificationList)
    await wrapper.get('[data-test=message]').setValue('hi')
    await wrapper.get('[data-test=create]').trigger('click')
    await flushPromises()
    expect(wrapper.findAll('li')).toHaveLength(1)
    await wrapper.get('li [data-test=confirm]').trigger('click')
    await flushPromises()
    expect(wrapper.html()).toContain('已确认')
  })

  it('falls back locally when creation fails', async () => {
    vi.spyOn(svc, 'postNotification').mockRejectedValue(new Error('fail'))
    const wrapper = mount(NotificationList)
    await wrapper.get('[data-test=message]').setValue('bad')
    await wrapper.get('[data-test=create]').trigger('click')
    await flushPromises()
    expect(wrapper.findAll('li')).toHaveLength(1)
    expect(wrapper.find('[data-test=error]').exists()).toBe(false)
  })
})
