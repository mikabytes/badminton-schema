import { page, users } from "./signals.js"

// clean up the DOM
for (const s of [...document.querySelectorAll(`script`)]) {
  s.remove()
}

// add service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js", { type: `module` })

  navigator.serviceWorker.ready.then((reg) => {
    console.log("SW ready:", reg)
  })
}

async function login() {
  if (localStorage.token) {
    try {
      // lets test if we can get something
      const res = await fetch(`/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
      })

      if (res.ok) {
        users.value = await res.json()
        page.value = `rsvp`
        return
      }
    } catch (e) {}
  }

  page.value = `login`
}

await login()
