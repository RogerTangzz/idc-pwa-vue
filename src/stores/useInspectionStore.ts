import { defineStore } from 'pinia'

export interface InspectionItem {
  id: number
  content: string
  status: '正常' | '异常'
}

export interface Inspection {
  id: number
  title: string
  inspector: string
  date: string
  items: InspectionItem[]
  abnormal: number
}

const STORAGE_KEY = 'idc-inspections'

export const useInspectionStore = defineStore('inspection', {
  state: () => ({
    list: [] as Inspection[]
  }),
  actions: {
    load() {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        this.list = JSON.parse(raw)
      } else {
        // seed with demo data
        this.list = [
          {
            id: 1,
            title: '机房A巡检',
            inspector: '张三',
            date: new Date().toISOString().slice(0, 10),
            items: [
              { id: 1, content: 'UPS电源', status: '正常' },
              { id: 2, content: '空调温度', status: '异常' },
              { id: 3, content: '消防系统', status: '正常' }
            ],
            abnormal: 1
          }
        ]
        this.save()
      }
    },
    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list))
    },
    getById(id: number) {
      return this.list.find(i => i.id === id)
    },
    update(id: number, data: Partial<Inspection>) {
      const idx = this.list.findIndex(i => i.id === id)
      if (idx !== -1) {
        this.list[idx] = { ...this.list[idx], ...data }
        this.save()
      }
    }
  }
})
