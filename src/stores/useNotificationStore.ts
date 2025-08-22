import { defineStore } from 'pinia'

// —— 优先走抽象服务层；若请求失败则回退到本地存储 —— //
import type { Notification as ServiceNotification } from '@/services/notificationService'
import {
  fetchNotifications,
  postNotification,
  confirmNotification as apiConfirmNotification
} from '@/services/notificationService'

/** 统一后的通知模型（兼容“消息/已读”分支与“管理/统计/服务”分支） */
export interface Notification {
  id: number

  // 测试/简单分支字段
  title?: string
  message?: string
  createdAt?: string
  read?: boolean

  // 管理/统计分支字段
  publisher?: string
  type?: string          // e.g. info/warn
  date?: string          // 兼容旧 UI 使用的 date
  confirmed?: boolean    // 兼容布尔形式
  confirmedCount?: number // 兼容数值形式
}

const STORAGE_KEY = 'idc-notifications'

function fromService(o: ServiceNotification | any, fallbackId = 1): Notification {
  const id = typeof o?.id === 'number' ? o.id : fallbackId
  const createdAt =
    typeof o?.createdAt === 'string' ? o.createdAt
    : typeof o?.date === 'string' ? o.date
    : new Date().toISOString()

  const title =
    typeof o?.title === 'string' ? o.title
    : typeof o?.name === 'string' ? o.name
    : typeof o?.message === 'string' ? o.message
    : `通知 #${id}`

  const message =
    typeof o?.message === 'string' ? o.message
    : typeof o?.content === 'string' ? o.content
    : ''

  const confirmedBool =
    typeof o?.confirmed === 'boolean' ? o.confirmed
    : typeof o?.status === 'string' ? (o.status === 'confirmed' || o.status === 'done')
    : false

  const confirmedCount =
    typeof o?.confirmedCount === 'number' ? o.confirmedCount
    : typeof o?.confirmed === 'number' ? Number(o.confirmed)
    : confirmedBool ? 1 : 0

  const read =
    typeof o?.read === 'boolean' ? o.read : false

  return {
    id,
    createdAt,
    date: createdAt, // 同步一份以兼容旧 UI
    title,
    message,
    publisher: typeof o?.publisher === 'string' ? o.publisher : undefined,
    type: typeof o?.type === 'string' ? o.type : undefined,
    confirmed: confirmedBool,
    confirmedCount,
    read
  }
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    list: [] as Notification[],
    nextId: 1,
    loading: false,
    error: null as string | null,
    // 简单统计：每条的确认数量（或布尔）
    stats: [] as Array<{ id: number; title: string; confirmed: number; unconfirmed: string[] }>
  }),
  getters: {
    unreadCount(state): number {
      return state.list.filter(n => !n.read).length
    }
  },
  actions: {
    /** 从服务端加载；失败则回退到 localStorage */
    async load() {
      this.loading = true
      this.error = null
      try {
        const data = await fetchNotifications()
        const arr = Array.isArray(data) ? data : []
        this.list = arr.map((o, idx) => fromService(o, idx + 1))
        const max = this.list.reduce((acc, n) => Math.max(acc, n.id), 0)
        this.nextId = max + 1
        // 同步统计
        this.stats = this.list.map(n => ({
          id: n.id,
          title: n.title || n.message || `通知 #${n.id}`,
          confirmed: n.confirmedCount ?? (n.confirmed ? 1 : 0),
          unconfirmed: []
        }))
        // 将服务数据持久化一份，便于离线/回退
        this.save()
      } catch (e: any) {
        // 回退到本地
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (!raw) {
            this.list = []
            this.nextId = 1
            this.stats = []
          } else {
            const parsed = JSON.parse(raw) as any[]
            this.list = parsed.map((o, idx) => fromService(o, idx + 1))
            const max = this.list.reduce((acc, n) => Math.max(acc, n.id), 0)
            this.nextId = max + 1
            this.stats = this.list.map(n => ({
              id: n.id,
              title: n.title || n.message || `通知 #${n.id}`,
              confirmed: n.confirmedCount ?? (n.confirmed ? 1 : 0),
              unconfirmed: []
            }))
          }
        } catch (parseErr: any) {
          this.error = parseErr?.message || String(parseErr)
          this.list = []
          this.nextId = 1
          this.stats = []
        }
      } finally {
        this.loading = false
      }
    },

    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list))
    },

    /** 兼容两种调用：
     *  - add('消息内容')  —— 测试/简单分支（调用服务 postNotification）
     *  - add({ title, content, publisher, type, ... }) —— 管理分支（本地创建）
     * 说明：对象内的 id/createdAt/confirmed/confirmedCount/read/date 由本方法自动生成或规范化
     */
    async add(arg: string | Omit<Notification, 'id' | 'createdAt' | 'date' | 'read' | 'confirmed' | 'confirmedCount'>): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const now = new Date().toISOString()

        if (typeof arg === 'string') {
          // 字符串：走服务；失败则本地兜底
          try {
            const created = await postNotification(arg)
            const n = fromService(created, this.nextId)
            // 确保必要字段
            n.createdAt ||= now
            n.date = n.createdAt
            n.title ||= arg
            n.message ||= arg
            n.confirmed ||= false
            n.confirmedCount ||= 0
            n.read = false
            this.list.push(n)
            this.nextId = Math.max(this.nextId, n.id + 1)
          } catch {
            const n: Notification = {
              id: this.nextId++,
              createdAt: now,
              date: now,
              title: arg,
              message: arg,
              confirmed: false,
              confirmedCount: 0,
              read: false
            }
            this.list.push(n)
          }
        } else {
          // 对象：本地创建
          const n = fromService(
            {
              ...arg,
              id: this.nextId,
              createdAt: now,
              read: false,
              confirmed: false,
              confirmedCount: 0
            },
            this.nextId
          )
          this.nextId++
          this.list.push(n)
        }

        this.save()

        // 更新统计
        this.stats = this.list.map(n => ({
          id: n.id,
          title: n.title || n.message || `通知 #${n.id}`,
          confirmed: n.confirmedCount ?? (n.confirmed ? 1 : 0),
          unconfirmed: []
        }))
      } catch (e: any) {
        this.error = e?.message || String(e)
      } finally {
        this.loading = false
      }
    },

    /** 兼容测试分支：确认某条通知（服务优先，本地兜底） */
    async confirm(id: number) {
      this.loading = true
      this.error = null
      try {
        try {
          await apiConfirmNotification(id)
          // 如果服务端记录了确认数，这里可以在下一次 load 时同步；此处先本地+1
        } catch {
          // 服务失败就直接本地记一次
        }
        const idx = this.list.findIndex(n => n.id === id)
        if (idx !== -1) {
          const n = this.list[idx]
          const count = (n.confirmedCount ?? (n.confirmed ? 1 : 0)) + 1
          this.list[idx] = { ...n, confirmed: true, confirmedCount: count }
        }

        this.save()
      } catch (e: any) {
        this.error = e?.message || String(e)
      } finally {
        this.loading = false
      }
    },

    /** 将所有消息标记为已读 */
    markAllRead() {
      this.list = this.list.map(n => ({ ...n, read: true }))
      this.save()
    },

    /** 为开发与离线准备的模拟数据注入 */
    seedIfEmpty() {
      if (this.list.length === 0) {
        const now = new Date().toISOString()
        this.list = [
          { id: 1, title: '服务器维护通知', message: '今晚 23:00-24:00 维护窗口', createdAt: now, read: false, confirmed: false, confirmedCount: 0 },
          { id: 2, title: '安全提醒', message: '请及时更新密码', createdAt: now, read: false, confirmed: false, confirmedCount: 0 }
        ]
        this.nextId = 3

        this.stats = [
          { id: 1, title: '服务器维护通知', confirmed: 3, unconfirmed: ['张三', '李四'] },
          { id: 2, title: '安全提醒', confirmed: 5, unconfirmed: [] }
        ]
      }
    }
  }
})
