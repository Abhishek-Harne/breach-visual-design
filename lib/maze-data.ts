// ============================================================
// MAZE GRID
// ============================================================
// '#' = wall, '.' = open path. 32 cols x 19 rows.

export const MAZE_ROWS: string[] = [
  '################################',
  '#..............................#',
  '###.##.##.##.##.##.##.##.##.##.#',
  '#..............................#',
  '###.##.##.##.##.##.##.##.##.##.#',
  '#..............................#',
  '###.##.##.##.##.##.##.##.##.##.#',
  '#..............................#',
  '###.##.##.##.##.##.##.##.##.##.#',
  '#..............................#',
  '###.##.##.##.##.##.##.##.##.##.#',
  '#..............................#',
  '###.##.##.##.##.##.##.##.##.##.#',
  '#..............................#',
  '###.##.##.##.##.##.##.##.##.##.#',
  '#..............................#',
  '###.##.##.##.##.##.##.##.##.##.#',
  '#..............................#',
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
  { id: 'github', label: 'GITHUB', colStart: 0, colEnd: 5, toast: 'Leaked API key found' },
  { id: 'api', label: 'INT_API', colStart: 5, colEnd: 10, toast: 'Logged in with stolen key' },
  { id: 'db', label: 'CUST_DB', colStart: 10, colEnd: 15, toast: 'Reached the customer database' },
  { id: 'admin', label: 'ADMIN', colStart: 15, colEnd: 20, toast: 'Escalated to admin access' },
  { id: 'exfil', label: 'EXFIL', colStart: 20, colEnd: 25, toast: 'Data quietly exported' },
  { id: 'world', label: 'WORLD', colStart: 25, colEnd: 32, toast: 'Breach goes undetected' },
]

export function zoneForCol(col: number): typeof ZONES[number] {
  return ZONES.find((z) => col >= z.colStart && col < z.colEnd) ?? ZONES[ZONES.length - 1]
}

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

export const COIN_DEFS: CoinDef[] = [
  { id: 'c1', row: 3, col: 2, zone: 'github', power: false },
  { id: 'c2', row: 7, col: 7, zone: 'api', power: false },
  { id: 'c3', row: 5, col: 12, zone: 'db', power: false },
  { id: 'c4', row: 9, col: 17, zone: 'admin', power: false },
  { id: 'c5', row: 13, col: 22, zone: 'exfil', power: false },
  { id: 'c6', row: 15, col: 28, zone: 'world', power: false },
  { id: 'power', row: 9, col: 9, zone: 'api', power: true },
]

export const THIEF_SPAWN: Cell = { row: 9, col: 16 }
export const COP_SPAWN: Cell = { row: 1, col: 1 }
