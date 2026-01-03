import Element from "./element.js"
import error from "./error.js"
import { html } from "html"

// also covers errors implicitly
export default function renderLoading(...signals) {
  const err = error(signals)

  if (err) {
    return err
  }

  if (signals.some(it => it.loading)) {
    return html`<x-loading></x-loading>`
  }

  return false
}

class Loading extends Element {

  render() {
    return html`
      <style>
        :host {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: center;
        }

        dots::after {
          content: '';
          display: inline-block;
          width: 1em;
          animation: dots 1.5s steps(3, end) infinite;
        }

        @keyframes dots {
          0%   { content: ''; }
          33%  { content: '.'; }
          66%  { content: '..'; }
          100% { content: '...'; }
        }
              
      </style>
      <div class="dots"></div>
    `
  }
}

customElements.define("x-error", Loading)
