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
  /** 接班/复核巡检人（为兼容搜索 UI 新增） */
  relayInspector?: string
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

/** 仅用于迁移：codex 分支的旧数据形状（分组+物理量） */
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

/** 仅用于迁移：极简搜索版对象（无 items，仅 remark 等） */
type LegacySimpleRecord = {
  id: number
  inspector: string
  relayInspector?: string
  remark?: string
  // 可能没有 date/title/items/abnormal/synced
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
    relayInspector: undefined,
    date,
    notes: undefined,
    items,
    abnormal,
    synced: false
  }
}

/** 兜底把“看起来像 main/或极简搜索版”的对象规整为规范 Inspection */
function normalizeLikeMain(o: any, fallbackId: number): Inspection {
  // 极简搜索版（没有 items/abnormal/synced）
  if (o && typeof o === 'object' && !Array.isArray(o.items) && o.inspector && (o.remark || o.relayInspector)) {
    const id = typeof o?.id === 'number' ? o.id : fallbackId
    return {
      id,
      title: String(o?.title ?? (o?.remark ? `巡检：${o.remark}` : `巡检记录 #${id}`)),
      inspector: String(o.inspector),
      relayInspector: o?.relayInspector ? String(o.relayInspector) : undefined,
      date: String(o?.date ?? new Date().toISOString().slice(0, 10)),
      notes: o?.remark ? String(o.remark) : (o?.notes ? String(o.notes) : undefined),
      items: [],
      abnormal: 0,
      synced: false
    }
  }

  // 近似 main 的对象
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
    relayInspector: o?.relayInspector ? String(o.relayInspector) : undefined,
    date: String(o?.date ?? new Date().toISOString()),
    notes: o?.notes ? String(o.notes) : undefined,
    items,
    abnormal,
    synced: typeof o?.synced === 'boolean' ? o.synced : false
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
          // codex 分组版：存在 data（Record<string, LegacyCodexItem[]>）
          if (o && typeof o === 'object' && o.data && typeof o.data === 'object') {
            migrated = true
            return fromLegacyCodex(o as LegacyCodexRecord, idx + 1)
          }
          // 其余按 main/极简搜索版 形状规整
          const before = JSON.stringify(o)
          const normalized = normalizeLikeMain(o as LegacySimpleRecord | any, idx + 1)
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
        relayInspector: data.relayInspector,
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
    },

    /**
     * 过滤函数：兼容搜索 UI 的参数
     * - inspector: 精确等值匹配
     * - relayInspector: 精确等值匹配
     * - remark: 在 notes/title 中模糊包含（remark ~ notes 的别名）
     * - keyword: 在 title/inspector/relayInspector/notes 中模糊包含
     */
    filter(params: { inspector?: string; relayInspector?: string; remark?: string; keyword?: string }) {
      let items = [...this.list]
      const eq = (a?: string, b?: string) => (a ?? '') === (b ?? '')

      if (params.inspector) {
        items = items.filter(i => eq(i.inspector, params.inspector))
      }
      if (params.relayInspector) {
        items = items.filter(i => eq(i.relayInspector, params.relayInspector))
      }
      if (params.remark && params.remark.trim()) {
        const kw = params.remark.trim()
        items = items.filter(i =>
          (i.notes && i.notes.includes(kw)) || (i.title && i.title.includes(kw))
        )
      }
      if (params.keyword && params.keyword.trim()) {
        const kw = params.keyword.trim()
        items = items.filter(i =>
          (i.title && i.title.includes(kw)) ||
          (i.inspector && i.inspector.includes(kw)) ||
          (i.relayInspector && i.relayInspector.includes(kw)) ||
          (i.notes && i.notes.includes(kw))
        )
      }
      return items
    },

    /**
     * 兼容原分支的异步获取接口：这里等价于 load()
     * 如需演示数据，可传入 seedIfEmpty=true 自动注入示例数据。
     */
    async fetchInspections(seedIfEmpty = false) {
      this.load()
      if (seedIfEmpty && this.list.length === 0) {
        this.list = [
          {
            id: 1,
            title: '机房温度检查',
            inspector: '张三',
            relayInspector: '李四',
            date: new Date().toISOString().slice(0, 10),
            notes: '示例记录：机房温度点检',
            items: [],
            abnormal: 0,
            synced: false
          },
          {
            id: 2,
            title: 'UPS 巡检',
            inspector: '王五',
            relayInspector: '赵六',
            date: new Date().toISOString().slice(0, 10),
            notes: '示例记录：UPS 状态',
            items: [],
            abnormal: 0,
            synced: false
          }
        ]
        this.nextId = 3
        this.save()
      }
    }
  }
})
