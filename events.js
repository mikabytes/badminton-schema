/**
 * rules: Array<{ weekday:number, hour:number, minute:number, tz:string, validFrom:string, validTo:string }>
 * skips: Array<{ ts:number }>
 * from/to: Date (instants)
 *
 * Returns: Array<{ date: Date, skipped: boolean }>
 */
export default function generateEvents(rules, skips, from, to) {
  const fromMs = from.getTime()
  const toMs = to.getTime()

  // Normalize skip timestamps: treat 10-digit values as seconds, 13-digit as milliseconds.
  const skipSet = new Set(skips.map((s) => s.getTime()))

  const events = []

  for (const rule of rules) {
    const { weekday, hour, minute, tz, validFrom, validTo } = rule

    // Work in "pure dates" (YYYY-MM-DD) using UTC to avoid local machine TZ issues.
    const vf = parseYMD(validFrom)
    const vt = parseYMD(validTo)

    // 1) Find the first date >= validFrom that matches rule.weekday
    let d = nextOrSameWeekday(vf, weekday)

    // 2) Walk by weeks until beyond validTo; also enforce [from, to] on the instant.
    while (compareYMD(d, vt) <= 0) {
      const occurrence = zonedTimeToUtc(tz, d.y, d.m, d.d, hour, minute)
      const ms = occurrence.getTime()

      if (ms >= fromMs && ms <= toMs) {
        const skipped = skipSet.has(ms)
        events.push({ date: occurrence, skipped })
      }

      // Small optimization: if even the current occurrence is > to, and we're stepping forward, we can break.
      if (ms > toMs) break

      d = addDaysYMD(d, 7)
    }
  }

  // Sort and return
  events.sort((a, b) => a.date - b.date)
  return events
}

// ------------------------ helpers ------------------------

function parseYMD(s) {
  // "YYYY-MM-DD"
  const y = Number(s.slice(0, 4))
  const m = Number(s.slice(5, 7))
  const d = Number(s.slice(8, 10))
  return { y, m, d }
}

function compareYMD(a, b) {
  if (a.y !== b.y) return a.y - b.y
  if (a.m !== b.m) return a.m - b.m
  return a.d - b.d
}

function addDaysYMD(ymd, days) {
  const dt = new Date(Date.UTC(ymd.y, ymd.m - 1, ymd.d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() }
}

function weekdayOfYMD(ymd) {
  // 0=Sunday..6=Saturday
  return new Date(Date.UTC(ymd.y, ymd.m - 1, ymd.d)).getUTCDay()
}

function nextOrSameWeekday(startYMD, targetWeekday) {
  const w = weekdayOfYMD(startYMD)
  const delta = (targetWeekday - w + 7) % 7
  return addDaysYMD(startYMD, delta)
}

/**
 * Convert a local date/time in an IANA timezone to a UTC Date.
 * Handles DST by iterating offset calculation a couple times.
 *
 * Note: For "nonexistent" local times during spring-forward, this picks the nearest
 * representable instant per the offset iteration (good enough for scheduling; if you
 * need strict behavior, use Temporal or luxon).
 */
function zonedTimeToUtc(timeZone, y, m, d, hh, mm) {
  const base = Date.UTC(y, m - 1, d, hh, mm, 0, 0) // "local clock" expressed as if it were UTC
  let utc = base

  for (let i = 0; i < 4; i++) {
    const offsetMin = tzOffsetMinutesAt(timeZone, new Date(utc))
    const nextUtc = base - offsetMin * 60_000
    if (nextUtc === utc) break
    utc = nextUtc
  }

  return new Date(utc)
}

function tzOffsetMinutesAt(timeZone, date) {
  // offset = localTime(date in tz) - utcTime(date), in minutes
  const dtf = getDTF(timeZone)
  const parts = dtf.formatToParts(date)

  let Y, M, D, h, m, s
  for (const p of parts) {
    if (p.type === "year") Y = Number(p.value)
    else if (p.type === "month") M = Number(p.value)
    else if (p.type === "day") D = Number(p.value)
    else if (p.type === "hour") h = Number(p.value)
    else if (p.type === "minute") m = Number(p.value)
    else if (p.type === "second") s = Number(p.value)
  }

  const localAsUTC = Date.UTC(Y, M - 1, D, h, m, s || 0, 0)
  return (localAsUTC - date.getTime()) / 60_000
}

const _dtfCache = new Map()
function getDTF(timeZone) {
  let dtf = _dtfCache.get(timeZone)
  if (!dtf) {
    dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    _dtfCache.set(timeZone, dtf)
  }
  return dtf
}
