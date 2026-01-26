import webPush from "web-push"

const publicKey = `BEmlldzuyFxPtvszWfq1N0S2qR5m9IhUdwNFa8roKUHP4gPNRXeNv7uNZurWDnIX4uRBwq-WNtJ-9KiDWqV2CfE`
const privateKey = `nyQKV7USsDdP2nmrwlHb0thz5imtO0tE-p-llz-1Bs8`

webPush.setVapidDetails("mailto:mika@wappia.se", publicKey, privateKey)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const jitter = (ms) => Math.floor(ms * (0.7 + Math.random() * 0.6)) // ±30%

const maxAttempts = 3

export default async function push(
  sub,
  {
    title = "Notification",
    body = "Please check the app",
    url = "/",
    tag = "tag",
    ttl = 60 * 60 * 24,
  }
) {
  if (title?.length < 3) throw new Error(`Too short title`)
  if (body?.length < 3) throw new Error(`Too short body`)
  if (url?.length < 1) throw new Error(`Too short url`)
  if (tag?.length < 3) throw new Error(`Too short tag`)
  if (ttl < 2) throw new Error(`Too short ttl`)

  let attempt = 0

  while (true) {
    try {
      await webPush.sendNotification(
        sub,
        JSON.stringify({ title, body, url, tag }),
        { TTL: ttl }
      )
      return `ok`
    } catch (err) {
      const code = err?.statusCode

      if (code === 404 || code === 410) {
        return `delete`
      }

      if (code === 429 || (code >= 500 && code <= 599)) {
        if (attempt >= maxAttempts) {
          return `failed` // let a job queue handle it, or log+give up
        }
        const base = 3000 * 2 ** attempt
        await sleep(jitter(base))
        attempt++
        continue
      }

      // 400/401/403 etc: usually config/bug; don't delete the sub
      throw err
    }
  }
}
