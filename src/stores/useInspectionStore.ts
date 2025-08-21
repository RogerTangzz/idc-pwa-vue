import { defineStore } from 'pinia'

/**
 * Representation of a single inspection record.  Each inspection contains
 * the date it was performed, the primary inspector and an optional relay
 * inspector.  The record also stores the number of issues discovered and any
 * additional notes.
 */
export interface Inspection {
  id: number
  /** Number of abnormal items found during inspection */
  abnormalCount: number
  /** Date of the inspection in YYYY-MM-DD format */
  date: string
  inspector: string
  relayInspector: string
  remark?: string
}

/**
 * Pinia store responsible for persisting and querying inspection records via
 * localStorage.  The store exposes helpers to list, add, update, remove and
 * filter inspections.
 */
export const useInspectionStore = defineStore('inspections', {
  state: () => ({
    /** All inspection records */
    list: [] as Inspection[],
    /**
     * Next identifier for new inspections.  This is derived from the largest
     * existing id.
     */
    nextId: 1
  }),
  actions: {
    /** Load inspections from localStorage */
    load() {
      const raw = localStorage.getItem('idc-inspections')
      if (raw) {
        try {
          this.list = JSON.parse(raw)
          const max = this.list.reduce((acc, i) => Math.max(acc, i.id), 0)
          this.nextId = max + 1
        } catch {
          this.list = []
          this.nextId = 1
        }
      }
    },
    /** Persist current inspection list to localStorage */
    save() {
      localStorage.setItem('idc-inspections', JSON.stringify(this.list))
    },
    /** Add a new inspection */
    add(data: Omit<Inspection, 'id'>) {
      const record: Inspection = { id: this.nextId++, ...data }
      this.list.push(record)
      this.save()
    },
    /** Update an existing inspection */
    update(id: number, data: Partial<Inspection>) {
      const idx = this.list.findIndex(i => i.id === id)
      if (idx !== -1) {
        this.list[idx] = { ...this.list[idx], ...data }
        this.save()
      }
    },
    /** Remove an inspection by id */
    remove(id: number) {
      this.list = this.list.filter(i => i.id !== id)
      this.save()
    },
    /**
     * Return inspections matching the supplied keyword and/or date.  Keyword
     * search is case-insensitive and checks inspector, relay inspector and
     * remark fields.  When a date is provided (YYYY-MM-DD) only records with
     * the same date are returned.
     */
    filter(keyword: string, date?: string) {
      let items = [...this.list]
      const kw = keyword.trim().toLowerCase()
      if (kw) {
        items = items.filter(i => {
          return (
            i.inspector.toLowerCase().includes(kw) ||
            i.relayInspector.toLowerCase().includes(kw) ||
            (i.remark && i.remark.toLowerCase().includes(kw))
          )
        })
      }
      if (date) {
        items = items.filter(i => i.date.startsWith(date))
      }
      return items
    }
  }
})

