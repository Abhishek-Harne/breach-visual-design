'use client'

import { useEffect, useRef, useState } from 'react'

export function ScoreDisplay({ score }: { score: number }) {
  const [pulse, setPulse] = useState(false)
  const prev = useRef(score)

  useEffect(() => {
    if (score !== prev.current) {
      prev.current = score
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 200)
      return () => clearTimeout(t)
    }
  }, [score])

  const display = Math.max(0, Math.round(score))

  return (
    <span
      className={pulse ? 'score-pulse' : ''}
      style={{
        display: 'inline-block',
        fontSize: '0.5rem',
        letterSpacing: '0.06em',
        color: 'rgba(226,232,240,0.4)',
        whiteSpace: 'nowrap',
      }}
    >
      SCORE: <span style={{ color: '#00ffcc', fontWeight: 700 }}>{display}</span>
    </span>
  )
}
