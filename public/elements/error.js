import Element from "./element.js"
import { html } from "html"

export default function renderError(...signals) {
  const out = []

  for (const signal of signals) {
    if (signal.error) {
      console.error(signal.error)
      out.push(html`<x-error .message=${signal.error.message}></x-error>`)
    }
  }

  if (out.length > 0) {
    return out
  }

  return false
}


class Error extends Element {
  render() {
    function navigate(newPage) {
      page.value = newPage
      showMenu.value = false
    }

    return html`
      <style>
        :host {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          padding: 30px;
          border: 3px dashed red;
        }
      </style>
      ${this.message}
    `
  }
}

customElements.define("x-error", Error)
