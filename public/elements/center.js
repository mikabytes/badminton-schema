import Element from "./element.js"
import { html } from "html"

class Center extends Element {
  static css = new URL(`./center.css`, import.meta.url)

  render() {
    return html`
      <div id="frame">
        <slot></slot>
        <div id="footer">
          <slot name="actions"></slot>
        </div>
      </div>
    `
  }
}

customElements.define("x-center", Center)
