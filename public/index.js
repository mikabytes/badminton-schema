import { page, users, hmr, showMenu } from "./signals.js"
import { effect } from "./reactive.js"
import { render, html } from "html"
import "./elements/page-login.js"
import "./elements/page-rsvp.js"
import "./elements/menu.js"

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

await testIsLoggedIn()

const content = document.querySelector(`#content`)
const title = document.querySelector(`h1`)
const footer = document.querySelector(`#footer`)
const hamburger = document.querySelector(`#hamburger`)
const menu = document.querySelector(`#menu`)

// toggle menu
hamburger.addEventListener(`click`, (e) => {
  showMenu.value = !showMenu.value
  hamburger.setAttribute(`aria-expanded`, String(showMenu.value))
})

effect(() => {
  menu.style.display = showMenu.value ? `block` : `none`
})

// main page picker
effect(() => {
  // make sure we're registered for hmr
  hmr.value

  render(
    html(
      [
        `<x-page-${page.value} .setTitle=`,
        ` .setActions=`,
        `></x-page-${page.value}>`,
      ],
      setTitle,
      setActions
    ),
    content
  )
})

// Hot Module Reloading (listening to file changes)
const source = new EventSource(`/changes`)
source.onmessage = (message) => {
  const { path, exists } = JSON.parse(message.data)

  if (!exists) {
    console.log(`${path} was deleted!`)

    document.location.reload()
  } else {
    console.log(`${path} was modified.`)

    if (path.startsWith(`public/elements`)) {
      // this will re-load it, and when doing customElements.define will
      // automatically trigger the hmr signal and re-render everything
      import(`${path.replace(/^public/, ``)}?d=${Date.now()}`)
    }
  }

  // Use that specific file for hot reloading, or do a full page refresh
}
