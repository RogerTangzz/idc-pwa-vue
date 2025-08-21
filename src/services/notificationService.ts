export interface Notification {
  id: number
  message: string
  confirmed: boolean
}

const STORAGE_KEY = 'idc-notifications'

function read(): Notification[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      return JSON.parse(raw) as Notification[]
    } catch {
      return []
    }
  }
  return []
}

function write(list: Notification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms))

export async function fetchNotifications(): Promise<Notification[]> {
  await delay()
  return read()
}

export async function postNotification(message: string): Promise<Notification> {
  await delay()
  const list = read()
  const nextId = list.reduce((max, n) => Math.max(max, n.id), 0) + 1
  const notification: Notification = { id: nextId, message, confirmed: false }
  list.push(notification)
  write(list)
  return notification
}

export async function confirmNotification(id: number): Promise<Notification> {
  await delay()
  const list = read()
  const idx = list.findIndex(n => n.id === id)
  if (idx === -1) {
    throw new Error('Notification not found')
  }
  list[idx].confirmed = true
  write(list)
  return list[idx]
}
