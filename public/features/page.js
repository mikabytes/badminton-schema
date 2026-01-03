import { signal } from "../reactive.js"

const page = signal(null, {})

export default Object.seal(page)
