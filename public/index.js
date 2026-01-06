import hmr from "features/hmr.js"
import showMenu from "features/showMenu.js"
import page from "features/page.js"
import user from "features/user.js"
import { effect } from "./reactive.js"
import { render, html } from "html"
import { preload } from "./elements/element.js"
import { getPageFromHash } from "./routing.js"
import "./elements/layout.js"

// clean up the DOM, already loaded scripts are just DOM junk
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

window.initialPage = getPageFromHash()

async function testIsLoggedIn() {
  if (localStorage.token) {
    try {
      // lets test if we can get something
      const res = await fetch(`/current-user`, {
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
      })

      if (res.ok) {
        user.value = await res.json()
        page.value = window.initialPage || { main: `rsvp` }
        return
      }
    } catch (e) {}
  }

  page.value = `login`
}

await preload()
await testIsLoggedIn()
