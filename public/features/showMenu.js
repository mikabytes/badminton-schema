import { signal } from "../reactive.js"

const showMenu = signal(false, {})

export default Object.seal(showMenu)
