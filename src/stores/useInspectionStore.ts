import { defineStore } from 'pinia'

/** 规范的巡检项；增加若干可选字段用于兼容 codex 分支 */
export interface InspectionItem {
  id: number
  /** 规范字段 */
  content: string
  status: '正常' | '异常'
  /** ↓↓↓ 兼容 codex 分支的可选扩展 ↓↓↓ */
  name?: string            // “项目”
  temperature?: number | null // “温度”
  humidity?: number | null    // “湿度”
  pressure?: number | null    // “压力”
  abnormalNote?: string    // “异常摘要”
  section?: string         // 来自 codex 的 data 的分组 key
}

/** 规范的巡检记录（沿用 main 分支设计） */
export interface Inspection {
  id: number
  title: string
  /** 巡检人（旧数据可能没有） */
  inspector?: string
  /** ISO 日期或日期字符串，如 2025-08-21 / 2025-08-21T10:20:30Z */
  date: string
  /** 备注（旧数据可能没有） */
  notes?: string
  /** 巡检项明细 */
  items: InspectionItem[]
  /** 异常项数量（会根据 items 自动计算） */
  abnormal: number
  /** 与后端同步标记（旧数据默认 false） */
  synced: boolean
}

/** 仅用于迁移：codex 分支的旧数据形状 */
type LegacyCodexItem = {
  项目: string
  内容: string
  温度?: number | null
  湿度?: number | null
  压力?: number | null
  状态: '正常' | '异常'
  异常摘要: string
}
type LegacyCodexRecord = {
  id: number
  createdAt: string
  data: Record<string, LegacyCodexItem[]>
  abnormalCount: number
}

const STORAGE_KEY = 'idc-inspections'

function computeAbnormal(items: InspectionItem[] | undefined): number {
  if (!Array.isArray(items)) return 0
  return items.filter(i => i?.status === '异常').length
}

/** 把 codex 分支的 record 迁移为规范 Inspection */
function fromLegacyCodex(o: LegacyCodexRecord, fallbackId: number): Inspection {
  const items: InspectionItem[] = []
  let itemId = 1
  const groups = o?.data && typeof o.data === 'object' ? o.data : {}

  Object.entries(groups).forEach(([section, arr]) => {
    const list = Array.isArray(arr) ? arr : []
    list.forEach((it) => {
      items.push({
        id: itemId++,
        name: String(it?.项目 ?? ''),
        content: String(it?.内容 ?? it?.项目 ?? ''),
        temperature: typeof it?.温度 === 'number' ? it.温度 : null,
        humidity: typeof it?.湿度 === 'number' ? it.湿度 : null,
        pressure: typeof it?.压力 === 'number' ? it.压力 : null,
        status: it?.状态 === '异常' ? '异常' : '正常',
        abnormalNote: it?.异常摘要 ? String(it.异常摘要) : undefined,
        section
      })
    })
  })

  const abnormal = computeAbnormal(items)
  const id = typeof o?.id === 'number' ? o.id : fallbackId
  const date = o?.createdAt ? String(o.createdAt) : new Date().toISOString()

  return {
    id,
    title: `巡检记录 #${id}`,
    inspector: undefined,
    date,
    notes: undefined,
    items,
    abnormal,
    synced: false
  }
}

/** 兜底把“看起来像 main”的对象规整为规范 Inspection */
function normalizeLikeMain(o: any, fallbackId: number): Inspection {
  const rawItems = Array.isArray(o?.items) ? o.items : []
  const items: InspectionItem[] = rawItems.map((it: any, idx: number) => ({
    id: typeof it?.id === 'number' ? it.id : idx + 1,
    content: String(it?.content ?? it?.内容 ?? it?.项目 ?? ''),
    status: it?.status === '异常' ? '异常' : '正常',
    // 若源数据携带了扩展字段也一并接住
    name: it?.name ?? it?.项目,
    temperature: typeof it?.temperature === 'number' ? it.temperature : (typeof it?.温度 === 'number' ? it.温度 : null),
    humidity: typeof it?.humidity === 'number' ? it.humidity : (typeof it?.湿度 === 'number' ? it.湿度 : null),
    pressure: typeof it?.pressure === 'number' ? it.pressure : (typeof it?.压力 === 'number' ? it.压力 : null),
    abnormalNote: it?.abnormalNote ?? it?.异常摘要,
    section: it?.section
  }))

  const abnormal =
    typeof o?.abnormal === 'number' ? o.abnormal : computeAbnormal(items)

  return {
    id: typeof o?.id === 'number' ? o.id : fallbackId,
    title: String(o?.title ?? ''),
    inspector: o?.inspector ? String(o.inspector) : undefined,
    date: String(o?.date ?? new Date().toISOString()),
    notes: o?.notes ? String(o.notes) : undefined,
    items,
    abnormal,
    synced: Boolean(o?.synced)
  }
}

export const useInspectionStore = defineStore('inspections', {
  state: () => ({
    list: [] as Inspection[],
    nextId: 1
  }),
  actions: {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
          this.list = []
          this.nextId = 1
          return
        }

        const parsed = JSON.parse(raw) as any[]
        let migrated = false

        this.list = (Array.isArray(parsed) ? parsed : []).map((o: any, idx) => {
          // codex 形状：存在 data（Record<string, LegacyCodexItem[]>）
          if (o && typeof o === 'object' && o.data && typeof o.data === 'object') {
            migrated = true
            return fromLegacyCodex(o as LegacyCodexRecord, idx + 1)
          }
          // 其余按 main 形状规整
          const before = JSON.stringify(o)
          const normalized = normalizeLikeMain(o, idx + 1)
          const after = JSON.stringify(normalized)
          if (before !== after) migrated = true
          return normalized
        })

        const max = this.list.reduce((acc, i) => Math.max(acc, i.id), 0)
        this.nextId = max + 1

        if (migrated) this.save()
      } catch (err) {
        console.error('Failed to load inspections', err)
        this.list = []
        this.nextId = 1
      }
    },

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list))
      } catch (err) {
        console.error('Failed to save inspections', err)
      }
    },

    /** 新增巡检；items 可缺省，abnormal 会自动计算 */
    add(data: Omit<Inspection, 'id' | 'abnormal' | 'synced'>) {
      const items = Array.isArray(data.items) ? data.items : []
      const inspection: Inspection = {
        id: this.nextId++,
        title: data.title,
        inspector: data.inspector,
        date: data.date,
        notes: data.notes,
        items,
        abnormal: computeAbnormal(items),
        synced: false
      }
      this.list.push(inspection)
      this.save()
    },

    /** 更新巡检；若传入了 items 会自动重算 abnormal */
    update(id: number, data: Partial<Inspection>) {
      const idx = this.list.findIndex(i => i.id === id)
      if (idx === -1) return
      const merged: Inspection = { ...this.list[idx], ...data }
      if (data.items) merged.abnormal = computeAbnormal(data.items)
      this.list[idx] = merged
      this.save()
    },

    /** 删除巡检 */
    remove(id: number) {
      this.list = this.list.filter(i => i.id !== id)
      this.save()
    },

    /** 按 id 获取 */
    getById(id: number) {
      return this.list.find(i => i.id === id)
    }
  }
})
