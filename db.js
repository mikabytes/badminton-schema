import { Sequelize, DataTypes } from "@sequelize/core"
import { SqliteDialect } from "@sequelize/sqlite3"

const { STRING, BOOLEAN, SMALLINT, TIME, DATE } = DataTypes

const sequelize = new Sequelize({
  dialect: SqliteDialect,
  storage: `db.sqlite`,
  define: {
    allowNull: false
  }
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

const Rule = sequelize.define('Rule', {
  weekday: SMALLINT, // 0-6 (0 is sunday)
  start: TIME,
  validFrom: DATE,
  validTo: DATE,
})

const Skip = sequelize.define('Skip', {
  eventDate: { type: DATE, allowNull: false },
})

await User.sync({ alter: true })
await Rule.sync({ alter: true })
await Skip.sync({ alter: true })

export { User }
export default sequelize
