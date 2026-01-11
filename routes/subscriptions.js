import { Router } from "express"
import { Subscription } from "../db.js"

const app = Router()
export default app

app.post(`/`, async (req, res) => {
  if (req.body.endpoint?.length < 10) {
    return res.status(400).send(`Missing well-formed endpoint`)
  }

  const subscription = await Subscription.upsert({
    endpoint: req.body.endpoint,
    userId: req.user.id,
    json: JSON.stringify(req.body),
  })
  res.status(204).send()
})
