import { defineStore } from 'pinia'

export interface NotificationStat {
  id: number
  title: string
  confirmed: number
  unconfirmed: string[]
}

/**
 * Store for notification data.  In a full application this would interface
 * with the backend API.  For now we only keep a list of notification
 * statistics that can be populated via `fetchStats`.
 */
export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    stats: [] as NotificationStat[]
  }),
  actions: {
    /**
     * Retrieve notification statistics.  This implementation uses mocked
     * data but can be replaced with an actual API call.
     */
    async fetchStats() {
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 300))
      this.stats = [
        {
          id: 1,
          title: '服务器维护通知',
          confirmed: 3,
          unconfirmed: ['张三', '李四']
        },
        {
          id: 2,
          title: '安全提醒',
          confirmed: 5,
          unconfirmed: []
        }
      ]
    }
  }
})
