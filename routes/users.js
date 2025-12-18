import { Router } from "express"
import { User } from "../db.js"

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
