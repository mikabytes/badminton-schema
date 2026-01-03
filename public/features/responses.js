import Request from "../request.js"
import { signal } from "../reactive.js"

const responses = signal([])
const request = Request(responses)

responses.load = () => {
  request(`get`, `/responses`, null, data => {
    for (const entry of data) {
      entry.date = new Date(entry.ts * 60000)
    }
  })
}

export default Object.seal(responses)
