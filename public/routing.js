import { effect } from "./reactive.js"
import page from "features/page.js"

function setPageFromHash() {
  page.value = document.location.hash.split(`#`)[1]
}

window.addEventListener(`hashchange`, e => {
  setPageFromHash()
})
setPageFromHash()

effect(() => {
  document.location.hash = `#${page.value}`
})
