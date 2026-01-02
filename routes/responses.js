
import { Router } from "express"
import { Response } from "../db.js"

const app = Router()
export default app

app.get(`/`, async (req, res) => {
  try {
    const responses = await Response.findAll()
    res.json(responses)
  } catch (e) {
    console.error(e)
    res.status(500).send(e.message)
  }
})
