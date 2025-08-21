import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InspectionForm from '../src/components/InspectionForm.vue'

describe('InspectionForm', () => {
  it('validates inspector field', () => {
    const wrapper = mount(InspectionForm)
    const ok = wrapper.vm.submit()
    expect(ok).toBe(false)
    expect(wrapper.vm.errors.inspector).toBe('巡检人必填')

    wrapper.vm.form.inspector = '张三'
    const ok2 = wrapper.vm.submit()
    expect(ok2).toBe(true)
    expect(wrapper.vm.errors.inspector).toBeUndefined()
  })

  it('calculates abnormal count', () => {
    const wrapper = mount(InspectionForm)
    wrapper.vm.form.items = [
      { name: 'A', status: '正常' },
      { name: 'B', status: '异常' },
      { name: 'C', status: '异常' }
    ]
    expect(wrapper.vm.abnormalCount).toBe(2)
  })
})
