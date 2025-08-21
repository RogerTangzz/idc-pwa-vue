import { defineStore } from 'pinia'
import type { Notification } from '@/services/notificationService'
import { fetchNotifications, postNotification, confirmNotification } from '@/services/notificationService'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    list: [] as Notification[],
    loading: false,
    error: null as string | null
  }),
  actions: {
    async load() {
      this.loading = true
      this.error = null
      try {
        this.list = await fetchNotifications()
      } catch (e: any) {
        this.error = e.message || String(e)
      } finally {
        this.loading = false
      }
    },
    async add(message: string) {
      this.loading = true
      this.error = null
      try {
        const n = await postNotification(message)
        this.list.push(n)
      } catch (e: any) {
        this.error = e.message || String(e)
      } finally {
        this.loading = false
      }
    },
    async confirm(id: number) {
      this.loading = true
      this.error = null
      try {
        const n = await confirmNotification(id)
        const idx = this.list.findIndex(i => i.id === id)
        if (idx !== -1) {
          this.list[idx] = n
        }
      } catch (e: any) {
        this.error = e.message || String(e)
      } finally {
        this.loading = false
      }
    }
  }
})
