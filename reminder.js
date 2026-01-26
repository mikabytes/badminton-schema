import { Op } from "@sequelize/core"
import {
  User,
  Subscription,
  Rule,
  Skip,
  NotificationsSent,
  Response,
} from "./db.js"
import generateEvents from "./public/events.js"
import push from "./push.js"

let running = false

setInterval(sendNotifications, 60000 * 15) // every 15 minutes

sendNotifications()

async function sendNotifications() {
  const metrics = {
    events: 0,
    devices: 0,
    devicesSkipped: 0,
    successes: 0,
    failures: 0,
    deleted: 0,
    attempted: 0,
  }

  if (running) {
    console.log(`Already running notifications, skipping`)
    return
  }
  running = true
  const promises = []
  try {
    const from = new Date()
    const to = new Date()
    const oneDayAgo = new Date()
    oneDayAgo.setHours(oneDayAgo.getHours() - 24)
    to.setHours(to.getHours() + 24)

    console.log(
      `Scanning events for sending notifications: ${from.toISOString()} to ${to.toISOString()}, considering notifications sent from ${oneDayAgo.toISOString()}`
    )

    const [subscriptions, rules, skips, users, responses, sent] =
      await Promise.all([
        Subscription.findAll(),
        Rule.findAll(),
        Skip.findAll(),
        User.findAll(),
        Response.findAll({
          where: {
            ts: {
              [Op.gte]: Math.floor(from.getTime() / 60000),
              [Op.lt]: Math.ceil(to.getTime() / 60000),
            },
          },
        }),
        NotificationsSent.findAll({
          where: {
            ts: {
              [Op.gte]: Math.floor(oneDayAgo.getTime() / 60000),
              [Op.lt]: Math.ceil(to.getTime() / 60000),
            },
          },
        }),
      ])

    const events = generateEvents(
      rules,
      skips.map((skip) => new Date(skip.ts * 60000)),
      from,
      to
    )

    metrics.events = events.length
    metrics.devices = subscriptions.length
    console.log(`There were ${events.length} events to notify`)

    for (const event of events) {
      for (const user of users) {
        const hasResponse = responses.some(
          (r) => r.userId === user.id && r.ts === event.ts
        )

        if (hasResponse) {
          // we don't notify people who has already responded
          metrics.devicesSkipped += subscriptions.filter(
            (it) => it.userId === user.id
          ).length
          console.log(
            `We're not notifying ${user.name} because they already responded`
          )
          continue
        }

        const didNotify = sent.some(
          (s) => s.userId === user.id && s.ts === event.ts
        )

        if (didNotify) {
          // no point in notifying them again
          metrics.devicesSkipped += subscriptions.filter(
            (it) => it.userId === user.id
          ).length
          console.log(
            `We're not notifying ${user.name} because they had already been notified`
          )
          continue
        }

        const subs = subscriptions.filter((s) => s.userId === user.id)

        if (subs.length === 0) {
          console.log(`We can't notify ${user.name} because they have no subs`)
          continue
        } else {
          console.log(
            `Notifying ${user.name} as they have ${subs.length} subscriptions`
          )
        }

        for (const sub of subs) {
          // we don't await on pushes, handle them async
          // also, we only log errors, they'll be attempted again
          // next run
          let json
          try {
            json = JSON.parse(sub.json)
          } catch (e) {
            console.log(
              `Could not parse subscription json, deleting it: ${sub.json}`
            )
            metrics.deleted += 1
            await sub.destroy()
            continue
          }
          metrics.attempted += 1
          promises.push(
            push(json, {
              title: `Badminton`,
              body: `Kommer du imorgon?`,
              url: `/#rsvp/details/${event.ts}`,
            })
              .then(async (status) => {
                if (status === `ok`) {
                  metrics.successes += 1
                  NotificationsSent.upsert({
                    userId: user.id,
                    ts: event.ts,
                  }).catch((err) => {
                    console.error(
                      `User was notified correctly, but we couldn't upsert the notification sent, user will be notified again next run!`
                    )
                    console.error(err)
                  })
                  console.log(
                    `Notified ${user.name} successfully about event ${event.id} to device ${json.endpoint}`
                  )
                } else if (status === `delete`) {
                  metrics.deleted += 1
                  try {
                    console.log(`Deleting subscription for ${user.name}`)
                    await sub.destroy()
                  } catch (e) {
                    console.log(e)
                  }
                } else if (status === `failed`) {
                  metrics.failed += 1
                  console.log(
                    `Push service seems to be down for ${json.endpoint}`
                  )
                }
              })
              .catch((err) => {
                metrics.failed += 1
                console.error(err)
              })
          )
        }
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    try {
      await Promise.all(promises)
      console.log(metrics)
    } catch (e) {
      console.error(e)
    }
    running = false
  }
}
