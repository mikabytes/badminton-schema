import { signal } from "../reactive.js"

// the id of the currently logged in user
const userId = signal(null, {})

export default userId
