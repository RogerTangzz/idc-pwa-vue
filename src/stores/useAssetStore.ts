import { defineStore } from 'pinia'

export interface Asset {
  id: number
  name: string
  category?: string
  location?: string
  status: '在库' | '借用中' | '维修'
  borrowerId?: string
  borrowTime?: string
  returnTime?: string
  remark?: string
}

export const useAssetStore = defineStore('assets', {
  state: () => ({
    list: [] as Asset[],
    nextId: 1
  }),
  actions: {
    load() {
      const raw = localStorage.getItem('idc-assets')
      if (raw) {
        try {
          this.list = JSON.parse(raw)
          const max = this.list.reduce((acc, a) => Math.max(acc, a.id), 0)
          this.nextId = max + 1
        } catch {
          this.list = []
          this.nextId = 1
        }
      }
    },
    save() {
      localStorage.setItem('idc-assets', JSON.stringify(this.list))
    },
    add(data: Omit<Asset, 'id'>) {
      const asset: Asset = {
        id: this.nextId++,
        ...data
      }
      this.list.push(asset)
      this.save()
    },
    update(id: number, data: Partial<Asset>) {
      const idx = this.list.findIndex(a => a.id === id)
      if (idx !== -1) {
        this.list[idx] = { ...this.list[idx], ...data }
        this.save()
      }
    },
    remove(id: number) {
      this.list = this.list.filter(a => a.id !== id)
      this.save()
    },
    returnAsset(id: number) {
      const idx = this.list.findIndex(a => a.id === id)
      if (idx !== -1) {
        this.list[idx].status = '在库'
        this.list[idx].borrowerId = undefined
        this.list[idx].borrowTime = undefined
        this.list[idx].returnTime = new Date().toISOString()
        this.save()
      }
    }
  }
})
