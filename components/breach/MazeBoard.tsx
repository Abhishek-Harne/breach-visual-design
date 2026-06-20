'use client'

import { MAZE_ROWS, ROWS, COLS, ZONES, type Cell } from '@/lib/maze-data'
import { ThiefSVG, CopSVG } from '@/components/breach/Sprite'

export interface RenderCoin {
  id: string
  row: number
  col: number
  power: boolean
}

interface MazeBoardProps {
  cellSize: number
  coins: RenderCoin[]
  thiefPos: Cell
  copPos: Cell
  copDebuffed: boolean
  shaking: boolean
}

export function MazeBoard({
  cellSize,
  coins,
  thiefPos,
  copPos,
  copDebuffed,
  shaking,
}: MazeBoardProps) {
  const width = COLS * cellSize
  const height = ROWS * cellSize

  return (
    <div
      className={shaking ? 'screen-shake' : ''}
      style={{
        position: 'relative',
        width,
        height,
        margin: '0 auto',
        background: '#0a0a0f',
      }}
    >
      {/* walls */}
      {MAZE_ROWS.map((rowStr, r) =>
        rowStr.split('').map((ch, c) =>
          ch === '#' ? (
            <div
              key={`w-${r}-${c}`}
              style={{
                position: 'absolute',
                top: r * cellSize,
                left: c * cellSize,
                width: cellSize,
                height: cellSize,
                background: '#0f0f18',
                border: '1px solid rgba(255,255,255,0.08)',
                boxSizing: 'border-box',
              }}
            />
          ) : null
        )
      )}

      {/* zone labels */}
      {ZONES.map((z) => (
        <div
          key={z.id}
          style={{
            position: 'absolute',
            top: -2,
            left: ((z.colStart + z.colEnd) / 2) * cellSize,
            transform: 'translateX(-50%)',
            fontSize: '0.45rem',
            letterSpacing: '0.05em',
            color: 'rgba(226,232,240,0.3)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {z.label}
        </div>
      ))}

      {/* coins */}
      {coins.map((coin) => (
        <div
          key={coin.id}
          style={{
            position: 'absolute',
            top: coin.row * cellSize,
            left: coin.col * cellSize,
            width: cellSize,
            height: cellSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {coin.power ? (
            <div
              style={{
                width: cellSize * 0.45,
                height: cellSize * 0.45,
                background: '#00ffcc',
                transform: 'rotate(45deg)',
                animation: 'pulse-teal 0.7s ease-in-out infinite',
              }}
            />
          ) : (
            <div
              style={{
                width: cellSize * 0.22,
                height: cellSize * 0.22,
                borderRadius: '50%',
                background: '#00ffcc',
                opacity: 0.85,
              }}
            />
          )}
        </div>
      ))}

      {/* thief sprite */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: cellSize,
          height: cellSize,
          transform: `translate(${thiefPos.col * cellSize}px, ${thiefPos.row * cellSize}px)`,
          transition: 'transform 160ms linear',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
        }}
      >
        <ThiefSVG size={cellSize * 0.85} />
      </div>

      {/* cop sprite */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: cellSize,
          height: cellSize,
          transform: `translate(${copPos.col * cellSize}px, ${copPos.row * cellSize}px)`,
          transition: 'transform 160ms linear',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
        }}
      >
        <CopSVG size={cellSize * 0.85} debuffed={copDebuffed} />
      </div>
    </div>
  )
}
