import { signal, effect } from "../reactive.js"
import { render, html } from "lit-html"
import { hmr } from "../signals.js"

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
      const callHmr = hmr.value
      try {
        render(this.render(), this.shadowRoot)
      } catch (e) {
        console.error(e)
        render(
          html`<div
            style="border: 2px dashed red; padding: 16px; white-space: pre-wrap; color: red;"
          >
            ${e.message}${`\n\n`}${e.stack}
          </div>`,
          this.shadowRoot
        )
      }
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

// we patch customElements.define so that we can do HMR
let define = customElements.define
export const versions = new Map()

export function getTagName(tagName) {
  const version = versions.get(`x-${tagName}`) || 1
  return `${tagName}-${version}`
}

customElements.define = (tagName, klass) => {
  if (!versions.has(tagName)) {
    versions.set(tagName, 0)
  }

  const version = versions.get(tagName) + 1
  versions.set(tagName, version)

  define.call(customElements, `${tagName}-${version}`, klass)

  // trigger all custom elements to re-render
  hmr.value = version
}
