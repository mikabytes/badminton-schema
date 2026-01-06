import Element from "./element.js"
import error from "./error.js"
import { html } from "html"
import users from "features/users.js"
import rules from "features/rules.js"
import skips from "features/skips.js"
import page from "features/page.js"
import responses from "features/responses.js"
import user from "features/user.js"
import generateEvents from "../events.js"
import "./page-details.js"
import { signal } from "../reactive.js"

const formatter = new Intl.DateTimeFormat("sv-SE", {
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
})

class PageRsvp extends Element {
  static css = new URL(`./page-rsvp.css`, import.meta.url)

  #details = signal(null, {})

  async connectedCallback() {
    super.connectedCallback()

    rules.load()
    skips.load()
    users.load()
    responses.load()
  }

  prepare() {
    const collated = []

    let from = new Date()
    from.setHours(0)
    from.setMinutes(0)
    from.setSeconds(0)
    from.setMilliseconds(0)

    let to = new Date(from)
    to.setFullYear(to.getFullYear() + 1)

    const events = generateEvents(rules.value, skips.value, from, to)

    let week
    let weekEvents = []

    for (const event of events) {
      let eventWeek = getISOWeek(event.date)
      if (!week) {
        week = eventWeek
      }

      if (week === eventWeek) {
        weekEvents.push(event)
      } else {
        collated.push({
          week,
          events: weekEvents,
        })
        weekEvents = [event]
        week = eventWeek
      }
    }

    if (weekEvents.length > 0) {
      collated.push({
        week,
        events: weekEvents,
      })
    }

    return collated
  }

  render() {
    return error(rules, skips, users, responses) || html` 
      ${this.prepare().map(
        (group) => html`
          <section>
            <h2>Vecka ${group.week}</h2>
            ${group.events.map(
              (event) => {
                const eventResponses = responses.value.filter(it => it.ts === event.ts)
                const myAnswer = eventResponses.find(it => it.userId === user.value.id && it.ts === event.ts)

                const yes = myAnswer?.response === 1
                const no = myAnswer?.response === 0

                return html`
                  <div class="event" @click=${() => { page.value = { ...page.value, sub: `details`, item: event.id } }}> 
                    <div class="attending">
                      <div class="icon">👤</div>
                      ${eventResponses.filter(e => e.response === 1).length}
                    </div>
                    <div
                      class="date"
                      title="${event.date.toISOString().slice(0, 10)}"
                    >
                      ${formatter.format(event.date)}
                    </div>
                    <div class="quick-actions">
                      <button @click=${() => user.respond(event.id, 1)} class="yes ${yes ? `selected` : ``}" title="Yes, I'm going">✓</button
                      ><button @click=${() => user.respond(event.id, 0)} class="no ${no ? `selected` : ``}" title="No, I'm not going">✗</button>
                    </div>
                  </div>
                `
              }
            )}
          </section>
          ${page.value.sub !== `details` ? html`` : html`
            <x-page-details .setActions=${this.setActions}></x-page-details>
          `}
        `
      )}`
  }
}

customElements.define("x-page-rsvp", PageRsvp)

function getISOWeek(date) {
  // Copy date so we don't mutate original
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )

  // ISO week date algorithm:
  // Thursday determines the year
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)

  return week
}
