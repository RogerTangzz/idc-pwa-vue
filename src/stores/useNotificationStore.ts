import { defineStore } from 'pinia'
import { createNotification, confirmNotification } from '../services/notifications'

export interface Notification {
  id: number
  message: string
  confirmed: boolean
  createdAt: string
}

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    list: [] as Notification[],
    nextId: 1
  }),
  getters: {
    total: state => state.list.length,
    confirmedCount: state => state.list.filter(n => n.confirmed).length,
    unconfirmedCount: state => state.list.filter(n => !n.confirmed).length
  },
  actions: {
    async add(message: string) {
      await createNotification(message)
      const notification: Notification = {
        id: this.nextId++,
        message,
        confirmed: false,
        createdAt: new Date().toISOString()
      }
      this.list.push(notification)
    },
    async confirm(id: number) {
      await confirmNotification(id)
      const item = this.list.find(n => n.id === id)
      if (item) item.confirmed = true
    }
  }
})
