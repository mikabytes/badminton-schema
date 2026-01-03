
import { Router } from "express"
import { Skip } from "../db.js"

const app = Router()
export default app

app.get(`/`, async (req, res) => {
  try {
    const skips = await Skip.findAll()
    res.json(skips)
  } catch (e) {
    console.error(e)
    res.status(500).send(e.message)
  }
})

//app.delete(`/:ruleId`, async (req, res) => {
//  if (req.user.isAdmin) {
//    return res.status(401).send(`You're not authorized to do this`)
//  }
//
//  const rule = await Rule.findByPk(req.params.ruleId)
//
//  if (!rule) {
//    return res.status(404).send(`No such rule with id ${req.params.ruleId}`)
//  }
//
//  await rule.destroy()
//  res.status(200).send(`OK`)
//})


const difference = (a, b) => {
  const out = new Set()
  for (const x of a) if (!b.has(x)) out.add(x)
  return out
}
