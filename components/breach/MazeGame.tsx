'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  COIN_DEFS,
  COLS,
  COP_SPAWN,
  THIEF_SPAWN,
  ZONES,
  sameCell,
  zoneForCol,
  type Cell,
  type Direction,
  type ZoneId,
} from '@/lib/maze-data'
import { bfsNextStep, thiefAiNextStep, tryMove } from '@/lib/maze-engine'
import { MazeBoard, type RenderCoin } from '@/components/breach/MazeBoard'

export type GameMode = 'thief' | 'cop'
export type GameResult = { outcome: 'won' | 'lost'; coinsCollected: number; totalCoins: number }

interface MazeGameProps {
  mode: GameMode
  onFinish: (result: GameResult) => void
  onExit: () => void
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

export function MazeGame({ mode, onFinish, onExit }: MazeGameProps) {
  const [thiefPos, setThiefPos] = useState<Cell>(THIEF_SPAWN)
  const [copPos, setCopPos] = useState<Cell>(COP_SPAWN)
  const [collected, setCollected] = useState<Set<string>>(new Set())
  const [phase, setPhase] = useState<'playing' | 'caught' | 'won' | 'lost'>('playing')
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([])
  const [shaking, setShaking] = useState(false)
  const [copDebuffed, setCopDebuffed] = useState(false)
  const [cellSize, setCellSize] = useState(26)

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

  thiefPosRef.current = thiefPos
  copPosRef.current = copPos
  collectedRef.current = collected
  phaseRef.current = phase

  // ----------------------------------------------------------------
  // Responsive cell size
  // ----------------------------------------------------------------
  useEffect(() => {
    function resize() {
      const w = containerRef.current?.offsetWidth ?? 360
      const size = Math.max(10, Math.min(30, Math.floor(w / COLS)))
      setCellSize(size)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
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
      const tryNext = tryMove(pos, desiredDirRef.current)
      if (!sameCell(tryNext, pos)) {
        next = tryNext
        lastDirRef.current = desiredDirRef.current
      }
    }
    if (sameCell(next, pos) && lastDirRef.current) {
      const tryNext = tryMove(pos, lastDirRef.current)
      if (!sameCell(tryNext, pos)) next = tryNext
    }
    return { next, moved: !sameCell(next, pos) }
  }

  // ----------------------------------------------------------------
  // Coin pickup + win checks (called whenever thief position changes)
  // ----------------------------------------------------------------
  const handleThiefArrive = useCallback(
    (pos: Cell) => {
      const coin = COIN_DEFS.find((c) => sameCell(c, pos) && !collectedRef.current.has(c.id))
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

        if (nextCollected.size === COIN_DEFS.length) {
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
      if (phaseRef.current !== 'playing') return

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
            const remainingCoins = COIN_DEFS.filter((c) => !collectedRef.current.has(c.id))
            const aiNext = thiefAiNextStep(thiefPosRef.current, copPosRef.current, remainingCoins)
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
      if (phaseRef.current !== 'playing') return

      const now = Date.now()
      const frozen = now < powerFreezeUntilRef.current
      const halved = !frozen && now < powerHalfUntilRef.current
      setCopDebuffed(frozen || halved)

      if (frozen) return
      if (halved) {
        halfToggleRef.current = !halfToggleRef.current
        if (!halfToggleRef.current) return
      }

      const next = bfsNextStep(copPosRef.current, thiefPosRef.current)
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
          totalCoins: COIN_DEFS.length,
        })
      }, 900)
      return () => clearTimeout(t)
    }
  }, [phase, onFinish])

  const renderCoins: RenderCoin[] = COIN_DEFS.filter((c) => !collected.has(c.id)).map((c) => ({
    id: c.id,
    row: c.row,
    col: c.col,
    power: c.power,
  }))

  const accent = mode === 'thief' ? '#ff6b4a' : '#00ffcc'

  const zonesCompleted = new Set<ZoneId>(
    COIN_DEFS.filter((c) => !c.power && collected.has(c.id)).map((c) => c.zone)
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        position: 'relative',
      }}
    >
      {/* HUD */}
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <div className="breach-label">
          {mode === 'thief' ? 'THIEF_MODE:' : 'COP_MODE:'}{' '}
          <span style={{ color: accent }}>{collected.size}/{COIN_DEFS.length} COINS</span>
        </div>
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
        style={{ width: '100%', maxWidth: '560px', touchAction: 'none' }}
      >
        <MazeBoard
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
      <div style={{ width: '100%', maxWidth: '560px', marginTop: '18px' }}>
        <div className="breach-label" style={{ marginBottom: '6px' }}>
          HACK_PROGRESS: <span style={{ color: '#00ffcc' }}>{zonesCompleted.size}/{ZONES.length} SYSTEMS COMPROMISED</span>
        </div>
        <div style={{ display: 'flex', gap: '3px' }}>
          {ZONES.map((z) => {
            const done = zonesCompleted.has(z.id)
            return (
              <div
                key={z.id}
                style={{
                  flex: 1,
                  height: '8px',
                  border: '1px solid rgba(0,255,204,0.3)',
                  borderRadius: '1px',
                  overflow: 'hidden',
                  background: 'rgba(15,15,24,0.8)',
                }}
              >
                <div
                  style={{
                    width: done ? '100%' : '0%',
                    height: '100%',
                    background: '#00ffcc',
                    transition: 'width 300ms ease-out',
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

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
              {collected.size}/{COIN_DEFS.length} coins collected
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
