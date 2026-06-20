'use client'

import { useEffect, useRef, useState } from 'react'
import type { GameMode } from '@/lib/game-data'

interface SpriteProps {
  mode: GameMode
  spritePosition: number // 0-5
  nodePositions: number[] // pixel offsets for each node center
  isMoving: boolean
  showCaughtAnimation: boolean
}

export function ThiefSVG({ opacity = 1, size = 24 }: { opacity?: number; size?: number }) {
  const scale = size / 28
  return (
    <svg
      width={20 * scale}
      height={28 * scale}
      viewBox="0 0 20 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      {/* body */}
      <rect x="4" y="12" width="12" height="12" rx="1" fill="#1a1a2e" />
      {/* head */}
      <rect x="6" y="4" width="8" height="8" rx="1" fill="#1e1e32" />
      {/* eye mask */}
      <rect x="5" y="8" width="10" height="3" rx="0.5" fill="#0a0a0f" />
      {/* eye gleam */}
      <rect x="7" y="8.5" width="2" height="1.5" rx="0.5" fill="#ff6b4a" opacity="0.8" />
      <rect x="11" y="8.5" width="2" height="1.5" rx="0.5" fill="#ff6b4a" opacity="0.8" />
    </svg>
  )
}

export function CopSVG({ opacity = 1, size = 24 }: { opacity?: number; size?: number }) {
  const scale = size / 28
  return (
    <svg
      width={20 * scale}
      height={28 * scale}
      viewBox="0 0 20 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      {/* body */}
      <rect x="4" y="12" width="12" height="12" rx="1" fill="#0f2a2a" />
      {/* badge on chest */}
      <rect x="8" y="14" width="4" height="4" rx="0.5" fill="#00ffcc" opacity="0.9" />
      <rect x="9.5" y="15.5" width="1" height="1" fill="#0a0a0f" />
      {/* head */}
      <rect x="6" y="4" width="8" height="8" rx="1" fill="#0f2a2a" />
      {/* cap */}
      <rect x="5" y="4" width="10" height="2.5" rx="0.5" fill="#00ffcc" opacity="0.7" />
      {/* eyes */}
      <rect x="7" y="8" width="2" height="1.5" rx="0.5" fill="#00ffcc" opacity="0.9" />
      <rect x="11" y="8" width="2" height="1.5" rx="0.5" fill="#00ffcc" opacity="0.9" />
    </svg>
  )
}

export function Sprite({
  mode,
  spritePosition,
  nodePositions,
  isMoving,
  showCaughtAnimation,
}: SpriteProps) {
  const prevPos = useRef(spritePosition)
  const [moveDuration, setMoveDuration] = useState(400)

  useEffect(() => {
    const dist = Math.abs(spritePosition - prevPos.current)
    setMoveDuration(Math.max(400, dist * 300))
    prevPos.current = spritePosition
  }, [spritePosition])

  const xOffset = nodePositions[spritePosition] ?? 0

  return (
    <div
      style={{
        position: 'absolute',
        top: '-32px',
        left: xOffset,
        transform: 'translateX(-50%)',
        transition: `left ${moveDuration}ms ease-out`,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <div className={isMoving ? 'sprite-bob' : ''}>
        {mode === 'thief' ? <ThiefSVG size={28} /> : <CopSVG size={28} />}
      </div>

      {/* Caught animation overlay: ghost thief behind cop */}
      {showCaughtAnimation && mode === 'cop' && (
        <div
          className="caught-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: '-24px',
            pointerEvents: 'none',
          }}
        >
          <ThiefSVG opacity={0.6} size={28} />
          <span
            style={{
              position: 'absolute',
              top: '-18px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#ff6b4a',
              fontSize: '0.55rem',
              letterSpacing: '0.12em',
              whiteSpace: 'nowrap',
              fontWeight: 700,
            }}
          >
            CAUGHT
          </span>
        </div>
      )}
    </div>
  )
}
