import Element from "./element.js"
import { html } from "lit-html"
import "./layout.js"
import "./players.js"
import buttonStyle from "../styles/button.js"
import { page, players } from "../signals.js"

class PagePlayers extends Element {
  render() {
    return html`
      <x-layout>
        <style>
          ${buttonStyle}
        </style>
        <x-players></x-players>
        <button id="start" slot="footer" @click=${this.start}>Start!</button>
      </x-layout>
    `
  }

  start() {
    if (players.value.filter((it) => it.chosen).length < 2) {
      alert(`You need at least two players`)
    } else {
      page.value = `rounds`
    }
  }
}

customElements.define("x-page-players", PagePlayers)
