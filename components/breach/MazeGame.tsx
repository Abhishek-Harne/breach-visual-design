'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  gridDims,
  generateCoins,
  pickLayout,
  sameCell,
  zoneForCol,
  type Cell,
  type CoinDef,
  type Direction,
  type MazeGrid,
  type ZoneDef,
  type ZoneId,
} from '@/lib/maze-data'
import { bfsNextStep, thiefAiNextStep, tryMove } from '@/lib/maze-engine'
import { MazeBoard, type RenderCoin } from '@/components/breach/MazeBoard'
import { NodeProgressBar } from '@/components/breach/NodeProgressBar'
import { HowToPlayContent } from '@/components/breach/HowToPlayContent'
import { useTheme, hexToRgba } from '@/components/breach/ThemeContext'

export type GameMode = 'thief' | 'cop'
export type GameResult = {
  outcome: 'won' | 'lost'
  coinsCollected: number
  totalCoins: number
  zonesCompleted: ZoneId[]
}

interface MazeGameProps {
  mode: GameMode
  onFinish: (result: GameResult) => void
  onExit: () => void
  showHowToInitially: boolean
  onHowToSeen: () => void
}

const PLAYER_TICK_MS = 170
const COP_BFS_TICK_MS = 500
// AI thief moves slightly slower than the player-controlled cop — it skips
// every 4th tick, giving the player a small, earnable speed edge.
const AI_THIEF_SKIP_EVERY = 4
const POWER_FREEZE_MS = 1500
const POWER_TOTAL_MS = 9000
const TOAST_TTL_MS = 1400

let toastSeq = 0

// Below this viewport width, load the mobile-specific maze layout
// (fewer columns) instead of squeezing a desktop layout into a narrow
// screen.
const MOBILE_BREAKPOINT = 600

