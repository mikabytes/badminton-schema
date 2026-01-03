import Element from "./element.js"
import { html } from "lit-html"
import page from "features/page.js"
import showMenu from "features/showMenu.js"

class Menu extends Element {
  render() {
    function navigate(newPage) {
      page.value = newPage
      showMenu.value = false
    }

    return html`
      <style>
        :host {
          display: flex;
          position: absolute;
          top: 0px;
          bottom: 0px;
          right: 0px;
          left: 0px;
          align-items: stretch;
        }

        :host([hidden]) {
          display: none;
        }

        #curtain {
          background-color: rgba(0, 0, 0, 0.35);
          width: 100%;
          backdrop-filter: blur(2px);
        }
        nav {
          width: 300px;
          box-shadow: -4px 0 12px rgba(0, 0, 0, 0.25);
          box-sizing: border-box;
          padding: 30px;
          background: var(--background);
        }

        li {
          padding: 0;
          margin-bottom: 16px;
          list-style: none;
          font-size: 20px;
        }

        button {
          background-color: transparent;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }

        #close { 
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 20px;
        }

        #login-text {
          font-size: 12px;
        }

        #name {
          font-size: 16px;
          font-weight: bold;
        }

        hr {
          margin: 16px 0;
        }
      </style>
      <div id="curtain"></div>
      <nav>
        <div>
          <div><span id="login-text">Inloggad som:</span><br /><span id="name">Mikael Wikman</span></div>
          <button id="close" title="Close menu" @click=${() => { showMenu.value = false }}>✕</button>
        </div>
        <hr />
        <li><button @click=${() => { navigate(`rsvp`) }}>Bokning</li>
        <li><button @click=${() => { navigate(`members`)}}>Medlemmar</li>
        <li><button @click=${() => { navigate(`rules`)}}>Schema</li>
      </nav>

    `
  }
}

customElements.define("x-menu", Menu)
