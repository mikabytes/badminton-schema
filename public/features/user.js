import { signal } from "../reactive.js"
import responses from "features/responses.js"
import Request from "../request.js"

// the id of the currently logged in user
const user = signal(null, {})

user.respond = async (eventId, yes) => {
  const sig = signal(null)
  const request = Request(sig)

  await request(`put`, `/users/${user.value.id}/events/${eventId}/response`, { value: yes })

  if (sig.error) {
    alert(`Något gick fel.`)
    console.error(sig.error)
    return
  }

  responses.load()
}

export default user
