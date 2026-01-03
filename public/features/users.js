import { signal } from "../reactive.js"
import Request from "../request.js"

export const users = signal([])
const request = Request(users)

users.load = () => {
  request(`get`, `/users`)
}

export default Object.seal(users)
