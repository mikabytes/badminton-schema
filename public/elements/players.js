import Element from "./element.js"
import { html } from "lit-html"
import { players } from "../signals.js"

class Players extends Element {
  render() {
    return html`
      <style>
        :host {
          padding: 16px;
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }

        h2 {
          text-align: center;
        }

        ul {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0;
          padding: 0;
        }

        li {
          cursor: pointer;
          display: block;
          padding: 4px;
          width: 100%;
          max-width: 360px;
          user-select: none;
          box-sizing: border-box;
        }

        li div {
          background-color: white;
          border: 1px solid;
          border-radius: 5px;
          padding: 16px;
        }

        .chosen {
          position: relative;
          padding-right: 24px;
          background-color: green;
          color: white;
          font-weight: bold;
        }

        .chosen::after {
          content: "✓";
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.5em;
          color: white;
          font-weight: bold;
        }

        form {
          display: block;
          margin-left: 6px;
          width: 100%;
          max-width: 360px;
        }

        form > input[type="text"] {
          width: 100%;
          height: 30px;
          max-width: calc(360px - 20px);
        }

        form > button[type="button"] {
          width: 20px;
          height: 30px;
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

  add = (e) => {
    e.preventDefault()

    const add = this.shadowRoot.querySelector(`#add`)
    const name = add.value
    players.value.push({
      id: name,
      display: name,
      chosen: true,
    })
    players.value = players.value
    add.value = ``
    setTimeout(() => {
      add.scrollIntoView({
        behavior: `smooth`,
        block: `nearest`,
        inline: `nearest`,
      })
    }, 50)
  }

  toggle(playerId) {
    players.value = players.value.map((player) =>
      player.id === playerId ? { ...player, chosen: !player.chosen } : player
    )
  }
}

customElements.define("x-players", Players)
