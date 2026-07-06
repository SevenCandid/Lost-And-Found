/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope

// Precache all assets injected by Vite PWA
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// ─── Push Event ──────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data: {
    title?: string
    body?: string
    icon?: string
    badge?: string
    data?: { url?: string; notification_id?: string }
  } = {}

  try {
    data = event.data.json()
  } catch {
    data = { title: 'Lost & Found', body: event.data.text() }
  }

  const options: any = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-192x192.png',
    data: data.data || {},
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    tag: data.data?.notification_id || 'lostfound-notification',
    renotify: true,
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Lost & Found', options)
  )
})

// ─── Notification Click ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const url = event.notification.data?.url || '/notifications'

  event.waitUntil(
    (self.clients.matchAll({ type: 'window', includeUncontrolled: true }) as Promise<WindowClient[]>).then((clients) => {
      // If app is already open, focus it
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})
