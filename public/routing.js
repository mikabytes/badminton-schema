import { effect } from "./reactive.js"
import page from "features/page.js"

function setPageFromHash() {
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
setPageFromHash()

effect(() => {
  document.location.hash = `#${page.value}`
})
