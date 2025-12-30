import { effect } from "./reactive.js"
import { page } from "./signals.js"

function setPageFromHash() {
  page.value = document.location.hash.split(`#`)[1]
  console.log(page.value)
}

window.addEventListener(`hashchange`, e => {
  setPageFromHash()
})
setPageFromHash()

effect(() => {
  document.location.hash = `#${page.value}`
})