export function MazeGame({ mode, onFinish, onExit, showHowToInitially, onHowToSeen }: MazeGameProps) {
  const { palette: theme } = useTheme()
  const [layout] = useState(() =>
    pickLayout(typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT)
  )
  const { grid, zones, thiefSpawn, copSpawn } = layout
  const { rows, cols } = gridDims(grid)
  const [coins] = useState<CoinDef[]>(() => generateCoins(grid, zones, thiefSpawn, copSpawn))
  const [thiefPos, setThiefPos] = useState<Cell>(thiefSpawn)
  const [copPos, setCopPos] = useState<Cell>(copSpawn)
  const [collected, setCollected] = useState<Set<string>>(new Set())
  const [phase, setPhase] = useState<'playing' | 'caught' | 'won' | 'lost'>('playing')
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([])
  const [shaking, setShaking] = useState(false)
  const [copDebuffed, setCopDebuffed] = useState(false)
  const [cellSize, setCellSize] = useState(26)
  const [howToOpen, setHowToOpen] = useState(showHowToInitially)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const thiefPosRef = useRef(thiefPos)
  const copPosRef = useRef(copPos)
  const collectedRef = useRef(collected)
  const phaseRef = useRef(phase)
  const desiredDirRef = useRef<Direction | null>(null)
  const lastDirRef = useRef<Direction | null>(null)
  const powerFreezeUntilRef = useRef(0)
  const powerHalfUntilRef = useRef(0)
  const halfToggleRef = useRef(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const aiThiefTickCountRef = useRef(0)
  const pausedRef = useRef(howToOpen)

  thiefPosRef.current = thiefPos
  copPosRef.current = copPos
  collectedRef.current = collected
  phaseRef.current = phase
  pausedRef.current = howToOpen

  const handleHowToDismiss = useCallback(() => {
    setHowToOpen(false)
    onHowToSeen()
  }, [onHowToSeen])

  // ----------------------------------------------------------------
  // Responsive cell size — derived from the actual viewport so the
  // board fills the available space instead of sitting in a fixed box.
  // ----------------------------------------------------------------
  useEffect(() => {
    function resize() {
      const horizontalPadding = 32 // matches the outer container's padding
      const reservedVertical = 300 // outer padding + HUD + dpad + progress bar + gaps, approx
      const widthBudget = window.innerWidth - horizontalPadding
      const heightBudget = window.innerHeight - reservedVertical
      const widthBased = Math.floor(widthBudget / cols)
      const heightBased = Math.floor(heightBudget / rows)
      // Always fit both dimensions so the board never overflows the
      // viewport horizontally or vertically — the mobile-specific layout
      // (fewer columns) keeps this comfortably tappable on narrow screens.
      const fit = Math.min(widthBased, heightBased)
      const size = Math.max(8, Math.min(44, fit))
      setCellSize(size)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [cols, rows])

  // ----------------------------------------------------------------
  // Keyboard input
  // ----------------------------------------------------------------
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const map: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
        W: 'up',
        S: 'down',
        A: 'left',
        D: 'right',
      }
      const dir = map[e.key]
      if (dir) {
        desiredDirRef.current = dir
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const setDpadDir = useCallback((dir: Direction) => {
    desiredDirRef.current = dir
  }, [])

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStartRef.current
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 16) return
    if (Math.abs(dx) > Math.abs(dy)) {
      desiredDirRef.current = dx > 0 ? 'right' : 'left'
    } else {
      desiredDirRef.current = dy > 0 ? 'down' : 'up'
    }
    touchStartRef.current = null
  }

  // ----------------------------------------------------------------
  // Shared: step a character using buffered direction
  // ----------------------------------------------------------------
  function stepBuffered(pos: Cell): { next: Cell; moved: boolean } {
    let next = pos
    if (desiredDirRef.current) {
      const tryNext = tryMove(grid, pos, desiredDirRef.current)
      if (!sameCell(tryNext, pos)) {
        next = tryNext
        lastDirRef.current = desiredDirRef.current
      }
    }
    if (sameCell(next, pos) && lastDirRef.current) {
      const tryNext = tryMove(grid, pos, lastDirRef.current)
      if (!sameCell(tryNext, pos)) next = tryNext
    }
    return { next, moved: !sameCell(next, pos) }
  }

  // ----------------------------------------------------------------
  // Coin pickup + win checks (called whenever thief position changes)
  // ----------------------------------------------------------------
  const handleThiefArrive = useCallback(
    (pos: Cell) => {
      const coin = coins.find((c) => sameCell(c, pos) && !collectedRef.current.has(c.id))
      if (coin) {
        const nextCollected = new Set(collectedRef.current)
        nextCollected.add(coin.id)
        collectedRef.current = nextCollected
        setCollected(nextCollected)

        const zone = zoneForCol(coin.col, zones)
        const text = coin.power ? 'ZERO-DAY EXPLOIT FOUND' : zone.toast
        const id = ++toastSeq
        setToasts((t) => [...t, { id, text }])
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), TOAST_TTL_MS)

        if (coin.power) {
          const now = Date.now()
          powerFreezeUntilRef.current = now + POWER_FREEZE_MS
          powerHalfUntilRef.current = now + POWER_TOTAL_MS
          setCopDebuffed(true)
        }

        if (nextCollected.size === coins.length) {
          phaseRef.current = mode === 'thief' ? 'won' : 'lost'
          setPhase(phaseRef.current)
        }
      }

      if (sameCell(pos, copPosRef.current) && phaseRef.current === 'playing') {
        phaseRef.current = mode === 'thief' ? 'caught' : 'won'
        setPhase(phaseRef.current)
        setShaking(true)
        setTimeout(() => setShaking(false), 250)
      }
    },
    [mode]
  )

  // ----------------------------------------------------------------
  // Player movement tick (170ms) — moves human player + AI thief if cop mode
  // ----------------------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      if (phaseRef.current !== 'playing' || pausedRef.current) return

      if (mode === 'thief') {
        const { next, moved } = stepBuffered(thiefPosRef.current)
        if (moved) {
          thiefPosRef.current = next
          setThiefPos(next)
          handleThiefArrive(next)
        }
      } else {
        // player controls the cop
        const { next: copNext, moved: copMoved } = stepBuffered(copPosRef.current)
        if (copMoved) {
          copPosRef.current = copNext
          setCopPos(copNext)
          if (sameCell(copNext, thiefPosRef.current) && phaseRef.current === 'playing') {
            phaseRef.current = 'won'
            setPhase('won')
            setShaking(true)
            setTimeout(() => setShaking(false), 250)
          }
        }

        if (phaseRef.current === 'playing') {
          aiThiefTickCountRef.current += 1
          const skipThisTick = aiThiefTickCountRef.current % AI_THIEF_SKIP_EVERY === 0
          if (!skipThisTick) {
            const remainingCoins = coins.filter((c) => !collectedRef.current.has(c.id))
            const aiNext = thiefAiNextStep(grid, thiefPosRef.current, copPosRef.current, remainingCoins)
            if (!sameCell(aiNext, thiefPosRef.current)) {
              thiefPosRef.current = aiNext
              setThiefPos(aiNext)
              handleThiefArrive(aiNext)
            }
          }
        }
      }
    }, PLAYER_TICK_MS)
    return () => clearInterval(interval)
  }, [mode, handleThiefArrive])

  // ----------------------------------------------------------------
  // Cop BFS tick (500ms) — only drives the cop when player is the thief
  // ----------------------------------------------------------------
  useEffect(() => {
    if (mode !== 'thief') return
    const interval = setInterval(() => {
      if (phaseRef.current !== 'playing' || pausedRef.current) return

      const now = Date.now()
      const frozen = now < powerFreezeUntilRef.current
      const halved = !frozen && now < powerHalfUntilRef.current
      setCopDebuffed(frozen || halved)

      if (frozen) return
      if (halved) {
        halfToggleRef.current = !halfToggleRef.current
        if (!halfToggleRef.current) return
      }

      const next = bfsNextStep(grid, copPosRef.current, thiefPosRef.current)
      if (next) {
        copPosRef.current = next
        setCopPos(next)
        if (sameCell(next, thiefPosRef.current) && phaseRef.current === 'playing') {
          phaseRef.current = 'caught'
          setPhase('caught')
          setShaking(true)
          setTimeout(() => setShaking(false), 250)
        }
      }
    }, COP_BFS_TICK_MS)
    return () => clearInterval(interval)
  }, [mode])

  // ----------------------------------------------------------------
  // Report result once phase settles
  // ----------------------------------------------------------------
  useEffect(() => {
    if (phase === 'won' || phase === 'lost' || phase === 'caught') {
      const outcome = phase === 'won' ? 'won' : 'lost'
      const t = setTimeout(() => {
        const zonesCompleted = Array.from(
          new Set(coins.filter((c) => !c.power && collectedRef.current.has(c.id)).map((c) => c.zone))
        )
        onFinish({
          outcome,
          coinsCollected: collectedRef.current.size,
          totalCoins: coins.length,
          zonesCompleted,
        })
      }, 900)
      return () => clearTimeout(t)
    }
  }, [phase, onFinish])

  const renderCoins: RenderCoin[] = coins.filter((c) => !collected.has(c.id)).map((c) => ({
    id: c.id,
    row: c.row,
    col: c.col,
    power: c.power,
  }))

  const accent = mode === 'thief' ? theme.orange : theme.teal

  const zonesCompleted = new Set<ZoneId>(
    coins.filter((c) => !c.power && collected.has(c.id)).map((c) => c.zone)
  )

  const boardWidth = cellSize * cols

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        position: 'relative',
      }}
    >
      {/* HUD */}
      <div
        style={{
          width: '100%',
          maxWidth: boardWidth,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <div className="breach-label">
          {mode === 'thief' ? 'THIEF_MODE:' : 'COP_MODE:'}{' '}
          <span style={{ color: accent }}>{collected.size}/{coins.length} COINS</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setHowToOpen(true)}
            aria-label="How to play"
            style={{
              border: `1px solid ${theme.borderMed}`,
              borderRadius: '2px',
              padding: '5px 10px',
              background: theme.surface,
              color: theme.muted,
              fontSize: '0.55rem',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ?
          </button>
          <button
            onClick={onExit}
            style={{
              border: `1px solid ${theme.borderMed}`,
              borderRadius: '2px',
              padding: '5px 10px',
              background: theme.surface,
              color: theme.muted,
              fontSize: '0.55rem',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ← HOME
          </button>
        </div>
      </div>

      {/* Toasts */}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="panel-fade-in"
            style={{
              background: hexToRgba(theme.surface, 0.92),
              border: `1px solid ${hexToRgba(theme.teal, 0.4)}`,
              borderRadius: '2px',
              padding: '6px 12px',
              fontSize: '0.62rem',
              letterSpacing: '0.05em',
              color: theme.teal,
              whiteSpace: 'nowrap',
            }}
          >
            {t.text}
          </div>
        ))}
      </div>

      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ width: '100%', maxWidth: boardWidth, touchAction: 'none', overflowX: 'auto' }}
      >
        <MazeBoard
          grid={grid}
          zones={zones}
          cellSize={cellSize}
          coins={renderCoins}
          thiefPos={thiefPos}
          copPos={copPos}
          copDebuffed={copDebuffed}
          shaking={shaking}
        />
      </div>

      {/* On-screen D-pad for mobile */}
      <div
        style={{
          marginTop: '18px',
          display: 'grid',
          gridTemplateColumns: '44px 44px 44px',
          gridTemplateRows: '44px 44px 44px',
          gap: '4px',
        }}
      >
        <div />
        <DpadButton label="▲" onPress={() => setDpadDir('up')} />
        <div />
        <DpadButton label="◀" onPress={() => setDpadDir('left')} />
        <div />
        <DpadButton label="▶" onPress={() => setDpadDir('right')} />
        <div />
        <DpadButton label="▼" onPress={() => setDpadDir('down')} />
        <div />
      </div>

      {/* Hack progress bar */}
      <NodeProgressBar zonesCompleted={zonesCompleted} accent={accent} maxWidth={boardWidth} />

      {/* How-to-play popup */}
      {howToOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: theme.overlay,
            padding: '16px',
          }}
        >
          <div className="breach-card" style={{ padding: '24px', maxWidth: '340px' }}>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                marginBottom: '14px',
                color: accent,
              }}
            >
              HOW TO PLAY
            </div>

            <div style={{ marginBottom: '8px' }}>
              <HowToPlayContent mode={mode} />
            </div>

            <button
              onClick={handleHowToDismiss}
              style={{
                border: `1px solid ${accent}`,
                borderRadius: '2px',
                padding: '12px 20px',
                background: 'transparent',
                color: accent,
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                width: '100%',
              }}
            >
              GOT IT — START
            </button>
          </div>
        </div>
      )}

      {/* Caught / win overlay */}
      {phase !== 'playing' && (
        <div
          className="caught-burst"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: theme.overlay,
          }}
        >
          <div className="breach-card" style={{ padding: '28px', maxWidth: '320px', textAlign: 'center' }}>
            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                marginBottom: '12px',
                color: phase === 'won' ? theme.teal : theme.orange,
              }}
            >
              {phase === 'caught' && 'CAUGHT!'}
              {phase === 'won' && (mode === 'thief' ? 'BREACH COMPLETE' : 'SUSPECT CAUGHT')}
              {phase === 'lost' && 'BREACH SUCCEEDED'}
            </div>
            <p style={{ fontSize: '0.7rem', color: theme.muted }}>
              {collected.size}/{coins.length} coins collected
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function DpadButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { palette: theme } = useTheme()
  return (
    <button
      onMouseDown={onPress}
      onTouchStart={(e) => {
        e.preventDefault()
        onPress()
      }}
      style={{
        border: `1px solid ${theme.borderMed}`,
        borderRadius: '2px',
        background: theme.surface,
        color: theme.muted,
        fontSize: '0.9rem',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}
