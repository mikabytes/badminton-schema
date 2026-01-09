import Element from "./element.js"
import { html } from "lit-html"
import user from "features/user.js"
import users from "features/users.js"
import page from "features/page.js"
import responses from "features/responses.js"
import skips from "features/skips.js"
import rules from "features/rules.js"
import error from "./error.js"

class PageDetails extends Element {
  static css = new URL(`./page-details.css`, import.meta.url)

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener(`click`, this.goback)
  }

  disconnectedCallback() {
    super.disconnectedCallback() 
    this.removeEventListener(`click`, this.goback)
  }

  render() {
    let err = error(rules, skips, users, responses) 

    this.setActions(html`<button @click=${this.remove}>Ta bort</button>`)

    return html` 
      ${err ? err : html``}
    `
  }
}

customElements.define("x-page-details", PageDetails)
