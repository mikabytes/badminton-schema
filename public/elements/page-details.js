import Element from "./element.js"
import { html } from "html"
import user from "features/user.js"
import users from "features/users.js"
import page from "features/page.js"
import responses from "features/responses.js"
import skips from "features/skips.js"
import rules from "features/rules.js"
import error from "./error.js"
import "./button.js"
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

    if (!rules.value || !skips.value || !users.value || !responses.value) {
      return html``
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
    const eventResponses = responses.value.filter((it) => it.ts === event.ts)

    for (const e of eventResponses) {
      e.user = users.value.find((u) => u.id === e.userId)
    }

    const myAnswer = eventResponses.find(
      (it) => it.userId === user.value.id && it.ts === event.ts
    )

    const yeses = eventResponses.filter((e) => e.yes)
    const noes = eventResponses.filter((e) => e.no)

    return html`
      <h1>${capitalizeFirst(formatter.format(event.date))}</h1>
      <hr />
      <div class="quick-actions">
        <h3>Mitt svar:</h3>
        <span id="respond-buttons">
          <button
            @click=${() => user.respond(event.id, 1)}
            class="yes ${myAnswer?.yes ? `selected` : ``}"
            title="Yes, I'm going"
          >
            ✓ Ja</button
          ><button
            @click=${() => user.respond(event.id, 0)}
            class="no ${myAnswer?.no ? `selected` : ``}"
            title="No, I'm not going"
          >
            ✗ Nej
          </button>
        </span>
      </div>

      <h2>
        Närvarar:
        <span id="number-yeses">(${yeses.length} personer)</span>
      </h2>
      ${yeses.length === 0
        ? html`<span id="no-people"
            >Ingen har anmält sig till detta event.</span
          >`
        : ``}
      <ul>
        ${eventResponses.filter((e) => e.yes).map((e) => this.person(e))}
      </ul>

      ${noes.length === 0
        ? ``
        : html`
            <h2>Kommer inte:</h2>
            <ul>
              ${eventResponses.filter((e) => e.no).map((e) => this.person(e))}
            </ul>
          `}
      <x-button
        id="back"
        secondary
        @click=${() => (page.value = { ...page.value, sub: null, item: null })}
        >Tillbaka</x-button
      >
    `
  }

  person(e) {
    return html`
      <li>
        <img
          data-initials="${e.user.fullName
            .split(` `)
            .map((it) => it[0])
            .join(``)
            .toUpperCase()}"
          src="/photos/${e.user.picturePath}"
        />
        ${e.user.name}
      </li>
    `
  }
}

customElements.define("x-page-details", PageDetails)

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const formatter = new Intl.DateTimeFormat("sv-SE", {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})
