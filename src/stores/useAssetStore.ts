import { defineStore } from 'pinia'

export interface AssetLog {
  action: 'add' | 'borrow' | 'return'
  user?: string
  date: string
}

export interface Asset {
  id: number
  name: string
  status: 'available' | 'borrowed'
  borrower?: string
  borrowedAt?: string
  returnedAt?: string
  logs: AssetLog[]
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
          const max = this.list.reduce((m, a) => Math.max(m, a.id), 0)
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
    add(data: Omit<Asset, 'id' | 'status' | 'logs' | 'borrower' | 'borrowedAt' | 'returnedAt'>) {
      const asset: Asset = {
        id: this.nextId++,
        status: 'available',
        logs: [],
        ...data
      }
      this.list.push(asset)
      this.save()
    },
    borrow(id: number, user: string) {
      const asset = this.list.find(a => a.id === id)
      if (asset) {
        const now = new Date().toISOString()
        asset.status = 'borrowed'
        asset.borrower = user
        asset.borrowedAt = now
        asset.logs.push({ action: 'borrow', user, date: now })
        this.save()
      }
    },
    returnAsset(id: number) {
      const asset = this.list.find(a => a.id === id)
      if (asset) {
        const now = new Date().toISOString()
        asset.status = 'available'
        asset.returnedAt = now
        asset.borrower = undefined
        asset.borrowedAt = undefined
        asset.logs.push({ action: 'return', date: now })
        this.save()
      }
    },
    search(keyword: string) {
      const q = keyword.toLowerCase()
      return this.list.filter(a => a.name.toLowerCase().includes(q))
    }
  }
})

