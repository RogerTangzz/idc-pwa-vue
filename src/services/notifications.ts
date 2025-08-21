// Mock notification API service. In a real application these functions would
// communicate with a backend server. They return resolved promises so tests can
// mock them to simulate success or failure.

export async function createNotification(message: string): Promise<void> {
  // placeholder for API call
}

export async function confirmNotification(id: number): Promise<void> {
  // placeholder for API call
}
