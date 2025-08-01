import { defineStore } from 'pinia'

/**
 * A simple tag record.  Tags are used to categorise tasks, orders or
 * other entities.  Each tag has a unique id, a human friendly name
 * and an optional description.  Tags are persisted to localStorage
 * under the key `idc-tags`.
 */
export interface Tag {
  id: number
  name: string
  description?: string
  createdAt: string
}

export const useTagStore = defineStore('tags', {
  state: () => ({
    list: [] as Tag[],
    nextId: 1
  }),
  actions: {
    /**
     * Load tags from localStorage.  Determines the next available id
     * from the highest existing tag id.
     */
    load() {
      const raw = localStorage.getItem('idc-tags')
      if (raw) {
        try {
          this.list = JSON.parse(raw)
          const max = this.list.reduce((acc, t) => Math.max(acc, t.id), 0)
          this.nextId = max + 1
        } catch {
          this.list = []
          this.nextId = 1
        }
      }
    },
    /**
     * Persist tags to localStorage.
     */
    save() {
      localStorage.setItem('idc-tags', JSON.stringify(this.list))
    },
    /**
     * Create a new tag.
     */
    add(data: Omit<Tag, 'id' | 'createdAt'>) {
      const tag: Tag = {
        id: this.nextId++,
        createdAt: new Date().toISOString(),
        ...data
      }
      this.list.push(tag)
      this.save()
    },
    /**
     * Update an existing tag.  Merges the provided data into the
     * existing record.
     */
    update(id: number, data: Partial<Tag>) {
      const idx = this.list.findIndex(t => t.id === id)
      if (idx !== -1) {
        this.list[idx] = { ...this.list[idx], ...data }
        this.save()
      }
    },
    /**
     * Delete a tag by id.
     */
    remove(id: number) {
      this.list = this.list.filter(t => t.id !== id)
      this.save()
    }
  }
})