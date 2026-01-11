import "./page-login.js"
import "./page-rsvp.js"
import "./page-members.js"
import "./page-rules.js"
import "./menu.js"

import { versions } from "./element.js"
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

function curtainClick(e) {
  console.log(e)
  if (e.target === document.querySelector(`#sub-curtain`)) {
    delete page.value.sub
    delete page.value.item
    page.value = page.value
  }
}

effect(() => {
  // ensure we're subscribed to HMR changes
  hmr.value

  function setActions(it) {
    render(it || html``, document.querySelector(`#footer`))
  }

  const out = html`
    <style>

      #content {
        display: flex;
        flex: 1 1 auto;
        overflow-y: scroll;
        overflow-x: hidden;
      }

      #content > * {
        flex: 1 1 auto;
      }

      #footer {
        flex: 0 0 55px;
        box-sizing: border-box;
        box-shadow: 0 -3px 3px var(--background-subtle);
        border-top: 1px var(--border-strong) solid; 
        display: flex;
        align-items: stretch;
        justify-content: center;
        background-color: var(--background-subtle);
}


      nav {
        height: 40px;
        display: flex;
        align-items: center;
        box-shadow: 0 3px 3px rgba(0, 0, 0, 0.2);
        background-color: var(--secondary-focus);
        color: var(--background);
      }

      #hamburger {
        border: 0px;
        background-color: transparent;
        margin: 0;
        padding: 8px;
        height: 40px;
        width: 40px;
        margin-left: auto;
        cursor: pointer;
        position: relative;
      }

      #hamburger > div {
        position: absolute;
        border-radius: 5px;
        background-color: var(--background);
        left: 8px;
        right: 8px;
        height: 3px;
      }

      #hamburger > div:nth-child(1) {
        top: 12px;
      }
      #hamburger > div:nth-child(2) {
        top: 20px;
      }
      #hamburger > div:nth-child(3) {
        top: 28px;
      }

      nav h1 {
        display: block;
        margin: 0 0 0 16px;
        padding: 0;
        font-size: 24px;
      }


      button, input[type=submit] {
        box-sizing: border-box;
        width: 100%;
        max-width: 400px;
        padding: 16px 8px;
        background-color: green;
        color: white;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        cursor: pointer;
      }

      #sub-curtain {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        top: 0px;
        bottom: 55px;
        left: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.15);
        z-index: 1;
        overflow: hidden;
      }

      #frame {
        position: absolute;
        background-color: var(--background-panel);
        border: 1px solid var(--border);
        overflow-x: scroll;
        width: 100%;
      }

      @media (min-width: 600px) {
        #frame {
          height: 100%;
          max-width: 600px;
          max-height: 600px;
        }
      }

      @media (min-width: 0px) and (max-width: 599px) {
        #frame {
          top: 0;
          bottom: 0px;
        }
      }
    </style>
    <nav style="z-index: 1;">
      <h1>${titles[page.value?.main] || ``}</h1>
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

  render(out, document.body)
})
