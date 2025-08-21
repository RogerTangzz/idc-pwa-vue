import { defineStore } from 'pinia'

/**
 * Description of an inspection record. Inspections represent routine
 * checks performed in the data centre. For now the structure is simple
 * and can be extended as the application grows.
 */
export interface Inspection {
  id: number
  title: string
  /** Optional notes about the inspection. */
  notes?: string
  /** ISO timestamp indicating when the inspection is scheduled. */
  date: string
  /** Whether the inspection has been synchronised with the backend. */
  synced: boolean
}

/**
 * Pinia store for managing inspections. Inspections are persisted to
 * localStorage under the key `idc-inspections`. All CRUD operations keep
 * the localStorage representation in sync. Basic error handling ensures
 * that storage failures do not crash the application.
 */
export const useInspectionStore = defineStore('inspections', {
  state: () => ({
    /** List of all inspections. */
    list: [] as Inspection[],
    /** Next identifier for a new inspection. */
    nextId: 1
  }),
  actions: {
    /**
     * Load persisted inspections from localStorage. Call during
     * application start-up.
     */
    load() {
      try {
        const raw = localStorage.getItem('idc-inspections')
        if (raw) {
          this.list = JSON.parse(raw) as Inspection[]
          const max = this.list.reduce((acc, i) => Math.max(acc, i.id), 0)
          this.nextId = max + 1
        }
      } catch (err) {
        console.error('Failed to load inspections', err)
        this.list = []
        this.nextId = 1
      }
    },
    /**
     * Persist the current inspection list to localStorage.
     */
    save() {
      try {
        localStorage.setItem('idc-inspections', JSON.stringify(this.list))
      } catch (err) {
        console.error('Failed to save inspections', err)
      }
    },
    /**
     * Add a new inspection. The id and synced flag are populated
     * automatically.
     */
    add(data: Omit<Inspection, 'id' | 'synced'>) {
      const inspection: Inspection = {
        id: this.nextId++,
        synced: false,
        ...data
      }
      this.list.push(inspection)
      this.save()
    },
    /**
     * Update an existing inspection by id. If no inspection is found the
     * call is silently ignored.
     */
    update(id: number, data: Partial<Inspection>) {
      const idx = this.list.findIndex(i => i.id === id)
      if (idx !== -1) {
        this.list[idx] = { ...this.list[idx], ...data }
        this.save()
      }
    },
    /**
     * Remove an inspection by id.
     */
    remove(id: number) {
      this.list = this.list.filter(i => i.id !== id)
      this.save()
    }
  }
})
