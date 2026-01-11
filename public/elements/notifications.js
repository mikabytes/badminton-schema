import Element from "./element.js"
import { html } from "lit-html"

import notifications from "features/notifications.js"

class Notifications extends Element {
  render() {
    return html`<style>
        :host {
          display: block;
        }

        button {
          background-color: transparent;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }

        button:not([subscribed]) {
          color: #ccc;
          filter: grayscale(1);
          opacity: 0.8;
        }
      </style>
      <button
        ?subscribed=${notifications.value}
        @click=${notifications.value
          ? notifications.disable
          : notifications.enable}
      >
        🔔
      </button>`
  }
}

customElements.define("x-notifications", Notifications)
