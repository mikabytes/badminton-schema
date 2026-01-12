import { effect } from "./reactive.js"
import page from "features/page.js"

export function getPageFromHash() {
  const hash = document.location.hash.split(`#`)[1]
  if (hash) {
    const [main, sub, item] = hash.split(`/`)
    return { main, sub, item }
  }
}

export function setPageFromHash() {
  const details = getPageFromHash()
  if (details) {
    page.value = details
  } else {
    page.value = { main: `rsvp` }
  }
}

window.addEventListener(`hashchange`, (e) => {
  setPageFromHash()
})

effect(() => {
  if (page.value) {
    const { main, sub, item } = page.value
    let hash = `#${main}`
    if (sub) {
      hash += `/${sub}`
      if (item) {
        hash += `/${item}`
      }
    }

    document.location.hash = hash
  }
})
