import { defineStore } from 'pinia'

/** 借/还日志（统一版） */
export interface AssetLog {
  action: '借用' | '归还'
  userId: string
  time: string // ISO
}

/** 资产模型（统一版，含日志） */
export interface Asset {
  id: number
  name: string
  category?: string
  location?: string
  status: '可用' | '借用' | '维修中'
  remark?: string
  borrowerId?: string
  borrowTime?: string
  returnTime?: string
  logs: AssetLog[]
}

const STORAGE_KEY = 'idc-assets'

/** 兼容旧分支状态映射：
 * - 在库/available → 可用
 * - 借用中/borrowed → 借用
 * - 维修/维修中 → 维修中
 */
function normalizeStatus(s: any): Asset['status'] {
  const map: Record<string, Asset['status']> = {
    '在库': '可用',
    'available': '可用',
    '借用中': '借用',
    'borrowed': '借用',
    '维修': '维修中',
    '维修中': '维修中',
    '可用': '可用',
    '借用': '借用'
  }
  return map[String(s)] ?? '可用'
}

/** 迁移旧日志到统一版：
 *  - { action:'borrow'|'return', user, date } → { '借用'|'归还', userId, time }
 *  - 其他类型（如 'add'）忽略
 */
function normalizeLogs(arr: any[]): AssetLog[] {
  if (!Array.isArray(arr)) return []
  const out: AssetLog[] = []
  for (const l of arr) {
    const a = String(l?.action ?? '')
    if (a === 'borrow') {
      out.push({ action: '借用', userId: String(l?.user ?? ''), time: String(l?.date ?? new Date().toISOString()) })
    } else if (a === 'return') {
      out.push({ action: '归还', userId: String(l?.user ?? ''), time: String(l?.date ?? new Date().toISOString()) })
    } else if (a === '借用' || a === '归还') {
      out.push({ action: a as '借用' | '归还', userId: String(l?.userId ?? ''), time: String(l?.time ?? new Date().toISOString()) })
    }
  }
  return out
}

/** 迁移/规整任意对象为统一版 Asset */
function normalizeAsset(o: any, fallbackId: number): Asset {
  const a: Asset = {
    id: typeof o?.id === 'number' ? o.id : fallbackId,
    name: String(o?.name ?? ''),
    category: o?.category ? String(o.category) : undefined,
    location: o?.location ? String(o.location) : undefined,
    status: normalizeStatus(o?.status),
    remark: o?.remark ? String(o.remark) : undefined,

    // 兼容字段：borrower/borrowedAt/returnedAt → borrowerId/borrowTime/returnTime
    borrowerId: o?.borrowerId
      ? String(o.borrowerId)
      : (o?.borrower ? String(o.borrower) : undefined),
    borrowTime: o?.borrowTime
      ? String(o.borrowTime)
      : (o?.borrowedAt ? String(o.borrowedAt) : undefined),
    returnTime: o?.returnTime
      ? String(o.returnTime)
      : (o?.returnedAt ? String(o.returnedAt) : undefined),

    logs: normalizeLogs(o?.logs)
  }
  return a
}

export const useAssetStore = defineStore('assets', {
  state: () => ({
    list: [] as Asset[],
    nextId: 1
  }),
  actions: {
    /** 从 localStorage 加载并做迁移 */
    load() {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        this.list = []
        this.nextId = 1
        return
      }
      try {
        const parsed = JSON.parse(raw) as any[]
        let migrated = false
        this.list = (Array.isArray(parsed) ? parsed : []).map((o: any, idx) => {
          const before = JSON.stringify(o)
          const n = normalizeAsset(o, idx + 1)
          const after = JSON.stringify(n)
          if (before !== after) migrated = true
          return n
        })
        const max = this.list.reduce((acc, a) => Math.max(acc, a.id), 0)
        this.nextId = max + 1
        if (migrated) this.save()
      } catch {
        this.list = []
        this.nextId = 1
      }
    },

    /** 持久化 */
    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list))
    },

    /** 新增资产（status 未传则默认为可用） */
    add(data: Omit<Asset, 'id' | 'logs'>) {
      const normalized = normalizeAsset(data, 0)
      const asset: Asset = {
        id: this.nextId++,
        logs: [],
        // 以传入/迁移后的状态为准，默认可用
        status: normalized.status ?? '可用',
        ...data,
        // 再次规整，确保字段名一致
        ...normalized,
        id: this.nextId - 1
      }
      this.list.push(asset)
      this.save()
    },

    /** 更新资产 */
    update(id: number, data: Partial<Asset>) {
      const idx = this.list.findIndex(a => a.id === id)
      if (idx === -1) return
      const merged = { ...this.list[idx], ...data }
      merged.status = normalizeStatus(merged.status)
      merged.logs = Array.isArray(merged.logs) ? merged.logs : this.list[idx].logs
      this.list[idx] = merged
      this.save()
    },

    /** 删除资产 */
    remove(id: number) {
      this.list = this.list.filter(a => a.id !== id)
      this.save()
    },

    /** 借用资产（记录日志） */
    borrow(id: number, borrowerId: string) {
      const asset = this.list.find(a => a.id === id)
      if (!asset) return
      const now = new Date().toISOString()
      asset.borrowerId = borrowerId
      asset.borrowTime = now
      asset.status = '借用'
      asset.logs.push({ action: '借用', userId: borrowerId, time: now })
      this.save()
    },

    /** 归还资产（记录日志并复位状态） */
    returnAsset(id: number) {
      const asset = this.list.find(a => a.id === id)
      if (!asset) return
      const now = new Date().toISOString()
      asset.returnTime = now
      if (asset.borrowerId) {
        asset.logs.push({ action: '归还', userId: asset.borrowerId, time: now })
      }
      asset.borrowerId = undefined
      asset.borrowTime = undefined
      asset.status = '可用'
      this.save()
    },

    /** 关键词搜索：按名称/分类/位置/备注模糊匹配（不区分大小写） */
    search(keyword: string) {
      const kw = keyword.trim().toLowerCase()
      if (!kw) return this.list
      return this.list.filter(a =>
        [a.name, a.category, a.location, a.remark]
          .filter(Boolean)
          .some(f => String(f).toLowerCase().includes(kw))
      )
    }
  }
})
