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

export function signal(initial, _fields={ error: null, loading: false}) {
  const fields = {..._fields, value: initial }
  const subscribers = new Set()
  let value = initial

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

  const target = {}
  const descriptors = {}

  for (const key of Object.keys(fields)) {
    descriptors[key] = {
      get() { 
        read()
        return fields[key] 
      },
      set(val) { 
        fields[key] = val 
        announce()
      },
      enumerable: true,
    }
  }

  Object.defineProperties(target, descriptors)

  return target
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
