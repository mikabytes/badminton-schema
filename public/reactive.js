let activeEffect = null

const queue = new Set()
let scheduled = false

function schedule(effect) {
  queue.add(effect)
  if (!scheduled) {
    scheduled = true
    queueMicrotask(() => {
      scheduled = false
      // run a stable snapshot; effects might schedule more effects
      for (const fn of [...queue]) {
        queue.delete(fn)
        if (!fn.isCancelled) fn()
      }
    })
  }
}

export function signal(initial) {
  const subscribers = new Set()
  let value = initial
  let error = null
  let loading = false

  const read = () => {
    if (activeEffect) subscribers.add(activeEffect)
  }

  const announce = (next) => {
    // re-run all subscribers
    subscribers.forEach((fn) => {
      if (fn.isCancelled) {
        subscribers.delete(fn)
      } else {
        schedule(fn)
      }
    })
  }

  return {
    get value() {
      read()
      return value
    },
    set value(val) {
      value = val
      announce()
    },

    get error() {
      read()
      return error
    },
    set error(err) {
      if (Object.is(err, error)) {
        return
      }
      error = err
      announce()
    },

    get loading() {
      read()
      return loading
    },
    set loading(load) {
      if (Object.is(load, loading)) {
        return
      }
      loading = load
      announce()
    }
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
