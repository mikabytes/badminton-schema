import { signal } from "./reactive.js"

export const hmr = signal()
export const userId = signal()
export const users = signal([])
export const page = signal(null)
export const schema = signal([])
export const showMenu = signal(false)
export const title = signal(``)
export const actions = signal(null)
export const rules = signal([])
