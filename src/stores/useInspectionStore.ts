import { defineStore } from 'pinia'

export interface InspectionItem {
  id: number
  content: string
  status: '正常' | '异常'
}

export interface Inspection {
  id: number
  title: string
  /** 巡检人（旧数据可能没有） */
  inspector?: string
  /** ISO 日期或日期字符串，如 2025-08-21 */
  date: string
  /** 备注（旧数据可能没有） */
  notes?: string
  /** 巡检项明细（旧数据可能没有） */
  items: InspectionItem[]
  /** 异常项数量（会根据 items 自动计算） */
  abnormal: number
  /** 与后端同步标记（旧数据默认 false） */
  synced: boolean
}

const STORAGE_KEY = 'idc-inspections'

function computeAbnormal(items: InspectionItem[] | undefined): number {
  if (!Array.isArray(items)) return 0
  return items.filter(i => i?.status === '异常').length
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
          // 没有数据则不做种子；如需演示数据可自行添加
          this.list = []
          this.nextId = 1
          return
        }

        const parsed = JSON.parse(raw) as any[]
        let migrated = false

        this.list = (Array.isArray(parsed) ? parsed : []).map((o: any, idx) => {
          const items: InspectionItem[] = Array.isArray(o?.items)
            ? o.items.map((it: any, k: number) => ({
                id: typeof it?.id === 'number' ? it.id : k + 1,
                content: String(it?.content ?? ''),
                status: it?.status === '异常' ? '异常' : '正常'
              }))
            : []

          const abnormal =
            typeof o?.abnormal === 'number' ? o.abnormal : computeAbnormal(items)

          const migratedObj: Inspection = {
            id: typeof o?.id === 'number' ? o.id : idx + 1,
            title: String(o?.title ?? ''),
            inspector: o?.inspector ? String(o.inspector) : undefined,
            date: String(o?.date ?? ''),
            notes: o?.notes ? String(o.notes) : undefined,
            items,
            abnormal,
            synced: Boolean(o?.synced)
          }

          // 触发迁移标记的条件
          if (
            o?.abnormal !== abnormal ||
            !Array.isArray(o?.items) ||
            typeof o?.synced !== 'boolean'
          ) {
            migrated = true
          }

          return migratedObj
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

    /** 新增巡检，items 可缺省，abnormal 会自动计算 */
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
      if (data.items) {
        merged.abnormal = computeAbnormal(data.items)
      }
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
