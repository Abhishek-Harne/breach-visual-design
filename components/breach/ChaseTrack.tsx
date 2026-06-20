'use client'

import type { GameMode } from '@/lib/game-data'
import { ThiefSVG, CopSVG } from './Sprite'

interface ChaseTrackProps {
  mode: GameMode
  chaseGap: number
  caught: boolean
}

const THIEF_LEFT = 88
const COP_LEFT_MIN = 6

export function ChaseTrack({ mode, chaseGap, caught }: ChaseTrackProps) {
  const clampedGap = Math.max(0, Math.min(100, chaseGap))
  const copLeft = caught
    ? THIEF_LEFT
    : COP_LEFT_MIN + ((100 - clampedGap) / 100) * (THIEF_LEFT - COP_LEFT_MIN)

  const label = mode === 'cop' ? 'DISTANCE_TO_THIEF:' : 'DISTANCE_FROM_COP:'

  const gapColor =
    clampedGap > 50 ? '#00ffcc' : clampedGap > 20 ? '#f59e0b' : '#ff6b4a'

  return (
    <div
      className="breach-card"
      style={{ margin: '0 16px 16px', padding: '16px 20px' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '14px',
        }}
      >
        <span className="breach-label">{label}</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: gapColor }}>
          {Math.round(clampedGap)}
        </span>
      </div>

      <div style={{ position: 'relative', height: '40px' }}>
        {/* track line */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            background: 'rgba(255,255,255,0.15)',
          }}
        />

        {/* thief sprite — fixed near the right side, the safety zone */}
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: `${THIEF_LEFT}%`,
            transform: 'translateX(-50%)',
            zIndex: 2,
          }}
        >
          <div className="chase-bob">
            <ThiefSVG size={26} />
          </div>
        </div>

        {/* cop sprite — moves toward the thief as chaseGap drops */}
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: `${copLeft}%`,
            transform: 'translateX(-50%)',
            transition: 'left 500ms ease-out',
            zIndex: 1,
          }}
        >
          <div className="chase-bob">
            <CopSVG size={26} />
          </div>
        </div>
      </div>
    </div>
  )
}
