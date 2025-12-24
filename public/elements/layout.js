import Element from "./element.js"
import { html } from "lit-html"
import { signal } from "../reactive.js"

class Layout extends Element {
  #title = signal(``)
  #actions = signal(html``)

  setTitle = (text) => {
    this.title.value = text
  }

  setActions = (html) => {
    this.actions.value = html
  }

  render() {
    return html`
      <style>
        nav {
          height: 50px;
          display: flex;
          align-items: center;
          box-shadow: 0 3px 3px rgba(0, 0, 0, 0.2);
          background-color: var(--secondary-focus);
          color: var(--background);
        }

        nav > button {
          border: 0px;
          background-color: transparent;
          margin: 0;
          padding: 8px;
          height: 59px;
          width: 59px;
          margin-left: auto;
          cursor: pointer;
        }

        nav > button > svg {
          height: 100%;
          width: 100%;
          color: var(--background);
        }

        nav h1 {
          display: block;
          margin: 0 0 0 16px;
          padding: 0;
        }
      </style>
      <nav>
        <h1>${this.title.value}</h1>
        <button
          id="hamburger"
          aria-label="Open menu"
          aria-expanded="false"
          aria-controls="main-menu"
        >
          <svg
            class="hamburger__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </nav>
      <div id="content"></div>
      <div id="footer">${this.actions.value}</div>
      <x-menu id="menu"></x-menu>
    `
  }
}

customElements.define("x-layout", Layout)
