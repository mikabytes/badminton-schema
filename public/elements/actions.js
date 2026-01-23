import Element from "./element.js"
import { html } from "html"

class Actions extends Element {
  static css = new URL(`./actions.css`, import.meta.url)

  render() {
    return html`<slot></slot>`
  }
}

customElements.define("x-actions", Actions)
