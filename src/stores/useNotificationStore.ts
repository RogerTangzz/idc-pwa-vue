import { defineStore } from 'pinia'

export interface Notification {
  id: number
  title: string
  content: string
  publisher: string
  createdAt: string
  confirmed: number
}

export interface NotificationStat {
  id: number
  title: string
  confirmed: number
  /** 未确认人员名单（无人员体系时先留空或示例） */
  unconfirmed: string[]
}

const STORAGE_KEY = 'idc-notifications'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    list: [] as Notification[],
    nextId: 1,
    stats: [] as NotificationStat[]
  }),
  actions: {
    load() {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        this.list = []
        this.nextId = 1
        this.stats = []
        return
      }
      try {
        this.list = JSON.parse(raw)
        const max = this.list.reduce((acc, n) => Math.max(acc, n.id), 0)
        this.nextId = max + 1
      } catch {
        this.list = []
        this.nextId = 1
      }
      // 同步一次统计
      this.stats = this.list.map(n => ({
        id: n.id,
        title: n.title,
        confirmed: n.confirmed ?? 0,
        unconfirmed: []
      }))
    },

    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list))
    },

    add(data: Omit<Notification, 'id' | 'createdAt' | 'confirmed'>) {
      const notification: Notification = {
        id: this.nextId++,
        createdAt: new Date().toISOString(),
        confirmed: 0,
        ...data
      }
      this.list.push(notification)
      this.save()
    },

    confirm(id: number) {
      const idx = this.list.findIndex(n => n.id === id)
      if (idx !== -1) {
        this.list[idx].confirmed = (this.list[idx].confirmed ?? 0) + 1
        this.save()
      }
    },

    remove(id: number) {
      this.list = this.list.filter(n => n.id !== id)
      this.save()
    },

    /** 供通知统计页使用；若已有列表则由列表计算，否则返回示例数据 */
    async fetchStats() {
      // 模拟网络延迟（可根据需要保留/去掉）
      await new Promise(r => setTimeout(r, 200))

      if (this.list.length > 0) {
        this.stats = this.list.map(n => ({
          id: n.id,
          title: n.title,
          confirmed: n.confirmed ?? 0,
          unconfirmed: [] // 没有用户体系时先留空
        }))
        return
      }

      // 无数据时给出示例
      this.stats = [
        { id: 1, title: '服务器维护通知', confirmed: 3, unconfirmed: ['张三', '李四'] },
        { id: 2, title: '安全提醒', confirmed: 5, unconfirmed: [] }
      ]
    }
  }
})
