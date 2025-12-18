import { Router } from "express"
import { Rule, Skip } from "../db.js"
import generateEvents from "../events.js"

const app = Router()
export default app

app.get(`/:from/:to`, async (req, res) => {
  let from, to

  try {
    from = new Date(+req.params.from)
    to = new Date(+req.params.to)
  } catch (e) {
    return res.status(400).send(`Invalid from/to date`)
  }

  if (from < new Date(`2024-01-01`)) {
    return res.status(400).send(`Invalid from date`)
  }

  if (to < new Date(`2024-01-01`)) {
    return res.status(400).send(`Invalid to date`)
  }

  if (to < from || to === from) {
    return res.status(400).send(`'to' date is older than 'from' date`)
  }

  if (Math.abs(from.getTime() - to.getTime()) > 365 * 24 * 60 * 60 * 1000) {
    // one year
    return res
      .status(400)
      .send(`Don't get schedule for more than a year at a time please`)
  }

  const [rules, skips] = await Promise.all([Rule.findAll(), Skip.findAll()])

  const events = generateEvents(
    rules,
    skips.map((it) => new Date(it.rs)),
    from,
    to
  )

  res.json(events)
})
