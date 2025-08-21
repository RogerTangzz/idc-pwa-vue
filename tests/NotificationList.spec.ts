import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import NotificationList from '../src/views/NotificationList.vue'
import * as api from '../src/services/notifications'

describe('NotificationList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('creates and confirms notification', async () => {
    vi.spyOn(api, 'createNotification').mockResolvedValue()
    vi.spyOn(api, 'confirmNotification').mockResolvedValue()
    const wrapper = mount(NotificationList)
    await wrapper.get('[data-test=message]').setValue('hi')
    await wrapper.get('[data-test=create]').trigger('click')
    await flushPromises()
    expect(wrapper.findAll('li')).toHaveLength(1)
    await wrapper.get('li [data-test=confirm]').trigger('click')
    await flushPromises()
    expect(wrapper.html()).toContain('已确认')
  })

  it('shows error when creation fails', async () => {
    vi.spyOn(api, 'createNotification').mockRejectedValue(new Error('fail'))
    const wrapper = mount(NotificationList)
    await wrapper.get('[data-test=message]').setValue('bad')
    await wrapper.get('[data-test=create]').trigger('click')
    await flushPromises()
    expect(wrapper.findAll('li')).toHaveLength(0)
    expect(wrapper.get('[data-test=error]').text()).toBe('创建失败')
  })
})
