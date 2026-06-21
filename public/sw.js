const CACHE_NAME = "pedefacil-v1"

const urlsToCache = [
  "/",
  "/manifest.json",
]

self.addEventListener("install", (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event: any) => {
  const url = new URL(event.request.url)

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }
        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })
        return response
      })
    })
  )
})

self.addEventListener("push", (event: any) => {
  let data = { title: "PedeFácil", body: "Nova notificação", url: "/" }
  try {
    data = JSON.parse(event.data.text())
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [200, 100, 200],
      data: { url: data.url },
      actions: [
        { action: "open", title: "Abrir" },
      ],
    })
  )
})

self.addEventListener("notificationclick", (event: any) => {
  event.notification.close()
  const url = event.notification.data?.url || "/"
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients: any) => {
      const existingClient = clients.find((c: any) => c.url.includes(self.location.origin))
      if (existingClient) {
        existingClient.navigate(url)
        existingClient.focus()
      } else {
        self.clients.openWindow(url)
      }
    })
  )
})
