
import { Router } from "express"
import { Rule } from "../db.js"

const app = Router()
export default app

app.get(`/`, async (req, res) => {
  try {
    const rules = await Rule.findAll()
    res.json(rules)
  } catch (e) {
    console.error(e)
    res.status(500).send(e.message)
  }
})

app.post(`/`, async (req, res) => {
  if (req.user.isAdmin) {
    return res.status(401).send(`You're not authorized to do this`)
  }

  const expected = new Set([`weekday`, `hour`, `minute`, `tz`, `validFrom`, `validTo`, `slots`])
  const actual = new Set(Object.keys(req.body))

  const missing = difference(expected, actual)

  if (missing.size > 0) {
    return res.status(400).send(`Missing fields: ${[...missing].join(`, `)}`)
  }

  const superflous = difference(actual, expected)

  if (superflous.size > 0) {
    return res.status(400).send(`Extra fields: ${[...superflous].join(`, `)}`)
  }

  if (req.body.tz !== `Europe/Stockholm`) {
    return res.status(400).send(`tz must be Europe/Stockholm`, `)}`)
  }

  const rule = await Rule.create(req.body)
  res.status(200).json(rule)
})

app.delete(`/:ruleId`, async (req, res) => {
  if (req.user.isAdmin) {
    return res.status(401).send(`You're not authorized to do this`)
  }

  const rule = await Rule.findByPk(req.params.ruleId)

  if (!rule) {
    return res.status(404).send(`No such rule with id ${req.params.ruleId}`)
  }

  await rule.destroy()
  res.status(200).send(`OK`)
})

app.put(`/:ruleId`, async (req, res) => {
  if (req.user.isAdmin) {
    return res.status(401).send(`You're not authorized to do this`)
  }

  const rule = await Rule.findByPk(req.params.ruleId)

  if (!rule) {
    return res.status(404).send(`No such rule with id ${req.params.ruleId}`)
  }

  const expected = new Set([`weekday`, `hour`, `minute`, `tz`, `validFrom`, `validTo`, `slots`])
  const actual = new Set(Object.keys(req.body))

  const missing = difference(expected, actual)

  if (missing.size > 0) {
    return res.status(400).send(`Missing fields: ${[...missing].join(`, `)}`)
  }

  if (req.body.tz !== `Europe/Stockholm`) {
    return res.status(400).send(`tz must be Europe/Stockholm`, `)}`)
  }

  const superflous = difference(actual, expected)

  if (superflous.size > 0) {
    return res.status(400).send(`Extra fields: ${[...superflous].join(`, `)}`)
  }

  for (const property of expected) {
    rule[property] = req.body[property]
  }

  await rule.save()

  res.status(200).send(`OK`)
})


const difference = (a, b) => {
  const out = new Set()
  for (const x of a) if (!b.has(x)) out.add(x)
  return out
}
