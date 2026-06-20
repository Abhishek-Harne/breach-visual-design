// ============================================================
// MAZE GRID
// ============================================================
// '#' = wall, '.' = open path. 19 cols x 13 rows.

export const MAZE_ROWS: string[] = [
  '###################',
  '#........#........#',
  '#.##.###.#.###.##.#',
  '#.................#',
  '#.##.#.#####.#.##.#',
  '#....#...#...#....#',
  '###.#.#.....#.#.###',
  '#....#...#...#....#',
  '#.##.#.#####.#.##.#',
  '#.................#',
  '#.##.###.#.###.##.#',
  '#........#........#',
  '###################',
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
  { id: 'github', label: 'GITHUB', colStart: 0, colEnd: 3, toast: 'Leaked API key found' },
  { id: 'api', label: 'INT_API', colStart: 3, colEnd: 6, toast: 'Logged in with stolen key' },
  { id: 'db', label: 'CUST_DB', colStart: 6, colEnd: 9, toast: 'Reached the customer database' },
  { id: 'admin', label: 'ADMIN', colStart: 9, colEnd: 12, toast: 'Escalated to admin access' },
  { id: 'exfil', label: 'EXFIL', colStart: 12, colEnd: 15, toast: 'Data quietly exported' },
  { id: 'world', label: 'WORLD', colStart: 15, colEnd: 19, toast: 'Breach goes undetected' },
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
  { id: 'c1', row: 1, col: 2, zone: 'github', power: false },
  { id: 'c2', row: 3, col: 2, zone: 'github', power: false },
  { id: 'c3', row: 1, col: 5, zone: 'api', power: false },
  { id: 'c4', row: 5, col: 4, zone: 'api', power: false },
  { id: 'c5', row: 3, col: 7, zone: 'db', power: false },
  { id: 'c6', row: 7, col: 7, zone: 'db', power: false },
  { id: 'c7', row: 3, col: 11, zone: 'admin', power: false },
  { id: 'c8', row: 5, col: 11, zone: 'admin', power: false },
  { id: 'c9', row: 3, col: 13, zone: 'exfil', power: false },
  { id: 'c10', row: 7, col: 14, zone: 'exfil', power: false },
  { id: 'c11', row: 1, col: 16, zone: 'world', power: false },
  { id: 'c12', row: 11, col: 16, zone: 'world', power: false },
  { id: 'power', row: 9, col: 9, zone: 'db', power: true },
]

export const THIEF_SPAWN: Cell = { row: 6, col: 9 }
export const COP_SPAWN: Cell = { row: 1, col: 1 }
