import createError from "http-errors"
import express from "express"
import path from "path"
import cookieParser from "cookie-parser"
import logger from "morgan"

import { Sequelize } from "@sequelize/core"
import { SqliteDialect } from "@sequelize/sqlite3"

import { fileURLToPath } from "url"

import usersRouter from "./routes/users.js"

const sequelize = new Sequelize({
  dialect: SqliteDialect,
  storage: `db.sqlite`,
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(logger(`dev`))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, `public`)))

app.use(`/users`, usersRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

export default app
