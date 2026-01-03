import { signal } from "../reactive.js"

// parts of the app that depends on hot module replacement hook into this
const hmr = signal(null, {})

export default Object.seal(hmr)
