'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  COLS,
  COP_SPAWN,
  ROWS,
  THIEF_SPAWN,
  ZONES,
  generateCoins,
  pickLayout,
  sameCell,
  zoneForCol,
  type Cell,
  type CoinDef,
  type Direction,
  type MazeGrid,
  type ZoneId,
} from '@/lib/maze-data'
import { bfsNextStep, thiefAiNextStep, tryMove } from '@/lib/maze-engine'
import { MazeBoard, type RenderCoin } from '@/components/breach/MazeBoard'
import { NODE_CONTENT } from '@/lib/node-content'

export type GameMode = 'thief' | 'cop'
export type GameResult = { outcome: 'won' | 'lost'; coinsCollected: number; totalCoins: number }

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

export function MazeGame({ mode, onFinish, onExit, showHowToInitially, onHowToSeen }: MazeGameProps) {
  const [grid] = useState<MazeGrid>(() => pickLayout().grid)
  const [coins] = useState<CoinDef[]>(() => generateCoins(grid))
  const [thiefPos, setThiefPos] = useState<Cell>(THIEF_SPAWN)
  const [copPos, setCopPos] = useState<Cell>(COP_SPAWN)
  const [collected, setCollected] = useState<Set<string>>(new Set())
  const [phase, setPhase] = useState<'playing' | 'caught' | 'won' | 'lost'>('playing')
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([])
  const [shaking, setShaking] = useState(false)
  const [copDebuffed, setCopDebuffed] = useState(false)
  const [cellSize, setCellSize] = useState(26)
  const [howToOpen, setHowToOpen] = useState(showHowToInitially)

  // Node learning panel — purely informational UI layered on top of the
  // progress bar. Never touches pausedRef/game-tick state; the chase
  // keeps running underneath it regardless of whether it's open.
  const [openNodeId, setOpenNodeId] = useState<ZoneId | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<ZoneId | null>(null)
  const [hasOpenedNode, setHasOpenedNode] = useState(false)
  const nodePanelRef = useRef<HTMLDivElement | null>(null)
  const nodeBarRef = useRef<HTMLDivElement | null>(null)

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
      const widthBased = Math.floor(widthBudget / COLS)
      const heightBased = Math.floor(heightBudget / ROWS)
      // The maze is much wider (32 cols) than it is tall (19 rows). On
      // portrait/narrow viewports, sizing purely by width leaves the board
      // tiny with dead space above/below — so there we size by height
      // instead and let the board scroll horizontally. On landscape/desktop
      // viewports width is the more generous dimension, so the usual
      // fit-both-dimensions sizing already fills the screen without
      // overflowing vertically.
      const isPortrait = window.innerHeight > window.innerWidth
      const fit = isPortrait ? heightBased : Math.min(widthBased, heightBased)
      const size = Math.max(8, Math.min(44, fit))
      setCellSize(size)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // ----------------------------------------------------------------
  // Node learning panel — dismiss on click/tap outside the panel
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!openNodeId) return
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node
      if (nodePanelRef.current?.contains(target)) return
      if (nodeBarRef.current?.contains(target)) return
      setOpenNodeId(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [openNodeId])

  const handleNodeClick = useCallback((id: ZoneId) => {
    setHasOpenedNode(true)
    setOpenNodeId((current) => (current === id ? null : id))
  }, [])

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

        const zone = zoneForCol(coin.col)
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
        onFinish({
          outcome,
          coinsCollected: collectedRef.current.size,
          totalCoins: coins.length,
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

  const accent = mode === 'thief' ? '#ff6b4a' : '#00ffcc'

  const zonesCompleted = new Set<ZoneId>(
    coins.filter((c) => !c.power && collected.has(c.id)).map((c) => c.zone)
  )

  const boardWidth = cellSize * COLS

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0f',
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
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '2px',
              padding: '5px 10px',
              background: '#0f0f18',
              color: 'rgba(226,232,240,0.45)',
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
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '2px',
              padding: '5px 10px',
              background: '#0f0f18',
              color: 'rgba(226,232,240,0.45)',
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
              background: 'rgba(15,15,24,0.92)',
              border: '1px solid rgba(0,255,204,0.4)',
              borderRadius: '2px',
              padding: '6px 12px',
              fontSize: '0.62rem',
              letterSpacing: '0.05em',
              color: '#00ffcc',
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
      <div style={{ width: '100%', maxWidth: boardWidth, marginTop: '18px', position: 'relative' }}>
        <div className="breach-label" style={{ marginBottom: '6px' }}>
          HACK_PROGRESS: <span style={{ color: '#00ffcc' }}>{zonesCompleted.size}/{ZONES.length} SYSTEMS COMPROMISED</span>
        </div>
        <div ref={nodeBarRef} style={{ display: 'flex', gap: '3px' }}>
          {ZONES.map((z) => {
            const done = zonesCompleted.has(z.id)
            const hovered = hoveredNodeId === z.id
            const isOpen = openNodeId === z.id
            return (
              <button
                key={z.id}
                onClick={() => handleNodeClick(z.id)}
                onMouseEnter={() => setHoveredNodeId(z.id)}
                onMouseLeave={() => setHoveredNodeId((id) => (id === z.id ? null : id))}
                aria-label={`Learn about the ${z.label} stage`}
                style={{
                  flex: 1,
                  position: 'relative',
                  height: '8px',
                  border: `1px solid ${isOpen ? '#00ffcc' : 'rgba(0,255,204,0.3)'}`,
                  borderRadius: '1px',
                  overflow: 'visible',
                  background: 'rgba(15,15,24,0.8)',
                  padding: 0,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transform: hovered ? 'scale(1.045)' : 'scale(1)',
                  transition: 'transform 150ms ease-out, border-color 150ms ease-out',
                }}
              >
                <div
                  style={{
                    width: done ? '100%' : '0%',
                    height: '100%',
                    background: '#00ffcc',
                    transition: 'width 300ms ease-out',
                    overflow: 'hidden',
                  }}
                />
                <span
                  className={hasOpenedNode ? 'node-icon-pulse-subtle' : 'node-icon-pulse'}
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    border: '1px solid rgba(0,255,204,0.7)',
                    background: '#0a0a0f',
                    color: '#00ffcc',
                    fontSize: '6px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    pointerEvents: 'none',
                  }}
                >
                  i
                </span>
              </button>
            )
          })}
        </div>

        {/* Node learning panel — informational only, never pauses the game */}
        {openNodeId && (
          <div
            ref={nodePanelRef}
            className="breach-card panel-fade-in"
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 10px)',
              left: 0,
              right: 0,
              padding: '14px 16px',
              zIndex: 50,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '10px',
                marginBottom: '8px',
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: accent, letterSpacing: '0.04em' }}>
                {ZONES.find((z) => z.id === openNodeId)?.label} — {NODE_CONTENT[openNodeId].name}
              </div>
              <button
                onClick={() => setOpenNodeId(null)}
                aria-label="Close"
                style={{
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: '2px',
                  padding: '2px 6px',
                  background: '#0f0f18',
                  color: 'rgba(226,232,240,0.6)',
                  fontSize: '0.6rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '0.68rem', color: '#e2e8f0', lineHeight: 1.55, marginBottom: '6px' }}>
              <span style={{ color: '#ff6b4a', fontWeight: 700 }}>EXPLOIT: </span>
              {NODE_CONTENT[openNodeId].exploit}
            </p>
            <p style={{ fontSize: '0.68rem', color: '#e2e8f0', lineHeight: 1.55, marginBottom: '6px' }}>
              <span style={{ color: '#00ffcc', fontWeight: 700 }}>DEFENSE: </span>
              {NODE_CONTENT[openNodeId].defense}
            </p>
            <p style={{ fontSize: '0.68rem', color: 'rgba(226,232,240,0.85)', lineHeight: 1.55 }}>
              <span style={{ fontWeight: 700 }}>DO / DON&apos;T: </span>
              {NODE_CONTENT[openNodeId].doDont}
            </p>
          </div>
        )}
      </div>

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
            background: 'rgba(10,10,15,0.85)',
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

            <p style={{ fontSize: '0.72rem', color: '#e2e8f0', lineHeight: 1.6, marginBottom: '10px' }}>
              Use arrow keys or WASD to move. On touch devices, swipe or use
              the on-screen D-pad.
            </p>

            <p style={{ fontSize: '0.72rem', color: '#e2e8f0', lineHeight: 1.6, marginBottom: '10px' }}>
              {mode === 'thief'
                ? 'Each star is a real step in a data breach — collect them to complete the hack.'
                : 'Each star the thief grabs is a step toward finishing the breach — stop them before they collect them all.'}
            </p>

            <p style={{ fontSize: '0.72rem', color: '#e2e8f0', lineHeight: 1.6, marginBottom: '18px' }}>
              The diamond is a zero-day exploit — grab it for a brief
              advantage that slows down your opponent.
            </p>

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
            background: 'rgba(10,10,15,0.85)',
          }}
        >
          <div className="breach-card" style={{ padding: '28px', maxWidth: '320px', textAlign: 'center' }}>
            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                marginBottom: '12px',
                color: phase === 'won' ? '#00ffcc' : '#ff6b4a',
              }}
            >
              {phase === 'caught' && 'CAUGHT!'}
              {phase === 'won' && (mode === 'thief' ? 'BREACH COMPLETE' : 'SUSPECT CAUGHT')}
              {phase === 'lost' && 'BREACH SUCCEEDED'}
            </div>
            <p style={{ fontSize: '0.7rem', color: 'rgba(226,232,240,0.6)' }}>
              {collected.size}/{coins.length} coins collected
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function DpadButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <button
      onMouseDown={onPress}
      onTouchStart={(e) => {
        e.preventDefault()
        onPress()
      }}
      style={{
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: '2px',
        background: '#0f0f18',
        color: 'rgba(226,232,240,0.6)',
        fontSize: '0.9rem',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}
