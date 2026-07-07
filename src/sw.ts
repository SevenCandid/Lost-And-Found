/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare let self: ServiceWorkerGlobalScope

// Precache all assets injected by Vite PWA
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// ─── Routing & Runtime Caching ───────────────────────────────────────────────

// 1. Handle Navigation Requests (Offline SPA support)
// This ensures that if the user reloads a route like /messages offline, 
// the Service Worker serves the index.html shell.
try {
  const handler = createHandlerBoundToURL('/index.html')
  const navigationRoute = new NavigationRoute(handler, {
    denylist: [/^\/admin/, /^\/api/], // Don't serve app shell for admin or API routes if any
  })
  registerRoute(navigationRoute)
} catch (error) {
  console.warn('Navigation fallback could not be registered', error)
}

// 2. Cache Images (Supabase uploads, avatars, etc.)
// Uses CacheFirst since uploaded item images generally don't change.
registerRoute(
  ({ request, url }) => request.destination === 'image' || url.pathname.match(/\.(?:png|jpg|jpeg|svg|webp|gif)$/),
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
)

// 3. Cache API/Supabase Requests (Optional enhancement for feed)
registerRoute(
  ({ url }) => url.href.includes('supabase.co/rest/v1/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
)

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
