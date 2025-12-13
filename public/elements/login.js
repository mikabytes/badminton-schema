import Element from "./element.js"
import { html } from "lit-html"
import { players } from "./signals.js"

class Login extends Element {
  render() {
    return html`
      <style>
        :host {
          display: flexbox;
          justify-content: center;
          align-items: center;
        }
      </style>
      <h2>Välj spelare</h2>
      <ul id="picked-players">
        ${players.value.map(
          (player) =>
            html`<li title="${player.id}">
              <div
                @click=${() => this.toggle(player.id)}
                class="${player.chosen ? `chosen` : ``}"
              >
                ${player.display}
              </div>
            </li>`
        )}
      </ul>
      <div>
        <ul>
          <form style="display: flex" @submit=${this.add}>
            <input id="add" type="text" />
            <input type="submit" value="Lägg till" />
          </form>
        </ul>
      </div>
    `
  }

  add(e) {
    e.preventDefault()

    const add = this.querySelector(`#add`)
    const name = add.value
    players.value.push({
      id: name,
      display: name,
      chosen: true,
    })
    players.value = players.value
    add.value = ``
    setTimeout(() => {
      document.body.scrollTo({ top: add.offsetTop, behavior: "smooth" })
    }, 50)
  }

  toggle(playerId) {
    players.value = players.value.map((player) =>
      player.id === playerId ? { ...player, chosen: !player.chosen } : player
    )
  }
}

customElements.define("x-players", Login)
