import hmr from "features/hmr.js"
import showMenu from "features/showMenu.js"
import page from "features/page.js"
import user from "features/user.js"
import { effect } from "./reactive.js"
import { render, html } from "html"
import "./routing.js"
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
        console.log(`Logged in`)
        user.value = await res.json()
        return
      }
    } catch (e) {}
  }

  page.value = `login`
}

await testIsLoggedIn()

// Hot Module Reloading (listening to file changes)
const source = new EventSource(`/changes`)
source.onmessage = (message) => {
  const { path, exists } = JSON.parse(message.data)

  if (!exists) {
    console.log(`${path} was deleted!`)

    document.location.reload()
  } else {
    console.log(`${path} was modified.`)

    if (path.startsWith(`public/elements`) && path !== `public/elements/layout.js`) {
      // this will re-load it, and when doing customElements.define will
      // automatically trigger the hmr signal and re-render everything
      import(`${path.replace(/^public/, ``)}?d=${Date.now()}`)
    } else {
      document.location.reload()
    }
  }

  // Use that specific file for hot reloading, or do a full page refresh
}
