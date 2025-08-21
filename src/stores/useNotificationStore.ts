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
  type?: string          // e.g. info/warn...
  read?: boolean
  date?: string          // 兼容旧字段；与 createdAt 同步

  // 管理/统计/服务分支字段
  content?: string
  publisher?: string
  confirmed?: boolean
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

/** 将任意对象规范化为统一 Notification 结构 */
function normalize(n: any, fallbackId: number): Notification {
  const id = typeof n?.id === 'number' ? n.id : fallbackId
  const srcCreated = n?.createdAt ?? n?.date
  const createdAt = srcCreated ? String(srcCreated) : new Date().toISOString()

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

  const read =
    typeof n?.read === 'boolean' ? n.read : false

  return {
    id,
    createdAt,
    date: createdAt, // 同步一份以兼容旧 UI
    title,
    content: n?.content != null ? String(n.content) : undefined,
    publisher: n?.publisher != null ? String(n.publisher) : undefined,
    message,
    type: n?.type != null ? String(n.type) : undefined,
    read,
    confirmed: confirmedBool,
    confirmedCount
  }
}

/** 将服务层 Notification 规范化为本地 Notification */
function fromService(s: ServiceNotification, fallbackId: number): Notification {
  return normalize(s as any, fallbackId)
}

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    list: [] as Notification[],
    nextId: 1,
    stats: [] as NotificationStat[],
    loading: false,
    error: null as string | null
  }),
  getters: {
    // 测试分支所需统计：按布尔 confirmed 计数
    total: state => state.list.length,
    confirmedCount: state => state.list.filter(n => n.confirmed === true).length,
    unconfirmedCount: state => state.list.filter(n => !n.confirmed).length
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
            this.list = (Array.isArray(parsed) ? parsed : []).map((o, idx) => normalize(o, idx + 1))
            const max = this.list.reduce((acc, n) => Math.max(acc, n.id), 0)
            this.nextId = max + 1
            this.stats = this.list.map(n => ({
              id: n.id,
              title: n.title || n.message || `通知 #${n.id}`,
              confirmed: n.confirmedCount ?? (n.confirmed ? 1 : 0),
              unconfirmed: []
            }))
          }
        } catch {
          this.list = []
          this.nextId = 1
          this.stats = []
        }
        // 记录错误但不打断 UI
        this.error = e?.message || String(e)
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
     */
    async add(message: string): Promise<void>
    async add(data: Omit<Notification, 'id' | 'createdAt' | 'confirmed' | 'confirmedCount' | 'read' | 'date'>): Promise<void>
    async add(arg: any) {
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
              read: false,
              confirmed: false,
              confirmedCount: 0
            }
            this.list.push(n)
          }
        } else {
          // 对象：管理分支
          const n = normalize(
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
        let updated: ServiceNotification | null = null
        try {
          updated = await apiConfirmNotification(id)
        } catch {
          // 静默回退到本地处理
        }

        if (updated) {
          const n = fromService(updated, id)
          const idx = this.list.findIndex(i => i.id === id)
          if (idx !== -1) this.list[idx] = { ...this.list[idx], ...n }
        } else {
          // 本地兜底：置 confirmed=true，并把 confirmedCount 至少提升为 1
          const item = this.list.find(n => n.id === id)
          if (item) {
            item.confirmed = true
            const current = typeof item.confirmedCount === 'number' ? item.confirmedCount : 0
            item.confirmedCount = Math.max(1, current + 1)
          }
        }

        this.save()
        // 同步统计
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

    /** 标记单条为已读（来自“复用组件”分支） */
    markRead(id: number) {
      const idx = this.list.findIndex(n => n.id === id)
      if (idx !== -1) {
        this.list[idx].read = true
        this.save()
      }
    },

    /** 全部标记为已读（来自“复用组件”分支） */
    markAllRead() {
      this.list = this.list.map(n => ({ ...n, read: true }))
      this.save()
    },

    /** 管理页的删除 */
    remove(id: number) {
      this.list = this.list.filter(n => n.id !== id)
      this.save()
      this.stats = this.list.map(n => ({
        id: n.id,
        title: n.title || n.message || `通知 #${n.id}`,
        confirmed: n.confirmedCount ?? (n.confirmed ? 1 : 0),
        unconfirmed: []
      }))
    },

    /** 统计页：若已有列表则由列表计算，否则提供示例数据 */
    async fetchStats() {
      // 轻微延迟模拟
      await new Promise(r => setTimeout(r, 120))
      if (this.list.length > 0) {
        this.stats = this.list.map(n => ({
          id: n.id,
          title: n.title || n.message || `通知 #${n.id}`,
          confirmed: n.confirmedCount ?? (n.confirmed ? 1 : 0),
          unconfirmed: []
        }))
      } else {
        this.stats = [
          { id: 1, title: '服务器维护通知', confirmed: 3, unconfirmed: ['张三', '李四'] },
          { id: 2, title: '安全提醒', confirmed: 5, unconfirmed: [] }
        ]
      }
    }
  }
})
