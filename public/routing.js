import { effect } from "./reactive.js"
import page from "features/page.js"

export function params(url) {
  const hash = url.split(`#`)[1]
  if (hash) {
    const [main, sub, item] = hash.split(`/`)
    return { main, sub, item }
  }
}

export function url(params) {
  const { main, sub, item } = params
  let hash = `#${main}`
  if (sub) {
    hash += `/${sub}`
    if (item) {
      hash += `/${item}`
    }
  }
  return hash
}

export function setPageFromHash() {
  const details = params(document.location.hash)
  if (details) {
    page.value = details
  } else {
    page.value = { main: `rsvp` }
  }
}

window.addEventListener(`hashchange`, (e) => {
  setPageFromHash()
})

export default function start() {
  effect(() => {
    if (page.value) {
      const dest = url(page.value)
      document.location.hash = dest
    }
  })
}
