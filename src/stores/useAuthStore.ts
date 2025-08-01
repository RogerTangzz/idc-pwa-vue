import { defineStore } from 'pinia'

/**
 * Pinia store responsible for user authentication and user account
 * management.  Credentials are persisted in localStorage so that a
 * logged in user will remain authenticated after a page refresh.
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    /**
     * The currently logged in user.  When no user is logged in this
     * property is `null`.
     */
    user: null as null | { username: string; role: string },
    /**
     * A list of registered users.  Each user has a username, password
     * and role.  Passwords are stored in plain text for simplicity; in
     * production you should never do this.
     */
    users: [] as { username: string; password: string; role: string }[]
  }),
  actions: {
    /**
     * Initialise the store by loading persisted users and the currently
     * logged in user from localStorage.  Call this once during app
     * startup.
     */
    load() {
      const usersRaw = localStorage.getItem('idc-users')
      if (usersRaw) {
        try {
          this.users = JSON.parse(usersRaw)
        } catch {
          this.users = []
        }
      }
      const currentRaw = localStorage.getItem('idc-current')
      if (currentRaw) {
        try {
          const parsed = JSON.parse(currentRaw)
          this.user = parsed
        } catch {
          this.user = null
        }
      }
    },
    /**
     * Persist the current list of users to localStorage.  Should be
     * called after adding or removing users.
     */
    saveUsers() {
      localStorage.setItem('idc-users', JSON.stringify(this.users))
    },
    /**
     * Persist the currently logged in user to localStorage or remove it
     * if no user is logged in.
     */
    saveCurrent() {
      if (this.user) {
        localStorage.setItem('idc-current', JSON.stringify(this.user))
      } else {
        localStorage.removeItem('idc-current')
      }
    },
    /**
     * Register a new user.  Throws if the username is already taken.  A
     * successful registration also logs the user in.
     *
     * @param username The desired username
     * @param password The password
     * @param role     The role for the user (e.g. 管理员, 巡检员, 运维工程师)
     */
    register(username: string, password: string, role: string) {
      if (this.users.find(u => u.username === username)) {
        throw new Error('用户名已存在')
      }
      const record = { username, password, role }
      this.users.push(record)
      this.saveUsers()
      // log the user in after registration
      this.user = { username, role }
      this.saveCurrent()
    },
    /**
     * Attempt to log a user in.  Returns true on success and false
     * otherwise.  When successful the current user is persisted to
     * localStorage.
     */
    login(username: string, password: string): boolean {
      const found = this.users.find(u => u.username === username && u.password === password)
      if (found) {
        this.user = { username: found.username, role: found.role }
        this.saveCurrent()
        return true
      }
      return false
    },
    /**
     * Log the current user out.  Removes any persisted user state.
     */
    logout() {
      this.user = null
      this.saveCurrent()
    }
  }
})