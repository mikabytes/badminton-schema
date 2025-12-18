import Element from "./element.js"
import { html } from "lit-html"

class Layout extends Element {
  render() {
    return html`
      <style>
      </style>
      <nav>
        <button>|||</button>
        <h1><slot name="title">Title</slot></h1>
      </nav>
      <div id="content">
        <slot></slot>
      </div>
      <div id="footer">
        <slot name="footer"></slot>
      </div>
    `
  }
}

customElements.define("x-layout", Layout)
