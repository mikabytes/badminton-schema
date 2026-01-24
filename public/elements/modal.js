import Element from "./element.js"
import { html, render } from "html"

import page from "features/page.js"

class Modal extends Element {
  static css = new URL(`./modal.css`, import.meta.url)

  constructor() {
    super()

    this.setAttribute(`role`, `dialog`)
    this.setAttribute(`aria-modal`, `true`)
  }

  connectedCallback() {
    super.connectedCallback()

    this.addEventListener(`click`, this.onClick)
  }

  disconnectedCallback() {
    this.removeEventListener(`click`, this.onClick)
  }

  onClick = (e) => {
    if (e.target === this) {
      page.value = { ...page.value, sub: null, item: null }
    }
  }

  render() {
    return html`
      <dialog open aria-modal="true" aria-label="${this.title}">
        <button
          id="close"
          aria-label="Close dialog"
          autofocus
          @click=${() => {
            page.value = { ...page.value, sub: null }
          }}
        >
          ✕
        </button>
        <slot></slot>
      </dialog>
    `
  }
}

customElements.define("x-modal", Modal)
