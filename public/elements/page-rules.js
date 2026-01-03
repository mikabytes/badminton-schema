import Element from "./element.js"
import { html } from "lit-html"
import { signal } from "../reactive.js"
import rules from "features/rules.js"

class PageRules extends Element {

  #refresh = signal()

  async connectedCallback() {
    super.connectedCallback()
    this.loadRules()
  }

  disconnectedCallback() {
    this.loadRules()
  }

  async loadRules() {
    try {
      const res = await fetch(`/rules`, {
        headers: {
          Authorization: `Bearer ${localStorage.token}`
        }
      })

      if (res.ok) {
        rules.value = await res.json()
      }
    } catch(e) {
    }
  }

  async delete(rule) {
    if (!confirm(`Är du säker?`)) {
      return
    }

    try {
      const res = await fetch(`/rules/${rule.id}`, {
        method: `delete`,
        headers: {
          Authorization: `Bearer ${localStorage.token}`
        }
      })

      if (!res.ok) {
        alert(`Something went wrong: ${res.status}`)
        return
      }

      this.loadRules()
    } catch(e) {
      console.error(e)
      alert(`Inget internet?`)
    }
  }

  async createNew() {
    const now = new Date()

    rules.value = [
      ...rules.value,
      {
        id: rules.value[rules.value.length-1].id + 1,
        new: true,
        dirty: true,
        validFrom: now.toISOString().slice(0, 10),
        validTo: now.toISOString().slice(0, 10),
        weekday: 1,
        hour: 0,
        minute: 0,
        tz: `Europe/Stockholm`,
        slots: 20,
      }
    ]
  }

  async save(rule) {
    const payload = {
      tz: `Europe/Stockholm`
    }

    this.shadowRoot.querySelectorAll(`#rule-${rule.id} input, #rule-${rule.id} select`).forEach(el => {
      let value = el.type === `date` ? el.value : Number(el.value)
      payload[el.name] = value
    })

    if (rule.new) {
      try {
        const res = await fetch(`/rules`, {
          method: `post`,
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
            'Content-Type': `application/json`,
          },
          body: JSON.stringify(payload)
        })

        if (!res.ok) {
          alert(`Gick inte att skapa: ${res.status}`)
          return
        }

        this.loadRules()
      } catch(e) {
        alert(`Inget internet?`)
      }

      return
    }

    try {
      const res = await fetch(`/rules/${rule.id}`, {
        method: `put`,
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
          'Content-Type': `application/json`,
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        alert(`Gick inte att spara: ${res.status}`)
        return
      }

      this.loadRules()
    } catch(e) {
      alert(`Inget internet?`)
    }
  }

  render() {
    this.#refresh.value // make sure we're subscribed to the refresh

    return html`
      <style>
        :host {
          display: block;
          margin-top: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        fieldset > div {
          display: flex;
          margin-bottom: 20px;
        }

        fieldset > div:last-child {
          margin-bottom: 0;
        }

        input:invalid {
          background-color: crimson;
        }

        fieldset {
          background-color: var(--background-panel);
          border: 1px solid var(--border);
          margin: 0 0 20px 0;
          padding: 20px;
        }
      
        input, select {
          border: 1px solid var(--border);
          padding: 5px;
          background-color: var(--background-panel);
        }

        label {
          margin-right: 20px;
        }

        input[name="slots"] {
          width: 40px;
        }

        input[name="hour"] {
          width: 20px;
        }

        input[name="minute"] {
          margin-left: 0;
          width: 20px;
        }

        /* Chrome, Edge, Safari */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* Firefox */
        input[type="number"] {
          -moz-appearance: textfield;
        }

        .buttons {
          display: flex;
          justify-content: flex-end;
        }

        button {
          border: none;
          color: var(--background);
          padding: 8px;
          font-size: 16px;
          margin-left: 8px;
          cursor: pointer;
        }

        button[disabled] {
          background-color: transparent;
          color: var(--text-primary);
          cursor: default;
        }

        .delete {
          background-color: var(--warning);
        }

        .save, #new-rule {
          background-color: var(--primary-action);
        }

        #new-rule {
          margin-top: 30px;
        }

        .time {
          margin-left: auto;
        }
      </style>
      ${rules.value.map(rule => html`
        <fieldset id="rule-${rule.id}" ?data-dirty=${rule.dirty} @input=${(e) => { rule.dirty = true; this.#refresh.value = null }}>
          <div>
            <label>
              Period:
              <input type="date" name="validFrom" value=${rule.validFrom} />
              till
              <input type="date" name="validTo" value=${rule.validTo} />
            </label>
          </div>
          <div>
            <label>
              Dag
              <select name="weekday">
                <option ?selected=${rule.weekday === 1} value="1">Måndag</option>
                <option ?selected=${rule.weekday === 2} value="2">Tisdag</option>
                <option ?selected=${rule.weekday === 3} value="3">Onsdag</option>
                <option ?selected=${rule.weekday === 4} value="4">Torsdag</option>
                <option ?selected=${rule.weekday === 5} value="5">Fredag</option>
                <option ?selected=${rule.weekday === 6} value="6">Lördag</option>
                <option ?selected=${rule.weekday === 0} value="0">Söndag</option>
              </select>
            </label>
            <label class="time">
              Tid
              <input type="number" name="hour" min="0" max="23" step="1" inputmode="numeric" value=${rule.hour} /><span>:</span><input type="number" name="minute" min="0" max="59" step="1" inputmode="numeric" value=${rule.minute} />
            </label>
          </div>
          <div>
            <label>Max deltagare
              <input type="number" name="slots" min="1" step="1" inputmode="numeric" value=${rule.slots} />
            </label>
          </div>
          <div class="buttons">
            <button class="delete" @click=${() => this.delete(rule)}>Radera</button>
            <button class="save" ?disabled=${!rule.dirty} @click=${() => this.save(rule)}>Spara</button>
          </div>
        </fieldset>
      `)}
      <button id="new-rule" @click=${() => this.createNew()}>Skapa ny</button>
    `
  }
}

customElements.define("x-page-rules", PageRules)
