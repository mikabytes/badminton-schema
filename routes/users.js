import { Router } from "express"
import { User, Rule, Skip, Response } from "../db.js"
import generateEvents from "../public/events.js"

const app = Router()
export default app

app.get(`/`, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    })
    res.json(users)
  } catch (e) {
    console.error(e)
    res.status(500).send(e.message)
  }
})

app.get(`/current-user`, async (req, res) => {
  res.json(req.user)
})

app.put(`/users/:userId/events/:ts/response`, async (req, res) => {
  const userId = +req.params.userId

  if (!req.user.isAdmin && userId !== req.user.id) {
    return res.status(401).send(`Unauthorized.`)
  }

  const [rules, skips] = await Promise.all([
    Rule.findAll(),
    Skip.findAll(),
  ])

  const ts = +req.params.ts

  if (ts < 1) {
    return res.status(400).send(`Bad ts parameter`)
  }

  const date = new Date(ts * 60000)

  const events = generateEvents(rules, skips.map(it => new Date(it.ts*60000)), date, date).filter(event => !event.skipped)

  if (events.length === 0) {
    return res.status(404).send(`No such event.`)
  }

  const response = req.body

  if (![0,1].includes(response)) {
    return res.status(400).send(`Invalid response: ${req.body}`)
  }

  await Response.upsert({
    ts,
    userId,
    req.body
  })

  res.status(204)
})
