import { defineStore } from 'pinia'

export interface InspectionItem {
  项目: string
  内容: string
  温度?: number | null
  湿度?: number | null
  压力?: number | null
  状态: '正常' | '异常'
  异常摘要: string
}

export interface InspectionRecord {
  id: number
  createdAt: string
  data: Record<string, InspectionItem[]>
  abnormalCount: number
}

export const useInspectionStore = defineStore('inspections', {
  state: () => ({
    list: [] as InspectionRecord[],
    nextId: 1
  }),
  actions: {
    load() {
      const raw = localStorage.getItem('idc-inspections')
      if (raw) {
        try {
          this.list = JSON.parse(raw)
          const max = this.list.reduce((acc, r) => Math.max(acc, r.id), 0)
          this.nextId = max + 1
        } catch {
          this.list = []
          this.nextId = 1
        }
      }
    },
    save() {
      localStorage.setItem('idc-inspections', JSON.stringify(this.list))
    },
    add(recordData: Omit<InspectionRecord, 'id' | 'createdAt'>) {
      const record: InspectionRecord = {
        id: this.nextId++,
        createdAt: new Date().toISOString(),
        ...recordData
      }
      this.list.push(record)
      this.save()
    },
    update(id: number, data: Partial<InspectionRecord>) {
      const idx = this.list.findIndex(r => r.id === id)
      if (idx !== -1) {
        this.list[idx] = { ...this.list[idx], ...data }
        this.save()
      }
    }
  }
})
