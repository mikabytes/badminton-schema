import Element from "./element.js"
import { html } from "lit-html"
import { users, page, userId } from "../signals.js"

class PageLogin extends Element {
  submit = async (e) => {
    e.preventDefault()

    const input = this.shadowRoot.querySelector(`input`)
    const code = this.shadowRoot.querySelector(`#text`).value.trim()

    try {
      input.disabled = true

      const res = await fetch(`/current-user`, {
        headers: {
          Authorization: `Bearer ${code}`,
        },
      })

      if (res.ok) {
        const json = await res.json()
        localStorage.token = code
        userId.value = json.id
        page.value = `rsvp`
        return
      }
    } finally {
      input.disabled = false
    }
  }

  render() {
    this.setTitle(`Logga in`)
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

customElements.define("x-page-login", PageLogin)
