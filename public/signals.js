import { signal } from "./reactive.js"

export const hmr = signal()
export const userId = signal()
export const users = signal([])
export const page = signal(null)
export const schema = signal([])
