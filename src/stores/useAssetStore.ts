import { defineStore } from 'pinia'

/** Log entry for asset borrow/return events. */
export interface AssetLog {
  /** Action performed on the asset. */
  action: '借用' | '归还'
  /** Identifier of the user performing the action. */
  userId: string
  /** ISO timestamp of when the action occurred. */
  time: string
}

/** Representation of a physical asset in the data centre. */
export interface Asset {
  id: number
  name: string
  category: string
  location: string
  status: '可用' | '借用' | '维修中'
  remark?: string
  borrowerId?: string
  borrowTime?: string
  returnTime?: string
  logs: AssetLog[]
}

/**
 * Pinia store managing data centre assets.  Assets are persisted to
 * localStorage under the key `idc-assets`.
 */
export const useAssetStore = defineStore('assets', {
  state: () => ({
    /** List of all assets. */
    list: [] as Asset[],
    /** Next identifier to assign when adding an asset. */
    nextId: 1
  }),
  actions: {
    /** Load persisted assets from localStorage. */
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
    /** Persist current assets to localStorage. */
    save() {
      localStorage.setItem('idc-assets', JSON.stringify(this.list))
    },
    /** Add a new asset to the list. */
    add(data: Omit<Asset, 'id' | 'logs'>) {
      const asset: Asset = {
        id: this.nextId++,
        logs: [],
        status: '可用',
        ...data
      }
      this.list.push(asset)
      this.save()
    },
    /** Update an existing asset by id. */
    update(id: number, data: Partial<Asset>) {
      const idx = this.list.findIndex(a => a.id === id)
      if (idx !== -1) {
        this.list[idx] = { ...this.list[idx], ...data }
        this.save()
      }
    },
    /** Remove an asset by id. */
    remove(id: number) {
      this.list = this.list.filter(a => a.id !== id)
      this.save()
    },
    /** Borrow an asset, recording borrower and time. */
    borrow(id: number, borrowerId: string) {
      const asset = this.list.find(a => a.id === id)
      if (asset) {
        const now = new Date().toISOString()
        asset.borrowerId = borrowerId
        asset.borrowTime = now
        asset.status = '借用'
        asset.logs.push({ action: '借用', userId: borrowerId, time: now })
        this.save()
      }
    },
    /** Return a previously borrowed asset. */
    returnAsset(id: number) {
      const asset = this.list.find(a => a.id === id)
      if (asset) {
        const now = new Date().toISOString()
        asset.returnTime = now
        if (asset.borrowerId) {
          asset.logs.push({ action: '归还', userId: asset.borrowerId, time: now })
        }
        asset.borrowerId = undefined
        asset.borrowTime = undefined
        asset.status = '可用'
        this.save()
      }
    },
    /** Search assets by name, category, location or remark. */
    search(keyword: string) {
      const kw = keyword.trim().toLowerCase()
      return this.list.filter(a => [a.name, a.category, a.location, a.remark]
        .filter(Boolean)
        .some(f => (f as string).toLowerCase().includes(kw)))
    }
  }
})
