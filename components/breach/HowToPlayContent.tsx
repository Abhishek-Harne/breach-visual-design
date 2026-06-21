'use client'

import { useTheme } from '@/components/breach/ThemeContext'
import type { GameMode } from '@/components/breach/MazeGame'

interface HowToPlayContentProps {
  mode: GameMode
}

export function HowToPlayContent({ mode }: HowToPlayContentProps) {
  const { palette: theme } = useTheme()
  return (
    <>
      <p style={{ fontSize: '0.72rem', color: theme.text, lineHeight: 1.6, marginBottom: '10px' }}>
        Use arrow keys or WASD to move. On touch devices, swipe or use
        the on-screen D-pad.
      </p>

      <p style={{ fontSize: '0.72rem', color: theme.text, lineHeight: 1.6, marginBottom: '10px' }}>
        {mode === 'thief'
          ? 'Each star is a real step in a data breach — collect them to complete the hack.'
          : 'Each star the thief grabs is a step toward finishing the breach — stop them before they collect them all.'}
      </p>

      <p style={{ fontSize: '0.72rem', color: theme.text, lineHeight: 1.6 }}>
        The diamond is a zero-day exploit — grab it for a brief
        advantage that slows down your opponent.
      </p>
    </>
  )
}
