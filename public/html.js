import { html as litHtml, render } from "lit-html"
import { versions } from "./elements/element.js"


export function html(strings, ...values) {
  const stringsOut = [...strings]
  stringsOut[0] = stringsOut[0].trimStart()
  stringsOut[stringsOut.length-1] = stringsOut[stringsOut.length-1].trimEnd()

  // we also need to handle the special case of x-page-${currentPage}
  for (let i = 0; i < stringsOut.length; i++) {

    while (stringsOut[i].endsWith(`x-page-`)) {

      const a = stringsOut[i] 
      const val = String(values.splice(i, 1)[0]) 
      const b = String(stringsOut.splice(i+1, 1)[0])

      stringsOut[i] = a + val + b
    }

    for (const [tagName, version] of versions.entries()) {
      const re = new RegExp(`<(/?)(${tagName})(?!-\\d+)(?=\\s|/?>)`, "g")

      stringsOut[i] = stringsOut[i].replaceAll(re, `<$1$2-${version}`)
    }
  }


  Object.defineProperty(stringsOut, "raw", {
    value: Object.freeze(stringsOut.slice()),
    writable: false,
    enumerable: false,
    configurable: false,
  })

  return litHtml(stringsOut, ...values)
}

export { render }
