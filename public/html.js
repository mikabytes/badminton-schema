import { html as litHtml, render } from "lit-html"
import { versions } from "./elements/element.js"

export function html(strings, ...values) {
  let patched = strings.map((s) => {
    for (const [tagName, version] of versions.entries()) {
      const re = new RegExp(`<(/?)(${tagName})(?!-\\d+)(?=\\s|/?>)`, "g")

      s = s.replaceAll(re, `<$1$2-${version}`)
    }

    return s
  })

  // Let's pretend to be a TemplateStringResult
  Object.defineProperty(patched, "raw", {
    value: Object.freeze(patched.slice()),
    writable: false,
    enumerable: false,
    configurable: false,
  })

  return litHtml(patched, ...values)
}

export { render }
