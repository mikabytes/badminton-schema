import "./page-login.js"
import "./page-rsvp.js"
import "./page-members.js"
import "./page-rules.js"
import "./menu.js"
import "./notifications.js"

import Element, { versions } from "./element.js"
import { html, render } from "html"
import { effect } from "../reactive.js"

import showMenu from "features/showMenu.js"
import page from "features/page.js"
import user from "features/user.js"

const titles = {
  rsvp: `Bokning`,
  members: `Medlemmar`,
  rules: `Schemaregler`,
  login: `Logga in`,
}

class Layout extends Element {
  static css = new URL(`./layout.css`, import.meta.url)

  render() {
    const curtainClick = (e) => {
      if (e.target === this.shadowRoot.querySelector(`#sub-curtain`)) {
        delete page.value.sub
        delete page.value.item
        page.value = page.value
      }
    }

    // extra guard in case user navigates to logged in page after
    // initial render
    if (!user.value && page.value?.main !== `login`) {
      window.initialPage = page.value
      page.value = { main: `login` }
      return html``
    }

    return html`
      <nav style="z-index: 1;">
        <h1>${titles[page.value?.main] || ``}</h1>
        <x-notifications id="notifications"></x-notifications>
        <button
          id="hamburger"
          aria-label="Open menu"
          aria-expanded="${String(showMenu.value)}"
          aria-controls="main-menu"
          @click=${() => (showMenu.value = !showMenu.value)}
        >
          <div></div>
          <div></div>
          <div></div>
        </button>
      </nav>
      <div id="content">
        <x-page-${page.value?.main}></x-page-${page.value}>
      </div>
      <style>#footer:empty { display: none; }</style>
      <x-menu id="menu" ?hidden=${!showMenu.value}></x-menu>

      ${
        page.value?.sub !== `details`
          ? html``
          : html`
              <div id="sub-curtain" @click=${curtainClick}>
                <div id="frame">
                  <x-page-details></x-page-details>
                </div>
              </div>
            `
      }
    `
  }
}

customElements.define("x-layout", Layout)
