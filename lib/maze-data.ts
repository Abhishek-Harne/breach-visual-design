// ============================================================
// MAZE LAYOUTS
// ============================================================
// '#' = wall, '.' = open path. 32 cols x 19 rows.
//
// 5 distinct hand-authored layouts, one randomly selected per round.
// Each starts from a recursive-backtracker spanning tree (a "perfect"
// maze — exactly one path between any two points), then has extra
// loop edges carved in, then is fully debridged: every corridor edge
// that was a graph-theoretic bridge (the only edge connecting two
// regions) had an additional wall opened nearby to create a parallel
// route, until the open-cell graph has zero bridges left. This makes
// every region, including the 4 corners and the far edges, reachable
// by at least 2 edge-disjoint paths (verified via max-flow, not just
// reachability) rather than a single thread-like corridor. All 5 are
// verified fully connected with both spawn cells open.

export const MAZE_LAYOUTS: string[][] = [
  [
    '################################',
    '#...............#.............##',
    '#.#.#.###.#.###.#.#######.#.#.##',
    '#...#.#...#...#.#.#.......#.#.##',
    '#.#.#.#.###.#.#.#.#.#.#.#.#.#.##',
    '#.#...#.....#.#.#.....#...#.#.##',
    '#.#.###.#.#.#.#.###.###.#.#.#.##',
    '#...#...#.#.........#...#.....##',
    '#.#.#.###.#.###.#.#.#.#.#.#.#.##',
    '#.....#...........#.#.....#.#.##',
    '#.#.#.#.#.###.###.#.#.#.###.#.##',
    '#.....#...........#...#.#.....##',
    '#.###.#.#.#.#.#########.#.######',
    '#.....#.#.#.............#.....##',
    '#.###.#.#.#.#.#.###.#####.#.#.##',
    '#.....#...#.........#...#...#.##',
    '#.#.#.#####.#.#.#.###.#.#.###.##',
    '#...#...........#.....#.......##',
    '################################',
  ],
  [
    '################################',
    '#...........#.................##',
    '#.#.#.#.###.#.###.#######.#.#.##',
    '#...#.#.......#...#.......#.#.##',
    '#.#.#.###.###.#.#.#.#####.#.#.##',
    '#...#...........#.....#...#...##',
    '#.###.#####.#.#.#####.#.###.#.##',
    '#...#.............#...#.#...#.##',
    '###.#.#.#.#.#.#.#.#.###.#.###.##',
    '#...#.#.......#.............#.##',
    '#.#.#.#######.#.#.#.#.#.###.#.##',
    '#...#.......#...#.#.#.....#...##',
    '#.#.#####.#.#.#.#.#.###.#.#.#.##',
    '#...#.......#...#.#...#.....#.##',
    '###.#.###.#.###.#.#.#.#.#####.##',
    '#...#...#.......#.#...#.....#.##',
    '#.#.###.###.#.#.#.#.#.#.###.#.##',
    '#.............#...#...........##',
    '################################',
  ],
  [
    '################################',
    '#...#.......#.................##',
    '#.#.#.#.#.#.#.#.###.###.###.#.##',
    '#.#...#...#...#...#.......#...##',
    '#.#.###.#########.#.#.#.#.#.#.##',
    '#...#...#.............#.#...#.##',
    '###.#.#.#.#####.#####.#.###.#.##',
    '#.....#.....#.........#.......##',
    '#.###.#.###.#.#.#.###########.##',
    '#.........#.#.#...............##',
    '#######.#.#.#.#.###.#.#.#.#.####',
    '#.........#...#.....#.....#...##',
    '#.#########.###.#.#####.#.###.##',
    '#...#.....#.............#...#.##',
    '#.#.#.###.#.###.#.#########.#.##',
    '#.#.....#...........#.......#.##',
    '#.#####.#########.#.#.#.#.###.##',
    '#.....................#.......##',
    '################################',
  ],
  [
    '################################',
    '#...#.................#.......##',
    '#.#.#.#.#######.#.###.#.###.#.##',
    '#.#.................#.........##',
    '#.#.#.#####.#.#.###.#####.#.####',
    '#.#.....#...#.#...............##',
    '#.#.#.#.#.###.#####.#.#######.##',
    '#.....#.....#.....#...........##',
    '#.#.#.#.###.#####.#.#.#.###.#.##',
    '#.#.....#.........#...#...#.#.##',
    '#.###.###.#.#.#####.#.###.#.#.##',
    '#.....#...#.#.............#.#.##',
    '#.#.#.#.#.#.#.#####.#.#.#.#.#.##',
    '#.#...#...#.........#.....#...##',
    '#.#.#.#.#.#.#####.###.###.#.#.##',
    '#.#.#.......#...#...........#.##',
    '#.#.#.###.###.#.#.#.###.#.#.#.##',
    '#.............#...............##',
    '################################',
  ],
  [
    '################################',
    '#.............................##',
    '#.#.#.#.#.###.###.#.#.#####.#.##',
    '#.#...#...#.......#...#.......##',
    '#.#.###.#.#.#.#.###.#.#.###.#.##',
    '#.#.........#...#...#.........##',
    '#.###.#.#.#.#.###.#.#######.####',
    '#.#...........#...#...........##',
    '#.#.###.#.#.#.#.###.#.#.#.###.##',
    '#...#.......#.#.....#.........##',
    '#####.###.#.#.#########.#####.##',
    '#.........#.#...........#.....##',
    '#.#.#####.#.###.#.#.###.#.######',
    '#.#.#.....#.......#.....#.....##',
    '#.#.#.#.#.###.###.###.#####.#.##',
    '#.....#.#...................#.##',
    '#.#.#.#.#.#####.#.#.#.#.#.###.##',
    '#.....#.......................##',
    '################################',
  ],
]

