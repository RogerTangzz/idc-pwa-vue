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
  maintainerSignature?: string
  /** Base64 data URLs or external links */
  attachments?: string[]
  createdAt: string
  synced: boolean
}

function toStringArray(v: any): string[] {
  const filter = (s: unknown) => typeof s === 'string' && !s.startsWith('blob:')
  if (Array.isArray(v)) return v.filter(filter) as string[]
  if (filter(v)) return [v as string]
  return []
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
      if (!raw) return
      try {
        const parsed = JSON.parse(raw) as any[]
        let migrated = false
        this.list = (parsed || []).map((o: any) => {
          if (o && typeof o === 'object') {
            // 兼容旧数据：endDate -> clearTime
            if (o.endDate && !o.clearTime) {
              o.clearTime = o.endDate
              delete o.endDate
              migrated = true
            }
            // 规范化附件
            const norm = toStringArray(o.attachments)
            if (o.attachments === undefined || norm.length !== (o.attachments?.length || 0)) {
              o.attachments = norm
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
      order.attachments = toStringArray(order.attachments)
      this.list.push(order)
      this.save()
    },
    update(id: number, data: Partial<Order>) {
      const idx = this.list.findIndex(o => o.id === id)
      if (idx === -1) return
      const merged: Order = { ...this.list[idx], ...data }
      if (data.attachments !== undefined) {
        merged.attachments = toStringArray(data.attachments)
      }
      this.list[idx] = merged
      this.save()
    },
    remove(id: number) {
      this.list = this.list.filter(o => o.id !== id)
      this.save()
    }
  }
})
