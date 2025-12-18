import { page, users } from "./signals.js"
import { effect } from "./reactive.js"
import { render } from "lit-html"
import "./elements/page-login.js"
import "./elements/page-rsvp.js"

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

function setTitle(text) {
  title.textContent = text
}

function setActions(html) {
  if (html) {
    render(html, footer)
    footer.style.display = ``
  } else {
    footer.style.display = `none`
  }
}
// main page picker
effect(() => {
  const newPage = document.createElement(`x-page-${page.value}`)
  newPage.setTitle = setTitle
  newPage.setActions = setActions
  content.replaceChildren(newPage)
})
