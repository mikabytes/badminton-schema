self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const raw = event.data ? event.data.text() : ""
        console.log("push event raw:", raw)

        let data = {}
        try {
          data = raw ? JSON.parse(raw) : {}
        } catch (e) {
          console.warn("push payload was not JSON", e)
        }

        await self.registration.showNotification(data.title ?? "Badminton", {
          body: data.body ?? "Kom ihåg att svara på inbjudan.",
          data: { url: data.url ?? "#" },
          tag: data.tag ?? "rsvp-reminder",
        })
      } catch (err) {
        console.error("push handler failed:", err)
      }
    })()
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const { url } = event.notification.data

  event.waitUntil(
    (async () => {
      // Prefer focusing an existing tab/window of this PWA
      const clientsArr = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      })

      // If you have multiple, pick the most relevant; this picks the first same-origin client
      for (const client of clientsArr) {
        // Focus and navigate (navigate is supported in modern browsers)
        try {
          await client.focus()
        } catch (e) {
          console.log(e)
        }
        if ("navigate" in client) {
          await client.navigate(url)
        } else {
          // Fallback: open a new window if navigate isn't available
          await clients.openWindow(url)
        }
        return
      }

      // No existing client, open a new one
      await clients.openWindow(url)
    })()
  )
})
