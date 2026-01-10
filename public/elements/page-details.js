import Element from "./element.js"
import { html } from "lit-html"
import user from "features/user.js"
import users from "features/users.js"
import page from "features/page.js"
import responses from "features/responses.js"
import skips from "features/skips.js"
import rules from "features/rules.js"
import error from "./error.js"
import generateEvents from "../events.js"

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

    if (err) {
      return err
    }

    const eventId = page.value.item
    const date = eventId * 60000

    const events = generateEvents(
      rules.value,
      skips.value.map((d) => d.date),
      new Date(date),
      new Date(date)
    )

    if (events.length !== 1) {
      return html`Invalid event.`
    }

    const event = events[0]

    this.setActions(html`<button @click=${this.remove}>Ta bort</button>`)

    return html`
      <h1>${capitalizeFirst(formatter.format(event.date))}</h1>
      <hr />
      <pre>${JSON.stringify(event)}</pre>
    `
  }
}

customElements.define("x-page-details", PageDetails)

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const formatter = new Intl.DateTimeFormat("sv-SE", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})
