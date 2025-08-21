import { defineStore } from 'pinia'

export interface Order {
  id: number
  title: string
  priority: '高' | '中' | '低'
  reporter: string
  specialty: '暖通' | '配电' | '消防弱电'
  assignee?: string
  status: '新建' | '处理中' | '已完成'
  startDate?: string
  clearTime?: string
  description?: string
  emergencyMethod?: string
  faultDescription?: string
  createdAt: string
  synced: boolean
}

/**
 * Store managing work orders (工单).
 */
export const useOrderStore = defineStore('orders', {
  state: () => ({
    list: [] as Order[],
    nextId: 1
  }),
  actions: {
    load() {
      const raw = localStorage.getItem('idc-orders')
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as any[]
          let migrated = false
          this.list = (parsed || []).map((o: any) => {
            // 兼容旧数据：endDate -> clearTime
            if (o && typeof o === 'object') {
              if (o.endDate && !o.clearTime) {
                o.clearTime = o.endDate
                delete o.endDate
                migrated = true
              }
            }
            return o as Order
          })
          const max = this.list.reduce((acc, o) => Math.max(acc, o.id), 0)
          this.nextId = max + 1
          if (migrated) this.save()
        } catch {
          this.list = []
          this.nextId = 1
        }
      }
    },
    save() {
      localStorage.setItem('idc-orders', JSON.stringify(this.list))
    },
    add(data: Omit<Order, 'id' | 'createdAt' | 'synced'>) {
      const order: Order = {
        id: this.nextId++,
        createdAt: new Date().toLocaleString(),
        synced: false,
        ...data
      }
      this.list.push(order)
      this.save()
    },
    update(id: number, data: Partial<Order>) {
      const idx = this.list.findIndex(o => o.id === id)
      if (idx !== -1) {
        this.list[idx] = { ...this.list[idx], ...data }
        this.save()
      }
    },
    remove(id: number) {
      this.list = this.list.filter(o => o.id !== id)
      this.save()
    }
  }
})
