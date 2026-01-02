
export default function Request(signal) {
  let inc = 0 // just to track request order, handle race conditions
  return async (method, endpoint, body=null, process=null) => {
    if (process !== null && typeof process !== `function`) {
      signal.error = new Error(`Invalid argument given to request(,,,process)`)
      return
    }

    const i = ++inc
    method = method.toUpperCase()

    const headers = { }

    if (localStorage.token?.length > 0) {
      headers.Authorization = `Bearer ${localStorage.token}`
    }

    if (body !== null) {
      if ([`GET`, `HEAD`].includes(method)) {
        signal.error = new Error(`Invalid use sending a body with GET/HEAD methods`)
        return
      }

      headers[`Content-Type`] = `application/json`
    } 

    try {
      signal.error = null
      signal.loading = true

      const res = await fetch(endpoint,
        {
          method,
          body: body !== null ? JSON.stringify(body) : undefined,
          headers,
        }
      )

      if (i !== inc) {
        return // bail, another request has been started
      }

      if (!res.ok) {
        const text = (await res.text()).slice(0, 1000)
        if (i !== inc) {
          return // bail, another request has been started
        }
        signal.error = new Error(`HTTP ${res.status} ${res.statusText}: ${text}`)
        return
      }

      const contentType = res.headers.get(`content-type`) || ``
      
      if (contentType.match(/application\/([\w-]+\+)?json/) ) {
        let json = await res.json()
        if (i !== inc) {
          return // bail, another request has been started
        }
        if (process) {
          json = process(json)
        }
        signal.value = json
      }
    } catch (e) {
      if (i !== inc) {
        return // bail, another request has been started
      }
      signal.error = e instanceof Error ? e : new Error(String(e))
    } finally {
      if (i !== inc) {
        return // bail, another request has been started
      }
      signal.loading = false
    }
  }
}
