import { signal } from "../reactive.js"

// parts of the app that depends on hot module replacement hook into this
const callbacks = []
const hmr = signal(null, {})

hmr.onChange = (cb) => {
  callbacks.push(cb)
}

export default Object.seal(hmr)

// Hot Module Reloading (listening to file changes)
const source = new EventSource(`/changes`)
source.onmessage = (message) => {
  let { path, exists } = JSON.parse(message.data)
  path = path.replace(/^public/,``)

  if (!exists) {
    console.log(`${path} was deleted!`)

    document.location.reload()
  } else {
    console.log(`${path} was modified.`)


    for (const cb of callbacks) {
      if (cb(path)) {
        return
      }
    }

    document.location.reload()
  }

  // Use that specific file for hot reloading, or do a full page refresh
}

