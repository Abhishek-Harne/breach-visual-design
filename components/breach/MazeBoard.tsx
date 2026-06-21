'use client'

import { gridDims, type Cell, type MazeGrid, type ZoneDef } from '@/lib/maze-data'
import { ThiefSVG, CopSVG } from '@/components/breach/Sprite'
import { useTheme, hexToRgba } from '@/components/breach/ThemeContext'

export interface RenderCoin {
  id: string
  row: number
  col: number
  power: boolean
}

interface MazeBoardProps {
  grid: MazeGrid
  zones: ZoneDef[]
  cellSize: number
  coins: RenderCoin[]
  thiefPos: Cell
  copPos: Cell
  copDebuffed: boolean
  shaking: boolean
}

export function MazeBoard({
  grid,
  zones,
  cellSize,
  coins,
  thiefPos,
  copPos,
  copDebuffed,
  shaking,
}: MazeBoardProps) {
  const { palette: theme } = useTheme()
  const { rows, cols } = gridDims(grid)
  const width = cols * cellSize
  const height = rows * cellSize

  return (
    <div
      className={shaking ? 'screen-shake' : ''}
      style={{
        position: 'relative',
        width,
        height,
        margin: '0 auto',
        background: theme.bg,
      }}
    >
      {/* walls — brighter border + subtle outer glow so walls read
          clearly distinct from open path cells at a glance */}
      {grid.map((rowStr, r) =>
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
                background: theme.wallBg,
                border: `1px solid ${theme.wallBorder}`,
                boxShadow: `inset 0 0 0 1px ${hexToRgba(theme.text, 0.06)}`,
                boxSizing: 'border-box',
              }}
            />
          ) : null
        )
      )}

      {/* zone labels */}
      {zones.map((z) => (
        <div
          key={z.id}
          style={{
            position: 'absolute',
            top: -2,
            left: ((z.colStart + z.colEnd) / 2) * cellSize,
            transform: 'translateX(-50%)',
            fontSize: '0.45rem',
            letterSpacing: '0.05em',
            color: hexToRgba(theme.text, 0.3),
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
                background: theme.teal,
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
                background: theme.teal,
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
