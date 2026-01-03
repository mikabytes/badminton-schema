import "./page-login.js"
import "./page-rsvp.js"
import "./page-members.js"
import "./page-rules.js"
import "./menu.js"

import {versions} from "./element.js"
import { html, render } from "html"
import { effect } from "../reactive.js"

import hmr from "features/hmr.js"
import showMenu from "features/showMenu.js"
import page from "features/page.js"

const titles = {
  rsvp: `Bokning`,
  members: `Medlemmar`,
  rules: `Schemaregler`,
}

effect(() =>  {
  // ensure we're subscribed to HMR changes
  hmr.value

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
    </style>
    <nav>
      <h1>${titles[page.value] || ``}</h1>
      <button
        id="hamburger"
        aria-label="Open menu"
        aria-expanded="${String(showMenu.value)}"
        aria-controls="main-menu"
        @click=${() => showMenu.value = !showMenu.value}
      >
        <div></div>
        <div></div>
        <div></div>
      </button>
    </nav>
    <div id="content">
      <x-page-${page.value} .setActions=${it => render(it || html``, document.querySelector(`#footer`))}></x-page-${page.value}>
    </div>
    <style>#footer:empty { display: none; }</style>
    <div id="footer"></div>
    <x-menu id="menu" ?hidden=${!showMenu.value}></x-menu>
  `

  render(out, document.body)
})
