import { defineStore } from 'pinia'

export interface Notification {
  id: number
  title: string
  message: string
  type: string
  read: boolean
  date: string
}

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    list: [] as Notification[],
    nextId: 1
  }),
  actions: {
    load() {
      const raw = localStorage.getItem('idc-notifications')
      if (raw) {
        try {
          this.list = JSON.parse(raw)
          const max = this.list.reduce((acc, n) => Math.max(acc, n.id), 0)
          this.nextId = max + 1
        } catch {
          this.list = []
          this.nextId = 1
        }
      }
    },
    save() {
      localStorage.setItem('idc-notifications', JSON.stringify(this.list))
    },
    add(data: Omit<Notification, 'id' | 'date' | 'read'>) {
      const item: Notification = {
        id: this.nextId++,
        date: new Date().toISOString(),
        read: false,
        ...data
      }
      this.list.push(item)
      this.save()
    },
    markRead(id: number) {
      const idx = this.list.findIndex(n => n.id === id)
      if (idx !== -1) {
        this.list[idx].read = true
        this.save()
      }
    },
    markAllRead() {
      this.list = this.list.map(n => ({ ...n, read: true }))
      this.save()
    },
    remove(id: number) {
      this.list = this.list.filter(n => n.id !== id)
      this.save()
    }
  }
})