export const ROWS = MAZE_LAYOUTS[0].length
export const COLS = MAZE_LAYOUTS[0][0].length

export type Cell = { row: number; col: number }
export type MazeGrid = string[]

export function gridDims(grid: MazeGrid): { rows: number; cols: number } {
  return { rows: grid.length, cols: grid[0].length }
}

// ============================================================
// MOBILE LAYOUT — a separate, narrower-column maze used below the
// mobile breakpoint so the board fits a narrow viewport without
// horizontal clipping, instead of squeezing the desktop layout down.
// Same generation/verification process as the desktop layouts: a
// recursive-backtracker spanning tree, extra loop edges, then fully
// debridged (zero graph-theoretic bridges) and confirmed 2-edge-connected
// via max-flow across corner/edge sample points. 18 cols x 19 rows.
// ============================================================

export const MOBILE_LAYOUT: MazeGrid = [
  '##################',
  '#...............##',
  '#.#.#.#.#.###.#.##',
  '#...............##',
  '#.#.#.#.###.#.#.##',
  '#.....#.........##',
  '#.#.#.#.#.#.#.#.##',
  '#...#...........##',
  '#.#.#.#.#.#.#.####',
  '#.#.#.....#.#...##',
  '#.#.#.#.#.#.#.#.##',
  '#...........#...##',
  '#.###.#.#.#.#.#.##',
  '#.....#.........##',
  '#.#.###.#.#.#.#.##',
  '#.#.............##',
  '#.#.#.#.#.#.#.#.##',
  '#...............##',
  '##################',
]

export const MOBILE_ROWS = MOBILE_LAYOUT.length
export const MOBILE_COLS = MOBILE_LAYOUT[0].length

// Tracks the most recently selected layout (module-level, persists across
// component remounts within the same browser session) so consecutive
// rounds avoid repeating the same layout back to back. Tracked separately
// per breakpoint since desktop has 5 layouts and mobile currently has 1.
let lastLayoutIndex: number | null = null

export function pickLayout(mobile = false): { grid: MazeGrid; index: number; zones: ZoneDef[]; thiefSpawn: Cell; copSpawn: Cell } {
  if (mobile) {
    return { grid: MOBILE_LAYOUT, index: 0, zones: MOBILE_ZONES, thiefSpawn: MOBILE_THIEF_SPAWN, copSpawn: MOBILE_COP_SPAWN }
  }
  const candidates = MAZE_LAYOUTS.map((_, i) => i).filter((i) => i !== lastLayoutIndex)
  const pool = candidates.length > 0 ? candidates : MAZE_LAYOUTS.map((_, i) => i)
  const index = pool[Math.floor(Math.random() * pool.length)]
  lastLayoutIndex = index
  return { grid: MAZE_LAYOUTS[index], index, zones: ZONES, thiefSpawn: THIEF_SPAWN, copSpawn: COP_SPAWN }
}

