import { defineStore } from 'pinia'

export interface Inspection {
  id: number
  inspector: string
  relayInspector?: string
  remark?: string
}

/**
 * Simple store managing inspection records. The list is static for now but
 * could be replaced with real API calls in the future.
 */
export const useInspectionStore = defineStore('inspections', {
  state: () => ({
    list: [] as Inspection[]
  }),
  actions: {
    /**
     * Simulate fetching inspection records from an API.
     */
    async fetchInspections() {
      // Simulate network latency
      await new Promise(res => setTimeout(res, 200))
      this.list = [
        { id: 1, inspector: '张三', relayInspector: '李四', remark: '机房温度检查' },
        { id: 2, inspector: '王五', relayInspector: '赵六', remark: 'UPS 巡检' },
        { id: 3, inspector: '张三', relayInspector: '赵六', remark: '空调检查' }
      ]
    },
    /**
     * Return a filtered copy of inspections based on optional criteria.
     */
    filter(params: { inspector?: string; relayInspector?: string; remark?: string }) {
      let items = [...this.list]
      if (params.inspector) {
        items = items.filter(i => i.inspector === params.inspector)
      }
      if (params.relayInspector) {
        items = items.filter(i => i.relayInspector === params.relayInspector)
      }
      if (params.remark) {
        const kw = params.remark.trim()
        if (kw) {
          items = items.filter(i => i.remark && i.remark.includes(kw))
        }
      }
      return items
    }
  }
})
