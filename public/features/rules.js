import { signal } from "../reactive.js"
import Request from "../request.js"

const rules = signal([])
const request = Request(rules)

rules.load = () => {
  request(`get`, `/rules`)
}

export default Object.seal(rules)
