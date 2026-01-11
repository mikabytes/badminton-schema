import { signal } from "../reactive.js"

const reg = await navigator.serviceWorker.ready
const sub = await reg.pushManager.getSubscription()

const isOn = Notification.permission !== `denied` && !!sub

const notifications = signal(isOn, {})

notifications.disable = async () => {
  const sub = await reg.pushManager.getSubscription()
  if (sub) {
    await sub?.unsubscribe()
  }
  notifications.value = false
}

notifications.enable = async () => {
  // 0) sanity checks
  if (!("serviceWorker" in navigator)) {
    alert("No serviceWorker support")
    return
  }
  if (!("PushManager" in window)) {
    alert("No Push API support")
    return
  }
  if (!("Notification" in window)) {
    alert("No Notifications support")
    return
  }

  // 1) Ask permission (this triggers the browser dialog)
  const perm = await Notification.requestPermission()
  if (perm !== "granted") {
    alert(`Could not request notifications: ${perm}`)
    return
  }

  // 3) Subscribe (requires VAPID public key)
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      `BEmlldzuyFxPtvszWfq1N0S2qR5m9IhUdwNFa8roKUHP4gPNRXeNv7uNZurWDnIX4uRBwq-WNtJ-9KiDWqV2CfE`
    ),
  })

  // 4) Send to server
  const res = await fetch("/subscriptions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${localStorage.token}`,
    },
    body: JSON.stringify(sub),
  })

  if (!res.ok) {
    alert(`Something went wrong.`)
    await sub.unsubscribe()
    return
  }

  notifications.value = true
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export default Object.seal(notifications)
