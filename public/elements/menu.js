import Element from "./element.js"
import { html } from "lit-html"

class Menu extends Element {
  render() {
    return html`
      <style>
        :host {
          display: block;
          flex-direction: column;
          position: absolute;
          top: 0px;
          bottom: 0px;
          right: 0px;
        }

        @media (min-width: 0px, max-width: 600px) {
          :host {
            width: 600px;
            box-shadow: -3px 0 3px rgba(0, 0, 0, 0.2);
          }
        }

        @media (min-width: 601px) {
          :host {
            left: 0px;
          }
        }
      </style>

      <h2>Ange kod</h2>
      <form @submit=${this.submit}>
        <input type="text" id="text" />
      </form>
    `
  }
}

customElements.define("x-menu", Menu)
