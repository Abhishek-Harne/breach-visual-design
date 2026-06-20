'use client'

import { useEffect, useRef, useState } from 'react'

interface OptionTimerProps {
  active: boolean
  duration?: number
  resetKey: string | number
  onExpire: () => void
}

export function OptionTimer({
  active,
  duration = 8,
  resetKey,
  onExpire,
}: OptionTimerProps) {
  const [remaining, setRemaining] = useState(duration)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const expiredRef = useRef(false)

  useEffect(() => {
    setRemaining(duration)
    expiredRef.current = false
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (!active) return

    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        const next = r - 0.1
        if (next <= 0 && !expiredRef.current) {
          expiredRef.current = true
          if (intervalRef.current) clearInterval(intervalRef.current)
          onExpire()
          return 0
        }
        return next
      })
    }, 100)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, active, duration])

  if (!active) return null

  const color = remaining > 4 ? '#00ffcc' : remaining > 2 ? '#f59e0b' : '#ff6b4a'
  const pulsing = remaining <= 2
  const pct = Math.max(0, (remaining / duration) * 100)

  return (
    <div style={{ marginBottom: '14px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}
      >
        <span className="breach-label">TIME_REMAINING:</span>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color }}>
          {remaining.toFixed(1)}s
        </span>
      </div>
      <div
        className={pulsing ? 'timer-pulse' : ''}
        style={{
          height: '4px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '1px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            transition: 'width 0.1s linear, background-color 0.3s',
          }}
        />
      </div>
    </div>
  )
}