export function isWall(grid: MazeGrid, row: number, col: number): boolean {
  const { rows, cols } = gridDims(grid)
  if (row < 0 || row >= rows || col < 0 || col >= cols) return true
  return grid[row][col] === '#'
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

export function neighbors(grid: MazeGrid, c: Cell): Cell[] {
  return (Object.keys(DIRS) as Direction[])
    .map((d) => ({ row: c.row + DIRS[d].row, col: c.col + DIRS[d].col }))
    .filter((n) => !isWall(grid, n.row, n.col))
}

// ============================================================
// ZONES — 6 pipeline stages, left to right by column
// ============================================================

export type ZoneId = 'github' | 'api' | 'db' | 'admin' | 'exfil' | 'world'

export interface ZoneDef {
  id: ZoneId
  label: string
  colStart: number
  colEnd: number
  toast: string
}

export const ZONES: ZoneDef[] = [
  { id: 'github', label: 'GITHUB', colStart: 0, colEnd: 6, toast: 'Leaked API key found' },
  { id: 'api', label: 'INT_API', colStart: 6, colEnd: 10, toast: 'Logged in with stolen key' },
  { id: 'db', label: 'CUST_DB', colStart: 10, colEnd: 16, toast: 'Reached the customer database' },
  { id: 'admin', label: 'ADMIN', colStart: 16, colEnd: 20, toast: 'Escalated to admin access' },
  { id: 'exfil', label: 'EXFIL', colStart: 20, colEnd: 26, toast: 'Data quietly exported' },
  { id: 'world', label: 'WORLD', colStart: 26, colEnd: 32, toast: 'Breach goes undetected' },
]

// Same 6-stage structure/labeling as the desktop ZONES, with column
// ranges rescaled to the mobile layout's 18 columns.
export const MOBILE_ZONES: ZoneDef[] = [
  { id: 'github', label: 'GITHUB', colStart: 0, colEnd: 3, toast: 'Leaked API key found' },
  { id: 'api', label: 'INT_API', colStart: 3, colEnd: 6, toast: 'Logged in with stolen key' },
  { id: 'db', label: 'CUST_DB', colStart: 6, colEnd: 9, toast: 'Reached the customer database' },
  { id: 'admin', label: 'ADMIN', colStart: 9, colEnd: 12, toast: 'Escalated to admin access' },
  { id: 'exfil', label: 'EXFIL', colStart: 12, colEnd: 15, toast: 'Data quietly exported' },
  { id: 'world', label: 'WORLD', colStart: 15, colEnd: 18, toast: 'Breach goes undetected' },
]

export function zoneForCol(col: number, zones: ZoneDef[] = ZONES): ZoneDef {
  return zones.find((z) => col >= z.colStart && col < z.colEnd) ?? zones[zones.length - 1]
}

// ============================================================
// SPAWNS — verified open in every layout above
// ============================================================

export const THIEF_SPAWN: Cell = { row: 9, col: 16 }
export const COP_SPAWN: Cell = { row: 1, col: 1 }

export const MOBILE_THIEF_SPAWN: Cell = { row: 9, col: 9 }
export const MOBILE_COP_SPAWN: Cell = { row: 1, col: 1 }

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

function openCellsInZone(grid: MazeGrid, zone: ZoneDef): Cell[] {
  const { rows } = gridDims(grid)
  const cells: Cell[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = zone.colStart; col < zone.colEnd; col++) {
      if (!isWall(grid, row, col)) cells.push({ row, col })
    }
  }
  return cells
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Picks one random open cell per zone for a regular coin, plus one
// random open cell anywhere for the power-up coin, for the given maze
// layout. Avoids walls (by construction, since only open cells are
// candidates), avoids the thief/cop spawn cells, and avoids placing two
// coins on the same cell.
export function generateCoins(grid: MazeGrid, zones: ZoneDef[] = ZONES, thiefSpawn: Cell = THIEF_SPAWN, copSpawn: Cell = COP_SPAWN): CoinDef[] {
  const { rows, cols } = gridDims(grid)
  const taken = new Set<string>([cellKey(thiefSpawn), cellKey(copSpawn)])
  const coins: CoinDef[] = []

  zones.forEach((zone, i) => {
    const candidates = openCellsInZone(grid, zone).filter((c) => !taken.has(cellKey(c)))
    const cell = candidates.length > 0 ? pickRandom(candidates) : openCellsInZone(grid, zone)[0]
    taken.add(cellKey(cell))
    coins.push({ id: `c${i + 1}`, row: cell.row, col: cell.col, zone: zone.id, power: false })
  })

  const allOpen: Cell[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!isWall(grid, row, col)) allOpen.push({ row, col })
    }
  }
  const powerCandidates = allOpen.filter((c) => !taken.has(cellKey(c)))
  const powerCell = powerCandidates.length > 0 ? pickRandom(powerCandidates) : allOpen[0]
  const powerZone = zoneForCol(powerCell.col, zones).id
  coins.push({ id: 'power', row: powerCell.row, col: powerCell.col, zone: powerZone, power: true })

  return coins
}
