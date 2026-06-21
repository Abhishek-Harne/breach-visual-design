'use client'

import { createContext, useContext, useMemo, useState } from 'react'

export type ThemeMode = 'dark' | 'light'

export interface ThemePalette {
  bg: string
  surface: string
  surfaceAlt: string
  border: string
  borderFaint: string
  borderMed: string
  borderStrong: string
  text: string
  muted: string
  mutedFaint: string
  teal: string
  orange: string
  wallBg: string
  wallBorder: string
  shadow: string
  overlay: string
}

const DARK: ThemePalette = {
  bg: '#0a0a0f',
  surface: '#0f0f18',
  surfaceAlt: '#1c1c24',
  border: 'rgba(255,255,255,0.15)',
  borderFaint: 'rgba(255,255,255,0.08)',
  borderMed: 'rgba(255,255,255,0.2)',
  borderStrong: 'rgba(255,255,255,0.3)',
  text: '#e2e8f0',
  muted: 'rgba(226,232,240,0.5)',
  mutedFaint: 'rgba(226,232,240,0.35)',
  teal: '#00ffcc',
  orange: '#ff6b4a',
  wallBg: '#16161f',
  wallBorder: 'rgba(255,255,255,0.22)',
  shadow: 'rgba(0,0,0,0.5)',
  overlay: 'rgba(10,10,15,0.85)',
}

const LIGHT: ThemePalette = {
  bg: '#f4f4f7',
  surface: '#ffffff',
  surfaceAlt: '#e9eaf0',
  border: 'rgba(10,10,20,0.15)',
  borderFaint: 'rgba(10,10,20,0.08)',
  borderMed: 'rgba(10,10,20,0.22)',
  borderStrong: 'rgba(10,10,20,0.35)',
  text: '#15151c',
  muted: 'rgba(10,10,20,0.6)',
  mutedFaint: 'rgba(10,10,20,0.4)',
  teal: '#00897a',
  orange: '#d6502d',
  wallBg: '#d6d9e1',
  wallBorder: 'rgba(10,10,20,0.18)',
  shadow: 'rgba(10,10,20,0.18)',
  overlay: 'rgba(240,240,245,0.9)',
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

interface ThemeContextValue {
  mode: ThemeMode
  palette: ThemePalette
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark')
  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      palette: mode === 'dark' ? DARK : LIGHT,
      toggleMode: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
    }),
    [mode]
  )
  const cssVars = {
    '--theme-bg': value.palette.bg,
    '--theme-surface': value.palette.surface,
    '--theme-border': value.palette.border,
    '--theme-muted': value.palette.muted,
  } as React.CSSProperties

  return (
    <ThemeContext.Provider value={value}>
      <div style={{ ...cssVars, minHeight: '100vh', backgroundColor: value.palette.bg, color: value.palette.text }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
