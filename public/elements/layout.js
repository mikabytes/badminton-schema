import "./page-login.js"
import "./page-rsvp.js"
import "./page-members.js"
import "./page-rules.js"
import "./menu.js"
import "./notifications.js"

import Element, { versions } from "./element.js"
import { html, render } from "html"
import { effect } from "../reactive.js"

import hmr from "features/hmr.js"
import showMenu from "features/showMenu.js"
import page from "features/page.js"

const titles = {
  rsvp: `Bokning`,
  members: `Medlemmar`,
  rules: `Schemaregler`,
  login: `Logga in`,
}

class Layout extends Element {
  static css = new URL(`./layout.css`, import.meta.url)

  render() {
    function curtainClick(e) {
      if (e.target === this.shadowRoot.querySelector(`#sub-curtain`)) {
        delete page.value.sub
        delete page.value.item
        page.value = page.value
      }
    }

    function setActions(it) {
      render(it || html``, this.shadowRoot.querySelector(`#footer`))
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
        <x-page-${page.value?.main} .setActions=${setActions}></x-page-${page.value}>
      </div>
      <style>#footer:empty { display: none; }</style>
      <div id="footer" style="z-index: 1;"></div>
      <x-menu id="menu" ?hidden=${!showMenu.value}></x-menu>

      ${
        page.value?.sub !== `details`
          ? html``
          : html`
              <div id="sub-curtain" @click=${curtainClick}>
                <div id="frame">
                  <x-page-details .setActions=${setActions}></x-page-details>
                </div>
              </div>
            `
      }
    `
  }
}

customElements.define("x-layout", Layout)
