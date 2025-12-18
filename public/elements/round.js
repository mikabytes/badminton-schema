import Element from "./element.js"
import { html } from "lit-html"

class Round extends Element {
  render() {
    return html`
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          position: relative;
        }
        nav {
          display: flex;
          width: 100%;
          overflow: hidden;
        }

        nav div {
          flex: 1 1 auto;
          font-size: 32px;
          text-align: center;
        }

        button {
          width: 90px;
        }

        #rounds {
          position: absolute;
          display: flex;
          justify-content: center;
          height: 100%;
          flex-wrap: wrap;
          width: 100%;
          top: 60px;
          height: calc(100% - 60px);
          overflow-y: scroll;
        }

        #current-round {
          line-height: 55px;
        }

        .match {
          flex: 0 0 330px;
          overflow: hidden;
          box-sizing: border-box;
          margin: 16px;
        }

        .match h2 {
          margin-top: 0;
        }

        .team {
          height: 100px;
          border: 8px solid gray;
          background-color: green;
          color: white;
          font-weight: bold;
          font-size: 20px;
          display: flex;
        }

        .team div:nth-child(2) {
          border-left: 3px dotted gray;
        }

        .team div {
          padding: 16px;
          width: 150px;
          overflow-x: hidden;
          text-overflow: ellipsis;
        }

        #resting {
          font-size: 16px;
        }
      </style>

      <div id="rounds">
        ${this.matches.map((m) => {
          let team1, team2
          if (m.type === `doubles`) {
            team1 = html`
              <div>${m.team1[0]}</div>
              <div>${m.team1[1]}</div>
            `
            team2 = html`
              <div>${m.team2[0]}</div>
              <div>${m.team2[1]}</div>
            `
          } else if (m.type === `two_vs_one`) {
            team1 = html`
              <div>${m.team[0]}</div>
              <div>${m.team[1]}</div>
            `
            team2 = html`<div>${m.single}</div>`
          } else if (m.type === `singles`) {
            team1 = html`<div>${m.p1}</div>`
            team2 = html`<div>${m.p2}</div>`
          }

          return html`
            <div class="match">
              <h2>Bana ${match.court}</h2>
              <div class="team">${team1}</div>
              <div class="team">${team2}</div>
            </div>
            ${m.rest.length === 0
              ? html``
              : html`
                  <div id="resting">
                    ${`😴 ${match.rest.join(`, `)} vilar 😴`}
                  </div>
                `}
          `
        })}
        }
      </div>
    `
  }
}

customElements.define("x-round", Round)
