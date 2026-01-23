import Element from "./element.js"
import { html } from "html"
import "./actions.js"
import "./button.js"
import page from "features/page.js"
import user from "features/user.js"

class PageLogin extends Element {
  static css = new URL(`./page-login.css`, import.meta.url)

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
        user.value = json
        page.value = window.initialPage || { main: `rsvp` }
        return
      }
    } finally {
      input.disabled = false
    }
  }

  render() {
    return html`
      <h2>Ange kod</h2>
      <form @submit=${this.submit}>
        <input type="text" id="text" />
      </form>
      <x-actions>
        <x-button id="login-button" primary @click=${this.submit}>Logga in</button>
      </x-actions>
    `
  }
}

customElements.define("x-page-login", PageLogin)
