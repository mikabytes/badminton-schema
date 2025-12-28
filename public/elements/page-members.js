
import Element from "./element.js"
import { html } from "lit-html"
import { users} from "../signals.js"

class PageMembers extends Element {

  render() {


    return html`
      <style>
        :host {

        }

        ul {
          margin: 30px 0;
          padding: 0;
          display: flex;
          align-items: center;
          flex-direction: column;
        }

        li {
          list-style: none;
          margin: 16px;
          padding: 16px;
          background-color: var(--background-panel);
          border: 1px solid var(--border);
          width: 100%;
          max-width: 430px;
          position: relative;
          height: 150px;
        }

        .name {
          text-align: center;
          left: 0;
          right: 0;
          font-weight: bold;
        }

        .split {
          display: flex;
        }

        .photo {
          width: 100px;
          height: 100px;
          margin-right: 20px;
        }

        .phone {
          margin-top: 40px;
        }

        hr {
          border: none;
          height: 1px;
          background-color: var(--border);
          margin-bottom: 16px;
        }
      </style>
      <ul>
        ${users.value.map(user => html`
          <li>
            <div class="user">
              <div class="name">${user.name}</div>
              <hr />
              <div class="split">
                <img class="photo" src="${user.picturePath ? `/photos/${user.picturePath}` : `/home.svg`}"/>
                <div class="details">
                  <div class="fullname">${user.fullName}</div>
                  <div class="phone">${user.phone ? `📞 ` + user.phone : ``}</div>
                </div>
              </div>
            </div>
          </li>
        `)}
      </ul>
    `
  }
}

customElements.define("x-page-members", PageMembers)
