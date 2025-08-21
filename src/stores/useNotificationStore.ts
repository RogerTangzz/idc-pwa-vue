import { defineStore } from 'pinia'

export interface Notification {
  id: number
  title: string
  content: string
  publisher: string
  createdAt: string
  confirmed: number
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
    add(data: Omit<Notification, 'id' | 'createdAt' | 'confirmed'>) {
      const notification: Notification = {
        id: this.nextId++,
        createdAt: new Date().toISOString(),
        confirmed: 0,
        ...data
      }
      this.list.push(notification)
      this.save()
    },
    confirm(id: number) {
      const idx = this.list.findIndex(n => n.id === id)
      if (idx !== -1) {
        this.list[idx].confirmed += 1
        this.save()
      }
    }
  }
})
