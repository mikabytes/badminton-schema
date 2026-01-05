import { signal, effect } from "../reactive.js"
import { render, html } from "lit-html"
import hmr from "features/hmr.js"

const stylesByPath = new Map()
const instancesByClass = new WeakMap()

function instancesFor(ctor) {
  let s = instancesByClass.get(ctor);
  if (!s) instancesByClass.set(ctor, (s = new Set()));
  return s;
}

// css path -> current class managing that path
const cssRegistry = new Map();

export default class ReactiveElement extends HTMLElement {
  #cancelEffect = undefined
  #freeze = false

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
  }

  connectedCallback() {
    instancesFor(this.constructor).add(this);

    const sheet = stylesByPath.get(this.constructor.css?.pathname)
    if (sheet) {
      this.shadowRoot.adoptedStyleSheets = [sheet]
    }

    this.#cancelEffect = effect(() => {
      if (this.#freeze) {
        return
      }
      const callHmr = hmr.value
      try {const cssRegistry = new Map();
        render(this.render(), this.shadowRoot)
      } catch (e) {
        console.error(e)
        render(
          html`<div
            style="border: 2px dashed red; padding: 16px; white-space: pre-wrap; color: red;"
          >
            ${e.message}${`\n\n`}${e.stack}
          </div>`,
          this.shadowRoot
        )
      }
    })
  }

  disconnectedCallback() {
    instancesFor(this.constructor).delete(this);

    this.shadowRoot.adoptedStyleSheets = []

    this.#cancelEffect?.()
    this.#cancelEffect = undefined
  }

  adopt(path, sheet) {
    this.constructor.sheet = sheet
    this.shadowRoot.adoptedStyleSheets = [sheet]
  }

  freeze() {
    this.#freeze = true
  }

  unfreeze() {
    this.#freeze = false
    render(this.render(), this.shadowRoot)
  }

  static adopt(sheet) {
    this.sheet = sheet
    for (const i of instancesFor(this)) {
      i.shadowRoot.adoptedStyleSheets = [sheet]
    }
  }
}


// we patch customElements.define so that we can do HMR
let define = customElements.define
export const versions = new Map()

export function getTagName(tagName) {
  const version = versions.get(tagName) || 1
  return `${tagName}-${version}`
}

customElements.define = (tagName, klass) => {
  if (!versions.has(tagName)) {
    versions.set(tagName, 0)
  }

  const version = versions.get(tagName) + 1
  versions.set(tagName, version)

  if (klass.css) {
    cssRegistry.set(klass.css.pathname, klass)
  }

  define.call(customElements, `${tagName}-${version}`, klass)

  // trigger all custom elements to re-render
  hmr.value = version
}

hmr.onChange(path => {
  if (path.startsWith(`/elements`)) {

    // reload an Element
    if (path.endsWith(`.js`) && path !== `/elements/layout.js` && path !== `/elements/element.js`) {
      import(`${path}?d=${Date.now()}`)
      return true
    }

    console.log(cssRegistry)
    // reload CSS
    if (cssRegistry.has(path)) {
      fetch(`${path}`, { cache: `no-cache` }).then(res => res.text().then(css => {
        const sheet = new CSSStyleSheet()
        sheet.replaceSync(css)

        cssRegistry.get(path).adopt(sheet)
      }))

      return true
    }
  }
})

export async function preload() {
  let promises = []

  for (const [path, klass] of cssRegistry.entries()) {
    promises.push(new Promise(allDone => {
      fetch(`${path}`, { cache: `no-cache` }).then(res => res.text().then(css => {
        const sheet = new CSSStyleSheet()
        sheet.replaceSync(css)

        stylesByPath.set(path, sheet)

        klass.adopt(sheet)
        allDone()
      }))
    }))
  }

  await Promise.all(promises)
}
