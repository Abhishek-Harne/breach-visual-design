// ============================================================
// MAZE GRID
// ============================================================
// '#' = wall, '.' = open path. 32 cols x 19 rows.
// Generated via recursive-backtracker spanning tree + sparse extra
// loop edges, then connectivity-safe pruning of inter-zone boundary
// columns to narrow zone crossings without creating dead-end-only
// transitions. Verified fully connected.

export const MAZE_ROWS: string[] = [
  '################################',
  '#.#...........#.#.#.#.......#.##',
  '#.#.#######.#.#.#.#.#######.#.##',
  '#.#.#.#.....#...#.#...#...#...##',
  '#.#.#.#########.#.###.#.#.#.####',
  '#.#.#.#...#.....#...#.....#...##',
  '#.#.#.###.#.#.#####.#.#####.#.##',
  '#.#.#...#.#.#...#.#.#.......#.##',
  '#.#####.#.#.#.###.#.#######.#.##',
  '#...#...#.......#.#.#.....#...##',
  '###.#.#########.#.#.###.#####.##',
  '#.....#.........#.#...#.#.....##',
  '#.#.###.#####.###.###.#.#.###.##',
  '#.....#.#.............#...#.#.##',
  '#.###.#############.#.###.#.#.##',
  '#.#...#...#...#.....#.....#.#.##',
  '#.#.###.#.#.#.#######.#.###.#.##',
  '#.......#...#...........#.....##',
  '################################',
]

export const ROWS = MAZE_ROWS.length
export const COLS = MAZE_ROWS[0].length

export type Cell = { row: number; col: number }

export function isWall(row: number, col: number): boolean {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return true
  return MAZE_ROWS[row][col] === '#'
}

export function cellKey(c: Cell): string {
  return `${c.row},${c.col}`
}

export function sameCell(a: Cell, b: Cell): boolean {
  return a.row === b.row && a.col === b.col
}

export function manhattan(a: Cell, b: Cell): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
}

export const DIRS: Record<'up' | 'down' | 'left' | 'right', Cell> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
}

export type Direction = keyof typeof DIRS

export function neighbors(c: Cell): Cell[] {
  return (Object.keys(DIRS) as Direction[])
    .map((d) => ({ row: c.row + DIRS[d].row, col: c.col + DIRS[d].col }))
    .filter((n) => !isWall(n.row, n.col))
}

// ============================================================
// ZONES — 6 pipeline stages, left to right by column
// ============================================================

export type ZoneId = 'github' | 'api' | 'db' | 'admin' | 'exfil' | 'world'

export const ZONES: { id: ZoneId; label: string; colStart: number; colEnd: number; toast: string }[] = [
  { id: 'github', label: 'GITHUB', colStart: 0, colEnd: 6, toast: 'Leaked API key found' },
  { id: 'api', label: 'INT_API', colStart: 6, colEnd: 10, toast: 'Logged in with stolen key' },
  { id: 'db', label: 'CUST_DB', colStart: 10, colEnd: 16, toast: 'Reached the customer database' },
  { id: 'admin', label: 'ADMIN', colStart: 16, colEnd: 20, toast: 'Escalated to admin access' },
  { id: 'exfil', label: 'EXFIL', colStart: 20, colEnd: 26, toast: 'Data quietly exported' },
  { id: 'world', label: 'WORLD', colStart: 26, colEnd: 32, toast: 'Breach goes undetected' },
]

export function zoneForCol(col: number): typeof ZONES[number] {
  return ZONES.find((z) => col >= z.colStart && col < z.colEnd) ?? ZONES[ZONES.length - 1]
}

// ============================================================
// SPAWNS
// ============================================================

export const THIEF_SPAWN: Cell = { row: 9, col: 16 }
export const COP_SPAWN: Cell = { row: 1, col: 1 }

// ============================================================
// COINS
// ============================================================

export interface CoinDef {
  id: string
  row: number
  col: number
  zone: ZoneId
  power: boolean
}

function openCellsInZone(zone: typeof ZONES[number]): Cell[] {
  const cells: Cell[] = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = zone.colStart; col < zone.colEnd; col++) {
      if (!isWall(row, col)) cells.push({ row, col })
    }
  }
  return cells
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Picks one random open cell per zone for a regular coin, plus one
// random open cell anywhere for the power-up coin. Avoids walls (by
// construction, since only open cells are candidates), avoids the
// thief/cop spawn cells, and avoids placing two coins on the same cell.
export function generateCoins(): CoinDef[] {
  const taken = new Set<string>([cellKey(THIEF_SPAWN), cellKey(COP_SPAWN)])
  const coins: CoinDef[] = []

  ZONES.forEach((zone, i) => {
    const candidates = openCellsInZone(zone).filter((c) => !taken.has(cellKey(c)))
    const cell = candidates.length > 0 ? pickRandom(candidates) : openCellsInZone(zone)[0]
    taken.add(cellKey(cell))
    coins.push({ id: `c${i + 1}`, row: cell.row, col: cell.col, zone: zone.id, power: false })
  })

  const allOpen: Cell[] = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!isWall(row, col)) allOpen.push({ row, col })
    }
  }
  const powerCandidates = allOpen.filter((c) => !taken.has(cellKey(c)))
  const powerCell = powerCandidates.length > 0 ? pickRandom(powerCandidates) : allOpen[0]
  const powerZone = zoneForCol(powerCell.col).id
  coins.push({ id: 'power', row: powerCell.row, col: powerCell.col, zone: powerZone, power: true })

  return coins
}
