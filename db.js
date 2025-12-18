import { Sequelize, DataTypes, sql } from "@sequelize/core"
import { SqliteDialect } from "@sequelize/sqlite3"
import generateEvents from "./events.js"

const { STRING, BOOLEAN, SMALLINT, TIME, DATE, DATEONLY, INTEGER } = DataTypes

const sequelize = new Sequelize({
  dialect: SqliteDialect,
  storage: `db.sqlite`,
  define: {
    allowNull: false,
  },
})

while (true) {
  try {
    await sequelize.authenticate()
    console.log(`Connection has been established successfully.`)
    break
  } catch (error) {
    console.error(`Unable to connect to the database:`, error)
    await new Promise((res) => setTimeout(res, 1000))
  }
}

const User = sequelize.define(`User`, {
  name: { type: STRING, unique: true },
  fullName: STRING,
  password: STRING,
  isAdmin: { type: BOOLEAN, default: false },
  phone: STRING,
  picturePath: STRING,
})

const Rule = sequelize.define("Rule", {
  weekday: SMALLINT, // 0-6 (0 is sunday)
  hour: SMALLINT, // 0-23
  minute: SMALLINT, // 0-59
  tz: STRING, // e.g. 'Europe/Stockholm'
  validFrom: DATEONLY, // YYYY-MM-DD
  validTo: DATEONLY, // YYYY-MM-DD
  slots: INTEGER,
})

const Skip = sequelize.define("Skip", {
  ts: { type: INTEGER },
})

const Response = sequelize.define(
  `Response`,
  {
    ts: INTEGER,
    response: SMALLINT, // 0 = No, 1 = Yes, 2 = Maybe
  },
  {
    indexes: [
      {
        unique: true,
        fields: [`ts`, `userId`],
      },
    ],
  }
)

User.hasMany(Response)
Response.belongsTo(User)

await User.sync({ alter: true })
await Rule.sync({ alter: true })
await Skip.sync({ alter: true })
await Response.sync({ alter: true })

await Rule.destroy({ where: sql`1 = 1` })

await Rule.create({
  weekday: 2, // tuesday
  hour: 10,
  minute: 0,
  tz: `Europe/Stockholm`,
  validFrom: `2023-01-01`,
  validTo: `2026-01-01`,
  slots: 14,
})

await Rule.create({
  weekday: 4, // thursday
  hour: 10,
  minute: 0,
  tz: `Europe/Stockholm`,
  validFrom: `2023-01-01`,
  validTo: `2026-01-01`,
  slots: 14,
})

export { User, Rule, Skip }
export default sequelize
