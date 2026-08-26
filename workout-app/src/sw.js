import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

registerRoute(
  ({ url }) => url.hostname.endsWith('.supabase.co'),
  new NetworkFirst({
    cacheName: 'supabase-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
)

// Rest timer scheduling via postMessage from the app
const pendingTimers = new Map() // clientId → timeoutId

self.addEventListener('message', (event) => {
  const { type, endTime, label } = event.data ?? {}
  const clientId = event.source?.id

  if (type === 'SCHEDULE_REST_TIMER') {
    const delay = endTime - Date.now()
    if (delay <= 0) return
    if (pendingTimers.has(clientId)) clearTimeout(pendingTimers.get(clientId))
    const id = setTimeout(() => {
      pendingTimers.delete(clientId)
      self.registration.showNotification('Rest Complete', {
        body: label ? `Time for your next ${label} set` : 'Rest period is over',
        icon: '/pwa-192x192.png',
        badge: '/pwa-64x64.png',
        tag: 'rest-timer',
        renotify: true,
      })
    }, delay)
    pendingTimers.set(clientId, id)
  }

  if (type === 'CANCEL_REST_TIMER') {
    if (pendingTimers.has(clientId)) {
      clearTimeout(pendingTimers.get(clientId))
      pendingTimers.delete(clientId)
    }
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin))
      return existing ? existing.focus() : self.clients.openWindow('/')
    })
  )
})
