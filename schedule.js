function generateCirclePairs(players) {
  const n = players.length
  if (n % 2 !== 0) {
    throw new Error("Circle method requires an even number of players")
  }

  let arr = players.slice()
  const rounds = n - 1
  const allRounds = []

  for (let r = 0; r < rounds; r++) {
    const pairs = []
    for (let i = 0; i < n / 2; i++) {
      pairs.push([arr[i], arr[n - 1 - i]])
    }

    allRounds.push(pairs)

    // rotate arr[1..]
    const fixed = arr[0]
    const rest = arr.slice(1)
    rest.unshift(rest.pop())
    arr = [fixed, ...rest]
  }

  return allRounds
}

/**
 * Schedule badminton rounds so that:
 * - everyone partners everyone (circle method)
 * - special cases based on players.length % 4:
 *   0 => all doubles
 *   1 => one player rests each round
 *   2 => one singles match each round
 *   3 => one 2-vs-1 match each round
 *
 * Returns: array of rounds
 *   round = {
 *     matches: [
 *       { type: "doubles", court, team1: [p1,p2], team2: [p3,p4] }
 *       { type: "singles", court, p1, p2 }
 *       { type: "two_vs_one", court, team: [p1,p2], single: p3 }
 *     ],
 *     rest: [ ...players ]   // may be empty
 *   }
 */
export default function schedule(players) {
  const N = players.length
  const mod = N % 4
  const BYE = "__BYE__"

  let extendedPlayers = players.slice()
  let useBye = false

  if (mod === 1 || mod === 3) {
    extendedPlayers.push(BYE)
    useBye = true
  }

  const pairRounds = generateCirclePairs(extendedPlayers)
  const rounds = []

  // --- tracking fairness for singles (only used when mod === 2) ---
  const singlesCount = {}
  const lastSinglesRound = {}
  for (const p of players) {
    singlesCount[p] = 0
    lastSinglesRound[p] = -Infinity
  }

  for (const [roundIndex, roundPairs] of pairRounds.entries()) {
    const round = { matches: [], rest: [] }

    if (mod === 0) {
      // N = 4k: pure doubles – group pairs 2-by-2
      for (let i = 0; i < roundPairs.length; i += 2) {
        const [t1a, t1b] = roundPairs[i]
        const [t2a, t2b] = roundPairs[i + 1]

        round.matches.push({
          type: "doubles",
          court: round.matches.length + 1,
          team1: [t1a, t1b],
          team2: [t2a, t2b],
        })
      }
    } else if (mod === 2) {
      // N = 4k + 2: last pair becomes singles
      const pairs = roundPairs.slice()

      // Choose which pair becomes singles:
      // - prefer players with lower singlesCount
      // - avoid players who played singles last round
      let bestIndex = 0
      let bestScore = Infinity

      for (let i = 0; i < pairs.length; i++) {
        const [p1, p2] = pairs[i]
        // safety: BYE should never appear in mod===2 case
        if (p1 === BYE || p2 === BYE) continue

        const maxCount = Math.max(singlesCount[p1], singlesCount[p2])
        const consecutivePenalty =
          (lastSinglesRound[p1] === roundIndex - 1 ? 1 : 0) +
          (lastSinglesRound[p2] === roundIndex - 1 ? 1 : 0)

        // tuned weights: big weight on maxCount, smaller on consecutivePenalty
        const score = maxCount * 100 + consecutivePenalty * 10 + i

        if (score < bestScore) {
          bestScore = score
          bestIndex = i
        }
      }

      const singlesPair = pairs.splice(bestIndex, 1)[0]
      const [sp1, sp2] = singlesPair

      // update tracking
      if (sp1 in singlesCount) {
        singlesCount[sp1]++
        lastSinglesRound[sp1] = roundIndex
      }
      if (sp2 in singlesCount) {
        singlesCount[sp2]++
        lastSinglesRound[sp2] = roundIndex
      }

      // doubles from remaining pairs
      for (let i = 0; i < pairs.length; i += 2) {
        const [t1a, t1b] = pairs[i]
        const [t2a, t2b] = pairs[i + 1]

        round.matches.push({
          type: "doubles",
          court: round.matches.length + 1,
          team1: [t1a, t1b],
          team2: [t2a, t2b],
        })
      }

      const [p1, p2] = singlesPair
      round.matches.push({
        type: "singles",
        court: round.matches.length + 1,
        p1: sp1,
        p2: sp2,
      })
    } else if (mod === 1) {
      // N = 4k + 1: one player rests (paired with BYE)
      const pairsWithoutBye = []
      let restPlayer = null

      for (const [a, b] of roundPairs) {
        if (a === BYE || b === BYE) {
          // the other one rests
          restPlayer = a === BYE ? b : a
        } else {
          pairsWithoutBye.push([a, b])
        }
      }

      // group remaining pairs into doubles
      for (let i = 0; i < pairsWithoutBye.length; i += 2) {
        const [t1a, t1b] = pairsWithoutBye[i]
        const [t2a, t2b] = pairsWithoutBye[i + 1]

        round.matches.push({
          type: "doubles",
          court: round.matches.length + 1,
          team1: [t1a, t1b],
          team2: [t2a, t2b],
        })
      }

      if (restPlayer) {
        round.rest.push(restPlayer)
      }
    } else if (mod === 3) {
      // N = 4k + 3: one 2-vs-1 (match containing BYE)
      // First group pairs 2-by-2 as if all are doubles
      for (let i = 0; i < roundPairs.length; i += 2) {
        const pair1 = roundPairs[i]
        const pair2 = roundPairs[i + 1]
        const matchIndex = round.matches.length

        const match = {
          type: "doubles",
          court: matchIndex + 1,
          team1: pair1.slice(),
          team2: pair2.slice(),
        }

        round.matches.push(match)
      }

      // Now transform the one match that contains BYE into 2-vs-1
      for (const match of round.matches) {
        const t1HasBye = match.team1.includes(BYE)
        const t2HasBye = match.team2.includes(BYE)

        if (!t1HasBye && !t2HasBye) continue

        let teamDouble, single

        if (t1HasBye && !t2HasBye) {
          // (BYE + X) vs (A + B)  =>  (A + B) vs X
          const [x1, x2] = match.team1
          single = x1 === BYE ? x2 : x1
          teamDouble = match.team2
        } else if (!t1HasBye && t2HasBye) {
          // (A + B) vs (BYE + X)  =>  (A + B) vs X
          const [x1, x2] = match.team2
          single = x1 === BYE ? x2 : x1
          teamDouble = match.team1
        } else {
          // Extremely unlikely with proper circle method, but let's be safe:
          throw new Error(
            "BYE appeared on both teams in one match, something's off"
          )
        }

        match.type = "two_vs_one"
        match.team = teamDouble
        match.single = single
        delete match.team1
        delete match.team2
        break // only one match with BYE per round
      }
    }

    // Filter out any accidental BYE references (just in case)
    for (const m of round.matches) {
      if (m.type === "doubles") {
        m.team1 = m.team1.filter((p) => p !== BYE)
        m.team2 = m.team2.filter((p) => p !== BYE)
      } else if (m.type === "singles") {
        if (m.p1 === BYE || m.p2 === BYE) {
          // shouldn't happen in this design, but be defensive
        }
      } else if (m.type === "two_vs_one") {
        m.team = m.team.filter((p) => p !== BYE)
        if (m.single === BYE) {
          // shouldn't happen either
        }
      }
    }

    // Remove BYE from rest list if ever there
    round.rest = round.rest.filter((p) => p !== BYE)

    rounds.push(round)
  }

  return rounds
}
