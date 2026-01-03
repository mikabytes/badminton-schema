import Request from "../request.js"
import { signal } from "../reactive.js"

const responses = signal([])
const request = Request(responses)

responses.load = () => {
  request(`get`, `/responses`, null)
}

export default Object.seal(responses)
