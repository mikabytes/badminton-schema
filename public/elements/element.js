import { signal, effect } from "../reactive.js"
import { render } from "lit-html"

export default class ReactiveElement extends HTMLElement {
  #cancelEffect = undefined
  #freeze = false

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
  }

  connectedCallback() {
    this.#cancelEffect = effect(() => {
      if (this.#freeze) {
        return
      }
      render(this.render(), this.shadowRoot)
    })
  }

  disconnectedCallback() {
    this.#cancelEffect?.()
    this.#cancelEffect = undefined
  }

  freeze() {
    this.#freeze = true
  }

  unfreeze() {
    this.#freeze = false
    render(this.render(), this.shadowRoot)
  }
}
