import { signal } from "../reactive.js"
import user from "features/user.js"
import Request from "../request.js"

export const users = signal([])
const request = Request(users)

users.load = async () => {
  await request(`get`, `/users`)

  // make sure to update the object corresponding to logged in user
  const me = users.value.find(it => it.id === user.id)
  if (me) {
    user.value = me
  }
}

export default Object.seal(users)
