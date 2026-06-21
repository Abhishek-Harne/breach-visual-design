import { type Cell, type Direction, type MazeGrid, DIRS, neighbors, manhattan, sameCell } from './maze-data'

// ============================================================
// BFS PATHFINDING — used by the cop when chasing the thief
// ============================================================

export function bfsNextStep(grid: MazeGrid, start: Cell, target: Cell): Cell | null {
  if (sameCell(start, target)) return null

  const startKey = `${start.row},${start.col}`
  const visited = new Set<string>([startKey])
  const queue: Cell[] = [start]
  const parent = new Map<string, Cell>()

  while (queue.length) {
    const current = queue.shift()!
    if (sameCell(current, target)) break

    for (const n of neighbors(grid, current)) {
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
// BFS DISTANCE MAP — full flood-fill distances from a source, used by
// the thief AI to reason about actual maze distance rather than
// straight-line distance.
// ============================================================

function bfsDistances(grid: MazeGrid, start: Cell): Map<string, number> {
  const startKey = `${start.row},${start.col}`
  const dist = new Map<string, number>([[startKey, 0]])
  const queue: Cell[] = [start]

  while (queue.length) {
    const current = queue.shift()!
    const currentKey = `${current.row},${current.col}`
    const d = dist.get(currentKey)!
    for (const n of neighbors(grid, current)) {
      const key = `${n.row},${n.col}`
      if (dist.has(key)) continue
      dist.set(key, d + 1)
      queue.push(n)
    }
  }

  return dist
}

// ============================================================
// THIEF AI — BFS pathfinding toward nearest coin (by real maze
// distance), fleeing from the cop (by real maze distance) when close
// ============================================================

const HESITATION_CHANCE = 1 / 7

export function thiefAiNextStep(
  grid: MazeGrid,
  thiefPos: Cell,
  copPos: Cell,
  coins: Cell[],
  fleeRadius = 3
): Cell {
  const options = neighbors(grid, thiefPos)
  if (options.length === 0) return thiefPos

  // Hesitation: occasionally freeze for a tick or wander instead of the optimal move.
  if (Math.random() < HESITATION_CHANCE) {
    if (Math.random() < 0.5) return thiefPos
    return options[Math.floor(Math.random() * options.length)]
  }

  const distFromCop = bfsDistances(grid, copPos)
  const distToCop = distFromCop.get(`${thiefPos.row},${thiefPos.col}`) ?? manhattan(thiefPos, copPos)

  if (distToCop <= fleeRadius) {
    // Self-preservation: pick the neighbor that maximizes real maze distance from the cop.
    let best = options[0]
    let bestScore = -Infinity
    for (const o of options) {
      const score = distFromCop.get(`${o.row},${o.col}`) ?? manhattan(o, copPos)
      if (score > bestScore) {
        bestScore = score
        best = o
      }
    }
    return best
  }

  if (coins.length === 0) return thiefPos

  // Find the nearest coin by real maze distance, then take the BFS-computed
  // shortest-path step toward it (same approach the cop uses to chase).
  const distFromThief = bfsDistances(grid, thiefPos)
  let nearestCoin = coins[0]
  let nearestDist = distFromThief.get(`${coins[0].row},${coins[0].col}`) ?? Infinity
  for (const c of coins) {
    const d = distFromThief.get(`${c.row},${c.col}`) ?? Infinity
    if (d < nearestDist) {
      nearestDist = d
      nearestCoin = c
    }
  }

  const step = bfsNextStep(grid, thiefPos, nearestCoin)
  return step ?? options[Math.floor(Math.random() * options.length)]
}

// ============================================================
// PLAYER MOVEMENT — buffered direction, grid-snapped
// ============================================================

export function tryMove(grid: MazeGrid, pos: Cell, dir: Direction): Cell {
  const delta = DIRS[dir]
  const next = { row: pos.row + delta.row, col: pos.col + delta.col }
  const blocked = neighbors(grid, pos).every((n) => !sameCell(n, next))
  return blocked ? pos : next
}
