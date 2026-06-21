import { type Cell, type Direction, DIRS, neighbors, manhattan, sameCell } from './maze-data'

// ============================================================
// BFS PATHFINDING — used by the cop when chasing the thief
// ============================================================

export function bfsNextStep(start: Cell, target: Cell): Cell | null {
  if (sameCell(start, target)) return null

  const startKey = `${start.row},${start.col}`
  const visited = new Set<string>([startKey])
  const queue: Cell[] = [start]
  const parent = new Map<string, Cell>()

  while (queue.length) {
    const current = queue.shift()!
    if (sameCell(current, target)) break

    for (const n of neighbors(current)) {
      const key = `${n.row},${n.col}`
      if (visited.has(key)) continue
      visited.add(key)
      parent.set(key, current)
      queue.push(n)
    }
  }

  const targetKey = `${target.row},${target.col}`
  if (!visited.has(targetKey)) return null

  // Walk parents back from target to start to find the first step.
  let step = target
  let stepKey = targetKey
  while (parent.has(stepKey)) {
    const p = parent.get(stepKey)!
    const pKey = `${p.row},${p.col}`
    if (pKey === startKey) return step
    step = p
    stepKey = pKey
  }
  return null
}

// ============================================================
// THIEF AI — heuristic move toward nearest coin, away from cop
// ============================================================

const HESITATION_CHANCE = 1 / 7

export function thiefAiNextStep(
  thiefPos: Cell,
  copPos: Cell,
  coins: Cell[],
  fleeRadius = 3
): Cell {
  const options = neighbors(thiefPos)
  if (options.length === 0) return thiefPos

  // Hesitation: occasionally freeze for a tick or wander instead of the optimal move.
  if (Math.random() < HESITATION_CHANCE) {
    if (Math.random() < 0.5) return thiefPos
    return options[Math.floor(Math.random() * options.length)]
  }

  const distToCop = manhattan(thiefPos, copPos)

  if (distToCop <= fleeRadius) {
    // Self-preservation: pick the neighbor that maximizes distance from the cop.
    let best = options[0]
    let bestScore = -Infinity
    for (const o of options) {
      const score = manhattan(o, copPos)
      if (score > bestScore) {
        bestScore = score
        best = o
      }
    }
    return best
  }

  if (coins.length === 0) return thiefPos

  let nearestCoin = coins[0]
  let nearestDist = manhattan(thiefPos, nearestCoin)
  for (const c of coins) {
    const d = manhattan(thiefPos, c)
    if (d < nearestDist) {
      nearestDist = d
      nearestCoin = c
    }
  }

  let best = options[0]
  let bestDist = manhattan(options[0], nearestCoin)
  for (const o of options) {
    const d = manhattan(o, nearestCoin)
    if (d < bestDist) {
      bestDist = d
      best = o
    }
  }
  return best
}

// ============================================================
// PLAYER MOVEMENT — buffered direction, grid-snapped
// ============================================================

export function tryMove(pos: Cell, dir: Direction): Cell {
  const delta = DIRS[dir]
  const next = { row: pos.row + delta.row, col: pos.col + delta.col }
  const blocked = neighbors(pos).every((n) => !sameCell(n, next))
  return blocked ? pos : next
}
