import { defineStore } from 'pinia'
import { createNotification, confirmNotification } from '../services/notifications'

export interface Notification {
  id: number
  // 测试分支字段
  message?: string
  confirmed?: boolean

  // 管理/统计分支字段
  title?: string
  content?: string
  publisher?: string
  confirmedCount?: number

  // 公共字段
  createdAt: string
}

export interface NotificationStat {
  id: number
  title: string
  confirmed: number
  /** 未确认人员名单（无用户体系时先留空） */
  unconfirmed: string[]
}

const STORAGE_KEY = 'idc-notifications'

/** 规范化通知对象，兼容两套结构 */
function normalize(n: any, fallbackId: number): Notification {
  const id = typeof n?.id === 'number' ? n.id : fallbackId
  const createdAt = n?.createdAt ? String(n.createdAt) : new Date().toISOString()

  const title =
    n?.title != null ? String(n.title)
    : n?.message != null ? String(n.message)
    : ''

  const message =
    n?.message != null ? String(n.message)
    : n?.title != null ? String(n.title)
    : ''

  let confirmedBool: boolean
  if (typeof n?.confirmed === 'boolean') confirmedBool = n.confirmed
  else if (typeof n?.confirmed === 'number') confirmedBool = n.confirmed > 0
  else if (typeof n?.confirmedCount === 'number') confirmedBool = n.confirmedCount > 0
  else confirmedBool = false

  const confirmedCount =
    typeof n?.confirmedCount === 'number' ? n.confirmedCount
    : typeof n?.confirmed === 'number' ? Number(n.confirmed)
    : confirmedBool ? 1 : 0

  return {
    id,
    createdAt,
    title,
    content: n?.content != null ? String(n.content) : undefined,
    publisher: n?.publisher != null ? String(n.publisher) : undefined,
    message,
    confirmed: confirmedBool,
    confirmedCount
  }
}

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    list: [] as Notification[],
    nextId: 1,
    stats: [] as NotificationStat[]
  }),
  getters: {
    /** 与测试分支对齐的统计：按布尔 confirmed 计数 */
    total: state => state.list.length,
    confirmedCount: state => state.list.filter(n => n.confirmed === true).length,
    unconfirmedCount: state => state.list.filter(n => !n.confirmed).length
  },
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
        const parsed = JSON.parse(raw) as any[]
        let migrated = false
        this.list = (Array.isArray(parsed) ? parsed : []).map((o, idx) => {
          const before = JSON.stringify(o)
          const n = normalize(o, idx + 1)
          const after = JSON.stringify(n)
          if (before !== after) migrated = true
          return n
        })
        const max = this.list.reduce((acc, n) => Math.max(acc, n.id), 0)
        this.nextId = max + 1
        if (migrated) this.save()
      } catch {
        this.list = []
        this.nextId = 1
      }
      // 同步一次统计
      this.stats = this.list.map(n => ({
        id: n.id,
        title: n.title || n.message || `通知 #${n.id}`,
        confirmed: n.confirmedCount ?? (n.confirmed ? 1 : 0),
        unconfirmed: []
      }))
    },

    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list))
    },

    /** 兼容两种调用：
     *  - add('消息内容')  —— 测试分支写法（异步，调用服务）
     *  - add({ title, content, publisher }) —— 管理分支写法
     */
    async add(message: string): Promise<void>
    async add(data: Omit<Notification, 'id' | 'createdAt' | 'confirmed' | 'confirmedCount'>): Promise<void>
    async add(arg: any) {
      const now = new Date().toISOString()

      // 字符串：测试分支
      if (typeof arg === 'string') {
        try {
          // 若服务实现会抛错，捕获以保证本地状态可用
          await createNotification(arg)
        } catch { /* 忽略远端错误，仍然写本地 */ }
        const n: Notification = {
          id: this.nextId++,
          createdAt: now,
          message: arg,
          title: arg,
          confirmed: false,
          confirmedCount: 0
        }
        this.list.push(n)
        this.save()
        return
      }

      // 对象：管理分支
      const data = arg as Omit<Notification, 'id' | 'createdAt' | 'confirmed' | 'confirmedCount'>
      const n: Notification = normalize(
        {
          ...data,
          id: this.nextId,
          createdAt: now,
          // 默认未确认
          confirmed: false,
          confirmedCount: 0
        },
        this.nextId
      )
      this.nextId++
      this.list.push(n)
      this.save()
    },

    /** 兼容测试分支写法：确认某条通知 */
    async confirm(id: number) {
      try {
        await confirmNotification(id)
      } catch { /* 忽略远端错误，仍然写本地 */ }

      const item = this.list.find(n => n.id === id)
      if (!item) return

      // 将布尔 confirmed 置为 true
      item.confirmed = true
      // 至少把 confirmedCount 置为 1（若存在多端统计，可递增）
      const current = typeof item.confirmedCount === 'number' ? item.confirmedCount : 0
      item.confirmedCount = Math.max(1, current + 1)
      this.save()
    },

    /** 递增确认数（管理分支页面用）；不影响布尔 confirmed 统计 */
    incrementConfirmed(id: number) {
      const idx = this.list.findIndex(n => n.id === id)
      if (idx === -1) return
      const c = typeof this.list[idx].confirmedCount === 'number' ? this.list[idx].confirmedCount! : 0
      this.list[idx].confirmedCount = c + 1
      this.save()
    },

    remove(id: number) {
      this.list = this.list.filter(n => n.id !== id)
      this.save()
    },

    /** 供统计页使用；若已有列表则由列表生成，否则返回示例数据 */
    async fetchStats() {
      // 模拟网络延迟
      await new Promise(r => setTimeout(r, 150))

      if (this.list.length > 0) {
        this.stats = this.list.map(n => ({
          id: n.id,
          title: n.title || n.message || `通知 #${n.id}`,
          confirmed: n.confirmedCount ?? (n.confirmed ? 1 : 0),
          unconfirmed: []
        }))
        return
      }

      // 无数据示例
      this.stats = [
        { id: 1, title: '服务器维护通知', confirmed: 3, unconfirmed: ['张三', '李四'] },
        { id: 2, title: '安全提醒', confirmed: 5, unconfirmed: [] }
      ]
    }
  }
})
