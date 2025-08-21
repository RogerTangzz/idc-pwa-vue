import { defineStore } from 'pinia'

/**
 * Description of a task in the data centre platform.  Tasks can be used
 * to schedule work orders, preventive maintenance or other activities.
 */
export interface Task {
  id: number
  title: string
  status: '新建' | '处理中' | '已完成'
  location?: string
  recurrence?: string
  dueDate?: string
  createdAt: string
  description?: string
  /** When true the task has been synchronised with the backend. */
  synced: boolean
}

/**
 * Pinia store for managing tasks.  Tasks are persisted to localStorage so
 * that they survive page refreshes.  In a real application you would
 * synchronise tasks with a remote API instead of relying solely on
 * localStorage.
 */
export const useTaskStore = defineStore('tasks', {
  state: () => ({
    /**
     * A list of all tasks.  Use actions to mutate this array.
     */
    list: [] as Task[],
    /**
     * The next identifier to assign when creating a task.  This counter
     * is derived from the largest existing id.
     */
    nextId: 1
  }),
  actions: {
    /**
     * Load persisted tasks from localStorage.  This should be called
     * once during app initialisation.
     */
    load() {
      const raw = localStorage.getItem('idc-tasks')
      if (raw) {
        try {
          this.list = JSON.parse(raw)
          // derive the next id from existing tasks
          const max = this.list.reduce((acc, t) => Math.max(acc, t.id), 0)
          this.nextId = max + 1
        } catch {
          this.list = []
          this.nextId = 1
        }
      }
    },
    /**
     * Persist the current task list to localStorage.
     */
    save() {
      localStorage.setItem('idc-tasks', JSON.stringify(this.list))
    },
    /**
     * When a recurring task is completed schedule the next occurrence.
     * A new task with the same details but a later dueDate is inserted
     * unless one already exists. Supported recurrences are 每日/每周/每月.
     */
    scheduleNext(task: Task) {
      if (task.status !== '已完成' || !task.recurrence || !task.dueDate) {
        return
      }
      const current = new Date(task.dueDate)
      const next = new Date(current)
      switch (task.recurrence) {
        case '每日':
          next.setDate(current.getDate() + 1)
          break
        case '每周':
          next.setDate(current.getDate() + 7)
          break
        case '每月':
          next.setMonth(current.getMonth() + 1)
          break
        default:
          return
      }
      const due = next.toISOString()
      const exists = this.list.some(t => t.title === task.title && t.dueDate === due)
      if (exists) {
        return
      }
      const newTask: Task = {
        id: this.nextId++,
        title: task.title,
        status: '新建',
        location: task.location,
        recurrence: task.recurrence,
        dueDate: due,
        createdAt: new Date().toISOString(),
        description: task.description,
        synced: false
      }
      this.list.push(newTask)
      this.save()
    },
    /**
     * Add a new task.  The id, creation timestamp and synced flag are
     * automatically filled in.
     */
    add(taskData: Omit<Task, 'id' | 'createdAt' | 'synced'>) {
      const task: Task = {
        id: this.nextId++,
        createdAt: new Date().toISOString(),
        synced: false,
        ...taskData
      }
      this.list.push(task)
      this.scheduleNext(task)
      this.save()
    },
    /**
     * Update an existing task by merging in partial fields.  If the task
     * does not exist nothing happens.
     */
    update(id: number, data: Partial<Task>) {
      const idx = this.list.findIndex(t => t.id === id)
      if (idx !== -1) {
        this.list[idx] = { ...this.list[idx], ...data }
        this.scheduleNext(this.list[idx])
        this.save()
      }
    },
    /**
     * Remove a task by id.  This action updates localStorage as well.
     */
    remove(id: number) {
      this.list = this.list.filter(t => t.id !== id)
      this.save()
    }
  }
})