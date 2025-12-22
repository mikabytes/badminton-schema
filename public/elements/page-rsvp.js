import Element from "./element.js"
import { html } from "lit-html"
import { users, userId, schema } from "../signals.js"

class PageRsvp extends Element {
  async connectedCallback() {
    super.connectedCallback()

    let from = new Date()
    from.setHours(0)
    from.setMinutes(0)
    from.setSeconds(0)
    from.setMilliseconds(0)

    let to = new Date(from)
    to.setFullYear(to.getFullYear() + 1)

    try {
      const res = await fetch(`/schema/${from.getTime()}/${to.getTime()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
      })

      if (!res.ok) {
        throw new Error(`Connectivity issue.`)
      }

      schema.value = (await res.json()).map((it) => {
        return {
          ...it,
          date: new Date(it.date),
        }
      })
    } catch (e) {
      alert(e)
    }
  }

  render() {
    this.setTitle(`Kommer du?`)
    this.setActions()

    const collated = []

    let week
    let weekEvents = []

    for (const event of schema.value) {
      console.log(event)
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
        weekEvents = []
        week = eventWeek
      }
    }

    collated.push({
      week,
      events: weekEvents,
    })

    const formatter = new Intl.DateTimeFormat("sv-SE", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    })

    return html` <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      </style>
      ${collated.map(
        (group) => html`
          <section>
            <h2>Vecka ${group.week}</h2>
            ${group.events.map(
              (event) => html`
                <div class="event">
                  <div
                    class="date"
                    title="${event.date.toISOString().slice(0, 10)}"
                  >
                    ${formatter.format(event.date)}
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
