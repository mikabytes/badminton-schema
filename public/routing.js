import { effect } from "./reactive.js"
import page from "features/page.js"

export function getPageFromHash() {
  const page = document.location.hash.split(`#`)[1]
  return page
}

export function setPageFromHash() {
  const hash = document.location.hash.split(`#`)[1]

  if (hash) {
    page.value = hash
  } else {
    page.value = `rsvp`
  }
}

window.addEventListener(`hashchange`, e => {
  setPageFromHash()
})

effect(() => {
  if (page.value) {
    document.location.hash = `#${page.value}`
  }
})
