import { signal } from "../reactive.js"
import Request from "../request.js"

export const schema = signal([])
const request = Request(schema)

schema.load = () => {
  let from = new Date()
  from.setHours(0)
  from.setMinutes(0)
  from.setSeconds(0)
  from.setMilliseconds(0)

  let to = new Date(from)
  to.setFullYear(to.getFullYear() + 1)

  request(`get`, `/schema/${from.getTime()}/${to.getTime()}`, null, data => {
    for (const entry of data) {
      entry.date = new Date(entry.date)
    }
    return data
  })
}

export default schema
