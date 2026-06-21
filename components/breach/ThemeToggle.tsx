'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme, hexToRgba } from '@/components/breach/ThemeContext'

export function ThemeToggle() {
  const { mode, palette: theme, toggleMode } = useTheme()
  return (
    <button
      onClick={toggleMode}
      aria-label="Toggle light/dark theme"
      style={{
        position: 'fixed',
        top: '8px',
        right: '8px',
        zIndex: 90,
        width: '34px',
        height: '34px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${theme.borderMed}`,
        borderRadius: '2px',
        background: hexToRgba(theme.surface, 0.9),
        color: theme.muted,
        cursor: 'pointer',
      }}
    >
      {mode === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  )
}
