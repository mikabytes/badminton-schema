import Element from "./element.js"
import loading from "./loading.js"
import { html } from "html"
import users from "features/users.js"
import rules from "features/rules.js"
import skips from "features/skips.js"
import responses from "features/responses.js"
import userId from "features/userId.js"
import generateEvents from "../events.js"

const formatter = new Intl.DateTimeFormat("sv-SE", {
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
})

class PageRsvp extends Element {

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
    return loading(rules, skips, users, responses) || html` 
      <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          box-sizing: border-box;
        }

        .event {
          padding: 0px;
          border: 1px solid var(--border);
          background-color: var(--background-panel);
          display: flex;
        }

        .date {
          padding: 20px;
          width: 98px;
          text-align: right;
          padding-right: 40px;
          color: var(--text-primary);
        }

        button {
          padding: 0;
          margin: 0;
          border: none;
          background-color: transparent;
          cursor: pointer;
        }

        .no,
        .yes {
          font-size: 24px;
          padding: 12px;
        }

        .yes:not(.selected) {
          filter: grayscale(100%);
        }

        .no:not(.selected) {
          filter: grayscale(100%);
        }

        .yes {
          position: relative;
          color: green;
        }

        .no {
          position: relative;
          color: var(--error);
        }

        .yes.selected::after {
          position: absolute;
          content: " ";
          height: 3px;
          border-radius: 3px;
          background-color: green;
          bottom: 10px;
          left: 5px;
          right: 10px;
        }

        .no.selected::after {
          position: absolute;
          content: " ";
          height: 3px;
          border-radius: 3px;
          background-color: var(--error);
          bottom: 10px;
          left: 6px;
          right: 8px;
        }

        .event.cancelled {
          filter: grayscale(100%) opacity(0.1);
          position: relative;
        }
        .event.cancelled::after {
          content: " ";
          position: absolute;
          top: 30px;
          height: 2px;
          left: -20px;
          right: -20px;
          background-color: red;
        }

        .attending {
          position: relative;
          display: flex;
          color: var(--text-tertiary);
          padding: 20px;
        }

        .icon {
          font-size: 16px;
          filter: grayscale(100%);
        }

        section {
          margin-top: 30px;
        }

        section:last-child {
          padding-bottom: 60px;
        }

      </style>
      ${this.prepare().map(
        (group) => html`
          <section>
            <h2>Vecka ${group.week}</h2>
            ${group.events.map(
              (event) => html`
                <div class="event">
                  <div class="attending">
                    <div class="icon">👤</div>
                    10
                  </div>
                  <div
                    class="date"
                    title="${event.date.toISOString().slice(0, 10)}"
                  >
                    ${formatter.format(event.date)}
                  </div>
                  <div class="quick-actions">
                    <button class="yes selected" title="Yes, I'm going">
                      ✓</button
                    ><button class="no" title="No, I'm not going">✗</button>
                  </div>
                </div>
              `
            )}
          </section>
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
