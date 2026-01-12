import express from "express"
import hotserve from "hotserve"
import path from "path"
import cookieParser from "cookie-parser"
import logger from "morgan"

import { fileURLToPath } from "url"

import users from "./routes/users.js"
import rules from "./routes/rules.js"
import responses from "./routes/responses.js"
import skips from "./routes/skips.js"
import subscriptions from "./routes/subscriptions.js"

import sequelize, { User } from "./db.js"

function makePassword(full) {
  return (
    full.substr(0, 3).toLowerCase() +
    full.substr(full.length - 3, 3).toLowerCase()
  )
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(logger(`dev`))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, `public`)))

hotserve({
  dir: path.join(__dirname, `public`),
  pattern: `*.{js,css}`,
  app,
})

// auth
app.use(async (req, res, next) => {
  try {
    const header = req.headers.authorization

    if (!header) {
      return res.status(401).json({ error: "Missing authorization header" })
    }

    const [scheme, token] = header.split(" ")

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Invalid authorization format" })
    }

    // Verify token
    const user = await User.findOne({
      where: { password: token },
      attributes: {
        exclude: ["password"],
      },
    })

    if (!user) {
      throw new Error(`No user with that password`)
    }

    // Attach payload to request for later use
    req.user = user

    next()
  } catch (err) {
    console.error(err)
    return res.status(401).json({ error: "Invalid or expired token" })
  }
})

app.get(`/current-user`, async (req, res) => {
  res.json(req.user)
})

app.use(`/users`, users)
app.use(`/rules`, rules)
app.use(`/skips`, skips)
app.use(`/responses`, responses)
app.use(`/subscriptions`, subscriptions)

export default app
