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

      schema.value = await res.json()
    } catch (e) {
      alert(e)
    }
  }

  render() {
    this.setTitle(`Are you coming?`)
    this.setActions()

    return html`
      <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      </style>
      ${JSON.stringify(schema.value)}
    `
  }
}

customElements.define("x-page-rsvp", PageRsvp)
