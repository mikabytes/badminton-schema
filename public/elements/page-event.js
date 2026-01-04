
import Element from "./element.js"
import { html } from "lit-html"
import page from "features/page.js"
import user from "features/user.js"

class PageEvent extends Element {
  render() {
    this.setActions(html`<button @click=${this.submit}>Logga in</button>`)

    return html`
      <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        input {
          height: 40px;
          padding: 8px;
          font-size: 16px;
          text-align: center;
        }

        input::disabled {
          color: var(--text-muted);
        }
      </style>

      <h2>Ange kod</h2>
      <form @submit=${this.submit}>
        <input type="text" id="text" />
      </form>
    `
  }
}

customElements.define("x-page-event", PageEvent)
