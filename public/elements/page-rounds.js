import Element from "./element.js"
import { html } from "lit-html"
import "./layout.js"
import "./players.js"
import buttonStyle from "../styles/button.js"
import { players as playersSignal } from "../signals.js"
import { signal } from "../tiny-reactive.js"
import schedule from "../schedule.js"

class PageRounds extends Element {
  #rounds = undefined
  #currentRound = signal(0)

  constructor() {
    super()

    let players = playersSignal.value
      .filter((it) => it.chosen)
      .map((it) => it.display)

    if (players % 2 == 1) {
      // ensure we have even teams (in essence, means someone will be playing singles sometimes)
      players.push(``)
    }

    // randomize the players
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[players[i], players[j]] = [players[j], players[i]] // swap
    }

    this.#rounds = schedule(players)
  }

  render() {
    return html`
      <x-layout>
        <style>
          ${buttonStyle}
        </style>
        <x-round></x-round>
        <button id="back" slot="footer" @click=${this.back}>Tillbaka</button>
        <div slot="footer" id="title"></div>
        <button id="next" slot="footer" @click=${this.next}>Nästa</button>
      </x-layout>
    `
  }
}

customElements.define("x-page-rounds", PageRounds)
