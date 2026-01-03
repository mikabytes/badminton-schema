import { signal } from "../reactive.js"
import Request from "../request.js"

const skips = signal([])
const request = Request(skips)

skips.load = () => {
  request(`get`, `/skips`, null, data => {
    for (const entry of data) {
      entry.date = new Date(entry.ts * 60000)
    }
    return data
  })
}

export default Object.seal(skips)
