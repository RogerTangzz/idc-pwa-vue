import { defineStore } from 'pinia'

export interface Order {
  id: number
  title: string
  priority: '高' | '中' | '低'
  reporter: string
  assignee?: string
  status: '新建' | '处理中' | '已完成'
  startDate?: string
  endDate?: string
  description?: string
  maintainerSignature?: string
  createdAt: string
  synced: boolean
}

/**
 * Store managing work orders (工单).  Orders behave similarly to tasks
 * but include additional fields such as priority, reporter and assignee.
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
          this.list = JSON.parse(raw)
          const max = this.list.reduce((acc, o) => Math.max(acc, o.id), 0)
          this.nextId = max + 1
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
        createdAt: new Date().toISOString(),
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