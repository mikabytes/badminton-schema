// sw.js
self.addEventListener("install", () => {
  // no-op
})

self.addEventListener("activate", () => {
  // no-op
})

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Badminton", {
      body: data.body ?? "Kom ihåg att svara på inbjudan.",
    })
  )
})
