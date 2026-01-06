import Element from "./element.js"
import { html } from "lit-html"
import user from "features/user.js"
import page from "features/page.js"

class PageDetails extends Element {
  connectedCallback() {
    super.connectedCallback()
    this.addEventListener(`click`, this.goback)
  }

  disconnectedCallback() {
    super.disconnectedCallback() 
    this.removeEventListener(`click`, this.goback)
  }

  goback() {
    page.value = { main: `rsvp` }
  }

  render() {
    this.setActions(html`<button @click=${this.remove}>Ta bort</button>`)

    return html`
      <style>
        :host {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          top: 0px;
          bottom: 55px;
          left: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.15);
          z-index: 1;
          overflow: hidden;
        }

        #frame {
          background-color: var(--background-panel);
          border: 1px solid var(--border);
          width: 100%;
          overflow-x: scroll;
        }

        @media (min-width: 600px) {
          #frame {
            height: 100%;
            max-width: 600px;
            max-height: 600px;
          }
        }

        @media (min-width: 0px) and (max-width: 599px) {
          #frame {
            position: absolute;
            top: 0;
            bottom: 0px;
          }
        }
      </style>

      <div id="frame">
      </div>
    `
  }
}

customElements.define("x-page-details", PageDetails)
