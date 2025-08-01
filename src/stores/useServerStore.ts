import { defineStore } from 'pinia'

export interface Server {
  name: string
  ip: string
  status: '在线' | '离线'
}

/**
 * Store for the server list.  In this demo the list of servers is
 * hard-coded and returned after a short delay to emulate an async API
 * call.  Replace fetchServers() with a real API request when
 * integrating with a backend service.
 */
export const useServerStore = defineStore('server', {
  state: () => ({
    list: [] as Server[]
  }),
  actions: {
    async fetchServers() {
      // Simulate network latency
      await new Promise(res => setTimeout(res, 200))
      this.list = [
        { name: 'Server A', ip: '192.168.0.1', status: '在线' },
        { name: 'Server B', ip: '192.168.0.2', status: '离线' },
        { name: 'Server C', ip: '192.168.0.3', status: '在线' }
      ]
    }
  }
})