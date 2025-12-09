let activeEffect = null

export function signal(initial) {
  const subscribers = new Set()
  let value = initial

  const read = () => {
    if (activeEffect) subscribers.add(activeEffect)
    return value
  }

  const write = (next) => {
    value = next
    // re-run all subscribers
    subscribers.forEach((fn) => {
      if (fn.isCancelled) {
        subscribers.delete(fn)
      } else {
        fn()
      }
    })
  }

  return {
    get value() {
      return read()
    },
    set value(val) {
      write(val)
    },
  }
}

export function effect(fn) {
  const runner = () => {
    activeEffect = runner
    try {
      fn()
    } finally {
      activeEffect = null
    }
  }

  runner()

  return () => {
    runner.isCancelled = true
  }
}
